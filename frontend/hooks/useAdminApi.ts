import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

interface ApiError extends Error {
  code?: string;
  status?: number;
}

interface ApiState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: ApiError | null;
  isError: boolean;
  refetch: () => Promise<any>;
}

interface SafeApiOptions<T> {
  fallbackData?: T;
  showErrorToast?: boolean;
  errorContext?: string;
  retryAttempts?: number;
  staleTime?: number;
}

export function useSafeQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: SafeApiOptions<T> = {}
): ApiState<T> {
  const { toast } = useToast();
  const {
    fallbackData,
    showErrorToast = false,
    errorContext,
    retryAttempts = 1,
    staleTime = 30000
  } = options;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error: any) {
        console.error(`API Error [${queryKey.join('.')}]:`, error);
        
        if (showErrorToast) {
          toast({
            title: `Failed to load ${errorContext || queryKey[1] || 'data'}`,
            description: error.message || 'Service temporarily unavailable',
            variant: 'destructive',
          });
        }
        
        if (fallbackData) {
          return fallbackData;
        }
        
        throw error;
      }
    },
    retry: retryAttempts,
    staleTime,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as ApiError | null,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useSafeMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options: {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: ApiError, variables: V) => void;
    successMessage?: string;
    errorMessage?: string;
    invalidateQueries?: string[][];
  } = {}
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (options.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }
      
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options.onSuccess?.(data, variables);
    },
    onError: (error: any, variables) => {
      console.error('Mutation error:', error);
      
      const errorMessage = options.errorMessage || error.message || 'Operation failed';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      options.onError?.(error, variables);
    },
  });
}

// Specific hooks for admin dashboard APIs
export function useAnalyticsSummary() {
  return useSafeQuery(
    ['admin', 'analytics-summary'],
    () => backend.analytics.getAnalyticsSummary(),
    {
      errorContext: 'analytics data'
    }
  );
}

export function useAffiliateStats() {
  return useSafeQuery(
    ['admin', 'affiliate-stats'],
    () => backend.affiliate.getAffiliateStats(),
    {
      errorContext: 'affiliate statistics'
    }
  );
}

export function useUnifiedDashboard() {
  return useSafeQuery(
    ['admin', 'unified-dashboard'],
    () => backend.analytics.getUnifiedDashboard(),
    {
      errorContext: 'dashboard data',
      showErrorToast: true,
      staleTime: 60000
    }
  );
}

export function useContentList(params: { limit?: number } = {}) {
  return useSafeQuery(
    ['admin', 'content-list', JSON.stringify(params)],
    () => backend.content.listArticles(params),
    {
      errorContext: 'content list'
    }
  );
}

export function useAutomationSchedules() {
  return useSafeQuery(
    ['admin', 'automation-schedules'],
    () => backend.automation.getSchedules(),
    {
      errorContext: 'automation schedules'
    }
  );
}

export function useWeeklyReport() {
  return useSafeQuery(
    ['admin', 'weekly-report'],
    () => backend.automation.generateWeeklyReport(),
    {
      errorContext: 'weekly report',
      retryAttempts: 2
    }
  );
}

export function useRevenueAnalysis() {
  return useSafeQuery(
    ['admin', 'revenue-analysis'],
    () => backend.automation.analyzeRevenue(),
    {
      errorContext: 'revenue analysis',
      retryAttempts: 2
    }
  );
}

export function usePerformanceAnalysis() {
  return useSafeQuery(
    ['admin', 'performance-analysis'],
    () => backend.automation.analyzePerformance(),
    {
      errorContext: 'performance analysis'
    }
  );
}

export function useOptimizationTargets() {
  return useSafeQuery(
    ['admin', 'optimization-targets'],
    () => backend.automation.identifyOptimizationTargets(),
    {
      errorContext: 'optimization targets'
    }
  );
}

export function useContentSchedule() {
  return useSafeQuery(
    ['admin', 'content-schedule'],
    () => backend.automation.getContentSchedule(),
    {
      errorContext: 'content schedule'
    }
  );
}

export function useSEOReport() {
  return useSafeQuery(
    ['admin', 'seo-report'],
    () => backend.automation.generateSEOReport(),
    {
      errorContext: 'SEO report'
    }
  );
}

// Mutation hooks
export function useRunScheduledTasks() {
  return useSafeMutation(
    () => backend.automation.runScheduledTasks(),
    {
      successMessage: 'Scheduled tasks executed successfully',
      errorMessage: 'Failed to execute scheduled tasks',
      invalidateQueries: [['admin', 'automation-schedules']]
    }
  );
}

export function useIngestFromSheets() {
  return useSafeMutation(
    (data: { spreadsheetId: string }) => backend.automation.ingestFromSheets(data),
    {
      successMessage: 'Data ingested from sheets successfully',
      errorMessage: 'Failed to ingest data from sheets',
      invalidateQueries: [['admin', 'content-schedule']]
    }
  );
}

export function useBulkOptimizeContent() {
  return useSafeMutation(
    (data: { articleIds: string[]; optimizationType: string }) => 
      backend.automation.bulkOptimizeContent(data),
    {
      successMessage: 'Content optimization completed',
      errorMessage: 'Failed to optimize content',
      invalidateQueries: [
        ['admin', 'optimization-targets'],
        ['admin', 'performance-analysis']
      ]
    }
  );
}

export function useAffiliateProducts(params: { limit?: number } = {}) {
  return useSafeQuery(
    ['admin', 'affiliate-products', JSON.stringify(params)],
    () => backend.affiliate.listAffiliateProducts(params),
    {
      errorContext: 'affiliate products'
    }
  );
}

export function useDeleteProduct() {
  return useSafeMutation(
    (id: number) => backend.affiliate.deleteProduct({ id }),
    {
      successMessage: 'Product deleted successfully',
      errorMessage: 'Failed to delete product',
      invalidateQueries: [['admin', 'affiliate-products']]
    }
  );
}

export function useActionableInsights() {
  return useSafeQuery(
    ['admin', 'actionable-insights'],
    () => backend.analytics.getActionableInsights(),
    {
      errorContext: 'actionable insights',
      staleTime: 60000
    }
  );
}

export function useRealTimeMetrics() {
  return useSafeQuery(
    ['admin', 'real-time-metrics'],
    () => backend.analytics.getRealTimeMetrics(),
    {
      errorContext: 'real-time metrics',
      staleTime: 10000
    }
  );
}

export function usePerformanceTrends(params: { days?: number } = {}) {
  return useSafeQuery(
    ['admin', 'performance-trends', JSON.stringify(params)],
    () => backend.analytics.getPerformanceTrends(params),
    {
      errorContext: 'performance trends',
      staleTime: 300000
    }
  );
}