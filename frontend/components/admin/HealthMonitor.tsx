import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { HealthCheckResponse, ServiceHealthCheck } from "~backend/health/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw,
  Activity,
  Clock,
  TrendingUp
} from "lucide-react";

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

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    label: "Healthy"
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    label: "Degraded"
  },
  unhealthy: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    label: "Unhealthy"
  },
  unknown: {
    icon: HelpCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    label: "Unknown"
  }
};

const serviceNames: Record<string, string> = {
  openai: "OpenAI",
  google_sheets: "Google Sheets",
  amazon: "Amazon Product Advertising"
};

export function HealthMonitor() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [stats, setStats] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealth = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [healthData, statsData] = await Promise.all([
        backend.health.getAllHealth(),
        backend.health.getServiceStats({ hours: 24 })
      ]);

      setHealth(healthData);
      setStats(statsData.stats);
    } catch (err: any) {
      console.error("Failed to fetch health status:", err);
      setError(err.message || "Failed to fetch health status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealth(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    fetchHealth(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading health status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!health) return null;

  const overallConfig = statusConfig[health.overall];
  const OverallIcon = overallConfig.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Monitor external API connections and service status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-500' : ''}`} />
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className={`border-2 ${overallConfig.borderColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${overallConfig.bgColor}`}>
                <OverallIcon className={`h-6 w-6 ${overallConfig.color}`} />
              </div>
              <div>
                <CardTitle>Overall Status</CardTitle>
                <CardDescription>
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${overallConfig.color} ${overallConfig.bgColor} border-current`}
            >
              {overallConfig.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Current Status</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {health.services.map((service) => (
              <ServiceHealthCard key={service.service} service={service} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <ServiceStatsCard key={stat.service} stats={stat} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ServiceHealthCard({ service }: { service: ServiceHealthCheck }) {
  const config = statusConfig[service.status];
  const Icon = config.icon;
  const serviceName = serviceNames[service.service] || service.service;

  return (
    <Card className={`border ${config.borderColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded ${config.bgColor}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <CardTitle className="text-base">{serviceName}</CardTitle>
          </div>
          <Badge variant="outline" className={`${config.color} border-current`}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Response Time</span>
          <span className="font-medium">{service.responseTime}ms</span>
        </div>

        {service.message && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Message</p>
            <p className="font-medium">{service.message}</p>
          </div>
        )}

        {service.details && Object.keys(service.details).length > 0 && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Details</p>
            <div className="space-y-1">
              {Object.entries(service.details).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="font-medium">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Clock className="h-3 w-3" />
          {new Date(service.lastChecked).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceStatsCard({ stats }: { stats: ServiceStats }) {
  const serviceName = serviceNames[stats.service] || stats.service;
  const config = statusConfig[stats.lastStatus as keyof typeof statusConfig] || statusConfig.unknown;
  const Icon = config.icon;

  const uptimeColor = stats.uptimePercentage >= 99 
    ? 'text-green-500' 
    : stats.uptimePercentage >= 95 
    ? 'text-yellow-500' 
    : 'text-red-500';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded ${config.bgColor}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <CardTitle className="text-base">{serviceName}</CardTitle>
          </div>
        </div>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Uptime</span>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${uptimeColor}`} />
              <span className={`text-lg font-bold ${uptimeColor}`}>
                {stats.uptimePercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg Response</span>
            <span className="font-medium">{Math.round(stats.averageResponseTime)}ms</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Checks</span>
            <span className="font-medium">{stats.totalChecks}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Healthy</div>
            <div className="text-sm font-medium text-green-500">{stats.healthyChecks}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Degraded</div>
            <div className="text-sm font-medium text-yellow-500">{stats.degradedChecks}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Unhealthy</div>
            <div className="text-sm font-medium text-red-500">{stats.unhealthyChecks}</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Clock className="h-3 w-3" />
          Last: {new Date(stats.lastChecked).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}