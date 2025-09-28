import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plug, Globe } from "lucide-react";
import SecretsTestDashboard from './SecretsTestDashboard';
import { AdminErrorBoundary, AdminErrorFallback } from './AdminErrorBoundary';

export function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState("integrations");

  return (
    <AdminErrorBoundary context="Settings Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your site settings and integrations.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              External Services
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-6">
            <AdminErrorBoundary context="External Services" fallback={
              <AdminErrorFallback context="External Services" />
            }>
              <SecretsTestDashboard />
            </AdminErrorBoundary>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <AdminErrorBoundary context="General Settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    General site settings panel is currently under development. 
                    Here you will be able to configure site-wide settings, SEO defaults, 
                    theme preferences, and other global configurations.
                  </p>
                </CardContent>
              </Card>
            </AdminErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </AdminErrorBoundary>
  );
}
