import { api, APIError } from "encore.dev/api";
import { analyticsDB } from "./db";
import { TrackClickRequest, TrackClickResponse } from "./types";

// Validates and ingests affiliate click events with comprehensive tracking data
export const trackClick = api<TrackClickRequest, TrackClickResponse>(
  { expose: true, method: "POST", path: "/track-click" },
  async (req) => {
    try {
      // Validate required fields
      if (!req.linkId || !req.productId) {
        throw APIError.invalidArgument("linkId and productId are required");
      }

      // Validate numeric fields
      if (req.linkId <= 0 || req.productId <= 0) {
        throw APIError.invalidArgument("linkId and productId must be positive integers");
      }

      // Validate redirect timing if provided
      if (req.redirectMs !== undefined && req.redirectMs < 0) {
        throw APIError.invalidArgument("redirectMs must be non-negative");
      }

      // Extract and validate UTM parameters
      const utmParams = extractUtmParameters(req);
      
      // Detect device type and browser from user agent-like data
      const deviceInfo = extractDeviceInfo(req.device, req.browser);

      // Validate URL fields
      if (req.pagePath && !isValidPath(req.pagePath)) {
        throw APIError.invalidArgument("Invalid pagePath format");
      }

      if (req.referrer && !isValidUrl(req.referrer)) {
        throw APIError.invalidArgument("Invalid referrer URL format");
      }

      // Generate event ID
      const eventId = crypto.randomUUID();

      try {
        // Insert click event
        await analyticsDB.exec`
          INSERT INTO click_events (
            id, timestamp, link_id, product_id, content_id, pick_id, variant_id,
            page_path, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
            device, country, browser, redirect_ms, success
          ) VALUES (
            ${eventId}, NOW(), ${req.linkId}, ${req.productId}, ${req.contentId || null},
            ${req.pickId || null}, ${req.variantId || null}, ${req.pagePath || null},
            ${req.referrer || null}, ${utmParams.source}, ${utmParams.medium}, 
            ${utmParams.campaign}, ${utmParams.term}, ${utmParams.content},
            ${deviceInfo.device}, ${req.country || null}, ${deviceInfo.browser},
            ${req.redirectMs || null}, ${req.success !== false}
          )
        `;

        return {
          eventId,
          success: true
        };

      } catch (dbError) {
        // If direct write fails, queue for retry
        console.warn('Direct click tracking failed, queuing for retry:', dbError);
        
        await queueForRetry('click_event', {
          eventId,
          ...req,
          ...utmParams,
          ...deviceInfo,
          timestamp: new Date().toISOString()
        });

        return {
          eventId,
          success: true // Still return success to not block user experience
        };
      }

    } catch (error) {
      console.error('Click tracking error:', error);
      
      if (error instanceof APIError) {
        throw error;
      }

      // For unexpected errors, still try to queue for retry
      try {
        const eventId = crypto.randomUUID();
        await queueForRetry('click_event', {
          eventId,
          ...req,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return {
          eventId,
          success: true
        };
      } catch (queueError) {
        console.error('Failed to queue click event for retry:', queueError);
        throw APIError.internal("Failed to track click event");
      }
    }
  }
);

// Extract and validate UTM parameters
function extractUtmParameters(req: TrackClickRequest) {
  return {
    source: req.utmSource?.trim() || null,
    medium: req.utmMedium?.trim() || null,
    campaign: req.utmCampaign?.trim() || null,
    term: req.utmTerm?.trim() || null,
    content: req.utmContent?.trim() || null
  };
}

// Extract device and browser information
function extractDeviceInfo(device?: string, browser?: string) {
  return {
    device: device?.trim() || null,
    browser: browser?.trim() || null
  };
}

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate path format
function isValidPath(path: string): boolean {
  return path.startsWith('/') && path.length <= 500;
}

// Queue failed events for retry
async function queueForRetry(eventType: string, eventData: any): Promise<void> {
  try {
    await analyticsDB.exec`
      INSERT INTO analytics_retry_queue (
        event_type, event_data, retry_count, max_retries, next_retry_at
      ) VALUES (
        ${eventType}, ${JSON.stringify(eventData)}, 0, 3, NOW() + INTERVAL '1 minute'
      )
    `;
  } catch (error) {
    console.error('Failed to queue event for retry:', error);
    throw error;
  }
}