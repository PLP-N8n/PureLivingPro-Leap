export interface EmailCampaign {
  id: number;
  name: string;
  campaign_type: 'welcome_series' | 'weekly_digest' | 'product_launch' | 'reengagement';
  status: 'draft' | 'active' | 'paused' | 'completed';
  mailchimp_campaign_id?: string;
  subject_line?: string;
  from_name: string;
  from_email: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmailSequence {
  id: number;
  campaign_id: number;
  sequence_order: number;
  send_delay_days: number;
  send_delay_hours: number;
  subject_line: string;
  preview_text?: string;
  email_content: string;
  status: 'active' | 'paused';
  created_at: Date;
}

export interface EmailSend {
  id: number;
  campaign_id?: number;
  sequence_id?: number;
  subscriber_id: number;
  mailchimp_send_id?: string;
  sent_at: Date;
  opened: boolean;
  opened_at?: Date;
  clicked: boolean;
  clicked_at?: Date;
  bounce_type?: 'hard' | 'soft';
  unsubscribed: boolean;
  unsubscribed_at?: Date;
}

export interface EmailTemplate {
  id: number;
  name: string;
  template_type: 'welcome' | 'article_digest' | 'product_recommendation' | 'general';
  subject_line?: string;
  content: string;
  variables?: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

export interface EmailMetrics {
  campaign_id: number;
  sequence_id?: number;
  date: string;
  sends: number;
  opens: number;
  unique_opens: number;
  clicks: number;
  unique_clicks: number;
  bounces: number;
  unsubscribes: number;
  revenue: number;
  open_rate: number;
  click_rate: number;
  click_to_open_rate: number;
}

export interface MailchimpConfig {
  api_key: string;
  server_prefix: string; // e.g., 'us1', 'us2'
  list_id: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  content: string;
  template_variables?: Record<string, string>;
  campaign_id?: number;
  sequence_id?: number;
}

export interface CreateCampaignRequest {
  name: string;
  campaign_type: 'welcome_series' | 'weekly_digest' | 'product_launch' | 'reengagement';
  sequences: {
    send_delay_days: number;
    send_delay_hours: number;
    subject_line: string;
    preview_text?: string;
    email_content: string;
  }[];
}

export interface SyncMailchimpRequest {
  sync_type: 'subscribers' | 'campaigns' | 'metrics';
}
