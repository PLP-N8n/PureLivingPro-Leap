import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { affiliateDB } from "../affiliate/db";

interface RevenueOptimizationReport {
  currentMonthRevenue: number;
  projectedMonthlyRevenue: number;
  topPerformingProducts: Array<{
    productId: number;
    productName: string;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }>;
  underperformingProducts: Array<{
    productId: number;
    productName: string;
    clicks: number;
    conversions: number;
    suggestions: string[];
  }>;
  optimizationActions: string[];
}

// Analyzes affiliate performance and suggests optimizations.
export const analyzeRevenue = api<void, RevenueOptimizationReport>(
  { expose: true, method: "GET", path: "/automation/revenue-analysis" },
  async () => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    // Get current month performance
    const monthlyStats = await affiliateDB.queryRow<{
      totalClicks: number;
      totalConversions: number;
      totalRevenue: number;
    }>`
      SELECT 
        COUNT(DISTINCT ac.id) as "totalClicks",
        COUNT(DISTINCT conv.id) as "totalConversions",
        COALESCE(SUM(conv.commission_earned), 0) as "totalRevenue"
      FROM affiliate_clicks ac
      LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
      WHERE ac.clicked_at >= ${currentMonth.toISOString()}
    `;

    // Calculate projected monthly revenue
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const daysPassed = new Date().getDate();
    const projectedRevenue = (monthlyStats?.totalRevenue || 0) * (daysInMonth / daysPassed);

    // Get top performing products
    const topProducts = await affiliateDB.queryAll<{
      productId: number;
      productName: string;
      clicks: number;
      conversions: number;
      revenue: number;
    }>`
      SELECT 
        p.id as "productId",
        p.name as "productName",
        COUNT(DISTINCT ac.id) as clicks,
        COUNT(DISTINCT conv.id) as conversions,
        COALESCE(SUM(conv.commission_earned), 0) as revenue
      FROM affiliate_products p
      JOIN affiliate_links al ON p.id = al.product_id
      JOIN affiliate_clicks ac ON al.id = ac.link_id
      LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
      WHERE ac.clicked_at >= ${currentMonth.toISOString()}
      GROUP BY p.id, p.name
      HAVING COUNT(DISTINCT ac.id) > 0
      ORDER BY revenue DESC, conversions DESC
      LIMIT 10
    `;

    // Get underperforming products (high clicks, low conversions)
    const underperforming = await affiliateDB.queryAll<{
      productId: number;
      productName: string;
      clicks: number;
      conversions: number;
    }>`
      SELECT 
        p.id as "productId",
        p.name as "productName",
        COUNT(DISTINCT ac.id) as clicks,
        COUNT(DISTINCT conv.id) as conversions
      FROM affiliate_products p
      JOIN affiliate_links al ON p.id = al.product_id
      JOIN affiliate_clicks ac ON al.id = ac.link_id
      LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
      WHERE ac.clicked_at >= ${currentMonth.toISOString()}
      GROUP BY p.id, p.name
      HAVING COUNT(DISTINCT ac.id) >= 10 
      AND (COUNT(DISTINCT conv.id)::float / COUNT(DISTINCT ac.id)) < 0.02
      ORDER BY clicks DESC
      LIMIT 5
    `;

    // Generate optimization actions
    const optimizationActions = generateOptimizationActions(
      monthlyStats?.totalRevenue || 0,
      projectedRevenue,
      topProducts,
      underperforming
    );

    // Store daily revenue tracking
    await automationDB.exec`
      INSERT INTO revenue_tracking (
        date, affiliate_clicks, affiliate_conversions, estimated_revenue,
        top_performing_products, content_performance
      ) VALUES (
        CURRENT_DATE, ${monthlyStats?.totalClicks || 0}, ${monthlyStats?.totalConversions || 0},
        ${monthlyStats?.totalRevenue || 0}, ${JSON.stringify(topProducts.slice(0, 5))},
        ${JSON.stringify({ projectedRevenue, optimizationCount: optimizationActions.length })}
      )
      ON CONFLICT (date) DO UPDATE SET
        affiliate_clicks = EXCLUDED.affiliate_clicks,
        affiliate_conversions = EXCLUDED.affiliate_conversions,
        estimated_revenue = EXCLUDED.estimated_revenue,
        top_performing_products = EXCLUDED.top_performing_products,
        content_performance = EXCLUDED.content_performance
    `;

    return {
      currentMonthRevenue: monthlyStats?.totalRevenue || 0,
      projectedMonthlyRevenue: projectedRevenue,
      topPerformingProducts: topProducts.map(p => ({
        ...p,
        conversionRate: p.clicks > 0 ? (p.conversions / p.clicks) * 100 : 0
      })),
      underperformingProducts: underperforming.map(p => ({
        ...p,
        suggestions: generateProductSuggestions(p)
      })),
      optimizationActions
    };
  }
);

