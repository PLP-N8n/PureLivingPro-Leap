import { secret } from "encore.dev/config";

export const openaiApiKey = secret("OpenAIApiKey");
export const amazonAccessKeyId = secret("AmazonAccessKeyId");
export const amazonSecretAccessKey = secret("AmazonSecretAccessKey");
export const amazonAssociateTag = secret("AmazonAssociateTag");