import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Info, 
  ArrowRight,
  DollarSign,
  FileText,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import type { ActionableInsightsResponse, InsightItem } from '~backend/analytics/get_actionable_insights';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';

const typeIcons = {
  warning: AlertCircle,
  success: CheckCircle,
  info: Info,
  action: Zap,
};

const typeColors = {
  warning: 'text-orange-500',
  success: 'text-green-500',
  info: 'text-blue-500',
  action: 'text-purple-500',
};

const categoryIcons = {
  revenue: DollarSign,
  content: FileText,
  traffic: Activity,
  automation: Zap,
  performance: BarChart3,
};

export function InsightsPanel() {
  const { data, isLoading, refetch } = useQuery<ActionableInsightsResponse>({
    queryKey: ['actionable-insights'],
    queryFn: async () => backend.analytics.getActionableInsights(),
    refetchInterval: 60000,
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Activity className="h-6 w-6 animate-spin mr-2" />
            <span>Analyzing performance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Scorecard</CardTitle>
              <CardDescription>Overall health metrics across all services</CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(data.performanceScore.overall)}`}>
                {Math.round(data.performanceScore.overall)}
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreLabel(data.performanceScore.overall)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue</span>
                <span className={`text-sm font-bold ${getScoreColor(data.performanceScore.revenue)}`}>
                  {Math.round(data.performanceScore.revenue)}
                </span>
              </div>
              <Progress value={data.performanceScore.revenue} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content</span>
                <span className={`text-sm font-bold ${getScoreColor(data.performanceScore.content)}`}>
                  {Math.round(data.performanceScore.content)}
                </span>
              </div>
              <Progress value={data.performanceScore.content} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Traffic</span>
                <span className={`text-sm font-bold ${getScoreColor(data.performanceScore.traffic)}`}>
                  {Math.round(data.performanceScore.traffic)}
                </span>
              </div>
              <Progress value={data.performanceScore.traffic} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Automation</span>
                <span className={`text-sm font-bold ${getScoreColor(data.performanceScore.automation)}`}>
                  {Math.round(data.performanceScore.automation)}
                </span>
              </div>
              <Progress value={data.performanceScore.automation} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Actionable Insights</CardTitle>
              <CardDescription>
                {data.summary.totalInsights} insights • {data.summary.highPriority} high priority • {data.summary.actionableItems} require action
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="text-lg font-medium">All systems performing well!</p>
              <p className="text-sm">No critical issues detected at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.insights.map((insight) => {
                const TypeIcon = typeIcons[insight.type];
                const CategoryIcon = categoryIcons[insight.category];
                
                return (
                  <div
                    key={insight.id}
                    className={`p-4 border rounded-lg ${
                      insight.priority === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className={`h-5 w-5 ${typeColors[insight.type]}`} />
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge 
                              variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {insight.priority}
                            </Badge>
                            {insight.actionable && (
                              <Badge variant="outline" className="text-xs">
                                Actionable
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          
                          {insight.metric && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-mono font-bold">{insight.metric}</span>
                              {insight.change !== undefined && (
                                <span className={`text-xs flex items-center ${
                                  insight.change > 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  <TrendingUp className={`h-3 w-3 mr-1 ${
                                    insight.change < 0 ? 'rotate-180' : ''
                                  }`} />
                                  {Math.abs(insight.change).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          )}
                          
                          {insight.suggestedAction && (
                            <div className="flex items-start space-x-2 mt-2 p-2 bg-background/50 rounded border">
                              <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{insight.suggestedAction}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs ml-2">
                        {insight.category}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}