function generateOptimizationActions(
  currentRevenue: number,
  projectedRevenue: number,
  topProducts: any[],
  underperforming: any[]
): string[] {
  const actions: string[] = [];
  
  // Revenue-based actions
  if (projectedRevenue < 2000) {
    actions.push("Increase content publishing frequency to 5+ articles per week");
    actions.push("Focus on high-converting product categories");
    actions.push("Implement email capture with lead magnets");
  }
  
  if (projectedRevenue > 3000) {
    actions.push("Scale successful content topics");
    actions.push("Explore premium affiliate programs");
    actions.push("Consider launching own digital products");
  }

  // Product-based actions
  if (topProducts.length > 0) {
    const topCategory = topProducts[0];
    actions.push(`Create more content around "${topCategory.productName}" category`);
    actions.push(`Increase promotion of top performer: ${topCategory.productName}`);
  }

  if (underperforming.length > 0) {
    actions.push(`Review and optimize ${underperforming.length} underperforming products`);
    actions.push("A/B test different product placement strategies");
  }

  // General optimization actions
  actions.push("Run weekly affiliate link health checks");
  actions.push("Optimize social media posting schedule");
  actions.push("Review and update SEO keywords");

  return actions;
}

function generateProductSuggestions(product: any): string[] {
  const suggestions: string[] = [];
  
  const conversionRate = product.clicks > 0 ? (product.conversions / product.clicks) * 100 : 0;
  
  if (conversionRate < 1) {
    suggestions.push("Review product placement in content");
    suggestions.push("Update product description and benefits");
    suggestions.push("Check if product link is working correctly");
  }
  
  if (product.clicks > 50 && conversionRate < 2) {
    suggestions.push("Consider replacing with similar higher-converting product");
    suggestions.push("Add more compelling call-to-action");
    suggestions.push("Include customer testimonials or reviews");
  }
  
  return suggestions;
}

// Automatically implements optimization actions.
export const implementOptimizations = api<{ actions: string[] }, { implemented: number; failed: number }>(
  { expose: true, method: "POST", path: "/automation/implement-optimizations" },
  async (req) => {
    let implemented = 0;
    let failed = 0;

    for (const action of req.actions) {
      try {
        if (action.includes("underperforming products")) {
          // Automatically deactivate products with <1% conversion rate
          await affiliateDB.exec`
            UPDATE affiliate_products SET is_active = false
            WHERE id IN (
              SELECT p.id
              FROM affiliate_products p
              JOIN affiliate_links al ON p.id = al.product_id
              JOIN affiliate_clicks ac ON al.id = ac.link_id
              LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
              WHERE ac.clicked_at >= NOW() - INTERVAL '30 days'
              GROUP BY p.id
              HAVING COUNT(DISTINCT ac.id) >= 10 
              AND (COUNT(DISTINCT conv.id)::float / COUNT(DISTINCT ac.id)) < 0.01
            )
          `;
          implemented++;
        }
        
        if (action.includes("content publishing frequency")) {
          // Schedule additional content generation
          await automationDB.exec`
            INSERT INTO automation_schedules (name, type, cron_expression, config)
            VALUES (
              'Increased Content Generation', 'content_generation', '0 9 * * 1,3,5',
              '{"topics": ["wellness tips", "healthy recipes", "fitness routines"], "auto_publish": true}'
            )
            ON CONFLICT (name) DO UPDATE SET
              cron_expression = EXCLUDED.cron_expression,
              config = EXCLUDED.config
          `;
          implemented++;
        }
        
        // Add more automation implementations here
        
      } catch (error) {
        console.error(`Failed to implement action: ${action}`, error);
        failed++;
      }
    }

    return { implemented, failed };
  }
);
