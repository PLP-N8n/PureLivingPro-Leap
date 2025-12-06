import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AdminErrorBoundary, AdminErrorFallback } from '../AdminErrorBoundary';

interface TrafficData {
  date: string;
  views: number;
  uniqueVisitors: number;
}

interface TrafficChartProps {
  data: TrafficData[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  const formatNumber = (value: number) => 
    new Intl.NumberFormat('en-US').format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No traffic data available
      </div>
    );
  }

  return (
    <AdminErrorBoundary context="Traffic Chart" fallback={
      <AdminErrorFallback context="Traffic Chart" />
    }>
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          className="text-xs"
        />
        <YAxis 
          tickFormatter={formatNumber}
          className="text-xs"
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            formatNumber(value),
            name === 'views' ? 'Page Views' : 'Unique Visitors'
          ]}
          labelFormatter={(label) => formatDate(label)}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="views" 
          fill="hsl(var(--primary))" 
          fillOpacity={0.3}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Page Views"
        />
        <Line 
          type="monotone" 
          dataKey="uniqueVisitors" 
          stroke="hsl(var(--chart-2))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
          name="Unique Visitors"
        />
      </ComposedChart>
    </ResponsiveContainer>
    </AdminErrorBoundary>
  );
}