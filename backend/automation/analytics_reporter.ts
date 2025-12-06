import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { affiliateDB } from "../affiliate/db";
import { contentDB } from "../content/db";

interface WeeklyReport {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number;
    target: number;
    percentageOfTarget: number;
    projectedMonthly: number;
  };
  content: {
    articlesPublished: number;
    totalViews: number;
    topPerformingArticle: {
      title: string;
      views: number;
      slug: string;
    };
  };
  affiliate: {
    totalClicks: number;
    conversions: number;
    conversionRate: number;
    topProduct: {
      name: string;
      revenue: number;
      clicks: number;
    };
  };
  automation: {
    tasksExecuted: number;
    contentGenerated: number;
    socialPostsPublished: number;
    linksChecked: number;
  };
  recommendations: string[];
}

// Generates comprehensive weekly performance report.
export const generateWeeklyReport = api<void, WeeklyReport>(
  { expose: true, method: "GET", path: "/automation/weekly-report" },
  async () => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Revenue metrics
    const revenueData = await affiliateDB.queryRow<{
      totalRevenue: number;
      totalClicks: number;
      totalConversions: number;
    }>`
      SELECT 
        COALESCE(SUM(conv.commission_earned), 0) as "totalRevenue",
        COUNT(DISTINCT ac.id) as "totalClicks",
        COUNT(DISTINCT conv.id) as "totalConversions"
      FROM affiliate_clicks ac
      LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
      WHERE ac.clicked_at >= ${weekStart.toISOString()}
    `;

    // Content metrics
    const contentData = await contentDB.queryRow<{
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

    // Top performing article
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

    // Top performing product
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

    // Automation metrics
    const automationData = await automationDB.queryRow<{
      tasksExecuted: number;
      contentGenerated: number;
      socialPosts: number;
    }>`
      SELECT 
        COUNT(CASE WHEN type = 'content_generation' THEN 1 END) as "contentGenerated",
        COUNT(CASE WHEN type = 'social_posting' THEN 1 END) as "socialPosts",
        COUNT(*) as "tasksExecuted"
      FROM automation_schedules
      WHERE last_run_at >= ${weekStart.toISOString()}
    `;

    const linksChecked = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(DISTINCT affiliate_link_id) as count
      FROM affiliate_link_health
      WHERE last_checked_at >= ${weekStart.toISOString()}
    `;

    // Calculate projections and recommendations
    const weeklyRevenue = revenueData?.totalRevenue || 0;
    const projectedMonthly = weeklyRevenue * 4.33; // Average weeks per month
    const monthlyTarget = 2000; // £2,000 target
    const percentageOfTarget = (projectedMonthly / monthlyTarget) * 100;

    const recommendations = generateRecommendations({
      weeklyRevenue,
      projectedMonthly,
      percentageOfTarget,
      articlesPublished: contentData?.articlesPublished || 0,
      conversionRate: revenueData?.totalClicks ? (revenueData.totalConversions / revenueData.totalClicks) * 100 : 0
    });

    return {
      period: {
        start: weekStart.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      },
      revenue: {
        total: weeklyRevenue,
        target: monthlyTarget / 4.33, // Weekly target
        percentageOfTarget,
        projectedMonthly
      },
      content: {
        articlesPublished: contentData?.articlesPublished || 0,
        totalViews: contentData?.totalViews || 0,
        topPerformingArticle: topArticle || {
          title: "No articles published this week",
          views: 0,
          slug: ""
        }
      },
      affiliate: {
        totalClicks: revenueData?.totalClicks || 0,
        conversions: revenueData?.totalConversions || 0,
        conversionRate: revenueData?.totalClicks ? (revenueData.totalConversions / revenueData.totalClicks) * 100 : 0,
        topProduct: topProduct || {
          name: "No product data available",
          revenue: 0,
          clicks: 0
        }
      },
      automation: {
        tasksExecuted: automationData?.tasksExecuted || 0,
        contentGenerated: automationData?.contentGenerated || 0,
        socialPostsPublished: automationData?.socialPosts || 0,
        linksChecked: linksChecked?.count || 0
      },
      recommendations
    };
  }
);

function generateRecommendations(metrics: {
  weeklyRevenue: number;
  projectedMonthly: number;
  percentageOfTarget: number;
  articlesPublished: number;
  conversionRate: number;
}): string[] {
  const recommendations: string[] = [];

  // Revenue-based recommendations
  if (metrics.percentageOfTarget < 50) {
    recommendations.push("🚨 Revenue significantly below target. Increase content frequency and focus on high-converting topics.");
    recommendations.push("💡 Consider adding more affiliate products in wellness and nutrition categories.");
  } else if (metrics.percentageOfTarget < 80) {
    recommendations.push("⚠️ Revenue below target. Optimize existing content for better affiliate placement.");
  } else if (metrics.percentageOfTarget > 120) {
    recommendations.push("🎉 Revenue exceeding target! Scale successful strategies and explore premium affiliate programs.");
  }

  // Content recommendations
  if (metrics.articlesPublished < 3) {
    recommendations.push("📝 Increase content publishing to at least 3-4 articles per week for better SEO and affiliate opportunities.");
  } else if (metrics.articlesPublished > 7) {
    recommendations.push("✅ Great content output! Focus on quality and affiliate optimization.");
  }

  // Conversion recommendations
  if (metrics.conversionRate < 2) {
    recommendations.push("🔄 Low conversion rate. Review affiliate product placement and add more compelling CTAs.");
  } else if (metrics.conversionRate > 5) {
    recommendations.push("🎯 Excellent conversion rate! Document successful strategies for replication.");
  }

  // Automation recommendations
  recommendations.push("🤖 Review automation schedules weekly to ensure optimal performance.");
  recommendations.push("📊 Monitor affiliate link health and replace broken links immediately.");

  return recommendations;
}

// Sends automated email report (placeholder for email integration).
export const sendWeeklyReport = api<{ email: string }, { sent: boolean }>(
  { expose: true, method: "POST", path: "/automation/send-report" },
  async (req) => {
    const report = await generateWeeklyReport();
    
    // Here you would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll just log the report
    console.log('Weekly Report for:', req.email);
    console.log('Revenue:', report.revenue);
    console.log('Recommendations:', report.recommendations);
    
    // Simulate email sending
    return { sent: true };
  }
);
