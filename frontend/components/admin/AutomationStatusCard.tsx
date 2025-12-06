import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Activity,
  Link,
  Calendar
} from 'lucide-react';

interface AutomationStatusData {
  activePipelineJobs: number;
  completedToday: number;
  failedJobs: number;
  upcomingScheduled: number;
  recentActivity: Array<{
    id: number;
    topic: string;
    status: string;
    createdAt: Date;
    scheduledAt?: Date;
  }>;
  linkHealthSummary: {
    totalLinks: number;
    workingLinks: number;
    brokenLinks: number;
    lastChecked: Date | null;
  };
}

interface AutomationStatusCardProps {
  data: AutomationStatusData;
}

export function AutomationStatusCard({ data }: AutomationStatusCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'generating':
      case 'reviewing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
      case 'published':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
      case 'generating':
      case 'reviewing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const linkHealthPercentage = data.linkHealthSummary.totalLinks > 0 
    ? (data.linkHealthSummary.workingLinks / data.linkHealthSummary.totalLinks) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Automation Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Active Jobs</span>
            <Badge variant="secondary">{data.activePipelineJobs}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Completed Today</span>
            <Badge variant="default">{data.completedToday}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Failed Jobs</span>
            <Badge variant={data.failedJobs > 0 ? "destructive" : "outline"}>
              {data.failedJobs}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Upcoming Scheduled</span>
            <Badge variant="outline">{data.upcomingScheduled}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Link Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Link Health</span>
          </CardTitle>
          <CardDescription>
            Last checked: {data.linkHealthSummary.lastChecked 
              ? new Date(data.linkHealthSummary.lastChecked).toLocaleDateString()
              : 'Never'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Working Links</span>
              <span>{data.linkHealthSummary.workingLinks}/{data.linkHealthSummary.totalLinks}</span>
            </div>
            <Progress value={linkHealthPercentage} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{data.linkHealthSummary.workingLinks}</p>
              <p className="text-muted-foreground">Working</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{data.linkHealthSummary.brokenLinks}</p>
              <p className="text-muted-foreground">Broken</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 text-sm">
                {getStatusIcon(activity.status)}
                <div className="flex-1 space-y-1">
                  <p className="font-medium line-clamp-1">{activity.topic}</p>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Badge variant={getStatusVariant(activity.status)} className="text-xs">
                      {activity.status}
                    </Badge>
                    {activity.scheduledAt && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(activity.scheduledAt).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Status Detail */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Content Pipeline Status</CardTitle>
          <CardDescription>Current status of all automation pipelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">{data.activePipelineJobs}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{data.completedToday}</p>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-2xl font-bold">{data.failedJobs}</p>
              <p className="text-sm text-muted-foreground">Failed This Week</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{data.upcomingScheduled}</p>
              <p className="text-sm text-muted-foreground">Scheduled (24h)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}