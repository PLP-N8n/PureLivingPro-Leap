import { api } from "encore.dev/api";

interface HealthResponse {
  ok: boolean;
  timestamp: string;
  version: string;
  services: {
    database: boolean;
    ai: boolean;
    affiliate: boolean;
  };
}

// Health check endpoint for monitoring and deployment verification.
export const healthCheck = api<void, HealthResponse>(
  { expose: true, method: "GET", path: "/healthz" },
  async () => {
    const timestamp = new Date().toISOString();
    
    // Check database connectivity
    let databaseStatus = false;
    try {
      const { contentDB } = await import("../content/db");
      await contentDB.queryRow`SELECT 1 as test`;
      databaseStatus = true;
    } catch (error) {
      console.warn('Database health check failed:', error);
    }

    // Check AI service availability
    let aiStatus = false;
    try {
      const { secret } = await import("encore.dev/config");
      const openAIKey = secret("OpenAIKey");
      aiStatus = !!openAIKey();
    } catch (error) {
      console.warn('AI service check failed:', error);
    }

    // Check affiliate system
    let affiliateStatus = false;
    try {
      const { affiliateDB } = await import("../affiliate/db");
      await affiliateDB.queryRow`SELECT 1 as test`;
      affiliateStatus = true;
    } catch (error) {
      console.warn('Affiliate system check failed:', error);
    }

    return {
      ok: true,
      timestamp,
      version: "1.0.0",
      services: {
        database: databaseStatus,
        ai: aiStatus,
        affiliate: affiliateStatus
      }
    };
  }
);
