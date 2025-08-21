import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  Zap
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

  const optimizeMutation = useMutation({
    mutationFn: (actions: string[]) => 
      backend.automation.implementOptimizations({ actions }),
    onSuccess: (result) => {
      toast({ 
        title: "Optimizations applied", 
        description: `${result.implemented} actions implemented successfully` 
      });
      queryClient.invalidateQueries({ queryKey: ["automation"] });
    },
    onError: () => {
      toast({ title: "Failed to apply optimizations", variant: "destructive" });
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Optimizer</h2>
        <p className="text-gray-600">AI-powered revenue analysis and optimization recommendations.</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{revenueAnalysis.currentMonthRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month so far
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Monthly</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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

        <Card>
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

      {/* Top Performing Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-600" />
            Top Performing Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueAnalysis.topPerformingProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{product.productName}</h4>
                    <p className="text-sm text-gray-500">
                      {product.clicks} clicks • {product.conversions} conversions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">£{product.revenue.toFixed(2)}</p>
                  <Badge variant="outline">
                    {product.conversionRate.toFixed(1)}% CR
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Underperforming Products */}
      {revenueAnalysis.underperformingProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Underperforming Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueAnalysis.underperformingProducts.map((product) => (
                <div key={product.productId} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{product.productName}</h4>
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                      Low CR
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {product.clicks} clicks • {product.conversions} conversions
                  </p>
                  <div className="space-y-1">
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

      {/* Optimization Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            AI Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-6">
            {revenueAnalysis.optimizationActions.map((action, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{action}</p>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => optimizeMutation.mutate(revenueAnalysis.optimizationActions)}
            disabled={optimizeMutation.isPending}
            className="w-full"
          >
            {optimizeMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Implementing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Implement All Optimizations
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
