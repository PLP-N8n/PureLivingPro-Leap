import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { affiliateDB } from "../affiliate/db";
import { contentDB } from "../content/db";

interface OptimizationReport {
  contentOptimizations: Array<{
    articleId: number;
    title: string;
    currentRevenue: number;
    potentialRevenue: number;
    recommendations: string[];
  }>;
  affiliateOptimizations: Array<{
    productId: number;
    productName: string;
    currentCTR: number;
    recommendedActions: string[];
  }>;
  keywordOpportunities: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    potentialRevenue: number;
  }>;
  totalPotentialIncrease: number;
}

interface ImplementOptimizationsRequest {
  contentOptimizations: number[];
  affiliateOptimizations: number[];
  keywordTargets: string[];
}

// Analyzes performance and generates optimization recommendations.
export const analyzePerformance = api<void, OptimizationReport>(
  { expose: true, method: "GET", path: "/automation/performance-analysis" },
  async () => {
    // Analyze content performance
    const contentOptimizations = await analyzeContentPerformance();
    
    // Analyze affiliate performance
    const affiliateOptimizations = await analyzeAffiliatePerformance();
    
    // Identify keyword opportunities
    const keywordOpportunities = await identifyKeywordOpportunities();
    
    // Calculate total potential revenue increase
    const totalPotentialIncrease = 
      contentOptimizations.reduce((sum, opt) => sum + (opt.potentialRevenue - opt.currentRevenue), 0) +
      keywordOpportunities.reduce((sum, kw) => sum + kw.potentialRevenue, 0);

    return {
      contentOptimizations,
      affiliateOptimizations,
      keywordOpportunities,
      totalPotentialIncrease
    };
  }
);

// Automatically implements selected optimizations.
export const implementOptimizations = api<ImplementOptimizationsRequest, { 
  implemented: number; 
  failed: number; 
  estimatedImpact: number 
}>(
  { expose: true, method: "POST", path: "/automation/implement-optimizations" },
  async (req) => {
    let implemented = 0;
    let failed = 0;
    let estimatedImpact = 0;

    // Implement content optimizations
    for (const articleId of req.contentOptimizations) {
      try {
        const optimization = await optimizeArticleContent(articleId);
        if (optimization.success) {
          implemented++;
          estimatedImpact += optimization.estimatedImpact;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to optimize article ${articleId}:`, error);
        failed++;
      }
    }

    // Implement affiliate optimizations
    for (const productId of req.affiliateOptimizations) {
      try {
        const optimization = await optimizeAffiliateProduct(productId);
        if (optimization.success) {
          implemented++;
          estimatedImpact += optimization.estimatedImpact;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to optimize product ${productId}:`, error);
        failed++;
      }
    }

    // Schedule content for new keyword targets
    for (const keyword of req.keywordTargets) {
      try {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 7) + 1);
        
        await automationDB.exec`
          INSERT INTO content_pipeline (
            topic, status, target_keywords, scheduled_publish_at, estimated_revenue
          ) VALUES (
            'Optimized content for ${keyword}', 'scheduled', ${[keyword]},
            ${scheduledDate.toISOString()}, ${calculateKeywordRevenuePotential(keyword)}
          )
        `;
        
        implemented++;
        estimatedImpact += await calculateKeywordRevenuePotential(keyword);
      } catch (error) {
        console.error(`Failed to schedule content for keyword ${keyword}:`, error);
        failed++;
      }
    }

    return { implemented, failed, estimatedImpact };
  }
);

