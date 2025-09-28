import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  metric: string;
  description: string;
  trend?: number;
  icon: ReactNode;
}

export function MetricCard({ title, metric, description, trend, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend !== undefined && (
            <>
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(trend).toFixed(1)}% 
            </>
          )}
          <span className="ml-1">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}