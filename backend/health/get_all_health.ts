import { api } from "encore.dev/api";
import { checkOpenAI } from "./check_openai";
import { checkGoogleSheets } from "./check_google_sheets";
import { checkAmazon } from "./check_amazon";
import { HealthCheckResponse, HealthStatus, ServiceHealthCheck } from "./types";
import { DB } from "./db";

function determineOverallStatus(services: ServiceHealthCheck[]): HealthStatus {
  if (services.every(s => s.status === "healthy")) {
    return "healthy";
  }
  if (services.some(s => s.status === "unhealthy")) {
    return "unhealthy";
  }
  if (services.some(s => s.status === "degraded")) {
    return "degraded";
  }
  return "unknown";
}

async function logHealthCheck(check: ServiceHealthCheck): Promise<void> {
  try {
    await DB.exec`
      INSERT INTO health_checks (service, status, response_time, message, details, checked_at)
      VALUES (
        ${check.service},
        ${check.status},
        ${check.responseTime},
        ${check.message || null},
        ${JSON.stringify(check.details || {})},
        ${check.lastChecked}
      )
    `;
  } catch (error) {
    console.error(`Failed to log health check for ${check.service}:`, error);
  }
}

export const getAllHealth = api(
  { expose: true, method: "GET", path: "/health" },
  async (): Promise<HealthCheckResponse> => {
    const [openai, googleSheets, amazon] = await Promise.all([
      checkOpenAI(),
      checkGoogleSheets(),
      checkAmazon()
    ]);

    const services = [openai, googleSheets, amazon];
    
    await Promise.all(services.map(logHealthCheck));

    const overall = determineOverallStatus(services);

    return {
      overall,
      services,
      timestamp: new Date()
    };
  }
);