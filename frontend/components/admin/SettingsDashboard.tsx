import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function SettingsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your site settings and integrations.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            The settings management panel is currently under development. 
            Here you will be able to configure site-wide settings, SEO defaults, 
            and connect to third-party integrations like Google Analytics, Stripe, and AI services.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
