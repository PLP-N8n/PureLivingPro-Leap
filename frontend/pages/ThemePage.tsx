import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "../components/SEOHead";
import { useTheme } from "../providers/ThemeProvider";
import { Paintbrush } from "lucide-react";

export function ThemePage() {
  const { setTheme } = useTheme();

  return (
    <>
      <SEOHead title="Theme Switcher" description="Preview different themes for Pure Living Pro." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section>
          <h1 className="text-4xl font-bold font-display mb-4">Theme Switcher</h1>
          <p className="text-lg text-muted-foreground">
            Select a theme to preview changes across the application. Your choice will be saved.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5" />
              Select a Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => setTheme("teal")} className="bg-[#0EA5A6] hover:bg-[#0EA5A6]/90">
              Teal Core (Default)
            </Button>
            <Button onClick={() => setTheme("mint")} className="bg-[#6EE7B7] hover:bg-[#6EE7B7]/90 text-slate-900">
              Calm Mint
            </Button>
            <Button onClick={() => setTheme("sand")} className="bg-[#FAD7A0] hover:bg-[#FAD7A0]/90 text-slate-900">
              Warm Sand
            </Button>
          </CardContent>
        </Card>

        <section>
          <h2 className="text-2xl font-bold font-display mb-6">Component Preview</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Badge>Primary Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Cards with Accent</h3>
              <Card className="card-accent-border">
                <CardHeader>
                  <CardTitle>Card with Accent Border</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card has a left border that uses the primary theme color.</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <p>
                This is a sample paragraph with a <a href="#">themed link</a>. Notice the color and hover effect.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
