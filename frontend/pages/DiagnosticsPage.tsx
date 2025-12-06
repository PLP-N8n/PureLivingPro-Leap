import { useState, useEffect } from "react";
import { SEOHead } from "../components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "../providers/ThemeProvider";
import { useMotion } from "../providers/MotionProvider";
import { Monitor, Palette, Wind, Smartphone } from "lucide-react";

export function DiagnosticsPage() {
  const { theme } = useTheme();
  const { isReducedMotion } = useMotion();
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [userAgent, setUserAgent] = useState("");

  useEffect(() => {
    const updateViewport = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    setUserAgent(navigator.userAgent);
    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return (
    <>
      <SEOHead title="Diagnostics" description="View environment flags and diagnostic information for Pure Living Pro." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display mb-4">Diagnostics Panel</h1>
          <p className="text-lg text-muted-foreground">
            Information about your current browser environment and settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Current Theme:</strong> <span className="capitalize font-mono p-1 bg-secondary rounded">{theme}</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5" />
                Motion Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Prefers Reduced Motion:</strong> <span className={`font-mono p-1 rounded ${isReducedMotion ? 'bg-destructive/20 text-destructive-foreground' : 'bg-success/20 text-green-800'}`}>{isReducedMotion ? 'Enabled' : 'Disabled'}</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Viewport Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Width:</strong> <span className="font-mono">{viewportSize.width}px</span></p>
              <p><strong>Height:</strong> <span className="font-mono">{viewportSize.height}px</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Browser Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>User Agent:</strong></p>
              <p className="text-sm text-muted-foreground break-all">{userAgent}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
