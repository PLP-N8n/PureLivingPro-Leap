import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export function AutomationDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Automation</h1>
        <p className="text-gray-600">Schedule tasks and automate your workflows.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            The automation and scheduler dashboard is currently under development. 
            Soon, you'll be able to automate content posting, affiliate link checks, 
            and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
