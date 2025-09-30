import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Eye, 
  MousePointer, 
  DollarSign,
  Clock,
  Users,
  Zap,
  TrendingUp
} from 'lucide-react';
import type { RealTimeMetrics as RealTimeMetricsType } from '~backend/analytics/get_real_time_metrics';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';

export function RealTimeMetrics() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { data, isLoading } = useQuery<RealTimeMetricsType>({
    queryKey: ['real-time-metrics'],
    queryFn: async () => backend.analytics.getRealTimeMetrics(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date());
    }
  }, [data]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US').format(num);

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (isLoading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Activity className="h-6 w-6 animate-spin mr-2" />
            <span>Loading live data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Live • Updated {timeAgo(lastUpdate)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Visitors</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.liveVisitors)}</div>
            <p className="text-xs text-muted-foreground">Active in last 5 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks (1h)</CardTitle>
            <MousePointer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.currentMetrics.clicksLastHour)}</div>
            <p className="text-xs text-muted-foreground">
              {data.currentMetrics.conversionsLastHour} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (1h)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.currentMetrics.revenueLastHour)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.currentMetrics.pageViewsLastHour)} page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.automationActivity.jobsInProgress)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.automationActivity.completedLastHour} completed in last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Pages</CardTitle>
            <CardDescription>Most visited pages right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activePages.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.path}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(page.visitors)} active visitor{page.visitors !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {page.visitors}
                  </Badge>
                </div>
              ))}
              {data.activePages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active pages in the last 10 minutes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Conversions</CardTitle>
            <CardDescription>Latest affiliate conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentConversions.slice(0, 5).map((conversion) => (
                <div key={conversion.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conversion.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(conversion.convertedAt)}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <Badge variant="default" className="bg-green-500">
                      {formatCurrency(conversion.commission)}
                    </Badge>
                  </div>
                </div>
              ))}
              {data.recentConversions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No conversions in the last hour
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Clicks</CardTitle>
          <CardDescription>Latest affiliate link clicks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {data.recentClicks.slice(0, 6).map((click) => (
              <div 
                key={click.id} 
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{click.productName}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo(click.clickedAt)}</span>
                    {click.deviceType && (
                      <Badge variant="outline" className="text-xs">
                        {click.deviceType}
                      </Badge>
                    )}
                  </div>
                </div>
                <MousePointer className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            ))}
            {data.recentClicks.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground text-center py-4">
                No clicks in the last hour
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Performance</CardTitle>
          <CardDescription>Real-time system health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className="text-sm font-bold">
                  {Math.round(data.performanceIndicators.avgResponseTime)}ms
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ 
                    width: `${Math.min(100, (1 - data.performanceIndicators.avgResponseTime / 500) * 100)}%` 
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm font-bold text-green-500">
                  {data.performanceIndicators.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${data.performanceIndicators.successRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className={`text-sm font-bold ${
                  data.performanceIndicators.errorRate < 1 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {data.performanceIndicators.errorRate.toFixed(2)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    data.performanceIndicators.errorRate < 1 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, data.performanceIndicators.errorRate * 10)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}