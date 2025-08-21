import { api } from "encore.dev/api";
import { affiliateDB } from "./db";

interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  totalCommission: number;
  conversionRate: number;
  topProducts: Array<{
    productId: number;
    productName: string;
    clicks: number;
    conversions: number;
    commission: number;
  }>;
  clicksByDay: Array<{
    date: string;
    clicks: number;
  }>;
  deviceBreakdown: Array<{
    deviceType: string;
    clicks: number;
    percentage: number;
  }>;
}

// Retrieves comprehensive affiliate marketing statistics.
export const getAffiliateStats = api<void, AffiliateStats>(
  { expose: true, method: "GET", path: "/affiliate/stats" },
  async () => {
    // Get total clicks
    const totalClicksResult = await affiliateDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM affiliate_clicks
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
    `;
    const totalClicks = totalClicksResult?.count || 0;

    // Get total conversions and commission
    const conversionStats = await affiliateDB.queryRow<{ count: number; commission: number }>`
      SELECT COUNT(*) as count, COALESCE(SUM(commission_earned), 0) as commission
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '30 days'
    `;
    const totalConversions = conversionStats?.count || 0;
    const totalCommission = conversionStats?.commission || 0;

    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Get top products
    const topProducts = await affiliateDB.queryAll<{
      productId: number;
      productName: string;
      clicks: number;
      conversions: number;
      commission: number;
    }>`
      SELECT 
        p.id as "productId",
        p.name as "productName",
        COUNT(DISTINCT c.id) as clicks,
        COUNT(DISTINCT conv.id) as conversions,
        COALESCE(SUM(conv.commission_earned), 0) as commission
      FROM affiliate_products p
      LEFT JOIN affiliate_links l ON p.id = l.product_id
      LEFT JOIN affiliate_clicks c ON l.id = c.link_id AND c.clicked_at >= NOW() - INTERVAL '30 days'
      LEFT JOIN affiliate_conversions conv ON c.id = conv.click_id AND conv.converted_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.name
      ORDER BY clicks DESC
      LIMIT 10
    `;

    // Get clicks by day (last 7 days)
    const clicksByDay = await affiliateDB.queryAll<{ date: string; clicks: number }>`
      SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as clicks
      FROM affiliate_clicks
      WHERE clicked_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(clicked_at)
      ORDER BY date DESC
    `;

    // Get device breakdown
    const deviceBreakdown = await affiliateDB.queryAll<{ deviceType: string; clicks: number }>`
      SELECT 
        COALESCE(device_type, 'unknown') as "deviceType",
        COUNT(*) as clicks
      FROM affiliate_clicks
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY device_type
    `;

    // Calculate percentages for device breakdown
    const deviceBreakdownWithPercentage = deviceBreakdown.map(device => ({
      ...device,
      percentage: totalClicks > 0 ? (device.clicks / totalClicks) * 100 : 0
    }));

    return {
      totalClicks,
      totalConversions,
      totalCommission,
      conversionRate,
      topProducts,
      clicksByDay,
      deviceBreakdown: deviceBreakdownWithPercentage
    };
  }
);
