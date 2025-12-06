import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import backend from '~backend/client';
import type { SecretsTestResponse, SecretTestResult } from '~backend/automation/test_secrets';

export default function SecretsTestDashboard() {
  const [testResults, setTestResults] = useState<SecretsTestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await backend.automation.testSecrets();
      setTestResults(results);
      setLastRefresh(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run secrets tests');
      console.error('Secrets test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: SecretTestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'not_configured':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: SecretTestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'not_configured':
        return <Badge variant="secondary" className="text-yellow-700 border-yellow-200 bg-yellow-50">Not Configured</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOverallStatusColor = (status: SecretsTestResponse['overall_status']) => {
    switch (status) {
      case 'all_good':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'some_issues':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'major_issues':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getOverallStatusText = (status: SecretsTestResponse['overall_status']) => {
    switch (status) {
      case 'all_good':
        return 'All Services Connected';
      case 'some_issues':
        return 'Some Issues Detected';
      case 'major_issues':
        return 'Major Issues Detected';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">External Services</h2>
          <p className="text-muted-foreground">
            Monitor and test connections to all external services and APIs
          </p>
        </div>
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Testing...' : 'Test All Services'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {testResults && (
        <>
          {/* Overall Status Card */}
          <Card className={`border-2 ${getOverallStatusColor(testResults.overall_status)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {getOverallStatusText(testResults.overall_status)}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Last tested: {lastRefresh}
                </div>
              </div>
              <CardDescription>
                {testResults.results.filter(r => r.status === 'success').length} of {testResults.results.length} services connected successfully
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Service Status Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testResults.results.map((result) => (
              <Card key={result.service} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {result.service}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {result.message}
                  </p>
                  {result.details && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Service Configuration Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Service Configuration Guide</CardTitle>
              <CardDescription>
                Instructions for configuring each external service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">OpenAI</h4>
                  <p className="text-sm text-muted-foreground">
                    Required secret: <code className="bg-muted px-1 rounded">OpenAIKey</code> - 
                    Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm">Google Sheets</h4>
                  <p className="text-sm text-muted-foreground">
                    Required secrets: <code className="bg-muted px-1 rounded">GoogleSheetsId</code>, <code className="bg-muted px-1 rounded">GoogleClientEmail</code>, <code className="bg-muted px-1 rounded">GooglePrivateKey</code> - 
                    Create a service account in <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm">Amazon Associates</h4>
                  <p className="text-sm text-muted-foreground">
                    Required secrets: <code className="bg-muted px-1 rounded">AmazonAccessKey</code>, <code className="bg-muted px-1 rounded">AmazonSecretKey</code>, <code className="bg-muted px-1 rounded">AmazonStoreId</code> - 
                    Get credentials from <a href="https://webservices.amazon.com/paapi5/documentation/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Amazon Product Advertising API</a>
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm">WordPress</h4>
                  <p className="text-sm text-muted-foreground">
                    Required secrets: <code className="bg-muted px-1 rounded">WordPressUrl</code>, <code className="bg-muted px-1 rounded">WordPressUsername</code>, <code className="bg-muted px-1 rounded">WordPressPassword</code> - 
                    Use application password from WordPress admin
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm">Medium</h4>
                  <p className="text-sm text-muted-foreground">
                    Required secret: <code className="bg-muted px-1 rounded">MediumToken</code> - 
                    Get your integration token from <a href="https://medium.com/me/settings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Medium Settings</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test History */}
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Last Test:</span>
                  <p className="text-muted-foreground">{new Date(testResults.tested_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Overall Status:</span>
                  <p className="text-muted-foreground">{getOverallStatusText(testResults.overall_status)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isLoading && !testResults && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Testing external service connections...</span>
          </div>
        </div>
      )}
    </div>
  );
}