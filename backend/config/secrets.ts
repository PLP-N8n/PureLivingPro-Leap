import { secret } from "encore.dev/config";

export const openAIKey = secret("OpenAIKey");

export const googleSheetsId = secret("GoogleSheetsId");
export const googleClientEmail = secret("GoogleClientEmail");
export const googlePrivateKey = secret("GooglePrivateKey");

export const amazonAccessKey = secret("AmazonAccessKey");
export const amazonSecretKey = secret("AmazonSecretKey");
export const amazonStoreId = secret("AmazonStoreId");

export const wordpressUrl = secret("WordPressUrl");
export const wordpressUsername = secret("WordPressUsername");
export const wordpressPassword = secret("WordPressPassword");

export const mediumToken = secret("MediumToken");

export const mailchimpAPIKey = secret("MailchimpAPIKey");
export const mailchimpServerPrefix = secret("MailchimpServerPrefix"); // e.g., 'us1', 'us2'
export const mailchimpListID = secret("MailchimpListID");
