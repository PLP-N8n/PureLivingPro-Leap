CREATE TABLE content_pipeline (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, generating, reviewing, published, failed
  target_keywords TEXT[],
  generated_title TEXT,
  generated_content TEXT,
  affiliate_products_inserted JSONB,
  seo_score INTEGER DEFAULT 0,
  scheduled_publish_at TIMESTAMP WITH TIME ZONE,
  published_article_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE affiliate_link_health (
  id BIGSERIAL PRIMARY KEY,
  affiliate_link_id BIGINT NOT NULL,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_code INTEGER,
  is_working BOOLEAN DEFAULT TRUE,
  redirect_chain TEXT[],
  response_time_ms INTEGER,
  error_message TEXT,
  consecutive_failures INTEGER DEFAULT 0
);

CREATE TABLE social_media_posts (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT,
  platform TEXT NOT NULL, -- pinterest, instagram, tiktok, twitter, medium
  post_type TEXT NOT NULL, -- image, video, text, carousel
  content TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled', -- scheduled, posted, failed
  platform_post_id TEXT,
  engagement_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE automation_schedules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- content_generation, link_check, social_posting, analytics_report
  cron_expression TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE revenue_tracking (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  affiliate_clicks INTEGER DEFAULT 0,
  affiliate_conversions INTEGER DEFAULT 0,
  estimated_revenue DOUBLE PRECISION DEFAULT 0.0,
  top_performing_products JSONB,
  traffic_sources JSONB,
  content_performance JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_pipeline_status ON content_pipeline(status);
CREATE INDEX idx_content_pipeline_scheduled ON content_pipeline(scheduled_publish_at);
CREATE INDEX idx_affiliate_link_health_checked ON affiliate_link_health(last_checked_at);
CREATE INDEX idx_affiliate_link_health_link_id ON affiliate_link_health(affiliate_link_id);
CREATE INDEX idx_social_media_posts_scheduled ON social_media_posts(scheduled_at);
CREATE INDEX idx_automation_schedules_next_run ON automation_schedules(next_run_at);
CREATE INDEX idx_revenue_tracking_date ON revenue_tracking(date DESC);
