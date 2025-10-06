import { api } from "encore.dev/api";
import { googleClientEmail, googlePrivateKey } from "../config/secrets";
import { ServiceHealthCheck, HealthStatus } from "./types";

export const checkGoogleSheets = api(
  { expose: true, method: "GET", path: "/health/google-sheets" },
  async (): Promise<ServiceHealthCheck> => {
    const startTime = Date.now();
    let status: HealthStatus = "unknown";
    let message = "";
    let details: Record<string, any> = {};

    try {
      const clientEmail = googleClientEmail();
      const privateKey = googlePrivateKey();
      
      const missingCreds = [];
      if (!clientEmail || clientEmail.trim() === "") missingCreds.push("Client Email");
      if (!privateKey || privateKey.trim() === "") missingCreds.push("Private Key");

      if (missingCreds.length > 0) {
        return {
          service: "google_sheets",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          message: `Missing credentials: ${missingCreds.join(", ")}`,
          lastChecked: new Date(),
          details: { 
            configured: false,
            missingCreds,
            hasClientEmail: !!clientEmail,
            hasPrivateKey: !!privateKey
          }
        };
      }

      const responseTime = Date.now() - startTime;
      
      status = "healthy";
      message = "Google Sheets service account credentials configured";
      details = {
        configured: true,
        hasClientEmail: true,
        hasPrivateKey: true,
        note: "Full API validation requires making an authenticated request"
      };

      return {
        service: "google_sheets",
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
        service: "google_sheets",
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: { error: error.name || "unknown" }
      };
    }
  }
);