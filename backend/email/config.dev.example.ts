// Example Mailchimp configuration for development
// Copy this file to config.dev.ts and add your actual credentials

export const mailchimpConfig = {
  apiKey: "your-api-key-here-us18",  // Get from Mailchimp → Account → Extras → API keys
  serverPrefix: "us18",               // The part after the dash in your API key (e.g., us1, us18, us19)
  listId: "YOUR_LIST_ID_HERE",        // Get from Mailchimp → Audience → Settings → Audience ID
};
