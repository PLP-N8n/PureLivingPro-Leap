import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Search,
  TrendingUp,
  BarChart3,
  ExternalLink,
  DollarSign,
  Newspaper,
  ShoppingBag,
  Bot,
  ArrowRight,
  Target,
  Zap,
  AlertTriangle
} from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";

export function OverviewDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => backend.analytics.getAnalyticsSummary(),
  });

  const { data: affiliateStats, isLoading: affiliateLoading } = useQuery({
    queryKey: ["admin", "affiliate-stats"],
    queryFn: () => backend.affiliate.getAffiliateStats(),
  });

  const { data: articles } = useQuery({
    queryKey: ["admin", "articles"],
    queryFn: () => backend.content.listArticles({ limit: 1 }),
  });

  const { data: weeklyReport } = useQuery({
    queryKey: ["automation", "weekly-report"],
    queryFn: () => backend.automation.generateWeeklyReport(),
  });

  const { data: revenueAnalysis } = useQuery({
    queryKey: ["automation", "revenue-analysis"],
    queryFn: () => backend.automation.analyzeRevenue(),
  });

  if (analyticsLoading || affiliateLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const monthlyTarget = 2000; // £2,000 target
  const currentRevenue = revenueAnalysis?.currentMonthRevenue || 0;
  const projectedRevenue = revenueAnalysis?.projectedMonthlyRevenue || 0;
  const progressPercentage = (projectedRevenue / monthlyTarget) * 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
        <p className="text-gray-600">Autonomous revenue generation system overview and performance metrics.</p>
      </div>

      {/* Revenue Progress */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Monthly Revenue Target: £2,000
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current: £{currentRevenue.toFixed(2)}</span>
              <span className="text-sm font-medium">Projected: £{projectedRevenue.toFixed(2)}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{progressPercentage.toFixed(1)}% of target</span>
              <Badge variant={progressPercentage >= 80 ? "default" : "destructive"}>
                {progressPercentage >= 80 ? "On Track" : "Below Target"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Clicks</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateStats?.totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{affiliateStats?.totalCommission.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateStats?.conversionRate.toFixed(2) || 0}%</div>
            <p className="text-xs text-muted-foreground">Clicks to conversions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2">
              <Bot className="h-4 w-4" /> Generate Content
            </Button>
            <Button className="w-full justify-start gap-2" variant="secondary">
              <ShoppingBag className="h-4 w-4" /> Add Products
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Zap className="h-4 w-4" /> Run Optimization
            </Button>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyReport?.recommendations ? (
              <div className="space-y-3">
                {weeklyReport.recommendations.slice(0, 4).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <LoadingSpinner />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueAnalysis?.topPerformingProducts ? (
              <div className="space-y-3">
                {revenueAnalysis.topPerformingProducts.slice(0, 5).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{product.productName}</h4>
                        <p className="text-xs text-gray-500">{product.clicks} clicks</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">£{product.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{product.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <LoadingSpinner />
            )}
          </CardContent>
        </Card>

        {/* Automation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Automation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Content Generation</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Affiliate Monitoring</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Social Media</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Revenue Optimization</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  System running at <span className="font-semibold text-green-600">95% automation</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last optimization: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
