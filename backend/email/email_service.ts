import { api } from "encore.dev/api";
import { emailDB } from "./db";
import type { EmailCampaign, EmailMetrics, CreateCampaignRequest } from "./types";
import * as mailchimp from "./mailchimp";

/**
 * Sync newsletter subscribers to Mailchimp
 */
export const syncSubscribersToMailchimp = api(
  { expose: true, method: "POST", path: "/email/sync-subscribers" },
  async (): Promise<{ success: boolean; synced: number; errors: number }> => {
    try {
      // Get all subscribers from newsletter database
      const subscribers = await emailDB.query<{
        id: number;
        email: string;
        subscribed_at: Date;
      }>(
        `SELECT id, email, subscribed_at
         FROM newsletter.subscriptions
         WHERE unsubscribed = false
         ORDER BY subscribed_at DESC`
      );

      let synced = 0;
      let errors = 0;

      for (const subscriber of subscribers) {
        const result = await mailchimp.addSubscriber({
          email: subscriber.email,
          tags: ['website-signup'],
        });

        if (result.success) {
          synced++;
        } else {
          errors++;
          console.error(`Failed to sync ${subscriber.email}:`, result.error);
        }

        // Rate limiting: Wait 100ms between requests (free tier: 10 req/sec)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Log the sync
      await emailDB.exec(
        `INSERT INTO mailchimp_sync_log (sync_type, status, records_processed, error_message)
         VALUES ('subscribers', $1, $2, $3)`,
        [errors === 0 ? 'success' : 'failed', synced, errors > 0 ? `${errors} errors` : null]
      );

      return { success: errors === 0, synced, errors };
    } catch (error) {
      console.error('Sync subscribers error:', error);
      throw new Error('Failed to sync subscribers');
    }
  }
);

/**
 * Create email campaign with sequences
 */
export const createCampaign = api(
  { expose: true, method: "POST", path: "/email/campaigns" },
  async (req: CreateCampaignRequest): Promise<EmailCampaign> => {
    try {
      // Create campaign
      const campaign = await emailDB.queryRow<EmailCampaign>(
        `INSERT INTO email_campaigns (name, campaign_type, status)
         VALUES ($1, $2, 'draft')
         RETURNING *`,
        [req.name, req.campaign_type]
      );

      if (!campaign) {
        throw new Error('Failed to create campaign');
      }

      // Create sequences
      for (let i = 0; i < req.sequences.length; i++) {
        const seq = req.sequences[i];
        await emailDB.exec(
          `INSERT INTO email_sequences
           (campaign_id, sequence_order, send_delay_days, send_delay_hours, subject_line, preview_text, email_content)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            campaign.id,
            i + 1,
            seq.send_delay_days,
            seq.send_delay_hours,
            seq.subject_line,
            seq.preview_text,
            seq.email_content,
          ]
        );
      }

      return campaign;
    } catch (error) {
      console.error('Create campaign error:', error);
      throw new Error('Failed to create campaign');
    }
  }
);

/**
 * Get all campaigns
 */
export const getCampaigns = api(
  { expose: true, method: "GET", path: "/email/campaigns" },
  async (): Promise<EmailCampaign[]> => {
    try {
      const campaigns = await emailDB.query<EmailCampaign>(
        `SELECT * FROM email_campaigns ORDER BY created_at DESC`
      );

      return campaigns;
    } catch (error) {
      console.error('Get campaigns error:', error);
      throw new Error('Failed to get campaigns');
    }
  }
);

/**
 * Get campaign performance metrics
 */
export const getCampaignMetrics = api(
  { expose: true, method: "GET", path: "/email/campaigns/:campaignId/metrics" },
  async ({ campaignId }: { campaignId: number }): Promise<EmailMetrics[]> => {
    try {
      const metrics = await emailDB.query<EmailMetrics>(
        `SELECT
           campaign_id,
           sequence_id,
           date,
           sends,
           opens,
           unique_opens,
           clicks,
           unique_clicks,
           bounces,
           unsubscribes,
           revenue,
           CASE WHEN sends > 0 THEN (unique_opens::float / sends * 100) ELSE 0 END as open_rate,
           CASE WHEN sends > 0 THEN (unique_clicks::float / sends * 100) ELSE 0 END as click_rate,
           CASE WHEN unique_opens > 0 THEN (unique_clicks::float / unique_opens * 100) ELSE 0 END as click_to_open_rate
         FROM email_metrics
         WHERE campaign_id = $1
         ORDER BY date DESC
         LIMIT 30`,
        [campaignId]
      );

      return metrics;
    } catch (error) {
      console.error('Get campaign metrics error:', error);
      throw new Error('Failed to get campaign metrics');
    }
  }
);

/**
 * Get email performance overview
 */
export const getEmailOverview = api(
  { expose: true, method: "GET", path: "/email/overview" },
  async (): Promise<{
    total_subscribers: number;
    total_campaigns: number;
    avg_open_rate: number;
    avg_click_rate: number;
    total_revenue: number;
    last_30_days: {
      sends: number;
      opens: number;
      clicks: number;
      revenue: number;
    };
  }> => {
    try {
      // Get subscriber count
      const subscriberCount = await emailDB.queryRow<{ count: number }>(
        `SELECT COUNT(*) as count FROM newsletter.subscriptions WHERE unsubscribed = false`
      );

      // Get campaign count
      const campaignCount = await emailDB.queryRow<{ count: number }>(
        `SELECT COUNT(*) as count FROM email_campaigns WHERE status = 'active'`
      );

      // Get overall metrics
      const overallMetrics = await emailDB.queryRow<{
        avg_open_rate: number;
        avg_click_rate: number;
        total_revenue: number;
      }>(
        `SELECT
           AVG(CASE WHEN sends > 0 THEN (unique_opens::float / sends * 100) ELSE 0 END) as avg_open_rate,
           AVG(CASE WHEN sends > 0 THEN (unique_clicks::float / sends * 100) ELSE 0 END) as avg_click_rate,
           SUM(revenue) as total_revenue
         FROM email_metrics
         WHERE date >= CURRENT_DATE - INTERVAL '90 days'`
      );

      // Get last 30 days metrics
      const last30Days = await emailDB.queryRow<{
        sends: number;
        opens: number;
        clicks: number;
        revenue: number;
      }>(
        `SELECT
           COALESCE(SUM(sends), 0) as sends,
           COALESCE(SUM(unique_opens), 0) as opens,
           COALESCE(SUM(unique_clicks), 0) as clicks,
           COALESCE(SUM(revenue), 0) as revenue
         FROM email_metrics
         WHERE date >= CURRENT_DATE - INTERVAL '30 days'`
      );

      return {
        total_subscribers: subscriberCount?.count || 0,
        total_campaigns: campaignCount?.count || 0,
        avg_open_rate: overallMetrics?.avg_open_rate || 0,
        avg_click_rate: overallMetrics?.avg_click_rate || 0,
        total_revenue: overallMetrics?.total_revenue || 0,
        last_30_days: {
          sends: last30Days?.sends || 0,
          opens: last30Days?.opens || 0,
          clicks: last30Days?.clicks || 0,
          revenue: last30Days?.revenue || 0,
        },
      };
    } catch (error) {
      console.error('Get email overview error:', error);
      throw new Error('Failed to get email overview');
    }
  }
);

/**
 * Test Mailchimp connection
 */
export const testMailchimpConnection = api(
  { expose: true, method: "GET", path: "/email/test-connection" },
  async (): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await mailchimp.verifyConnection();

      if (result.success) {
        return {
          success: true,
          message: 'Successfully connected to Mailchimp!',
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to connect',
        };
      }
    } catch (error) {
      console.error('Test connection error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Trigger welcome series for new subscriber
 */
export const triggerWelcomeSeries = api(
  { method: "POST", path: "/email/trigger-welcome" },
  async (req: { email: string; firstName?: string }): Promise<{ success: boolean }> => {
    try {
      // Add subscriber to Mailchimp with welcome tag
      const result = await mailchimp.addSubscriber({
        email: req.email,
        firstName: req.firstName,
        tags: ['welcome-series', 'new-subscriber'],
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // In Mailchimp, you'd set up an automation that triggers on the 'welcome-series' tag
      // This is done through Mailchimp UI for free tier

      return { success: true };
    } catch (error) {
      console.error('Trigger welcome series error:', error);
      return { success: false };
    }
  }
);
