// TEMPORARILY DISABLED FOR LOCAL DEVELOPMENT
// These secrets require Encore Cloud authentication
// For local dev, these features will be unavailable until cloud is configured

// Placeholder values for local development - these won't work for actual API calls
// but will allow the server to start
export const openAIKey = () => process.env.OPENAI_KEY || "local-dev-placeholder";
export const googleSheetsId = () => process.env.GOOGLE_SHEETS_ID || "local-dev-placeholder";
export const googleClientEmail = () => process.env.GOOGLE_CLIENT_EMAIL || "local@dev.com";
export const googlePrivateKey = () => process.env.GOOGLE_PRIVATE_KEY || "local-dev-placeholder";
export const amazonAccessKey = () => process.env.AMAZON_ACCESS_KEY || "local-dev-placeholder";
export const amazonSecretKey = () => process.env.AMAZON_SECRET_KEY || "local-dev-placeholder";
export const amazonStoreId = () => process.env.AMAZON_STORE_ID || "local-dev-placeholder";
