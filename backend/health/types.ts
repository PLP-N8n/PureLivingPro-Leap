export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface ServiceHealthCheck {
  service: string;
  status: HealthStatus;
  responseTime: number;
  message?: string;
  lastChecked: Date;
  details?: Record<string, any>;
}

export interface HealthCheckResponse {
  overall: HealthStatus;
  services: ServiceHealthCheck[];
  timestamp: Date;
}

export interface HealthCheckHistory {
  id: string;
  service: string;
  status: HealthStatus;
  responseTime: number;
  message?: string;
  details?: Record<string, any>;
  checkedAt: Date;
}