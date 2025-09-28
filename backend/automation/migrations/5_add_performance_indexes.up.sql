-- Performance indexes for automation queries
CREATE INDEX IF NOT EXISTS idx_content_pipeline_topic ON content_pipeline(topic);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_published_article ON content_pipeline(published_article_id);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_seo_score ON content_pipeline(seo_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_updated_at ON content_pipeline(updated_at DESC);

-- Composite indexes for pipeline analytics
CREATE INDEX IF NOT EXISTS idx_content_pipeline_status_created ON content_pipeline(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_status_scheduled ON content_pipeline(status, scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;

-- Keywords array index
CREATE INDEX IF NOT EXISTS idx_content_pipeline_keywords_gin ON content_pipeline USING GIN(target_keywords);

-- Affiliate link health indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_link_health_is_working ON affiliate_link_health(is_working);
CREATE INDEX IF NOT EXISTS idx_affiliate_link_health_status_code ON affiliate_link_health(status_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_link_health_failures ON affiliate_link_health(consecutive_failures DESC);

-- Social media performance indexes
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_article_id ON social_media_posts(article_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_posted_at ON social_media_posts(posted_at DESC);

-- Composite social media indexes
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform_status ON social_media_posts(platform, status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_article_platform ON social_media_posts(article_id, platform);

-- Hashtags array index
CREATE INDEX IF NOT EXISTS idx_social_media_posts_hashtags_gin ON social_media_posts USING GIN(hashtags);

-- Automation schedules indexes
CREATE INDEX IF NOT EXISTS idx_automation_schedules_type ON automation_schedules(type);
CREATE INDEX IF NOT EXISTS idx_automation_schedules_is_active ON automation_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_schedules_last_run ON automation_schedules(last_run_at DESC);

-- Pipeline runs tracking indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_ran_at ON pipeline_runs(ran_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_auto_publish ON pipeline_runs(auto_publish);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_successful ON pipeline_runs(successful DESC);

-- Amazon sync tracking indexes
CREATE INDEX IF NOT EXISTS idx_amazon_sync_runs_ran_at ON amazon_sync_runs(ran_at DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_sync_runs_products_imported ON amazon_sync_runs(products_imported DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_sync_runs_products_updated ON amazon_sync_runs(products_updated DESC);