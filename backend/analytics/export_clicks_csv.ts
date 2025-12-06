import { api, APIError } from "encore.dev/api";
import { analyticsDB } from "./db";
import { ExportClicksRequest, ExportClicksResponse } from "./types";

// Exports click data as CSV with filtering and pagination support
export const exportClicksCSV = api<ExportClicksRequest, ExportClicksResponse>(
  { expose: true, method: "GET", path: "/export-clicks" },
  async (req) => {
    try {
      // Validate date range
      const { startDate, endDate } = validateDateRange(req.startDate, req.endDate);
      
      // Build WHERE clause for filtering
      const whereConditions = buildWhereConditions(req, startDate, endDate);
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Apply reasonable limits for performance
      const limit = Math.min(req.limit || 10000, 50000); // Max 50k records
      
      // Get click data
      const clickData = await getClickDataForExport(whereClause, limit);
      
      // Generate CSV content
      const csvContent = generateCSV(clickData);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `affiliate-clicks-${timestamp}.csv`;
      
      // In a real implementation, you would upload to cloud storage
      // For now, we'll return the CSV content directly
      const downloadUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
      
      return {
        downloadUrl,
        filename,
        recordCount: clickData.length
      };

    } catch (error) {
      console.error('Export clicks CSV error:', error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw APIError.internal("Failed to export click data");
    }
  }
);

// Validate and parse date range
function validateDateRange(startDateStr?: string, endDateStr?: string) {
  const now = new Date();
  const defaultStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
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

  // Limit to maximum 365 days range for exports
  const maxRange = 365 * 24 * 60 * 60 * 1000;
  if (endDate.getTime() - startDate.getTime() > maxRange) {
    throw APIError.invalidArgument("Date range cannot exceed 365 days for exports");
  }

  return { startDate, endDate };
}

// Build WHERE conditions for filtering
function buildWhereConditions(req: ExportClicksRequest, startDate: Date, endDate: Date): string[] {
  const conditions: string[] = [];

  // Date range
  conditions.push(`ce.timestamp >= '${startDate.toISOString()}'`);
  conditions.push(`ce.timestamp <= '${endDate.toISOString()}'`);

  // Product filter
  if (req.productId) {
    conditions.push(`ce.product_id = ${req.productId}`);
  }

  // Content filter
  if (req.contentId) {
    conditions.push(`ce.content_id = '${req.contentId.replace(/'/g, "''")}'`);
  }

  // Category filter (join with products table)
  if (req.category) {
    conditions.push(`ap.category = '${req.category.replace(/'/g, "''")}'`);
  }

  // UTM filters
  if (req.utmSource) {
    conditions.push(`ce.utm_source = '${req.utmSource.replace(/'/g, "''")}'`);
  }

  if (req.utmMedium) {
    conditions.push(`ce.utm_medium = '${req.utmMedium.replace(/'/g, "''")}'`);
  }

  return conditions;
}

// Get click data for export
async function getClickDataForExport(whereClause: string, limit: number) {
  const results = await analyticsDB.query<{
    id: string;
    timestamp: Date;
    linkId: number;
    productId: number;
    productName: string;
    category: string;
    contentId: string;
    pickId: string;
    variantId: string;
    pagePath: string;
    referrer: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmTerm: string;
    utmContent: string;
    device: string;
    country: string;
    browser: string;
    redirectMs: number;
    success: boolean;
  }>`
    SELECT 
      ce.id,
      ce.timestamp,
      ce.link_id as "linkId",
      ce.product_id as "productId",
      COALESCE(ap.name, 'Unknown Product') as "productName",
      COALESCE(ap.category, 'Unknown') as category,
      ce.content_id as "contentId",
      ce.pick_id as "pickId",
      ce.variant_id as "variantId",
      ce.page_path as "pagePath",
      ce.referrer,
      ce.utm_source as "utmSource",
      ce.utm_medium as "utmMedium",
      ce.utm_campaign as "utmCampaign",
      ce.utm_term as "utmTerm",
      ce.utm_content as "utmContent",
      ce.device,
      ce.country,
      ce.browser,
      ce.redirect_ms as "redirectMs",
      ce.success
    FROM click_events ce
    LEFT JOIN affiliate.affiliate_products ap ON ce.product_id = ap.id
    ${whereClause}
    ORDER BY ce.timestamp DESC
    LIMIT ${limit}
  `;

  return results;
}

// Generate CSV content with proper escaping
function generateCSV(data: any[]): string {
  if (data.length === 0) {
    return 'No data available for the selected criteria';
  }

  // Define CSV headers
  const headers = [
    'Event ID',
    'Timestamp',
    'Link ID',
    'Product ID',
    'Product Name',
    'Category',
    'Content ID',
    'Pick ID',
    'Variant ID',
    'Page Path',
    'Referrer',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'UTM Term',
    'UTM Content',
    'Device',
    'Country',
    'Browser',
    'Redirect Time (ms)',
    'Success'
  ];

  // Create CSV rows
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const csvRow = [
      escapeCsvField(row.id),
      escapeCsvField(row.timestamp?.toISOString()),
      escapeCsvField(row.linkId),
      escapeCsvField(row.productId),
      escapeCsvField(row.productName),
      escapeCsvField(row.category),
      escapeCsvField(row.contentId),
      escapeCsvField(row.pickId),
      escapeCsvField(row.variantId),
      escapeCsvField(row.pagePath),
      escapeCsvField(row.referrer),
      escapeCsvField(row.utmSource),
      escapeCsvField(row.utmMedium),
      escapeCsvField(row.utmCampaign),
      escapeCsvField(row.utmTerm),
      escapeCsvField(row.utmContent),
      escapeCsvField(row.device),
      escapeCsvField(row.country),
      escapeCsvField(row.browser),
      escapeCsvField(row.redirectMs),
      escapeCsvField(row.success)
    ];
    
    csvRows.push(csvRow.join(','));
  }

  return csvRows.join('\n');
}

// Escape CSV field values
function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  
  // If the field contains comma, newline, or quote, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}