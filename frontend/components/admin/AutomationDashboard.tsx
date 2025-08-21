import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  FileText, 
  Link, 
  Share2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";

export function AutomationDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ["automation", "schedules"],
    queryFn: () => backend.automation.getSchedules(),
  });

  const { data: weeklyReport } = useQuery({
    queryKey: ["automation", "weekly-report"],
    queryFn: () => backend.automation.generateWeeklyReport(),
  });

  const { data: revenueAnalysis } = useQuery({
    queryKey: ["automation", "revenue-analysis"],
    queryFn: () => backend.automation.analyzeRevenue(),
  });

  const { data: linkHealth } = useQuery({
    queryKey: ["automation", "link-health"],
    queryFn: () => backend.automation.getLinkHealthReport(),
  });

  const runTasksMutation = useMutation({
    mutationFn: () => backend.automation.runScheduledTasks(),
    onSuccess: (result) => {
      toast({ 
        title: "Tasks executed successfully", 
        description: `${result.executed} tasks completed, ${result.failed} failed` 
      });
      queryClient.invalidateQueries({ queryKey: ["automation"] });
    },
    onError: () => {
      toast({ title: "Failed to run tasks", variant: "destructive" });
    },
  });

  const checkLinksMutation = useMutation({
    mutationFn: () => backend.automation.checkAffiliateLinks(),
    onSuccess: (result) => {
      toast({ 
        title: "Link check completed", 
        description: `${result.workingLinks}/${result.totalLinks} links working` 
      });
      queryClient.invalidateQueries({ queryKey: ["automation"] });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: (data: { topic: string; keywords: string[] }) => 
      backend.automation.generateContent({
        topic: data.topic,
        targetKeywords: data.keywords,
        includeAffiliateProducts: true
      }),
    onSuccess: () => {
      toast({ title: "Content generated successfully" });
      queryClient.invalidateQueries({ queryKey: ["automation"] });
    },
  });

  const schedules = schedulesData?.schedules || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Automation Dashboard</h1>
        <p className="text-gray-600">Manage your autonomous revenue generation system.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => runTasksMutation.mutate()}
          disabled={runTasksMutation.isPending}
          className="h-20 flex flex-col gap-2"
        >
          <Play className="h-5 w-5" />
          Run All Tasks
        </Button>
        
        <Button 
          onClick={() => checkLinksMutation.mutate()}
          disabled={checkLinksMutation.isPending}
          variant="outline"
          className="h-20 flex flex-col gap-2"
        >
          <Link className="h-5 w-5" />
          Check Links
        </Button>
        
        <Button 
          onClick={() => generateContentMutation.mutate({
            topic: "wellness tips",
            keywords: ["wellness", "health", "lifestyle"]
          })}
          disabled={generateContentMutation.isPending}
          variant="outline"
          className="h-20 flex flex-col gap-2"
        >
          <FileText className="h-5 w-5" />
          Generate Content
        </Button>
        
        <Button 
          variant="outline"
          className="h-20 flex flex-col gap-2"
        >
          <Share2 className="h-5 w-5" />
          Publish Social
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  £{weeklyReport?.revenue.total.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {weeklyReport?.revenue.percentageOfTarget.toFixed(1)}% of target
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projected Monthly</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  £{weeklyReport?.revenue.projectedMonthly.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: £2,000
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automation Status</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  {schedules.filter(s => s.isActive).length || 0} tasks running
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {weeklyReport?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weeklyReport.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <h4 className="font-medium">{schedule.name}</h4>
                          <p className="text-sm text-gray-500">{schedule.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Next: {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'Not scheduled'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueAnalysis?.topPerformingProducts.slice(0, 5).map((product) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{product.productName}</h4>
                        <p className="text-xs text-gray-500">
                          {product.clicks} clicks • {product.conversions} conversions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">£{product.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{product.conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optimization Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {revenueAnalysis?.optimizationActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Content topic..." />
                  <Input placeholder="Target keywords (comma separated)" />
                </div>
                <Button 
                  onClick={() => generateContentMutation.mutate({
                    topic: "wellness tips",
                    keywords: ["wellness", "health"]
                  })}
                  disabled={generateContentMutation.isPending}
                  className="w-full"
                >
                  {generateContentMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Link Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Affiliate Link Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                {linkHealth ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {linkHealth.summary.workingLinks}
                        </div>
                        <p className="text-sm text-gray-500">Working</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {linkHealth.summary.brokenLinks}
                        </div>
                        <p className="text-sm text-gray-500">Broken</p>
                      </div>
                    </div>
                    
                    {linkHealth.brokenLinks.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Broken Links</h4>
                        <div className="space-y-2">
                          {linkHealth.brokenLinks.slice(0, 3).map((link) => (
                            <div key={link.id} className="p-2 bg-red-50 rounded text-sm">
                              <p className="font-medium">{link.shortCode}</p>
                              <p className="text-red-600">{link.lastError}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <LoadingSpinner />
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Generation</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Link Monitoring</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Social Media</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue Tracking</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
