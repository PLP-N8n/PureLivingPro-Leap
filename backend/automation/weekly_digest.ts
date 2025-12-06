import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { affiliateDB } from "../affiliate/db";
import { contentDB } from "../content/db";

interface WeeklyDigestResponse {
  emailSent: boolean;
  reportData: {
    period: {
      start: string;
      end: string;
    };
    content: {
      articlesPublished: number;
      totalViews: number;
      topArticle: {
        title: string;
        views: number;
        slug: string;
      };
    };
    affiliate: {
      totalClicks: number;
      totalRevenue: number;
      conversionRate: number;
      topProduct: {
        name: string;
        revenue: number;
        clicks: number;
      };
    };
    recommendations: string[];
  };
}

// Generates and sends weekly performance digest.
export const generateWeeklyDigest = api<void, WeeklyDigestResponse>(
  { expose: true, method: "POST", path: "/automation/weekly-digest" },
  async () => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get content metrics
    const contentMetrics = await contentDB.queryRow<{
      articlesPublished: number;
      totalViews: number;
    }>`
      SELECT 
        COUNT(*) as "articlesPublished",
        COALESCE(SUM(view_count), 0) as "totalViews"
      FROM articles
      WHERE published = true
      AND created_at >= ${weekStart.toISOString()}
    `;

    // Get top article
    const topArticle = await contentDB.queryRow<{
      title: string;
      views: number;
      slug: string;
    }>`
      SELECT title, view_count as views, slug
      FROM articles
      WHERE published = true
      AND created_at >= ${weekStart.toISOString()}
      ORDER BY view_count DESC
      LIMIT 1
    `;

    // Get affiliate metrics
    const affiliateMetrics = await affiliateDB.queryRow<{
      totalClicks: number;
      totalRevenue: number;
      totalConversions: number;
    }>`
      SELECT 
        COUNT(DISTINCT ac.id) as "totalClicks",
        COALESCE(SUM(conv.commission_earned), 0) as "totalRevenue",
        COUNT(DISTINCT conv.id) as "totalConversions"
      FROM affiliate_clicks ac
      LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
      WHERE ac.clicked_at >= ${weekStart.toISOString()}
    `;

    // Get top product
    const topProduct = await affiliateDB.queryRow<{
      name: string;
      revenue: number;
      clicks: number;
    }>`
      SELECT 
        p.name,
        COALESCE(SUM(conv.commission_earned), 0) as revenue,
        COUNT(DISTINCT ac.id) as clicks
      FROM affiliate_products p
      JOIN affiliate_links al ON p.id = al.product_id
      JOIN affiliate_clicks ac ON al.id = ac.link_id
      LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
      WHERE ac.clicked_at >= ${weekStart.toISOString()}
      GROUP BY p.id, p.name
      ORDER BY revenue DESC, clicks DESC
      LIMIT 1
    `;

    const conversionRate = affiliateMetrics?.totalClicks ? 
      (affiliateMetrics.totalConversions / affiliateMetrics.totalClicks) * 100 : 0;

    // Generate recommendations
    const recommendations = generateWeeklyRecommendations({
      articlesPublished: contentMetrics?.articlesPublished || 0,
      totalRevenue: affiliateMetrics?.totalRevenue || 0,
      conversionRate
    });

    const reportData = {
      period: {
        start: weekStart.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      },
      content: {
        articlesPublished: contentMetrics?.articlesPublished || 0,
        totalViews: contentMetrics?.totalViews || 0,
        topArticle: topArticle || {
          title: "No articles published this week",
          views: 0,
          slug: ""
        }
      },
      affiliate: {
        totalClicks: affiliateMetrics?.totalClicks || 0,
        totalRevenue: affiliateMetrics?.totalRevenue || 0,
        conversionRate,
        topProduct: topProduct || {
          name: "No product data available",
          revenue: 0,
          clicks: 0
        }
      },
      recommendations
    };

    // Store weekly report
    await automationDB.exec`
      INSERT INTO automation_metrics (metric_name, metric_value, metric_date)
      VALUES 
        ('weekly_articles', ${reportData.content.articlesPublished}, CURRENT_DATE),
        ('weekly_revenue', ${reportData.affiliate.totalRevenue}, CURRENT_DATE),
        ('weekly_clicks', ${reportData.affiliate.totalClicks}, CURRENT_DATE),
        ('weekly_conversion_rate', ${reportData.affiliate.conversionRate}, CURRENT_DATE)
      ON CONFLICT (metric_name, metric_date) DO UPDATE SET
        metric_value = EXCLUDED.metric_value
    `;

    // In a real implementation, you would send an email here
    // For now, we'll just log the report
    console.log('Weekly Digest Generated:', reportData);

    return {
      emailSent: true, // Simulated
      reportData
    };
  }
);

function generateWeeklyRecommendations(metrics: {
  articlesPublished: number;
  totalRevenue: number;
  conversionRate: number;
}): string[] {
  const recommendations: string[] = [];

  if (metrics.articlesPublished < 3) {
    recommendations.push("📝 Increase content publishing to 3-4 articles per week for better SEO performance");
  }

  if (metrics.totalRevenue < 100) {
    recommendations.push("💰 Focus on higher-commission affiliate products and optimize product placement");
  }

  if (metrics.conversionRate < 2) {
    recommendations.push("🎯 Improve affiliate link placement and add more compelling call-to-actions");
  }

  if (metrics.articlesPublished > 5) {
    recommendations.push("✅ Great content output! Focus on promoting existing articles on social media");
  }

  if (metrics.conversionRate > 5) {
    recommendations.push("🚀 Excellent conversion rate! Scale successful strategies to more content");
  }

  // Always include general recommendations
  recommendations.push("📊 Review Google Analytics for top-performing content and replicate successful topics");
  recommendations.push("🔗 Check affiliate links weekly to ensure they're still active and converting");

  return recommendations;
}
