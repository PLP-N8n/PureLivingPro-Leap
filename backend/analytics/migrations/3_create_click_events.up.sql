-- Create click events table for comprehensive affiliate tracking
CREATE TABLE click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  link_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  content_id TEXT,
  pick_id TEXT,
  variant_id TEXT,
  page_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  device TEXT,
  country TEXT,
  browser TEXT,
  redirect_ms INTEGER,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create retry queue for failed analytics writes
CREATE TABLE analytics_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Time-series partitioning indexes for performance
CREATE INDEX idx_click_events_timestamp ON click_events(timestamp DESC);
CREATE INDEX idx_click_events_product_id ON click_events(product_id);
CREATE INDEX idx_click_events_content_id ON click_events(content_id) WHERE content_id IS NOT NULL;
CREATE INDEX idx_click_events_link_id ON click_events(link_id);
CREATE INDEX idx_click_events_utm_source ON click_events(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_click_events_utm_medium ON click_events(utm_medium) WHERE utm_medium IS NOT NULL;
CREATE INDEX idx_click_events_device ON click_events(device) WHERE device IS NOT NULL;
CREATE INDEX idx_click_events_success ON click_events(success);

-- Composite indexes for analytics queries
CREATE INDEX idx_click_events_product_timestamp ON click_events(product_id, timestamp DESC);
CREATE INDEX idx_click_events_content_timestamp ON click_events(content_id, timestamp DESC) WHERE content_id IS NOT NULL;
CREATE INDEX idx_click_events_utm_timestamp ON click_events(utm_source, utm_medium, timestamp DESC) WHERE utm_source IS NOT NULL;

-- Retry queue indexes
CREATE INDEX idx_retry_queue_next_retry ON analytics_retry_queue(next_retry_at) WHERE processed_at IS NULL;
CREATE INDEX idx_retry_queue_event_type ON analytics_retry_queue(event_type);
CREATE INDEX idx_retry_queue_created_at ON analytics_retry_queue(created_at DESC);