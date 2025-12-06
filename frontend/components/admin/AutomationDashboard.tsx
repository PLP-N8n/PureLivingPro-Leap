import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Play, 
  Settings, 
  TrendingUp, 
  FileText, 
  Link, 
  Share2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Search,
  BarChart3,
  Sparkles,
  Clock,
  DollarSign,
  Upload
} from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";
import { RevenueOptimizer } from "./RevenueOptimizer";
import { AdminErrorBoundary, AdminErrorFallback } from "./AdminErrorBoundary";
import {
  useAutomationSchedules,
  useContentSchedule,
  usePerformanceAnalysis,
  useOptimizationTargets,
  useSEOReport,
  useWeeklyReport,
  useRunScheduledTasks,
  useIngestFromSheets,
  useBulkOptimizeContent
} from "../../hooks/useAdminApi";

export function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOptimizationType, setSelectedOptimizationType] = useState("seo");

  const { data: schedulesData, isLoading: schedulesLoading } = useAutomationSchedules();
  const { data: contentSchedule } = useContentSchedule();
  const { data: performanceAnalysis } = usePerformanceAnalysis();
  const { data: optimizationTargets } = useOptimizationTargets();
  const { data: seoReport } = useSEOReport();
  const { data: weeklyReport } = useWeeklyReport();

  const runTasksMutation = useRunScheduledTasks();
  const ingestMutation = useIngestFromSheets();
  const bulkOptimizeMutation = useBulkOptimizeContent();

  const schedules = schedulesData?.schedules || [];

  return (
    <AdminErrorBoundary context="Automation Dashboard">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Bot className="h-7 w-7 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Automation Hub</h1>
            <p className="text-gray-600">Autonomous content generation, optimization, and revenue maximization</p>
          </div>
        </div>

        {/* Quick Actions */}
        <AdminErrorBoundary context="Quick Actions" fallback={
          <AdminErrorFallback context="Quick Actions" />
        }>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Button 
              onClick={() => ingestMutation.mutate({ spreadsheetId: "" })}
              disabled={ingestMutation.isPending}
              className="h-20 flex flex-col gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Upload className="h-5 w-5" />
              Ingest from Sheets
            </Button>
        
        <Button 
          onClick={() => runTasksMutation.mutate(undefined)}
          disabled={runTasksMutation.isPending}
          variant="outline"
          className="h-20 flex flex-col gap-2 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50"
        >
          <Play className="h-5 w-5" />
          Run Pipeline
        </Button>
        
        <Button 
          onClick={() => {
            if (optimizationTargets?.lowPerformingArticles) {
              bulkOptimizeMutation.mutate({
                articleIds: optimizationTargets.lowPerformingArticles.slice(0, 5).map(a => String(a.articleId)),
                optimizationType: selectedOptimizationType
              });
            }
          }}
          disabled={bulkOptimizeMutation.isPending}
          variant="outline"
          className="h-20 flex flex-col gap-2 border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50"
        >
          <Zap className="h-5 w-5" />
          Optimize Content
        </Button>
        
        <Button 
          variant="outline"
          className="h-20 flex flex-col gap-2 border-2 border-orange-200 hover:border-orange-500 hover:bg-orange-50"
        >
          <Share2 className="h-5 w-5" />
          Publish Social
        </Button>

        <Button 
          variant="outline"
          className="h-20 flex flex-col gap-2 border-2 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50"
        >
          <Search className="h-5 w-5" />
          SEO Analysis
            </Button>
          </div>
        </AdminErrorBoundary>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Pipeline</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="seo">SEO Tracking</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  £{weeklyReport?.revenue.total.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {weeklyReport?.revenue.percentageOfTarget.toFixed(1)}% of target
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content in Pipeline</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {contentSchedule?.totalScheduled || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Next: {contentSchedule?.nextPublishDate ? new Date(contentSchedule.nextPublishDate).toLocaleDateString() : 'None'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Optimization Potential</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  £{performanceAnalysis?.totalPotentialIncrease.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly potential increase
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SEO Keywords</CardTitle>
                <Search className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {seoReport?.totalKeywords || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg rank: {seoReport?.averageRank.toFixed(1) || 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          {weeklyReport?.recommendations && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {weeklyReport.recommendations.slice(0, 5).map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Content Pipeline</h2>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <FileText className="h-4 w-4 mr-2" />
              Schedule New Content
            </Button>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Publish Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {contentSchedule?.scheduledContent ? (
                <div className="space-y-4">
                  {contentSchedule.scheduledContent.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{content.generatedTitle || content.topic}</h4>
                          <p className="text-sm text-gray-500">
                            Scheduled: {new Date(content.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={content.status === 'scheduled' ? 'default' : 'secondary'}>
                          {content.status}
                        </Badge>
                        <span className="text-sm font-medium text-green-600">
                          £{content.estimatedRevenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <LoadingSpinner />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">AI Content Optimization</h2>
            <div className="flex items-center gap-3">
              <Select value={selectedOptimizationType} onValueChange={setSelectedOptimizationType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seo">SEO Optimization</SelectItem>
                  <SelectItem value="affiliate">Affiliate Revenue</SelectItem>
                  <SelectItem value="engagement">User Engagement</SelectItem>
                  <SelectItem value="conversion">Conversion Rate</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => {
                  if (optimizationTargets?.lowPerformingArticles) {
                    bulkOptimizeMutation.mutate({
                      articleIds: optimizationTargets.lowPerformingArticles.slice(0, 5).map(a => a.articleId),
                      optimizationType: selectedOptimizationType
                    });
                  }
                }}
                disabled={bulkOptimizeMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Optimize Selected
              </Button>
            </div>
          </div>

          {/* Optimization Targets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Low-Performing Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {optimizationTargets?.lowPerformingArticles ? (
                  <div className="space-y-3">
                    {optimizationTargets.lowPerformingArticles.slice(0, 5).map((article) => (
                      <div key={article.articleId} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Current: £{article.currentRevenue.toFixed(2)}</span>
                          <span>Potential: £{article.potentialRevenue.toFixed(2)}</span>
                          <Badge variant="outline" className={`text-xs ${
                            article.optimizationPriority === 'high' ? 'border-red-300 text-red-700' :
                            article.optimizationPriority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-green-300 text-green-700'
                          }`}>
                            {article.optimizationPriority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <LoadingSpinner />
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Affiliate Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {optimizationTargets?.affiliateOpportunities ? (
                  <div className="space-y-3">
                    {optimizationTargets.affiliateOpportunities.slice(0, 5).map((opportunity) => (
                      <div key={opportunity.articleId} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-sm mb-1">{opportunity.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{opportunity.missingProducts} missing products</span>
                          <span className="font-medium text-blue-600">+£{opportunity.potentialRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <LoadingSpinner />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueOptimizer />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">SEO Performance Tracking</h2>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Update Rankings
            </Button>
          </div>

          {seoReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{seoReport.totalKeywords}</div>
                    <div className="text-sm text-gray-600">Total Keywords</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{seoReport.averageRank.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Average Rank</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-lime-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">+{seoReport.rankImprovements}</div>
                    <div className="text-sm text-gray-600">Improvements</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">-{seoReport.rankDeclines}</div>
                    <div className="text-sm text-gray-600">Declines</div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <h2 className="text-2xl font-bold">Automation Schedules</h2>
          
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Active Schedules</CardTitle>
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
      </Tabs>
      </div>
    </AdminErrorBoundary>
  );
}
