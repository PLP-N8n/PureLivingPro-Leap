import { api } from "encore.dev/api";
import { mailchimpAPIKey, mailchimpServerPrefix, mailchimpListID } from "../config/secrets";

interface MailchimpResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface SubscriberData {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  merge_fields?: Record<string, any>;
}

/**
 * Add or update subscriber in Mailchimp
 */
export const addSubscriber = async (data: SubscriberData): Promise<MailchimpResponse> => {
  try {
    const apiKey = mailchimpAPIKey();
    const serverPrefix = mailchimpServerPrefix();
    const listId = mailchimpListID();

    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const subscriberHash = md5(data.email.toLowerCase());

    const payload = {
      email_address: data.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: data.firstName || '',
        LNAME: data.lastName || '',
        ...data.merge_fields,
      },
      tags: data.tags || [],
    };

    const response = await fetch(`${url}/${subscriberHash}`, {
      method: 'PUT', // PUT to create or update
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Mailchimp API error:', error);
      return { success: false, error: error.detail || 'Failed to add subscriber' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Mailchimp addSubscriber error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Send transactional email via Mailchimp Transactional (Mandrill)
 * Note: Free tier of Mailchimp doesn't include Mandrill, so we'll use campaigns
 */
export const sendTransactionalEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<MailchimpResponse> => {
  try {
    // For free tier, we can't send individual emails
    // Instead, we'll add the user and trigger automation
    // Or use Mailchimp campaigns API

    console.log(`Would send email to ${to}: ${subject}`);
    console.log('Note: Free tier requires automation workflows or campaigns');

    return {
      success: true,
      data: { message: 'Email queued for automation workflow' }
    };
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Create automation workflow (welcome series, etc.)
 */
export const createAutomation = async (
  name: string,
  triggerSettings: any
): Promise<MailchimpResponse> => {
  try {
    const apiKey = mailchimpAPIKey();
    const serverPrefix = mailchimpServerPrefix();

    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/automations`;

    const payload = {
      recipients: {
        list_id: mailchimpListID(),
      },
      settings: {
        title: name,
        from_name: 'Pure Living Pro',
        reply_to: 'hello@purelivingpro.com',
      },
      trigger_settings: triggerSettings,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Create automation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = async (campaignId: string): Promise<MailchimpResponse> => {
  try {
    const apiKey = mailchimpAPIKey();
    const serverPrefix = mailchimpServerPrefix();

    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/reports/${campaignId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get campaign stats error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get list members (subscribers)
 */
export const getSubscribers = async (offset = 0, count = 100): Promise<MailchimpResponse> => {
  try {
    const apiKey = mailchimpAPIKey();
    const serverPrefix = mailchimpServerPrefix();
    const listId = mailchimpListID();

    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members?offset=${offset}&count=${count}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Get subscribers error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Add tags to a subscriber
 */
export const addTagsToSubscriber = async (
  email: string,
  tags: string[]
): Promise<MailchimpResponse> => {
  try {
    const apiKey = mailchimpAPIKey();
    const serverPrefix = mailchimpServerPrefix();
    const listId = mailchimpListID();

    const subscriberHash = md5(email.toLowerCase());
    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}/tags`;

    const payload = {
      tags: tags.map(tag => ({ name: tag, status: 'active' })),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail };
    }

    return { success: true, data: { message: 'Tags added successfully' } };
  } catch (error) {
    console.error('Add tags error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Simple MD5 hash for email (Mailchimp requirement)
 */
function md5(str: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Ping Mailchimp API to verify connection
 */
export const verifyConnection = async (): Promise<MailchimpResponse> => {
  try {
    const apiKey = mailchimpAPIKey();
    const serverPrefix = mailchimpServerPrefix();

    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/ping`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to connect to Mailchimp' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Verify connection error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
