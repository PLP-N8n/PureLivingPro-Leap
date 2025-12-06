import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminErrorBoundary, AdminErrorFallback } from '../AdminErrorBoundary';

interface RevenueData {
  date: string;
  revenue: number;
  clicks: number;
  conversions: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  return (
    <AdminErrorBoundary context="Revenue Chart" fallback={
      <AdminErrorFallback context="Revenue Chart" />
    }>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            className="text-xs"
          />
          <YAxis 
            tickFormatter={formatCurrency}
            className="text-xs"
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'revenue' ? formatCurrency(value) : value,
              name === 'revenue' ? 'Revenue' : name === 'clicks' ? 'Clicks' : 'Conversions'
            ]}
            labelFormatter={(label) => formatDate(label)}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary))" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </AdminErrorBoundary>
  );
}