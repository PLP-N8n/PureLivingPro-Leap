import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { affiliateDB } from "./db";

interface RedirectParams {
  shortCode: string;
}

interface RedirectRequest {
  contentId?: string;
  sessionId?: string;
  userAgent?: Header<"User-Agent">;
  xForwardedFor?: Header<"X-Forwarded-For">;
  referrer?: Header<"Referer">;
}

interface RedirectResponse {
  redirectUrl: string;
}

// Handles affiliate link redirects with tracking (matches /r/:id pattern from original architecture).
export const handleRedirect = api<RedirectParams & RedirectRequest, RedirectResponse>(
  { expose: true, method: "GET", path: "/r/:shortCode" },
  async (req) => {
    const { shortCode, contentId, sessionId, userAgent, xForwardedFor, referrer } = req;
    
    try {
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

      // Track the click with optional content attribution
      await affiliateDB.exec`
        INSERT INTO affiliate_clicks (
          link_id, ip_address, user_agent, referrer, session_id, device_type, content_id
        ) VALUES (
          ${link.id}, ${ipAddress}::inet, ${userAgent || null}, ${referrer || null}, 
          ${sessionId || null}, ${deviceType}, ${contentId || null}
        )
      `;

      // Return redirect response
      return {
        redirectUrl: link.originalUrl
      };

    } catch (error) {
      // Log error but don't crash - graceful degradation
      console.error('Redirect error:', error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      // Fallback redirect to homepage if something goes wrong
      return {
        redirectUrl: "https://purelivingpro.com"
      };
    }
  }
);
