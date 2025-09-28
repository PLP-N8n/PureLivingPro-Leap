import { api } from "encore.dev/api";
import { 
  openAIKey, 
  googleSheetsId, 
  googleClientEmail, 
  googlePrivateKey,
  amazonAccessKey,
  amazonSecretKey,
  amazonStoreId
} from "./secrets";
import { wordpressUrl, wordpressUsername, wordpressPassword, mediumToken } from "../content/secrets";

interface SecretStatus {
  name: string;
  configured: boolean;
  hasValue: boolean;
  length?: number;
}

interface SecretsTestResponse {
  secrets: SecretStatus[];
  summary: {
    total: number;
    configured: number;
    missing: number;
  };
}

export const testSecrets = api(
  { method: "GET", path: "/test-secrets", expose: true },
  async (): Promise<SecretsTestResponse> => {
    const secrets = [
      { name: "OpenAIKey", secret: openAIKey },
      { name: "GoogleSheetsId", secret: googleSheetsId },
      { name: "GoogleClientEmail", secret: googleClientEmail },
      { name: "GooglePrivateKey", secret: googlePrivateKey },
      { name: "AmazonAccessKey", secret: amazonAccessKey },
      { name: "AmazonSecretKey", secret: amazonSecretKey },
      { name: "AmazonStoreId", secret: amazonStoreId },
      { name: "WordPressUrl", secret: wordpressUrl },
      { name: "WordPressUsername", secret: wordpressUsername },
      { name: "WordPressPassword", secret: wordpressPassword },
      { name: "MediumToken", secret: mediumToken },
    ];

    const results: SecretStatus[] = [];
    
    for (const { name, secret } of secrets) {
      try {
        const value = await secret();
        const hasValue = value !== undefined && value !== null && value.toString().trim() !== "";
        
        results.push({
          name,
          configured: true,
          hasValue,
          length: hasValue ? value.toString().length : 0,
        });
      } catch (error) {
        results.push({
          name,
          configured: false,
          hasValue: false,
        });
      }
    }

    const configured = results.filter(r => r.configured && r.hasValue).length;
    const missing = results.length - configured;

    return {
      secrets: results,
      summary: {
        total: results.length,
        configured,
        missing,
      },
    };
  }
);