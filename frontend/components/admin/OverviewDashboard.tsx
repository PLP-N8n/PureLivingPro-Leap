import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const recentActivity = [
    { action: "Published new post", item: "10 Superfoods for Health", time: "2 hours ago" },
    { action: "Updated product", item: "Organic Multivitamin Complex", time: "5 hours ago" },
    { action: "Automation ran", item: "Daily Tips", time: "8 hours ago" },
    { action: "New comment on", item: "Beginner's Guide to Workouts", time: "1 day ago" },
  ];

  if (analyticsLoading || affiliateLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600">Welcome back! Here's a snapshot of your site's performance.</p>
      </div>

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
            <div className="text-2xl font-bold">${affiliateStats?.totalCommission.toFixed(2) || '0.00'}</div>
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
              <Newspaper className="h-4 w-4" /> New Post
            </Button>
            <Button className="w-full justify-start gap-2" variant="secondary">
              <ShoppingBag className="h-4 w-4" /> New Product
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Bot className="h-4 w-4" /> New Automation
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">"{activity.item}"</p>
                  </div>
                  <Badge variant="outline">{activity.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
