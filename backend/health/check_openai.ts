import { api } from "encore.dev/api";
import { openaiApiKey } from "./secrets";
import { ServiceHealthCheck, HealthStatus } from "./types";

export const checkOpenAI = api(
  { expose: true, method: "GET", path: "/health/openai" },
  async (): Promise<ServiceHealthCheck> => {
    const startTime = Date.now();
    let status: HealthStatus = "unknown";
    let message = "";
    let details: Record<string, any> = {};

    try {
      const key = openaiApiKey();
      
      if (!key || key.trim() === "") {
        return {
          service: "openai",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          message: "API key not configured",
          lastChecked: new Date(),
          details: { configured: false }
        };
      }

      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(10000)
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data: any = await response.json();
        status = "healthy";
        message = `Successfully connected to OpenAI API`;
        details = {
          configured: true,
          modelsAvailable: data.data?.length || 0,
          apiVersion: response.headers.get("openai-version") || "unknown"
        };
      } else if (response.status === 401) {
        status = "unhealthy";
        message = "Invalid API key";
        details = { configured: true, error: "authentication_failed" };
      } else if (response.status === 429) {
        status = "degraded";
        message = "Rate limit exceeded";
        details = { configured: true, error: "rate_limited" };
      } else {
        status = "unhealthy";
        message = `API error: ${response.status} ${response.statusText}`;
        details = { configured: true, statusCode: response.status };
      }

      return {
        service: "openai",
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        status = "unhealthy";
        message = "Connection timeout";
      } else {
        status = "unhealthy";
        message = error.message || "Unknown error";
      }

      return {
        service: "openai",
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: { error: error.name || "unknown" }
      };
    }
  }
);