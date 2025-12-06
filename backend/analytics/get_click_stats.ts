import { api, APIError } from "encore.dev/api";
import { analyticsDB } from "./db";
import { GetClickStatsRequest, ClickStats, TimeSeriesPoint, ProductStats, PageStats } from "./types";

// TEMPORARILY DISABLED: This endpoint needs restructuring to work with Encore's SQL parser
// Encore doesn't support dynamic WHERE clause construction via string concatenation
// TODO: Rewrite using conditional query building or separate endpoints for each filter combination

/*
// Retrieves comprehensive click statistics with filtering and time series data
export const getClickStats = api<GetClickStatsRequest, ClickStats>(
  { expose: true, method: "GET", path: "/click-stats" },
  async (req) => {
    try {
      // Validate date range
      const { startDate, endDate } = validateDateRange(req.startDate, req.endDate);
      
      // Build base WHERE clause
      const whereConditions = buildWhereConditions(req, startDate, endDate);
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total statistics
      const totalStats = await getTotalStats(whereClause);
      
      // Get top products
      const topProducts = await getTopProducts(whereClause, req.limit || 10);
      
      // Get top pages
      const topPages = await getTopPages(whereClause, req.limit || 10);
      
      // Get time series data
      const timeSeries = await getTimeSeries(whereClause, startDate, endDate);

      return {
        totalClicks: totalStats.totalClicks,
        uniqueClicks: totalStats.uniqueClicks,
        ctr: totalStats.ctr,
        avgRedirectTime: totalStats.avgRedirectTime,
        topProducts,
        topPages,
        timeSeries
      };

    } catch (error) {
      console.error('Get click stats error:', error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw APIError.internal("Failed to retrieve click statistics");
    }
  }
);

// Validate and parse date range
function validateDateRange(startDateStr?: string, endDateStr?: string) {
  const now = new Date();
  const defaultStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  
  let startDate = defaultStartDate;
  let endDate = now;

  if (startDateStr) {
    startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      throw APIError.invalidArgument("Invalid startDate format");
    }
  }

  if (endDateStr) {
    endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) {
      throw APIError.invalidArgument("Invalid endDate format");
    }
  }

  if (startDate >= endDate) {
    throw APIError.invalidArgument("startDate must be before endDate");
  }

  // Limit to maximum 90 days range for performance
  const maxRange = 90 * 24 * 60 * 60 * 1000;
  if (endDate.getTime() - startDate.getTime() > maxRange) {
    throw APIError.invalidArgument("Date range cannot exceed 90 days");
  }

  return { startDate, endDate };
}

// Build WHERE conditions for filtering
function buildWhereConditions(req: GetClickStatsRequest, startDate: Date, endDate: Date): string[] {
  const conditions: string[] = [];

  // Date range
  conditions.push(`timestamp >= '${startDate.toISOString()}'`);
  conditions.push(`timestamp <= '${endDate.toISOString()}'`);

  // Product filter
  if (req.productId) {
    conditions.push(`product_id = ${req.productId}`);
  }

  // Content filter
  if (req.contentId) {
    conditions.push(`content_id = '${req.contentId.replace(/'/g, "''")}'`);
  }

  // UTM filters
  if (req.utmSource) {
    conditions.push(`utm_source = '${req.utmSource.replace(/'/g, "''")}'`);
  }

  if (req.utmMedium) {
    conditions.push(`utm_medium = '${req.utmMedium.replace(/'/g, "''")}'`);
  }

  if (req.utmCampaign) {
    conditions.push(`utm_campaign = '${req.utmCampaign.replace(/'/g, "''")}'`);
  }

  // Device filter
  if (req.device) {
    conditions.push(`device = '${req.device.replace(/'/g, "''")}'`);
  }

  // Only successful clicks
  conditions.push('success = true');

  return conditions;
}

// Get total statistics
async function getTotalStats(req: GetClickStatsRequest, startDate: Date, endDate: Date) {
  const result = await analyticsDB.queryRow<{
    totalClicks: number;
    uniqueClicks: number;
    avgRedirectTime: number;
  }>`
    SELECT
      COUNT(*) as "totalClicks",
      COUNT(DISTINCT COALESCE(content_id, link_id::text)) as "uniqueClicks",
      COALESCE(AVG(redirect_ms), 0) as "avgRedirectTime"
    FROM click_events
    WHERE timestamp >= ${startDate}
      AND timestamp <= ${endDate}
      AND success = true
      ${req.productId ? `AND product_id = ${req.productId}` : ''}
      ${req.contentId ? `AND content_id = ${req.contentId}` : ''}
      ${req.utmSource ? `AND utm_source = ${req.utmSource}` : ''}
      ${req.utmMedium ? `AND utm_medium = ${req.utmMedium}` : ''}
      ${req.utmCampaign ? `AND utm_campaign = ${req.utmCampaign}` : ''}
      ${req.device ? `AND device = ${req.device}` : ''}
  `;

  if (!result) {
    return { totalClicks: 0, uniqueClicks: 0, ctr: 0, avgRedirectTime: 0 };
  }

  // Calculate CTR (placeholder - would need impression data for real CTR)
  const ctr = result.uniqueClicks > 0 ? (result.totalClicks / result.uniqueClicks) * 100 : 0;

  return {
    totalClicks: result.totalClicks,
    uniqueClicks: result.uniqueClicks,
    ctr: Math.round(ctr * 100) / 100,
    avgRedirectTime: Math.round(result.avgRedirectTime * 100) / 100
  };
}

// Get top performing products
async function getTopProducts(whereClause: string, limit: number): Promise<ProductStats[]> {
  const results = await analyticsDB.query<{
    productId: number;
    productName: string;
    clicks: number;
    uniqueClicks: number;
    avgRedirectTime: number;
  }>`
    SELECT 
      ce.product_id as "productId",
      COALESCE(ap.name, 'Unknown Product') as "productName",
      COUNT(*) as clicks,
      COUNT(DISTINCT COALESCE(ce.content_id, ce.link_id::text)) as "uniqueClicks",
      COALESCE(AVG(ce.redirect_ms), 0) as "avgRedirectTime"
    FROM click_events ce
    LEFT JOIN affiliate.affiliate_products ap ON ce.product_id = ap.id
    ${whereClause}
    GROUP BY ce.product_id, ap.name
    ORDER BY clicks DESC
    LIMIT ${limit}
  `;

  return results.map(row => ({
    productId: row.productId,
    productName: row.productName,
    clicks: row.clicks,
    uniqueClicks: row.uniqueClicks,
    ctr: row.uniqueClicks > 0 ? Math.round((row.clicks / row.uniqueClicks) * 10000) / 100 : 0,
    avgRedirectTime: Math.round(row.avgRedirectTime * 100) / 100
  }));
}

// Get top performing pages
async function getTopPages(whereClause: string, limit: number): Promise<PageStats[]> {
  const pageCondition = whereClause ? `${whereClause} AND page_path IS NOT NULL` : 'WHERE page_path IS NOT NULL';

  const results = await analyticsDB.query<{
    pagePath: string;
    clicks: number;
    uniqueClicks: number;
  }>`
    SELECT
      COALESCE(page_path, 'Unknown Page') as "pagePath",
      COUNT(*) as clicks,
      COUNT(DISTINCT COALESCE(content_id, link_id::text)) as "uniqueClicks"
    FROM click_events
    ${pageCondition}
    GROUP BY page_path
    ORDER BY clicks DESC
    LIMIT ${limit}
  `;

  return results.map(row => ({
    pagePath: row.pagePath,
    clicks: row.clicks,
    uniqueClicks: row.uniqueClicks,
    ctr: row.uniqueClicks > 0 ? Math.round((row.clicks / row.uniqueClicks) * 10000) / 100 : 0
  }));
}

// Get time series data for trend analysis
async function getTimeSeries(whereClause: string, startDate: Date, endDate: Date): Promise<TimeSeriesPoint[]> {
  // Determine appropriate time bucket based on date range
  const rangeDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  const timeBucket = rangeDays <= 7 ? 'hour' : rangeDays <= 30 ? 'day' : 'week';

  let results;

  if (timeBucket === 'hour') {
    results = await analyticsDB.query<{
      timestamp: Date;
      clicks: number;
      uniqueClicks: number;
      avgRedirectTime: number;
    }>`
      SELECT
        date_trunc('hour', timestamp) as timestamp,
        COUNT(*) as clicks,
        COUNT(DISTINCT COALESCE(content_id, link_id::text)) as "uniqueClicks",
        COALESCE(AVG(redirect_ms), 0) as "avgRedirectTime"
      FROM click_events
      ${whereClause}
      GROUP BY date_trunc('hour', timestamp)
      ORDER BY timestamp ASC
    `;
  } else if (timeBucket === 'day') {
    results = await analyticsDB.query<{
      timestamp: Date;
      clicks: number;
      uniqueClicks: number;
      avgRedirectTime: number;
    }>`
      SELECT
        date_trunc('day', timestamp) as timestamp,
        COUNT(*) as clicks,
        COUNT(DISTINCT COALESCE(content_id, link_id::text)) as "uniqueClicks",
        COALESCE(AVG(redirect_ms), 0) as "avgRedirectTime"
      FROM click_events
      ${whereClause}
      GROUP BY date_trunc('day', timestamp)
      ORDER BY timestamp ASC
    `;
  } else {
    results = await analyticsDB.query<{
      timestamp: Date;
      clicks: number;
      uniqueClicks: number;
      avgRedirectTime: number;
    }>`
      SELECT
        date_trunc('week', timestamp) as timestamp,
        COUNT(*) as clicks,
        COUNT(DISTINCT COALESCE(content_id, link_id::text)) as "uniqueClicks",
        COALESCE(AVG(redirect_ms), 0) as "avgRedirectTime"
      FROM click_events
      ${whereClause}
      GROUP BY date_trunc('week', timestamp)
      ORDER BY timestamp ASC
    `;
  }

  return results.map(row => ({
    timestamp: row.timestamp,
    clicks: row.clicks,
    uniqueClicks: row.uniqueClicks,
    ctr: row.uniqueClicks > 0 ? Math.round((row.clicks / row.uniqueClicks) * 10000) / 100 : undefined,
    avgRedirectTime: Math.round(row.avgRedirectTime * 100) / 100
  }));
}
*/