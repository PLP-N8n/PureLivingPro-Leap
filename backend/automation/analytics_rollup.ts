import { automationDB } from "./db";
import { affiliateDB } from "../affiliate/db";

// Aggregates daily analytics data for performance tracking.
export async function runAnalyticsRollup() {
  const today = new Date().toISOString().split('T')[0];

  // Aggregate affiliate stats for today
  const affiliateStats = await affiliateDB.queryRow<{
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
    WHERE DATE(ac.clicked_at) = ${today}
  `;

  // Get top performing products for today
  const topProducts = await affiliateDB.queryAll`
    SELECT 
      p.id, p.name,
      COALESCE(SUM(conv.commission_earned), 0) as revenue
    FROM affiliate_products p
    JOIN affiliate_links al ON p.id = al.product_id
    JOIN affiliate_clicks ac ON al.id = ac.link_id
    LEFT JOIN affiliate_conversions conv ON ac.id = conv.click_id
    WHERE DATE(ac.clicked_at) = ${today}
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 5
  `;

  // Insert or update today's revenue tracking record
  await automationDB.exec`
    INSERT INTO revenue_tracking (
      date, affiliate_clicks, affiliate_conversions, estimated_revenue, top_performing_products
    ) VALUES (
      ${today},
      ${affiliateStats?.clicks || 0},
      ${affiliateStats?.conversions || 0},
      ${affiliateStats?.revenue || 0},
      ${JSON.stringify(topProducts)}
    )
    ON CONFLICT (date) DO UPDATE SET
      affiliate_clicks = EXCLUDED.affiliate_clicks,
      affiliate_conversions = EXCLUDED.affiliate_conversions,
      estimated_revenue = EXCLUDED.estimated_revenue,
      top_performing_products = EXCLUDED.top_performing_products
  `;

  console.log(`Analytics rollup completed for ${today}`);
}
