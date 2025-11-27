import { api, APIError } from "encore.dev/api";
import { newsletterDB } from "./db";

interface SubscribeRequest {
  email: string;
  firstName?: string;
}

interface SubscribeResponse {
  success: boolean;
  mailchimp_synced?: boolean;
}

// Subscribes a user to the newsletter.
export const subscribe = api<SubscribeRequest, SubscribeResponse>(
  { expose: true, method: "POST", path: "/subscribe" },
  async ({ email, firstName }) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw APIError.invalidArgument("Invalid email address");
    }

    try {
      // Save to local database
      await newsletterDB.exec`
        INSERT INTO subscriptions (email) VALUES (${email})
        ON CONFLICT (email) DO NOTHING
      `;

      // Sync to Mailchimp
      let mailchimpSynced = false;
      try {
        // Import mailchimp functions
        const { addSubscriber } = await import("../email/mailchimp");

        const result = await addSubscriber({
          email,
          firstName,
          tags: ['website-signup', 'new-subscriber'],
        });

        if (result.success) {
          mailchimpSynced = true;

          // Trigger welcome series
          const { triggerWelcomeSeries } = await import("../email/email_service");
          await triggerWelcomeSeries({ email, firstName });
        } else {
          console.error("Mailchimp sync failed:", result.error);
        }
      } catch (mailchimpError) {
        // Don't fail the subscription if Mailchimp fails
        console.error("Mailchimp error:", mailchimpError);
      }

      return { success: true, mailchimp_synced: mailchimpSynced };
    } catch (error) {
      console.error("Subscription error:", error);
      throw APIError.internal("Could not subscribe email");
    }
  }
);
