import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import type { PerformanceTrends } from '~backend/analytics/get_performance_trends';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';

export function PerformanceTrendsChart() {
  const [timeRange, setTimeRange] = useState('30');
  
  const { data, isLoading } = useQuery<PerformanceTrends>({
    queryKey: ['performance-trends', timeRange],
    queryFn: async () => backend.analytics.getPerformanceTrends({ days: parseInt(timeRange) }),
    refetchInterval: 300000,
  });

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatNumber = (value: number) => 
    new Intl.NumberFormat('en-US').format(Math.round(value));

  if (isLoading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-muted-foreground">Loading trends...</div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Historical data and forecasts</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm bg-background"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenue.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.2}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {data.revenue.forecast.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">7-Day Forecast</h4>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.revenue.forecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8b5cf6" 
                        strokeDasharray="5 5"
                        dot={false}
                        name="Forecasted Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="traffic" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.traffic.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatNumber(value)}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.2}
                    name="Page Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Top Pages Performance</h4>
              <div className="space-y-3">
                {data.traffic.topPages.slice(0, 5).map((page, index) => {
                  const totalViews = page.trend.reduce((sum, p) => sum + p.value, 0);
                  return (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium truncate flex-1">{page.path}</p>
                        <div className="flex items-center space-x-2 ml-2">
                          <Badge variant="secondary">{formatNumber(totalViews)} views</Badge>
                          <div className={`flex items-center ${
                            page.growth >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {page.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="text-xs ml-1">{Math.abs(page.growth).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={page.trend}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conversions" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.conversions.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatNumber(value)}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Bar dataKey="value" fill="#10b981" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Top Converting Products</h4>
              <div className="space-y-3">
                {data.conversions.byProduct.slice(0, 5).map((product, index) => {
                  const totalConversions = product.trend.reduce((sum, p) => sum + p.value, 0);
                  return (
                    <div key={product.productId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium truncate flex-1">{product.productName}</p>
                        <div className="flex items-center space-x-2 ml-2">
                          <Badge variant="secondary">{formatNumber(totalConversions)} conversions</Badge>
                          <Badge variant="outline">{product.conversionRate.toFixed(1)}% rate</Badge>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={product.trend}>
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#10b981" 
                              fill="#10b981" 
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.content.publishingRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value} articles`}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Bar dataKey="value" fill="#f59e0b" name="Articles Published" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Category Performance</h4>
              <div className="space-y-2">
                {data.content.categoryTrends
                  .sort((a, b) => b.growth - a.growth)
                  .slice(0, 5)
                  .map((category, index) => {
                    const totalArticles = category.trend.reduce((sum, p) => sum + p.value, 0);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {formatNumber(totalArticles)} articles
                          </span>
                          <div className={`flex items-center ${
                            category.growth >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {category.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="text-xs ml-1">{Math.abs(category.growth).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}