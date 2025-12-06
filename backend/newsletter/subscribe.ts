import { api, APIError } from "encore.dev/api";
import { newsletterDB } from "./db";

interface SubscribeRequest {
  email: string;
}

interface SubscribeResponse {
  success: boolean;
}

// Subscribes a user to the newsletter.
export const subscribe = api<SubscribeRequest, SubscribeResponse>(
  { expose: true, method: "POST", path: "/subscribe" },
  async ({ email }) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw APIError.invalidArgument("Invalid email address");
    }

    try {
      await newsletterDB.exec`
        INSERT INTO subscriptions (email) VALUES (${email})
        ON CONFLICT (email) DO NOTHING
      `;
    } catch (error) {
      console.error("Subscription error:", error);
      throw APIError.internal("Could not subscribe email");
    }

    return { success: true };
  }
);
