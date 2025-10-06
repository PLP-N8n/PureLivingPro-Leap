import { api } from "encore.dev/api";
import { amazonAccessKey, amazonSecretKey, amazonStoreId } from "../config/secrets";
import { ServiceHealthCheck, HealthStatus } from "./types";

export const checkAmazon = api(
  { expose: true, method: "GET", path: "/health/amazon" },
  async (): Promise<ServiceHealthCheck> => {
    const startTime = Date.now();
    let status: HealthStatus = "unknown";
    let message = "";
    let details: Record<string, any> = {};

    try {
      const accessKeyId = amazonAccessKey();
      const secretAccessKey = amazonSecretKey();
      const associateTag = amazonStoreId();
      
      const missingKeys = [];
      if (!accessKeyId || accessKeyId.trim() === "") missingKeys.push("Access Key ID");
      if (!secretAccessKey || secretAccessKey.trim() === "") missingKeys.push("Secret Access Key");
      if (!associateTag || associateTag.trim() === "") missingKeys.push("Associate Tag");

      if (missingKeys.length > 0) {
        return {
          service: "amazon",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          message: `Missing credentials: ${missingKeys.join(", ")}`,
          lastChecked: new Date(),
          details: { 
            configured: false,
            missingKeys,
            hasAccessKey: !!accessKeyId,
            hasSecretKey: !!secretAccessKey,
            hasAssociateTag: !!associateTag
          }
        };
      }

      const responseTime = Date.now() - startTime;
      
      status = "healthy";
      message = "Amazon Product Advertising API credentials configured";
      details = {
        configured: true,
        hasAccessKey: true,
        hasSecretKey: true,
        hasAssociateTag: true,
        note: "Full API validation requires making a signed request"
      };

      return {
        service: "amazon",
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        service: "amazon",
        status: "unhealthy",
        responseTime,
        message: error.message || "Unknown error",
        lastChecked: new Date(),
        details: { error: error.name || "unknown" }
      };
    }
  }
);