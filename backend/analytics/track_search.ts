import { api } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { analyticsDB } from "./db";

interface TrackSearchRequest {
  query: string;
  resultsCount: number;
  sessionId?: string;
  userAgent?: Header<"User-Agent">;
  xForwardedFor?: Header<"X-Forwarded-For">;
}

// Tracks a search query for analytics purposes.
export const trackSearch = api<TrackSearchRequest, void>(
  { expose: true, method: "POST", path: "/analytics/search" },
  async (req) => {
    const ipAddress = req.xForwardedFor?.split(',')[0]?.trim() || '127.0.0.1';
    
    await analyticsDB.exec`
      INSERT INTO search_queries (
        query, results_count, user_agent, ip_address, session_id
      ) VALUES (
        ${req.query}, ${req.resultsCount}, ${req.userAgent || null},
        ${ipAddress}::inet, ${req.sessionId || null}
      )
    `;
  }
);
