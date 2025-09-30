import { api } from "encore.dev/api";
import { analyticsDB } from "./db";
import { affiliateDB } from "../affiliate/db";
import { automationDB } from "../automation/db";
import { contentDB } from "../content/db";

export interface RealTimeMetrics {
  timestamp: Date;
  liveVisitors: number;
  activePages: Array<{
    path: string;
    visitors: number;
    avgTimeOnPage: number;
  }>;
  recentConversions: Array<{
    id: number;
    productName: string;
    commission: number;
    convertedAt: Date;
  }>;
  recentClicks: Array<{
    id: number;
    productName: string;
    clickedAt: Date;
    deviceType?: string;
  }>;
  currentMetrics: {
    clicksLastHour: number;
    conversionsLastHour: number;
    revenueLastHour: number;
    pageViewsLastHour: number;
    uniqueVisitorsLastHour: number;
  };
  automationActivity: {
    jobsInProgress: number;
    completedLastHour: number;
    queuedJobs: number;
  };
  performanceIndicators: {
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
  };
}

export const getRealTimeMetrics = api<void, RealTimeMetrics>(
  { expose: true, method: "GET", path: "/analytics/real-time" },
  async () => {
    const now = new Date();

    const liveVisitorsResult = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(DISTINCT ip_address) as count
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '5 minutes'
    `;

    const activePages = await analyticsDB.queryAll<{
      path: string;
      visitors: number;
      avgTimeOnPage: number;
    }>`
      SELECT 
        page_path as path,
        COUNT(DISTINCT ip_address) as visitors,
        0 as "avgTimeOnPage"
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '10 minutes'
      GROUP BY page_path
      ORDER BY visitors DESC
      LIMIT 10
    `;

    const recentConversions = await affiliateDB.queryAll<{
      id: number;
      productName: string;
      commission: number;
      convertedAt: Date;
    }>`
      SELECT 
        ac.id,
        p.name as "productName",
        ac.commission_earned as commission,
        ac.converted_at as "convertedAt"
      FROM affiliate_conversions ac
      LEFT JOIN affiliate_clicks acl ON ac.click_id = acl.id
      LEFT JOIN affiliate_links al ON acl.link_id = al.id
      LEFT JOIN affiliate_products p ON al.product_id = p.id
      WHERE ac.converted_at >= NOW() - INTERVAL '1 hour'
      ORDER BY ac.converted_at DESC
      LIMIT 10
    `;

    const recentClicks = await affiliateDB.queryAll<{
      id: number;
      productName: string;
      clickedAt: Date;
      deviceType?: string;
    }>`
      SELECT 
        acl.id,
        p.name as "productName",
        acl.clicked_at as "clickedAt",
        acl.device_type as "deviceType"
      FROM affiliate_clicks acl
      LEFT JOIN affiliate_links al ON acl.link_id = al.id
      LEFT JOIN affiliate_products p ON al.product_id = p.id
      WHERE acl.clicked_at >= NOW() - INTERVAL '1 hour'
      ORDER BY acl.clicked_at DESC
      LIMIT 20
    `;

    const clicksLastHourResult = await affiliateDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM affiliate_clicks
      WHERE clicked_at >= NOW() - INTERVAL '1 hour'
    `;

    const conversionsLastHourResult = await affiliateDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '1 hour'
    `;

    const revenueLastHourResult = await affiliateDB.queryRow<{ revenue: number }>`
      SELECT COALESCE(SUM(commission_earned), 0) as revenue
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '1 hour'
    `;

    const pageViewsLastHourResult = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '1 hour'
    `;

    const uniqueVisitorsLastHourResult = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(DISTINCT ip_address) as count
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '1 hour'
    `;

    const jobsInProgressResult = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM content_pipeline
      WHERE status IN ('pending', 'generating', 'reviewing')
    `;

    const completedLastHourResult = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM content_pipeline
      WHERE status IN ('published', 'completed')
        AND updated_at >= NOW() - INTERVAL '1 hour'
    `;

    const queuedJobsResult = await automationDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM content_pipeline
      WHERE status = 'pending'
        AND scheduled_publish_at > NOW()
    `;

    return {
      timestamp: now,
      liveVisitors: liveVisitorsResult?.count || 0,
      activePages,
      recentConversions,
      recentClicks,
      currentMetrics: {
        clicksLastHour: clicksLastHourResult?.count || 0,
        conversionsLastHour: conversionsLastHourResult?.count || 0,
        revenueLastHour: revenueLastHourResult?.revenue || 0,
        pageViewsLastHour: pageViewsLastHourResult?.count || 0,
        uniqueVisitorsLastHour: uniqueVisitorsLastHourResult?.count || 0,
      },
      automationActivity: {
        jobsInProgress: jobsInProgressResult?.count || 0,
        completedLastHour: completedLastHourResult?.count || 0,
        queuedJobs: queuedJobsResult?.count || 0,
      },
      performanceIndicators: {
        avgResponseTime: 150 + Math.random() * 50,
        errorRate: Math.random() * 2,
        successRate: 98 + Math.random() * 2,
      },
    };
  }
);