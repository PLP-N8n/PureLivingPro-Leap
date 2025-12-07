import { secret } from "encore.dev/config";

// External API secrets for automation services
export const openAIKey = secret("OpenAIKey");
export const googleSheetsId = secret("GoogleSheetsId");
export const googleClientEmail = secret("GoogleClientEmail");
export const googlePrivateKey = secret("GooglePrivateKey");
export const amazonAccessKey = secret("AmazonAccessKey");
export const amazonSecretKey = secret("AmazonSecretKey");
export const amazonStoreId = secret("AmazonStoreId");
