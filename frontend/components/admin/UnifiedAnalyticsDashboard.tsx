import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  DollarSign, 
  FileText, 
  MousePointer, 
  Settings, 
  RefreshCw,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { UnifiedDashboardData } from '~backend/analytics/get_unified_dashboard';
import { RevenueChart } from './charts/RevenueChart';
import { TrafficChart } from './charts/TrafficChart';
import { ContentPerformanceChart } from './charts/ContentPerformanceChart';
import { AutomationStatusCard } from './AutomationStatusCard';
import { MetricCard } from './MetricCard';
import { AdminErrorBoundary, AdminErrorFallback } from './AdminErrorBoundary';
import { useUnifiedDashboard } from '../../hooks/useAdminApi';

export function UnifiedAnalyticsDashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data, isLoading: loading, error, refetch } = useUnifiedDashboard();

  const fetchData = async () => {
    const result = await refetch();
    if (result.data) {
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US').format(num);

  const formatPercentage = (num: number) => 
    `${num.toFixed(1)}%`;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminErrorFallback 
        error={error} 
        onRetry={fetchData} 
        context="Unified Analytics Dashboard" 
      />
    );
  }

  if (!data) return null;

  return (
    <AdminErrorBoundary context="Unified Analytics Dashboard">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Unified insights across all services • Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Live" : "Paused"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

        {/* Overview Cards */}
        <AdminErrorBoundary context="Overview Metrics" fallback={
          <AdminErrorFallback context="Overview Metrics" />
        }>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.overview.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {formatPercentage(Math.abs(data.overview.revenueGrowth))} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalPageViews)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.overview.trafficGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {formatPercentage(Math.abs(data.overview.trafficGrowth))} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.overview.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.overview.totalAffiliateClicks)} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalArticles)}</div>
            <p className="text-xs text-muted-foreground">
              +{data.contentPerformance.publishedThisMonth} this month
            </p>
          </CardContent>
        </Card>
          </div>
        </AdminErrorBoundary>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Revenue Trend */}
            <AdminErrorBoundary context="Revenue Trend Chart" fallback={
              <AdminErrorFallback context="Revenue Trend Chart" />
            }>
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Trend (14 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={data.affiliateRevenue.dailyRevenue} />
                </CardContent>
              </Card>
            </AdminErrorBoundary>

            {/* Quick Stats */}
            <AdminErrorBoundary context="Quick Stats" fallback={
              <AdminErrorFallback context="Quick Stats" />
            }>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Published Today</span>
                    <Badge variant="secondary">{data.contentPerformance.publishedToday}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Automation Jobs</span>
                    <Badge variant="outline">{data.automationStatus.activePipelineJobs}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Working Links</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={data.automationStatus.linkHealthSummary.brokenLinks > 0 ? "destructive" : "default"}>
                        {data.automationStatus.linkHealthSummary.workingLinks}/{data.automationStatus.linkHealthSummary.totalLinks}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Link Health</span>
                      <span>{formatPercentage((data.automationStatus.linkHealthSummary.workingLinks / data.automationStatus.linkHealthSummary.totalLinks) * 100)}</span>
                    </div>
                    <Progress value={(data.automationStatus.linkHealthSummary.workingLinks / data.automationStatus.linkHealthSummary.totalLinks) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </AdminErrorBoundary>
          </div>

          {/* Traffic Overview */}
          <AdminErrorBoundary context="Traffic Chart" fallback={
            <AdminErrorFallback context="Traffic Chart" />
          }>
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview (14 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <TrafficChart data={data.trafficAnalytics.pageViewsTrend} />
              </CardContent>
            </Card>
          </AdminErrorBoundary>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>
                  Current: {formatCurrency(data.affiliateRevenue.monthlyTrend.currentMonth)} | 
                  Previous: {formatCurrency(data.affiliateRevenue.monthlyTrend.previousMonth)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {data.affiliateRevenue.monthlyTrend.growth >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-2xl font-bold">
                    {formatPercentage(Math.abs(data.affiliateRevenue.monthlyTrend.growth))}
                  </span>
                  <span className="text-muted-foreground">growth</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={data.affiliateRevenue.dailyRevenue} />
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.affiliateRevenue.topProducts.slice(0, 5).map((product: any, index: number) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{product.productName}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatNumber(product.clicks)} clicks</span>
                        <span>{formatNumber(product.conversions)} conversions</span>
                        <span>{formatPercentage(product.conversionRate)} rate</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(product.revenue)}</p>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentPerformanceChart data={data.contentPerformance.contentByCategory} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publishing Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Today</span>
                  <Badge variant="secondary">{data.contentPerformance.publishedToday}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>This Week</span>
                  <Badge variant="secondary">{data.contentPerformance.publishedThisWeek}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>This Month</span>
                  <Badge variant="secondary">{data.contentPerformance.publishedThisMonth}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.contentPerformance.topPerformingArticles.slice(0, 5).map((article: any, index: number) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium line-clamp-1">{article.title}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatNumber(article.viewCount)} views</span>
                        <span>{formatCurrency(article.revenue)} revenue</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <AutomationStatusCard data={data.automationStatus} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="AI Recommendation Performance"
              metric={formatPercentage(data.aiInsights.recommendationAccuracy)}
              description={`${formatNumber(data.aiInsights.totalRecommendationsServed)} recommendations served`}
              trend={12.5}
              icon={<Activity className="h-4 w-4" />}
            />
            
            <MetricCard
              title="User Engagement Rate"
              metric={formatPercentage(data.aiInsights.userEngagementRate)}
              description="Average engagement across all content"
              trend={-2.1}
              icon={<Users className="h-4 w-4" />}
            />
            
            <MetricCard
              title="Revenue Per Click"
              metric={formatCurrency(data.overview.totalRevenue / Math.max(data.overview.totalAffiliateClicks, 1))}
              description="Average revenue generated per click"
              trend={8.3}
              icon={<DollarSign className="h-4 w-4" />}
            />
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Top recommended products and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.aiInsights.topRecommendedProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(product.recommendationCount)} recommendations • {formatPercentage(product.clickThrough)} CTR
                      </p>
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </AdminErrorBoundary>
  );
}