import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { affiliateDB } from "./db";

interface TrackClickParams {
  shortCode: string;
}

interface TrackClickRequest {
  sessionId?: string;
  userAgent?: Header<"User-Agent">;
  xForwardedFor?: Header<"X-Forwarded-For">;
  referrer?: Header<"Referer">;
}

interface TrackClickResponse {
  redirectUrl: string;
}

// Tracks an affiliate link click and returns the redirect URL.
export const trackClick = api<TrackClickParams & TrackClickRequest, TrackClickResponse>(
  { expose: true, method: "POST", path: "/r/:shortCode" },
  async (req) => {
    const { shortCode, sessionId, userAgent, xForwardedFor, referrer } = req;
    
    // Get the affiliate link
    const link = await affiliateDB.queryRow<{ id: number; originalUrl: string; isActive: boolean }>`
      SELECT id, original_url as "originalUrl", is_active as "isActive"
      FROM affiliate_links 
      WHERE short_code = ${shortCode}
    `;

    if (!link) {
      throw APIError.notFound("Affiliate link not found");
    }

    if (!link.isActive) {
      throw APIError.invalidArgument("Affiliate link is inactive");
    }

    // Extract IP address
    const ipAddress = xForwardedFor?.split(',')[0]?.trim() || '127.0.0.1';
    
    // Determine device type from user agent
    const deviceType = userAgent?.toLowerCase().includes('mobile') ? 'mobile' : 
                      userAgent?.toLowerCase().includes('tablet') ? 'tablet' : 'desktop';

    // Track the click
    await affiliateDB.exec`
      INSERT INTO affiliate_clicks (
        link_id, ip_address, user_agent, referrer, session_id, device_type
      ) VALUES (
        ${link.id}, ${ipAddress}::inet, ${userAgent || null}, ${referrer || null}, 
        ${sessionId || null}, ${deviceType}
      )
    `;

    return {
      redirectUrl: link.originalUrl
    };
  }
);
