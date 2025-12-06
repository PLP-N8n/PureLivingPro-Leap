import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Admin Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Component Error
              {this.props.context && ` - ${this.props.context}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200">
              <Bug className="h-4 w-4" />
              <AlertDescription>
                Something went wrong while loading this section. The error has been logged and you can try reloading.
              </AlertDescription>
            </Alert>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-red-100 p-3 rounded border text-sm">
                <summary className="font-medium cursor-pointer">Error Details (Development)</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleRetry} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/admin'}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export function AdminErrorFallback({ 
  error, 
  onRetry, 
  context 
}: { 
  error?: Error; 
  onRetry?: () => void; 
  context?: string; 
}) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          Service Unavailable
          {context && ` - ${context}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This service is temporarily unavailable. Some features may be limited until the service is restored.
          </AlertDescription>
        </Alert>

        {error && process.env.NODE_ENV === 'development' && (
          <details className="bg-yellow-100 p-3 rounded border text-sm">
            <summary className="font-medium cursor-pointer">Error Details (Development)</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        )}

        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}