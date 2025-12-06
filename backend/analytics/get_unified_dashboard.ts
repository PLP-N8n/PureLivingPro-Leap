import { api } from "encore.dev/api";
import { analyticsDB } from "./db";
import { affiliateDB } from "../affiliate/db";
import { automationDB } from "../automation/db";
import { contentDB } from "../content/db";

export interface UnifiedDashboardData {
  overview: {
    totalPageViews: number;
    totalRevenue: number;
    totalArticles: number;
    totalAffiliateClicks: number;
    conversionRate: number;
    revenueGrowth: number;
    trafficGrowth: number;
  };
  contentPerformance: {
    publishedToday: number;
    publishedThisWeek: number;
    publishedThisMonth: number;
    topPerformingArticles: Array<{
      id: number;
      title: string;
      viewCount: number;
      revenue: number;
      publishedAt: Date;
    }>;
    contentByCategory: Array<{
      category: string;
      count: number;
      views: number;
    }>;
  };
  affiliateRevenue: {
    dailyRevenue: Array<{
      date: string;
      revenue: number;
      clicks: number;
      conversions: number;
    }>;
    topProducts: Array<{
      productId: number;
      productName: string;
      revenue: number;
      clicks: number;
      conversions: number;
      conversionRate: number;
    }>;
    monthlyTrend: {
      currentMonth: number;
      previousMonth: number;
      growth: number;
    };
  };
  automationStatus: {
    activePipelineJobs: number;
    completedToday: number;
    failedJobs: number;
    upcomingScheduled: number;
    recentActivity: Array<{
      id: number;
      topic: string;
      status: string;
      createdAt: Date;
      scheduledAt?: Date;
    }>;
    linkHealthSummary: {
      totalLinks: number;
      workingLinks: number;
      brokenLinks: number;
      lastChecked: Date | null;
    };
  };
  trafficAnalytics: {
    pageViewsTrend: Array<{
      date: string;
      views: number;
      uniqueVisitors: number;
    }>;
    topPages: Array<{
      path: string;
      views: number;
      bounceRate: number;
      avgTimeOnPage: number;
    }>;
    trafficSources: Array<{
      source: string;
      visitors: number;
      percentage: number;
    }>;
    deviceBreakdown: Array<{
      device: string;
      visitors: number;
      percentage: number;
    }>;
  };
  aiInsights: {
    recommendationAccuracy: number;
    totalRecommendationsServed: number;
    userEngagementRate: number;
    topRecommendedProducts: Array<{
      productName: string;
      recommendationCount: number;
      clickThrough: number;
    }>;
  };
}

