import { api } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { analyticsDB } from "./db";

interface TrackPageViewRequest {
  articleId?: number;
  pagePath: string;
  referrer?: string;
  sessionId?: string;
  userAgent?: Header<"User-Agent">;
  xForwardedFor?: Header<"X-Forwarded-For">;
}

// Tracks a page view for analytics purposes.
export const trackPageView = api<TrackPageViewRequest, void>(
  { expose: true, method: "POST", path: "/analytics/page-view" },
  async (req) => {
    const ipAddress = req.xForwardedFor?.split(',')[0]?.trim() || '127.0.0.1';
    
    await analyticsDB.exec`
      INSERT INTO page_views (
        article_id, page_path, user_agent, ip_address, referrer, session_id
      ) VALUES (
        ${req.articleId || null}, ${req.pagePath}, ${req.userAgent || null},
        ${ipAddress}::inet, ${req.referrer || null}, ${req.sessionId || null}
      )
    `;
  }
);
