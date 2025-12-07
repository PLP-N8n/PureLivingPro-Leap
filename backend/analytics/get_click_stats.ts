import { api, APIError } from "encore.dev/api";
import { analyticsDB } from "./db";
import { GetClickStatsRequest, ClickStats, TimeSeriesPoint, ProductStats, PageStats } from "./types";

// Retrieves comprehensive click statistics with filtering and time series data
export const getClickStats = api<GetClickStatsRequest, ClickStats>(
  { expose: true, method: "GET", path: "/click-stats" },
  async (req) => {
    try {
      // Validate date range
      const { startDate, endDate } = validateDateRange(req.startDate, req.endDate);

      // Get total statistics
      const totalStats = await getTotalStats(req, startDate, endDate);

      // Get top products
      const topProducts = await getTopProducts(req, startDate, endDate, req.limit || 10);

      // Get top pages
      const topPages = await getTopPages(req, startDate, endDate, req.limit || 10);

      // Get time series data
      const timeSeries = await getTimeSeries(req, startDate, endDate);

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

// Build WHERE clause conditions based on request filters
function buildWhereConditions(req: GetClickStatsRequest): string[] {
  const conditions: string[] = [];

  if (req.productId !== undefined) {
    conditions.push(`product_id = ${req.productId}`);
  }
  if (req.contentId) {
    conditions.push(`content_id = '${req.contentId.replace(/'/g, "''")}'`);
  }
  if (req.utmSource) {
    conditions.push(`utm_source = '${req.utmSource.replace(/'/g, "''")}'`);
  }
  if (req.utmMedium) {
    conditions.push(`utm_medium = '${req.utmMedium.replace(/'/g, "''")}'`);
  }
  if (req.utmCampaign) {
    conditions.push(`utm_campaign = '${req.utmCampaign.replace(/'/g, "''")}'`);
  }
  if (req.device) {
    conditions.push(`device = '${req.device.replace(/'/g, "''")}'`);
  }

  return conditions;
}

// Get total statistics
async function getTotalStats(req: GetClickStatsRequest, startDate: Date, endDate: Date) {
  const additionalConditions = buildWhereConditions(req);
  const whereClause = additionalConditions.length > 0
    ? 'AND ' + additionalConditions.join(' AND ')
    : '';

  const query = `
    SELECT
      COUNT(*) as total_clicks,
      COUNT(DISTINCT COALESCE(content_id, link_id::text)) as unique_clicks,
      COALESCE(AVG(redirect_ms), 0) as avg_redirect_time
    FROM click_events
    WHERE timestamp >= $1
      AND timestamp <= $2
      AND success = true
      ${whereClause}
  `;

  const result = await analyticsDB.exec(query, startDate, endDate);

  if (!result.rows || result.rows.length === 0) {
    return {
      totalClicks: 0,
      uniqueClicks: 0,
      ctr: 0,
      avgRedirectTime: 0
    };
  }

  const row = result.rows[0];
  return {
    totalClicks: Number(row[0]) || 0,
    uniqueClicks: Number(row[1]) || 0,
    ctr: 0, // TODO: Calculate from page_views table when available
    avgRedirectTime: Math.round(Number(row[2]) || 0)
  };
}

// Get top products by click count
async function getTopProducts(
  req: GetClickStatsRequest,
  startDate: Date,
  endDate: Date,
  limit: number
): Promise<ProductStats[]> {
  const additionalConditions = buildWhereConditions(req);
  const whereClause = additionalConditions.length > 0
    ? 'AND ' + additionalConditions.join(' AND ')
    : '';

  const query = `
    SELECT
      product_id,
      MAX(product_name) as product_name,
      COUNT(*) as clicks,
      COUNT(DISTINCT COALESCE(content_id, link_id::text)) as unique_clicks
    FROM click_events
    WHERE timestamp >= $1
      AND timestamp <= $2
      AND success = true
      AND product_id IS NOT NULL
      ${whereClause}
    GROUP BY product_id
    ORDER BY clicks DESC
    LIMIT $3
  `;

  const result = await analyticsDB.exec(query, startDate, endDate, limit);

  return (result.rows || []).map(row => ({
    productId: Number(row[0]),
    productName: String(row[1]) || `Product ${row[0]}`,
    clicks: Number(row[2]) || 0,
    uniqueClicks: Number(row[3]) || 0,
    conversionRate: 0 // TODO: Calculate when conversion tracking available
  }));
}

// Get top pages by click count
async function getTopPages(
  req: GetClickStatsRequest,
  startDate: Date,
  endDate: Date,
  limit: number
): Promise<PageStats[]> {
  const additionalConditions = buildWhereConditions(req);
  const whereClause = additionalConditions.length > 0
    ? 'AND ' + additionalConditions.join(' AND ')
    : '';

  const query = `
    SELECT
      page_path,
      COUNT(*) as clicks,
      COUNT(DISTINCT COALESCE(content_id, link_id::text)) as unique_clicks
    FROM click_events
    WHERE timestamp >= $1
      AND timestamp <= $2
      AND success = true
      AND page_path IS NOT NULL
      ${whereClause}
    GROUP BY page_path
    ORDER BY clicks DESC
    LIMIT $3
  `;

  const result = await analyticsDB.exec(query, startDate, endDate, limit);

  return (result.rows || []).map(row => ({
    pagePath: String(row[0]) || '/',
    clicks: Number(row[1]) || 0,
    uniqueClicks: Number(row[2]) || 0
  }));
}

// Get time series data (daily aggregates)
async function getTimeSeries(
  req: GetClickStatsRequest,
  startDate: Date,
  endDate: Date
): Promise<TimeSeriesPoint[]> {
  const additionalConditions = buildWhereConditions(req);
  const whereClause = additionalConditions.length > 0
    ? 'AND ' + additionalConditions.join(' AND ')
    : '';

  const query = `
    SELECT
      DATE_TRUNC('day', timestamp) as date,
      COUNT(*) as clicks
    FROM click_events
    WHERE timestamp >= $1
      AND timestamp <= $2
      AND success = true
      ${whereClause}
    GROUP BY DATE_TRUNC('day', timestamp)
    ORDER BY date ASC
  `;

  const result = await analyticsDB.exec(query, startDate, endDate);

  return (result.rows || []).map(row => ({
    date: row[0] as Date,
    clicks: Number(row[1]) || 0
  }));
}
