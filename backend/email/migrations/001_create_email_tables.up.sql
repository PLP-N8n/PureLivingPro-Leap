-- Email campaigns and automation tables

-- Email campaigns (for tracking different email types)
CREATE TABLE email_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(50) NOT NULL, -- 'welcome_series', 'weekly_digest', 'product_launch', 'reengagement'
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  mailchimp_campaign_id VARCHAR(255),
  subject_line VARCHAR(255),
  from_name VARCHAR(100) DEFAULT 'Pure Living Pro',
  from_email VARCHAR(255) DEFAULT 'hello@purelivingpro.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email sequences (for automation workflows)
CREATE TABLE email_sequences (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL, -- 1, 2, 3, etc.
  send_delay_days INTEGER DEFAULT 0, -- Days after previous email (0 for immediate)
  send_delay_hours INTEGER DEFAULT 0, -- Additional hours
  subject_line VARCHAR(255) NOT NULL,
  preview_text VARCHAR(150),
  email_content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email sends (track individual emails sent)
CREATE TABLE email_sends (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE SET NULL,
  sequence_id INTEGER REFERENCES email_sequences(id) ON DELETE SET NULL,
  subscriber_id INTEGER, -- References newsletter.subscriptions(id)
  mailchimp_send_id VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_type VARCHAR(50), -- 'hard', 'soft', null
  unsubscribed BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Email templates (reusable content blocks)
CREATE TABLE email_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'welcome', 'article_digest', 'product_recommendation', 'general'
  subject_line VARCHAR(255),
  content TEXT NOT NULL,
  variables JSONB, -- Dynamic variables like {{first_name}}, {{article_title}}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email performance metrics (aggregated)
CREATE TABLE email_metrics (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
  sequence_id INTEGER REFERENCES email_sequences(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  sends INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0, -- Attributed revenue from affiliate clicks
  UNIQUE(campaign_id, sequence_id, date)
);

-- Mailchimp sync log
CREATE TABLE mailchimp_sync_log (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'subscriber', 'campaign', 'metrics'
  status VARCHAR(20) NOT NULL, -- 'success', 'failed'
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_sends_subscriber ON email_sends(subscriber_id);
CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_opened ON email_sends(opened, sent_at);
CREATE INDEX idx_email_sends_clicked ON email_sends(clicked, sent_at);
CREATE INDEX idx_email_metrics_campaign ON email_metrics(campaign_id, date);
CREATE INDEX idx_email_sequences_campaign ON email_sequences(campaign_id, sequence_order);
