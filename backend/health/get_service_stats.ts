import { api } from "encore.dev/api";
import { DB } from "./db";

interface ServiceStats {
  service: string;
  uptimePercentage: number;
  averageResponseTime: number;
  totalChecks: number;
  healthyChecks: number;
  degradedChecks: number;
  unhealthyChecks: number;
  lastStatus: string;
  lastChecked: Date;
}

interface ServiceStatsRequest {
  hours?: number;
}

interface ServiceStatsResponse {
  stats: ServiceStats[];
  period: {
    hours: number;
    from: Date;
    to: Date;
  };
}

export const getServiceStats = api(
  { expose: true, method: "GET", path: "/health/stats" },
  async ({ hours = 24 }: ServiceStatsRequest): Promise<ServiceStatsResponse> => {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const now = new Date();

    const query = DB.query`
      WITH latest_checks AS (
        SELECT DISTINCT ON (service)
          service,
          status as last_status,
          checked_at as last_checked
        FROM health_checks
        WHERE checked_at >= ${cutoffTime}
        ORDER BY service, checked_at DESC
      ),
      aggregates AS (
        SELECT
          service,
          COUNT(*) as total_checks,
          AVG(response_time) as avg_response_time,
          SUM(CASE WHEN status = 'healthy' THEN 1 ELSE 0 END) as healthy_checks,
          SUM(CASE WHEN status = 'degraded' THEN 1 ELSE 0 END) as degraded_checks,
          SUM(CASE WHEN status = 'unhealthy' THEN 1 ELSE 0 END) as unhealthy_checks
        FROM health_checks
        WHERE checked_at >= ${cutoffTime}
        GROUP BY service
      )
      SELECT
        a.service,
        a.total_checks,
        a.avg_response_time,
        a.healthy_checks,
        a.degraded_checks,
        a.unhealthy_checks,
        l.last_status,
        l.last_checked,
        CASE
          WHEN a.total_checks > 0 
          THEN (a.healthy_checks::float / a.total_checks::float * 100)
          ELSE 0
        END as uptime_percentage
      FROM aggregates a
      LEFT JOIN latest_checks l ON a.service = l.service
      ORDER BY a.service
    `;

    const rowsArray: any[] = [];
    for await (const row of query) {
      rowsArray.push(row);
    }

    const stats: ServiceStats[] = rowsArray.map((row: any) => ({
      service: row.service,
      uptimePercentage: parseFloat(row.uptime_percentage || "0"),
      averageResponseTime: parseFloat(row.avg_response_time || "0"),
      totalChecks: parseInt(row.total_checks || "0"),
      healthyChecks: parseInt(row.healthy_checks || "0"),
      degradedChecks: parseInt(row.degraded_checks || "0"),
      unhealthyChecks: parseInt(row.unhealthy_checks || "0"),
      lastStatus: row.last_status || "unknown",
      lastChecked: row.last_checked || now
    }));

    return {
      stats,
      period: {
        hours,
        from: cutoffTime,
        to: now
      }
    };
  }
);