async function analyzeContentPerformance() {
  const articles = await contentDB.queryAll<{
    id: number;
    title: string;
    viewCount: number;
    createdAt: Date;
  }>`
    SELECT id, title, view_count as "viewCount", created_at as "createdAt"
    FROM articles
    WHERE published = true
    AND created_at >= NOW() - INTERVAL '30 days'
    ORDER BY view_count DESC
    LIMIT 20
  `;

  const optimizations = [];

  for (const article of articles) {
    // Get affiliate clicks for this article
    const affiliateData = await affiliateDB.queryRow<{
      clicks: number;
      conversions: number;
      revenue: number;
    }>`
      SELECT 
        COUNT(DISTINCT ac.id) as clicks,
        COUNT(DISTINCT conv.id) as conversions,
        COALESCE(SUM(conv.commission_earned), 0) as revenue
      FROM affiliate_clicks ac
      LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
      WHERE ac.content_id = ${article.id.toString()}
    `;

    const currentRevenue = affiliateData?.revenue || 0;
    const ctr = article.viewCount > 0 ? (affiliateData?.clicks || 0) / article.viewCount : 0;
    
    // Calculate potential revenue with optimizations
    const potentialRevenue = currentRevenue * (1 + (0.1 - ctr) * 2); // Assume 10% CTR is optimal
    
    const recommendations = [];
    
    if (ctr < 0.05) {
      recommendations.push("Add more prominent affiliate product placements");
      recommendations.push("Include product comparison tables");
    }
    
    if (currentRevenue < 10) {
      recommendations.push("Target higher-commission affiliate products");
      recommendations.push("Add related product recommendations");
    }
    
    if (article.viewCount < 100) {
      recommendations.push("Optimize SEO keywords and meta descriptions");
      recommendations.push("Promote on social media platforms");
    }

    if (recommendations.length > 0) {
      optimizations.push({
        articleId: article.id,
        title: article.title,
        currentRevenue,
        potentialRevenue,
        recommendations
      });
    }
  }

  return optimizations;
}

async function analyzeAffiliatePerformance() {
  const products = await affiliateDB.queryAll<{
    id: number;
    name: string;
    clicks: number;
    conversions: number;
  }>`
    SELECT 
      p.id, p.name,
      COUNT(DISTINCT ac.id) as clicks,
      COUNT(DISTINCT conv.id) as conversions
    FROM affiliate_products p
    JOIN affiliate_links al ON p.id = al.product_id
    LEFT JOIN affiliate_clicks ac ON al.id = ac.link_id
    LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
    WHERE ac.clicked_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.name
    HAVING COUNT(DISTINCT ac.id) >= 10
    ORDER BY clicks DESC
  `;

  const optimizations = [];

  for (const product of products) {
    const ctr = product.clicks > 0 ? product.conversions / product.clicks : 0;
    const recommendations = [];

    if (ctr < 0.02) {
      recommendations.push("Update product description with better benefits");
      recommendations.push("Add customer testimonials and reviews");
      recommendations.push("Improve product image quality");
    }

    if (product.clicks > 50 && ctr < 0.01) {
      recommendations.push("Consider replacing with similar higher-converting product");
      recommendations.push("A/B test different call-to-action buttons");
    }

    if (recommendations.length > 0) {
      optimizations.push({
        productId: product.id,
        productName: product.name,
        currentCTR: ctr * 100,
        recommendedActions: recommendations
      });
    }
  }

  return optimizations;
}

async function identifyKeywordOpportunities() {
  // This would integrate with SEO tools like SEMrush or Ahrefs in production
  // For now, we'll use a simplified approach based on existing content performance
  
  const topKeywords = await contentDB.queryAll<{
    keyword: string;
    articleCount: number;
    avgViews: number;
  }>`
    SELECT 
      unnest(string_to_array(lower(title), ' ')) as keyword,
      COUNT(*) as "articleCount",
      AVG(view_count) as "avgViews"
    FROM articles
    WHERE published = true
    AND created_at >= NOW() - INTERVAL '90 days'
    AND length(unnest(string_to_array(lower(title), ' '))) > 4
    GROUP BY keyword
    HAVING COUNT(*) >= 2
    ORDER BY "avgViews" DESC
    LIMIT 10
  `;

  return topKeywords.map(kw => ({
    keyword: kw.keyword,
    searchVolume: Math.floor(kw.avgViews * 10), // Simulated search volume
    difficulty: Math.floor(Math.random() * 100), // Simulated difficulty
    potentialRevenue: kw.avgViews * 0.1 // Estimated revenue potential
  }));
}

