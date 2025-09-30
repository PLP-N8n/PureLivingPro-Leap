import { api } from "encore.dev/api";
import { analyticsDB } from "./db";
import { affiliateDB } from "../affiliate/db";
import { automationDB } from "../automation/db";
import { contentDB } from "../content/db";

export interface InsightItem {
  id: string;
  type: "warning" | "success" | "info" | "action";
  priority: "high" | "medium" | "low";
  category: "revenue" | "content" | "traffic" | "automation" | "performance";
  title: string;
  description: string;
  metric?: string;
  change?: number;
  actionable: boolean;
  suggestedAction?: string;
  createdAt: Date;
}

export interface ActionableInsightsResponse {
  insights: InsightItem[];
  summary: {
    totalInsights: number;
    highPriority: number;
    actionableItems: number;
    lastGenerated: Date;
  };
  performanceScore: {
    overall: number;
    revenue: number;
    content: number;
    traffic: number;
    automation: number;
  };
}

export const getActionableInsights = api<void, ActionableInsightsResponse>(
  { expose: true, method: "GET", path: "/analytics/insights" },
  async () => {
    const insights: InsightItem[] = [];
    const now = new Date();

    const brokenLinks = await automationDB.queryRow<{ count: number; total: number }>`
      SELECT 
        COUNT(CASE WHEN is_working = false THEN 1 END) as count,
        COUNT(*) as total
      FROM affiliate_link_health
    `;

    if (brokenLinks && brokenLinks.count > 0) {
      insights.push({
        id: "broken-links",
        type: "warning",
        priority: "high",
        category: "automation",
        title: "Broken Affiliate Links Detected",
        description: `${brokenLinks.count} out of ${brokenLinks.total} affiliate links are not working`,
        metric: `${((brokenLinks.count / brokenLinks.total) * 100).toFixed(1)}%`,
        actionable: true,
        suggestedAction: "Review and update broken links to prevent revenue loss",
        createdAt: now,
      });
    }

    const revenueDecline = await affiliateDB.queryRow<{ 
      thisWeek: number; 
      lastWeek: number; 
    }>`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN converted_at >= CURRENT_DATE - INTERVAL '7 days' 
          THEN commission_earned 
          ELSE 0 
        END), 0) as "thisWeek",
        COALESCE(SUM(CASE 
          WHEN converted_at >= CURRENT_DATE - INTERVAL '14 days' 
          AND converted_at < CURRENT_DATE - INTERVAL '7 days' 
          THEN commission_earned 
          ELSE 0 
        END), 0) as "lastWeek"
      FROM affiliate_conversions
    `;

    if (revenueDecline && revenueDecline.lastWeek > 0) {
      const change = ((revenueDecline.thisWeek - revenueDecline.lastWeek) / revenueDecline.lastWeek) * 100;
      
      if (change < -10) {
        insights.push({
          id: "revenue-decline",
          type: "warning",
          priority: "high",
          category: "revenue",
          title: "Significant Revenue Decline",
          description: "Weekly revenue has decreased compared to last week",
          metric: `$${revenueDecline.thisWeek.toFixed(2)}`,
          change,
          actionable: true,
          suggestedAction: "Review top-performing products and optimize affiliate placements",
          createdAt: now,
        });
      } else if (change > 20) {
        insights.push({
          id: "revenue-growth",
          type: "success",
          priority: "medium",
          category: "revenue",
          title: "Strong Revenue Growth",
          description: "Weekly revenue has increased significantly",
          metric: `$${revenueDecline.thisWeek.toFixed(2)}`,
          change,
          actionable: false,
          suggestedAction: "Analyze what's working and replicate successful strategies",
          createdAt: now,
        });
      }
    }

    const lowConversionProducts = await affiliateDB.queryAll<{
      productId: number;
      productName: string;
      clicks: number;
      conversions: number;
      conversionRate: number;
    }>`
      SELECT 
        p.id as "productId",
        p.name as "productName",
        COUNT(DISTINCT acl.id) as clicks,
        COUNT(DISTINCT ac.id) as conversions,
        CASE 
          WHEN COUNT(DISTINCT acl.id) > 0 
          THEN (COUNT(DISTINCT ac.id)::FLOAT / COUNT(DISTINCT acl.id)::FLOAT) * 100 
          ELSE 0 
        END as "conversionRate"
      FROM affiliate_products p
      LEFT JOIN affiliate_links al ON p.id = al.product_id
      LEFT JOIN affiliate_clicks acl ON al.id = acl.link_id AND acl.clicked_at >= NOW() - INTERVAL '30 days'
      LEFT JOIN affiliate_conversions ac ON acl.id = ac.click_id AND ac.converted_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.name
      HAVING COUNT(DISTINCT acl.id) > 20
      ORDER BY "conversionRate" ASC
      LIMIT 3
    `;

    lowConversionProducts.forEach((product) => {
      if (product.conversionRate < 2) {
        insights.push({
          id: `low-conversion-${product.productId}`,
          type: "info",
          priority: "medium",
          category: "performance",
          title: `Low Conversion Rate: ${product.productName}`,
          description: `${product.clicks} clicks but only ${product.conversions} conversions`,
          metric: `${product.conversionRate.toFixed(2)}%`,
          actionable: true,
          suggestedAction: "Consider updating product description, improving placement, or replacing with better-performing alternative",
          createdAt: now,
        });
      }
    });

    const contentGap = await contentDB.queryRow<{ 
      publishedThisWeek: number; 
      avgPerWeek: number; 
    }>`
      SELECT 
        COUNT(CASE 
          WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' AND published = true 
          THEN 1 
        END) as "publishedThisWeek",
        (COUNT(CASE WHEN published = true THEN 1 END)::FLOAT / 
          GREATEST(EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 604800, 1)) as "avgPerWeek"
      FROM articles
      WHERE created_at >= NOW() - INTERVAL '90 days'
    `;

    if (contentGap && contentGap.avgPerWeek > 0) {
      const expectedPublications = Math.round(contentGap.avgPerWeek);
      
      if (contentGap.publishedThisWeek < expectedPublications * 0.5) {
        insights.push({
          id: "content-production-low",
          type: "warning",
          priority: "high",
          category: "content",
          title: "Content Production Below Target",
          description: `Only ${contentGap.publishedThisWeek} articles published this week vs. ${expectedPublications} expected`,
          metric: `${contentGap.publishedThisWeek}/${expectedPublications}`,
          actionable: true,
          suggestedAction: "Review content pipeline and automation settings to increase output",
          createdAt: now,
        });
      }
    }

    const trafficTrend = await analyticsDB.queryRow<{
      thisWeek: number;
      lastWeek: number;
    }>`
      SELECT 
        COUNT(CASE 
          WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' 
          THEN 1 
        END) as "thisWeek",
        COUNT(CASE 
          WHEN created_at >= CURRENT_DATE - INTERVAL '14 days' 
          AND created_at < CURRENT_DATE - INTERVAL '7 days' 
          THEN 1 
        END) as "lastWeek"
      FROM page_views
    `;

    if (trafficTrend && trafficTrend.lastWeek > 0) {
      const change = ((trafficTrend.thisWeek - trafficTrend.lastWeek) / trafficTrend.lastWeek) * 100;
      
      if (change < -15) {
        insights.push({
          id: "traffic-decline",
          type: "warning",
          priority: "high",
          category: "traffic",
          title: "Significant Traffic Decline",
          description: "Weekly page views have dropped significantly",
          metric: `${trafficTrend.thisWeek.toLocaleString()}`,
          change,
          actionable: true,
          suggestedAction: "Check SEO rankings, review recent content quality, and analyze traffic sources",
          createdAt: now,
        });
      }
    }

    const failedAutomation = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM content_pipeline 
      WHERE status = 'failed' AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

    if (failedAutomation && failedAutomation.count > 5) {
      insights.push({
        id: "automation-failures",
        type: "warning",
        priority: "high",
        category: "automation",
        title: "Multiple Automation Failures",
        description: `${failedAutomation.count} pipeline jobs have failed in the past week`,
        metric: `${failedAutomation.count} failures`,
        actionable: true,
        suggestedAction: "Review error logs and fix automation pipeline issues",
        createdAt: now,
      });
    }

    const highPerformingCategory = await contentDB.queryRow<{
      category: string;
      avgViews: number;
      count: number;
    }>`
      SELECT 
        COALESCE(c.name, 'Uncategorized') as category,
        AVG(a.view_count) as "avgViews",
        COUNT(a.id) as count
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = true 
        AND a.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY c.name
      ORDER BY "avgViews" DESC
      LIMIT 1
    `;

    if (highPerformingCategory && highPerformingCategory.avgViews > 0) {
      insights.push({
        id: "high-performing-category",
        type: "success",
        priority: "low",
        category: "content",
        title: `${highPerformingCategory.category} Content Performing Well`,
        description: `Articles in this category average ${Math.round(highPerformingCategory.avgViews)} views`,
        metric: `${Math.round(highPerformingCategory.avgViews)} avg views`,
        actionable: true,
        suggestedAction: `Increase content production in ${highPerformingCategory.category} category`,
        createdAt: now,
      });
    }

    const staleContent = await contentDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM articles 
      WHERE published = true 
        AND updated_at < NOW() - INTERVAL '90 days'
        AND view_count > 100
    `;

    if (staleContent && staleContent.count > 10) {
      insights.push({
        id: "stale-content",
        type: "info",
        priority: "medium",
        category: "content",
        title: "High-Traffic Content Needs Refresh",
        description: `${staleContent.count} popular articles haven't been updated in 90+ days`,
        metric: `${staleContent.count} articles`,
        actionable: true,
        suggestedAction: "Update old content with fresh information and current affiliate links",
        createdAt: now,
      });
    }

    const revenuePerArticle = await affiliateDB.queryRow<{ avgRevenue: number }>`
      SELECT AVG(article_revenue) as "avgRevenue"
      FROM (
        SELECT 
          attr.article_id,
          COALESCE(SUM(ac.commission_earned), 0) as article_revenue
        FROM content_attribution attr
        LEFT JOIN affiliate_conversions ac ON attr.conversion_id = ac.id
        WHERE ac.converted_at >= NOW() - INTERVAL '30 days'
        GROUP BY attr.article_id
      ) AS article_revenues
      WHERE article_revenue > 0
    `;

    if (revenuePerArticle && revenuePerArticle.avgRevenue > 0) {
      insights.push({
        id: "revenue-per-article",
        type: "info",
        priority: "low",
        category: "performance",
        title: "Average Revenue Per Article",
        description: "Benchmark for content performance",
        metric: `$${revenuePerArticle.avgRevenue.toFixed(2)}`,
        actionable: false,
        suggestedAction: "Focus on creating content that exceeds this benchmark",
        createdAt: now,
      });
    }

    const highPriority = insights.filter(i => i.priority === "high").length;
    const actionableItems = insights.filter(i => i.actionable).length;

    const revenueScore = await calculateRevenueScore();
    const contentScore = await calculateContentScore();
    const trafficScore = await calculateTrafficScore();
    const automationScore = await calculateAutomationScore();
    const overall = (revenueScore + contentScore + trafficScore + automationScore) / 4;

    return {
      insights: insights.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      summary: {
        totalInsights: insights.length,
        highPriority,
        actionableItems,
        lastGenerated: now,
      },
      performanceScore: {
        overall,
        revenue: revenueScore,
        content: contentScore,
        traffic: trafficScore,
        automation: automationScore,
      },
    };
  }
);

