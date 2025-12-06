-- Add performance tracking tables for optimization
CREATE TABLE IF NOT EXISTS content_performance (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  affiliate_clicks INTEGER DEFAULT 0,
  affiliate_conversions INTEGER DEFAULT 0,
  revenue_generated DOUBLE PRECISION DEFAULT 0.0,
  ctr DOUBLE PRECISION DEFAULT 0.0,
  conversion_rate DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, date)
);

CREATE TABLE IF NOT EXISTS keyword_performance (
  id BIGSERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  difficulty_score INTEGER DEFAULT 0,
  current_rank INTEGER,
  target_rank INTEGER DEFAULT 1,
  articles_targeting INTEGER DEFAULT 0,
  estimated_traffic INTEGER DEFAULT 0,
  estimated_revenue DOUBLE PRECISION DEFAULT 0.0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(keyword)
);

CREATE TABLE IF NOT EXISTS optimization_history (
  id BIGSERIAL PRIMARY KEY,
  target_type TEXT NOT NULL, -- 'article', 'product', 'keyword'
  target_id TEXT NOT NULL,
  optimization_type TEXT NOT NULL,
  description TEXT,
  implemented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_impact DOUBLE PRECISION DEFAULT 0.0,
  actual_impact DOUBLE PRECISION,
  measured_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS automation_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  metric_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_name, metric_date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_performance_article_date ON content_performance(article_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_performance_keyword ON keyword_performance(keyword);
CREATE INDEX IF NOT EXISTS idx_optimization_history_target ON optimization_history(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_automation_metrics_date ON automation_metrics(metric_date DESC);

-- Insert sample performance data
INSERT INTO automation_metrics (metric_name, metric_value, metric_date) VALUES
('daily_revenue', 45.67, CURRENT_DATE),
('content_generated', 3, CURRENT_DATE),
('affiliate_clicks', 127, CURRENT_DATE),
('conversion_rate', 2.34, CURRENT_DATE),
('seo_rank_improvements', 8, CURRENT_DATE)
ON CONFLICT (metric_name, metric_date) DO NOTHING;

-- Add sample keyword opportunities
INSERT INTO keyword_performance (keyword, search_volume, difficulty_score, current_rank, estimated_traffic, estimated_revenue) VALUES
('natural wellness supplements', 2400, 45, 15, 120, 18.50),
('organic health products', 1800, 52, 22, 85, 14.20),
('mindfulness meditation guide', 3200, 38, 8, 280, 25.60),
('healthy lifestyle tips', 5600, 65, 35, 95, 12.80),
('plant based nutrition', 4100, 48, 18, 180, 22.40)
ON CONFLICT (keyword) DO NOTHING;
