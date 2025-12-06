-- Performance indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_ip_address ON page_views(ip_address);

-- Composite indexes for analytics aggregations
CREATE INDEX IF NOT EXISTS idx_page_views_article_date ON page_views(article_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path_date ON page_views(page_path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_date_path ON page_views(created_at DESC, page_path);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_queries_results_count ON search_queries(results_count);
CREATE INDEX IF NOT EXISTS idx_search_queries_session_id ON search_queries(session_id);

-- Composite search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_queries_query_date ON search_queries(query, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_results_date ON search_queries(results_count, created_at DESC);

-- Performance tracking for popular queries
CREATE INDEX IF NOT EXISTS idx_search_queries_query_results ON search_queries(query, results_count) WHERE results_count > 0;