export const getUnifiedDashboard = api<void, UnifiedDashboardData>(
  { expose: true, method: "GET", path: "/analytics/unified-dashboard" },
  async () => {
    // Overview metrics
    const totalPageViews = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM page_views 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;

    const totalRevenue = await affiliateDB.queryRow<{ revenue: number }>`
      SELECT COALESCE(SUM(commission_earned), 0) as revenue 
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '30 days'
    `;

    const totalArticles = await contentDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM articles WHERE published = true
    `;

    const totalAffiliateClicks = await affiliateDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM affiliate_clicks
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
    `;

    const conversionStats = await affiliateDB.queryRow<{ conversions: number }>`
      SELECT COUNT(*) as conversions FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '30 days'
    `;

    const conversionRate = (totalAffiliateClicks?.count || 0) > 0 
      ? ((conversionStats?.conversions || 0) / (totalAffiliateClicks?.count || 0)) * 100 
      : 0;

    // Growth calculations
    const previousMonthRevenue = await affiliateDB.queryRow<{ revenue: number }>`
      SELECT COALESCE(SUM(commission_earned), 0) as revenue 
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '60 days' AND converted_at < NOW() - INTERVAL '30 days'
    `;

    const previousMonthViews = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM page_views 
      WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'
    `;

    const revenueGrowth = (previousMonthRevenue?.revenue || 0) > 0 
      ? (((totalRevenue?.revenue || 0) - (previousMonthRevenue?.revenue || 0)) / (previousMonthRevenue?.revenue || 0)) * 100 
      : 0;

    const trafficGrowth = (previousMonthViews?.count || 0) > 0 
      ? (((totalPageViews?.count || 0) - (previousMonthViews?.count || 0)) / (previousMonthViews?.count || 0)) * 100 
      : 0;

    // Content performance
    const publishedToday = await contentDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM articles 
      WHERE published = true AND created_at >= CURRENT_DATE
    `;

    const publishedThisWeek = await contentDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM articles 
      WHERE published = true AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

    const publishedThisMonth = await contentDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM articles 
      WHERE published = true AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const topPerformingArticles = await contentDB.queryAll<{
      id: number;
      title: string;
      viewCount: number;
      revenue: number;
      publishedAt: Date;
    }>`
      SELECT 
        a.id,
        a.title,
        a.view_count as "viewCount",
        0 as revenue,
        a.created_at as "publishedAt"
      FROM articles a
      WHERE a.published = true
      ORDER BY a.view_count DESC
      LIMIT 10
    `;

    const contentByCategory = await contentDB.queryAll<{
      category: string;
      count: number;
      views: number;
    }>`
      SELECT 
        COALESCE(c.name, 'Uncategorized') as category,
        COUNT(a.id) as count,
        COALESCE(SUM(a.view_count), 0) as views
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = true
      GROUP BY c.name
      ORDER BY count DESC
    `;

    // Affiliate revenue trends
    const dailyRevenue = await affiliateDB.queryAll<{
      date: string;
      revenue: number;
      clicks: number;
      conversions: number;
    }>`
      SELECT 
        DATE(ac.converted_at) as date,
        COALESCE(SUM(ac.commission_earned), 0) as revenue,
        COUNT(DISTINCT acl.id) as clicks,
        COUNT(ac.id) as conversions
      FROM affiliate_conversions ac
      LEFT JOIN affiliate_clicks acl ON ac.click_id = acl.id
      WHERE ac.converted_at >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(ac.converted_at)
      ORDER BY date DESC
    `;

    const topProducts = await affiliateDB.queryAll<{
      productId: number;
      productName: string;
      revenue: number;
      clicks: number;
      conversions: number;
      conversionRate: number;
    }>`
      SELECT 
        p.id as "productId",
        p.name as "productName",
        COALESCE(SUM(ac.commission_earned), 0) as revenue,
        COUNT(DISTINCT acl.id) as clicks,
        COUNT(ac.id) as conversions,
        CASE 
          WHEN COUNT(DISTINCT acl.id) > 0 
          THEN (COUNT(ac.id)::FLOAT / COUNT(DISTINCT acl.id)::FLOAT) * 100 
          ELSE 0 
        END as "conversionRate"
      FROM affiliate_products p
      LEFT JOIN affiliate_links al ON p.id = al.product_id
      LEFT JOIN affiliate_clicks acl ON al.id = acl.link_id AND acl.clicked_at >= NOW() - INTERVAL '30 days'
      LEFT JOIN affiliate_conversions ac ON acl.id = ac.click_id AND ac.converted_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const currentMonthRevenue = await affiliateDB.queryRow<{ revenue: number }>`
      SELECT COALESCE(SUM(commission_earned), 0) as revenue 
      FROM affiliate_conversions
      WHERE converted_at >= DATE_TRUNC('month', NOW())
    `;

    const previousMonthRevenueForTrend = await affiliateDB.queryRow<{ revenue: number }>`
      SELECT COALESCE(SUM(commission_earned), 0) as revenue 
      FROM affiliate_conversions
      WHERE converted_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
        AND converted_at < DATE_TRUNC('month', NOW())
    `;

    const monthlyGrowth = (previousMonthRevenueForTrend?.revenue || 0) > 0 
      ? (((currentMonthRevenue?.revenue || 0) - (previousMonthRevenueForTrend?.revenue || 0)) / (previousMonthRevenueForTrend?.revenue || 0)) * 100 
      : 0;

    // Automation status
    const activePipelineJobs = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM content_pipeline 
      WHERE status IN ('pending', 'generating', 'reviewing')
    `;

    const completedToday = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM content_pipeline 
      WHERE status = 'published' AND updated_at >= CURRENT_DATE
    `;

    const failedJobs = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM content_pipeline 
      WHERE status = 'failed' AND updated_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

    const upcomingScheduled = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM content_pipeline 
      WHERE scheduled_publish_at > NOW() AND scheduled_publish_at <= NOW() + INTERVAL '24 hours'
    `;

    const recentActivity = await automationDB.queryAll<{
      id: number;
      topic: string;
      status: string;
      createdAt: Date;
      scheduledAt?: Date;
    }>`
      SELECT 
        id,
        topic,
        status,
        created_at as "createdAt",
        scheduled_publish_at as "scheduledAt"
      FROM content_pipeline
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const linkHealthData = await automationDB.queryRow<{
      totalLinks: number;
      workingLinks: number;
      brokenLinks: number;
      lastChecked: Date | null;
    }>`
      SELECT 
        COUNT(*) as "totalLinks",
        COUNT(CASE WHEN is_working = true THEN 1 END) as "workingLinks",
        COUNT(CASE WHEN is_working = false THEN 1 END) as "brokenLinks",
        MAX(last_checked_at) as "lastChecked"
      FROM affiliate_link_health
    `;

    // Traffic analytics
    const pageViewsTrend = await analyticsDB.queryAll<{
      date: string;
      views: number;
      uniqueVisitors: number;
    }>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT ip_address) as "uniqueVisitors"
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const topPages = await analyticsDB.queryAll<{
      path: string;
      views: number;
      bounceRate: number;
      avgTimeOnPage: number;
    }>`
      SELECT 
        page_path as path,
        COUNT(*) as views,
        0 as "bounceRate",
        0 as "avgTimeOnPage"
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `;

    const trafficSources = await analyticsDB.queryAll<{
      source: string;
      visitors: number;
      percentage: number;
    }>`
      SELECT 
        COALESCE(referrer, 'Direct') as source,
        COUNT(DISTINCT ip_address) as visitors,
        (COUNT(DISTINCT ip_address) * 100.0 / (SELECT COUNT(DISTINCT ip_address) FROM page_views WHERE created_at >= NOW() - INTERVAL '30 days')) as percentage
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY referrer
      ORDER BY visitors DESC
      LIMIT 10
    `;

    const deviceBreakdown = await analyticsDB.queryAll<{
      device: string;
      visitors: number;
      percentage: number;
    }>`
      SELECT 
        COALESCE(user_agent, 'Unknown') as device,
        COUNT(DISTINCT ip_address) as visitors,
        (COUNT(DISTINCT ip_address) * 100.0 / (SELECT COUNT(DISTINCT ip_address) FROM page_views WHERE created_at >= NOW() - INTERVAL '30 days')) as percentage
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY user_agent
      ORDER BY visitors DESC
      LIMIT 5
    `;

    return {
      overview: {
        totalPageViews: totalPageViews?.count || 0,
        totalRevenue: totalRevenue?.revenue || 0,
        totalArticles: totalArticles?.count || 0,
        totalAffiliateClicks: totalAffiliateClicks?.count || 0,
        conversionRate,
        revenueGrowth,
        trafficGrowth,
      },
      contentPerformance: {
        publishedToday: publishedToday?.count || 0,
        publishedThisWeek: publishedThisWeek?.count || 0,
        publishedThisMonth: publishedThisMonth?.count || 0,
        topPerformingArticles,
        contentByCategory,
      },
      affiliateRevenue: {
        dailyRevenue,
        topProducts,
        monthlyTrend: {
          currentMonth: currentMonthRevenue?.revenue || 0,
          previousMonth: previousMonthRevenueForTrend?.revenue || 0,
          growth: monthlyGrowth,
        },
      },
      automationStatus: {
        activePipelineJobs: activePipelineJobs?.count || 0,
        completedToday: completedToday?.count || 0,
        failedJobs: failedJobs?.count || 0,
        upcomingScheduled: upcomingScheduled?.count || 0,
        recentActivity,
        linkHealthSummary: {
          totalLinks: linkHealthData?.totalLinks || 0,
          workingLinks: linkHealthData?.workingLinks || 0,
          brokenLinks: linkHealthData?.brokenLinks || 0,
          lastChecked: linkHealthData?.lastChecked || null,
        },
      },
      trafficAnalytics: {
        pageViewsTrend,
        topPages,
        trafficSources,
        deviceBreakdown,
      },
      aiInsights: {
        recommendationAccuracy: 85.5, // Mock data - would come from AI service
        totalRecommendationsServed: 1250,
        userEngagementRate: 12.3,
        topRecommendedProducts: [
          { productName: "Premium Supplement A", recommendationCount: 150, clickThrough: 18.5 },
          { productName: "Natural Remedy B", recommendationCount: 135, clickThrough: 22.1 },
          { productName: "Wellness Product C", recommendationCount: 120, clickThrough: 15.8 },
        ],
      },
    };
  }
);