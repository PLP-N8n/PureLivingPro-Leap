import { api } from "encore.dev/api";
import { HealthCheckHistory } from "./types";
import { DB } from "./db";

interface HealthHistoryRequest {
  service?: string;
  limit?: number;
  hours?: number;
}

interface HealthHistoryResponse {
  history: HealthCheckHistory[];
  totalCount: number;
}

export const getHealthHistory = api(
  { expose: true, method: "GET", path: "/health/history" },
  async ({ service, limit = 100, hours = 24 }: HealthHistoryRequest): Promise<HealthHistoryResponse> => {
    const limitValue = Math.min(limit, 1000);
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    let query;
    if (service) {
      query = DB.query`
        SELECT 
          id::text,
          service,
          status,
          response_time,
          message,
          details,
          checked_at
        FROM health_checks
        WHERE service = ${service}
          AND checked_at >= ${cutoffTime}
        ORDER BY checked_at DESC
        LIMIT ${limitValue}
      `;
    } else {
      query = DB.query`
        SELECT 
          id::text,
          service,
          status,
          response_time,
          message,
          details,
          checked_at
        FROM health_checks
        WHERE checked_at >= ${cutoffTime}
        ORDER BY checked_at DESC
        LIMIT ${limitValue}
      `;
    }

    const rowsArray: any[] = [];
    for await (const row of query) {
      rowsArray.push(row);
    }
    
    const history: HealthCheckHistory[] = rowsArray.map((row: any) => ({
      id: row.id,
      service: row.service,
      status: row.status,
      responseTime: row.response_time,
      message: row.message,
      details: row.details,
      checkedAt: row.checked_at
    }));

    return {
      history,
      totalCount: history.length
    };
  }
);