async function optimizeArticleContent(articleId: number): Promise<{ success: boolean; estimatedImpact: number }> {
  try {
    // Get article content
    const article = await contentDB.queryRow<{ content: string; title: string }>`
      SELECT content, title FROM articles WHERE id = ${articleId}
    `;

    if (!article) {
      return { success: false, estimatedImpact: 0 };
    }

    // Find relevant affiliate products not currently in the article
    const relevantProducts = await affiliateDB.queryAll<{
      id: number;
      name: string;
      description: string;
    }>`
      SELECT id, name, description
      FROM affiliate_products
      WHERE is_active = true
      AND id NOT IN (
        SELECT DISTINCT al.product_id
        FROM affiliate_links al
        JOIN affiliate_clicks ac ON al.id = ac.link_id
        WHERE ac.content_id = ${articleId.toString()}
      )
      LIMIT 3
    `;

    // Add affiliate product recommendations to the article
    if (relevantProducts.length > 0) {
      const productSection = `
        <h3>Recommended Products</h3>
        <div class="affiliate-products">
          ${relevantProducts.map(p => `
            <div class="product-recommendation">
              <h4>${p.name}</h4>
              <p>${p.description}</p>
              <a href="/r/product-${p.id}" class="affiliate-link">View Product</a>
            </div>
          `).join('')}
        </div>
      `;

      const updatedContent = article.content + productSection;

      await contentDB.exec`
        UPDATE articles 
        SET content = ${updatedContent}, updated_at = NOW()
        WHERE id = ${articleId}
      `;

      return { success: true, estimatedImpact: relevantProducts.length * 5 };
    }

    return { success: false, estimatedImpact: 0 };
  } catch (error) {
    console.error('Article optimization error:', error);
    return { success: false, estimatedImpact: 0 };
  }
}

async function optimizeAffiliateProduct(productId: number): Promise<{ success: boolean; estimatedImpact: number }> {
  try {
    // Get product performance data
    const performance = await affiliateDB.queryRow<{
      clicks: number;
      conversions: number;
    }>`
      SELECT 
        COUNT(DISTINCT ac.id) as clicks,
        COUNT(DISTINCT conv.id) as conversions
      FROM affiliate_links al
      JOIN affiliate_clicks ac ON al.id = ac.link_id
      LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
      WHERE al.product_id = ${productId}
      AND ac.clicked_at >= NOW() - INTERVAL '30 days'
    `;

    if (!performance || performance.clicks < 10) {
      return { success: false, estimatedImpact: 0 };
    }

    const currentCTR = performance.conversions / performance.clicks;

    // If CTR is very low, deactivate the product
    if (currentCTR < 0.005) {
      await affiliateDB.exec`
        UPDATE affiliate_products 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${productId}
      `;

      return { success: true, estimatedImpact: -5 }; // Negative impact from removing poor performer
    }

    // Otherwise, try to improve the product listing
    await affiliateDB.exec`
      UPDATE affiliate_products 
      SET description = CONCAT(description, ' - Highly recommended by our wellness experts!'),
          updated_at = NOW()
      WHERE id = ${productId}
    `;

    return { success: true, estimatedImpact: 2 };
  } catch (error) {
    console.error('Product optimization error:', error);
    return { success: false, estimatedImpact: 0 };
  }
}

async function calculateKeywordRevenuePotential(keyword: string): Promise<number> {
  // Simplified calculation based on keyword characteristics
  const baseValue = 15;
  const keywordLength = keyword.length;
  const multiplier = keywordLength > 10 ? 1.5 : 1.0; // Longer keywords often have higher intent
  
  return Math.round(baseValue * multiplier * 100) / 100;
}
