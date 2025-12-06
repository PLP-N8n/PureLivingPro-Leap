import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  Sparkles,
  Brain,
  Rocket
} from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";

export function RevenueOptimizer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: revenueAnalysis, isLoading } = useQuery({
    queryKey: ["automation", "revenue-analysis"],
    queryFn: () => backend.automation.analyzeRevenue(),
  });

  const { data: performanceAnalysis } = useQuery({
    queryKey: ["automation", "performance-analysis"],
    queryFn: () => backend.automation.analyzePerformance(),
  });

  const { data: optimizationTargets } = useQuery({
    queryKey: ["automation", "optimization-targets"],
    queryFn: () => backend.automation.identifyOptimizationTargets(),
  });

  const optimizeMutation = useMutation({
    mutationFn: (actions: string[]) => 
      backend.automation.implementRevenueOptimizations({ actions }),
    onSuccess: (result) => {
      toast({ 
        title: "Revenue optimizations applied", 
        description: `${result.implemented} actions implemented successfully` 
      });
      queryClient.invalidateQueries({ queryKey: ["automation"] });
    },
    onError: () => {
      toast({ title: "Failed to apply optimizations", variant: "destructive" });
    },
  });

  const implementOptimizationsMutation = useMutation({
    mutationFn: (data: any) => backend.automation.implementOptimizations(data),
    onSuccess: (result) => {
      toast({ 
        title: "Advanced optimizations applied", 
        description: `${result.implemented} optimizations implemented successfully` 
      });
      queryClient.invalidateQueries({ queryKey: ["automation"] });
    },
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!revenueAnalysis) {
    return <div>No revenue data available</div>;
  }

  const monthlyTarget = 2000; // £2,000 target
  const progressPercentage = (revenueAnalysis.projectedMonthlyRevenue / monthlyTarget) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
          <Rocket className="h-7 w-7 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Revenue Optimizer</h2>
          <p className="text-gray-600">Intelligent revenue analysis and automated optimization strategies</p>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{revenueAnalysis.currentMonthRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month so far
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Monthly</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              £{revenueAnalysis.projectedMonthlyRevenue.toFixed(2)}
            </div>
            <div className="mt-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progressPercentage.toFixed(1)}% of £{monthlyTarget} target
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Potential</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
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
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {progressPercentage >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${progressPercentage >= 80 ? 'text-green-600' : 'text-red-600'}`}>
              {progressPercentage >= 80 ? 'On Track' : 'Below Target'}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue trajectory
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
          <TabsTrigger value="products">Product Analysis</TabsTrigger>
          <TabsTrigger value="strategies">Growth Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Top Performing Products */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {revenueAnalysis.topPerformingProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{product.productName}</h4>
                        <p className="text-sm text-gray-500">
                          {product.clicks} clicks • {product.conversions} conversions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-lg">£{product.revenue.toFixed(2)}</p>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        {product.conversionRate.toFixed(1)}% CR
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {performanceAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Content Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceAnalysis.contentOptimizations.slice(0, 5).map((content, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-sm mb-1">{content.title}</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span>Current: £{content.currentRevenue.toFixed(2)}</span>
                          <span className="font-medium text-blue-600">
                            Potential: +£{(content.potentialRevenue - content.currentRevenue).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Keyword Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceAnalysis.keywordOpportunities.slice(0, 5).map((keyword, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-sm mb-1">{keyword.keyword}</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span>Volume: {keyword.searchVolume}</span>
                          <span>Difficulty: {keyword.difficulty}</span>
                          <span className="font-medium text-purple-600">
                            £{keyword.potentialRevenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* AI Optimization Recommendations */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI-Powered Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 mb-6">
                {revenueAnalysis.optimizationActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => optimizeMutation.mutate(revenueAnalysis.optimizationActions)}
                  disabled={optimizeMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {optimizeMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Implementing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Implement Revenue Optimizations
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => {
                    if (optimizationTargets) {
                      implementOptimizationsMutation.mutate({
                        contentOptimizations: optimizationTargets.lowPerformingArticles.slice(0, 3).map(a => a.articleId),
                        affiliateOptimizations: optimizationTargets.affiliateOpportunities.slice(0, 2).map(a => a.articleId),
                        keywordTargets: optimizationTargets.keywordGaps.slice(0, 5).map(k => k.keyword)
                      });
                    }
                  }}
                  disabled={implementOptimizationsMutation.isPending}
                  variant="outline"
                  className="border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Advanced Optimization
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Targets */}
          {optimizationTargets && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Low-Performing Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizationTargets.lowPerformingArticles.slice(0, 4).map((article) => (
                      <div key={article.articleId} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span>Current: £{article.currentRevenue.toFixed(2)}</span>
                          <Badge variant="outline" className={`text-xs ${
                            article.optimizationPriority === 'high' ? 'border-red-300 text-red-700 bg-red-50' :
                            article.optimizationPriority === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                            'border-green-300 text-green-700 bg-green-50'
                          }`}>
                            {article.optimizationPriority} priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                    SEO Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizationTargets.keywordGaps.slice(0, 4).map((keyword, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-sm mb-1">{keyword.keyword}</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span>Current: #{keyword.currentRank}</span>
                          <span>Target: #{keyword.targetRank}</span>
                          <span className="text-blue-600 font-medium">Diff: {keyword.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingBag className="h-5 w-5 text-green-600" />
                    Affiliate Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizationTargets.affiliateOpportunities.slice(0, 4).map((opportunity) => (
                      <div key={opportunity.articleId} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-sm mb-1">{opportunity.title}</h4>
                        <div className="flex items-center justify-between text-xs">
                          <span>{opportunity.missingProducts} missing products</span>
                          <span className="font-medium text-green-600">+£{opportunity.potentialRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Underperforming Products */}
          {revenueAnalysis.underperformingProducts.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Underperforming Products
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {revenueAnalysis.underperformingProducts.map((product) => (
                    <div key={product.productId} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{product.productName}</h4>
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-100">
                          Low CR: {((product.conversions / product.clicks) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {product.clicks} clicks • {product.conversions} conversions
                      </p>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-yellow-800">Optimization Suggestions:</h5>
                        {product.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-yellow-800">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-purple-600" />
                Growth Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Content Strategy</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">High-Volume Keywords</h4>
                      <p className="text-sm text-blue-700">Target keywords with 5K+ monthly searches and medium difficulty</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Long-Form Content</h4>
                      <p className="text-sm text-green-700">Create comprehensive guides (2000+ words) for better rankings</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">Video Integration</h4>
                      <p className="text-sm text-purple-700">Add video content to increase engagement and dwell time</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Revenue Strategy</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">Premium Products</h4>
                      <p className="text-sm text-orange-700">Focus on higher-commission products ($50+ price point)</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h4 className="font-medium text-indigo-800 mb-2">Email Capture</h4>
                      <p className="text-sm text-indigo-700">Implement lead magnets to build email list for remarketing</p>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <h4 className="font-medium text-pink-800 mb-2">Social Proof</h4>
                      <p className="text-sm text-pink-700">Add testimonials and reviews to increase conversion rates</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">Projected Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+40%</div>
                    <div className="text-sm text-gray-600">Revenue Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">+60%</div>
                    <div className="text-sm text-gray-600">Organic Traffic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">+25%</div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
