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

// Get total statistics with conditional filtering
async function getTotalStats(req: GetClickStatsRequest, startDate: Date, endDate: Date) {
  // Build the query with conditional WHERE clauses using Encore's SQL templates
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
      ${req.productId !== undefined ? `AND product_id = ${req.productId}` : ''}
      ${req.contentId ? `AND content_id = ${req.contentId}` : ''}
      ${req.utmSource ? `AND utm_source = ${req.utmSource}` : ''}
      ${req.utmMedium ? `AND utm_medium = ${req.utmMedium}` : ''}
      ${req.utmCampaign ? `AND utm_campaign = ${req.utmCampaign}` : ''}
      ${req.device ? `AND device = ${req.device}` : ''}
  `;

  if (!result) {
    return {
      totalClicks: 0,
      uniqueClicks: 0,
      ctr: 0,
      avgRedirectTime: 0
    };
  }

  // Calculate CTR (assuming views are tracked separately - placeholder for now)
  const ctr = 0; // TODO: Calculate from page_views table when available

  return {
    totalClicks: result.totalClicks || 0,
    uniqueClicks: result.uniqueClicks || 0,
    ctr,
    avgRedirectTime: Math.round(result.avgRedirectTime || 0)
  };
}

// Get top products by click count
async function getTopProducts(
  req: GetClickStatsRequest,
  startDate: Date,
  endDate: Date,
  limit: number
): Promise<ProductStats[]> {
  const products = await analyticsDB.queryAll<{
    productId: number;
    productName: string;
    clicks: number;
    uniqueClicks: number;
    conversionRate: number;
  }>`
    SELECT
      product_id as "productId",
      MAX(product_name) as "productName",
      COUNT(*) as "clicks",
      COUNT(DISTINCT COALESCE(content_id, link_id::text)) as "uniqueClicks",
      0.0 as "conversionRate"
    FROM click_events
    WHERE timestamp >= ${startDate}
      AND timestamp <= ${endDate}
      AND success = true
      AND product_id IS NOT NULL
      ${req.productId !== undefined ? `AND product_id = ${req.productId}` : ''}
      ${req.contentId ? `AND content_id = ${req.contentId}` : ''}
      ${req.utmSource ? `AND utm_source = ${req.utmSource}` : ''}
      ${req.utmMedium ? `AND utm_medium = ${req.utmMedium}` : ''}
      ${req.utmCampaign ? `AND utm_campaign = ${req.utmCampaign}` : ''}
      ${req.device ? `AND device = ${req.device}` : ''}
    GROUP BY product_id
    ORDER BY clicks DESC
    LIMIT ${limit}
  `;

  return products.map(p => ({
    productId: p.productId,
    productName: p.productName || `Product ${p.productId}`,
    clicks: p.clicks || 0,
    uniqueClicks: p.uniqueClicks || 0,
    conversionRate: p.conversionRate || 0
  }));
}

// Get top pages by click count
async function getTopPages(
  req: GetClickStatsRequest,
  startDate: Date,
  endDate: Date,
  limit: number
): Promise<PageStats[]> {
  const pages = await analyticsDB.queryAll<{
    pagePath: string;
    clicks: number;
    uniqueClicks: number;
  }>`
    SELECT
      page_path as "pagePath",
      COUNT(*) as "clicks",
      COUNT(DISTINCT COALESCE(content_id, link_id::text)) as "uniqueClicks"
    FROM click_events
    WHERE timestamp >= ${startDate}
      AND timestamp <= ${endDate}
      AND success = true
      AND page_path IS NOT NULL
      ${req.productId !== undefined ? `AND product_id = ${req.productId}` : ''}
      ${req.contentId ? `AND content_id = ${req.contentId}` : ''}
      ${req.utmSource ? `AND utm_source = ${req.utmSource}` : ''}
      ${req.utmMedium ? `AND utm_medium = ${req.utmMedium}` : ''}
      ${req.utmCampaign ? `AND utm_campaign = ${req.utmCampaign}` : ''}
      ${req.device ? `AND device = ${req.device}` : ''}
    GROUP BY page_path
    ORDER BY clicks DESC
    LIMIT ${limit}
  `;

  return pages.map(p => ({
    pagePath: p.pagePath || '/',
    clicks: p.clicks || 0,
    uniqueClicks: p.uniqueClicks || 0
  }));
}

// Get time series data (daily aggregates)
async function getTimeSeries(
  req: GetClickStatsRequest,
  startDate: Date,
  endDate: Date
): Promise<TimeSeriesPoint[]> {
  const timeSeries = await analyticsDB.queryAll<{
    date: Date;
    clicks: number;
  }>`
    SELECT
      DATE_TRUNC('day', timestamp) as "date",
      COUNT(*) as "clicks"
    FROM click_events
    WHERE timestamp >= ${startDate}
      AND timestamp <= ${endDate}
      AND success = true
      ${req.productId !== undefined ? `AND product_id = ${req.productId}` : ''}
      ${req.contentId ? `AND content_id = ${req.contentId}` : ''}
      ${req.utmSource ? `AND utm_source = ${req.utmSource}` : ''}
      ${req.utmMedium ? `AND utm_medium = ${req.utmMedium}` : ''}
      ${req.utmCampaign ? `AND utm_campaign = ${req.utmCampaign}` : ''}
      ${req.device ? `AND device = ${req.device}` : ''}
    GROUP BY DATE_TRUNC('day', timestamp)
    ORDER BY date ASC
  `;

  return timeSeries.map(t => ({
    date: t.date,
    clicks: t.clicks || 0
  }));
}
