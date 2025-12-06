import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminErrorBoundary } from './AdminErrorBoundary';

// Component that throws an error when clicked
function ErrorThrowingComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Boundary Test Component</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Click the button below to trigger an error and test the error boundary:</p>
        <Button 
          onClick={() => setShouldThrow(true)}
          variant="destructive"
        >
          Trigger Error
        </Button>
      </CardContent>
    </Card>
  );
}

// Test component wrapped in error boundary
export function ErrorBoundaryTest() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Error Boundary Test</h2>
      <p className="text-gray-600">
        This component tests error boundaries in admin dashboard components.
      </p>
      
      <AdminErrorBoundary context="Error Boundary Test">
        <ErrorThrowingComponent />
      </AdminErrorBoundary>
    </div>
  );
}