import { api } from "encore.dev/api";
import { analyticsDB } from "./db";

interface AnalyticsSummary {
  totalPageViews: number;
  totalSearches: number;
  topSearchQueries: Array<{ query: string; count: number }>;
  popularPages: Array<{ path: string; views: number }>;
  recentActivity: {
    pageViewsToday: number;
    searchesToday: number;
    pageViewsThisWeek: number;
    searchesThisWeek: number;
  };
}

// Retrieves analytics summary data for the admin dashboard.
export const getAnalyticsSummary = api<void, AnalyticsSummary>(
  { expose: true, method: "GET", path: "/analytics/summary" },
  async () => {
    // Get total counts
    const totalPageViews = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM page_views
    `;

    const totalSearches = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM search_queries
    `;

    // Get top search queries
    const topSearchQueries = await analyticsDB.queryAll<{ query: string; count: number }>`
      SELECT query, COUNT(*) as count
      FROM search_queries
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get popular pages
    const popularPages = await analyticsDB.queryAll<{ path: string; views: number }>`
      SELECT page_path as path, COUNT(*) as views
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `;

    // Get recent activity
    const pageViewsToday = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM page_views 
      WHERE created_at >= CURRENT_DATE
    `;

    const searchesToday = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM search_queries 
      WHERE created_at >= CURRENT_DATE
    `;

    const pageViewsThisWeek = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM page_views 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

    const searchesThisWeek = await analyticsDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM search_queries 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

    return {
      totalPageViews: totalPageViews?.count || 0,
      totalSearches: totalSearches?.count || 0,
      topSearchQueries,
      popularPages,
      recentActivity: {
        pageViewsToday: pageViewsToday?.count || 0,
        searchesToday: searchesToday?.count || 0,
        pageViewsThisWeek: pageViewsThisWeek?.count || 0,
        searchesThisWeek: searchesThisWeek?.count || 0,
      }
    };
  }
);