async function calculateRevenueScore(): Promise<number> {
  const revenueData = await affiliateDB.queryRow<{
    thisMonth: number;
    lastMonth: number;
    conversionRate: number;
  }>`
    SELECT 
      COALESCE(SUM(CASE 
        WHEN converted_at >= DATE_TRUNC('month', NOW()) 
        THEN commission_earned 
        ELSE 0 
      END), 0) as "thisMonth",
      COALESCE(SUM(CASE 
        WHEN converted_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
        AND converted_at < DATE_TRUNC('month', NOW())
        THEN commission_earned 
        ELSE 0 
      END), 0) as "lastMonth",
      (SELECT 
        CASE 
          WHEN COUNT(DISTINCT acl.id) > 0 
          THEN (COUNT(DISTINCT ac.id)::FLOAT / COUNT(DISTINCT acl.id)::FLOAT) * 100 
          ELSE 0 
        END
        FROM affiliate_clicks acl
        LEFT JOIN affiliate_conversions ac ON acl.id = ac.click_id
        WHERE acl.clicked_at >= NOW() - INTERVAL '30 days'
      ) as "conversionRate"
    FROM affiliate_conversions
  `;

  let score = 50;

  if (revenueData) {
    if (revenueData.thisMonth > revenueData.lastMonth) {
      score += 20;
    } else if (revenueData.thisMonth < revenueData.lastMonth * 0.8) {
      score -= 20;
    }

    if (revenueData.conversionRate > 5) score += 15;
    else if (revenueData.conversionRate > 3) score += 10;
    else if (revenueData.conversionRate < 1) score -= 15;

    if (revenueData.thisMonth > 1000) score += 15;
    else if (revenueData.thisMonth > 500) score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

async function calculateContentScore(): Promise<number> {
  const contentData = await contentDB.queryRow<{
    publishedThisMonth: number;
    avgViews: number;
    totalArticles: number;
  }>`
    SELECT 
      COUNT(CASE 
        WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' AND published = true 
        THEN 1 
      END) as "publishedThisMonth",
      AVG(CASE WHEN published = true THEN view_count ELSE 0 END) as "avgViews",
      COUNT(CASE WHEN published = true THEN 1 END) as "totalArticles"
    FROM articles
  `;

  let score = 50;

  if (contentData) {
    if (contentData.publishedThisMonth > 20) score += 20;
    else if (contentData.publishedThisMonth > 10) score += 15;
    else if (contentData.publishedThisMonth < 5) score -= 15;

    if (contentData.avgViews > 500) score += 15;
    else if (contentData.avgViews > 200) score += 10;
    else if (contentData.avgViews < 50) score -= 10;

    if (contentData.totalArticles > 100) score += 15;
    else if (contentData.totalArticles > 50) score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

async function calculateTrafficScore(): Promise<number> {
  const trafficData = await analyticsDB.queryRow<{
    thisWeek: number;
    lastWeek: number;
    uniqueVisitors: number;
  }>`
    SELECT 
      COUNT(CASE 
        WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' 
        THEN 1 
      END) as "thisWeek",
      COUNT(CASE 
        WHEN created_at >= CURRENT_DATE - INTERVAL '14 days' 
        AND created_at < CURRENT_DATE - INTERVAL '7 days' 
        THEN 1 
      END) as "lastWeek",
      COUNT(DISTINCT CASE 
        WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' 
        THEN ip_address 
      END) as "uniqueVisitors"
    FROM page_views
  `;

  let score = 50;

  if (trafficData) {
    if (trafficData.thisWeek > trafficData.lastWeek) score += 20;
    else if (trafficData.thisWeek < trafficData.lastWeek * 0.8) score -= 20;

    if (trafficData.uniqueVisitors > 5000) score += 15;
    else if (trafficData.uniqueVisitors > 1000) score += 10;
    else if (trafficData.uniqueVisitors < 100) score -= 15;

    if (trafficData.thisWeek > 10000) score += 15;
    else if (trafficData.thisWeek > 5000) score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

async function calculateAutomationScore(): Promise<number> {
  const automationData = await automationDB.queryRow<{
    activePipeline: number;
    failedJobs: number;
    completedToday: number;
    brokenLinks: number;
    totalLinks: number;
  }>`
    SELECT 
      COUNT(CASE 
        WHEN status IN ('pending', 'generating', 'reviewing') 
        THEN 1 
      END) as "activePipeline",
      COUNT(CASE 
        WHEN status = 'failed' AND updated_at >= CURRENT_DATE - INTERVAL '7 days' 
        THEN 1 
      END) as "failedJobs",
      COUNT(CASE 
        WHEN status = 'published' AND updated_at >= CURRENT_DATE 
        THEN 1 
      END) as "completedToday",
      (SELECT COUNT(CASE WHEN is_working = false THEN 1 END) FROM affiliate_link_health) as "brokenLinks",
      (SELECT COUNT(*) FROM affiliate_link_health) as "totalLinks"
    FROM content_pipeline
  `;

  let score = 50;

  if (automationData) {
    if (automationData.failedJobs === 0) score += 20;
    else if (automationData.failedJobs < 3) score += 10;
    else if (automationData.failedJobs > 10) score -= 20;

    if (automationData.completedToday > 5) score += 15;
    else if (automationData.completedToday > 2) score += 10;

    if (automationData.totalLinks > 0) {
      const linkHealthRate = (automationData.totalLinks - automationData.brokenLinks) / automationData.totalLinks;
      if (linkHealthRate > 0.95) score += 15;
      else if (linkHealthRate > 0.85) score += 10;
      else if (linkHealthRate < 0.7) score -= 15;
    }
  }

  return Math.max(0, Math.min(100, score));
}