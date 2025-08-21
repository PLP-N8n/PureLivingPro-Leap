import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { SEOHead } from "../components/SEOHead";
import {
  Zap,
  Shield,
  Leaf,
  Heart,
  Dumbbell,
  Brain,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Award,
  TrendingUp,
  Target,
  BookOpen,
  ShoppingBag,
  Bookmark,
  Calendar,
  Eye,
  User,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { MotionWrapper } from "../components/design-system/MotionWrapper";
import { motion } from "framer-motion";
import { useMotion } from "../providers/MotionProvider";
import { motionContract } from "../lib/motion";

const ColorSwatch = ({ name, className }: { name: string; className: string }) => (
  <div className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg ${className}`}></div>
    <div>
      <div className="font-semibold">{name}</div>
      <div className="text-sm text-muted-foreground">{className.replace("bg-", "")}</div>
    </div>
  </div>
);

const MotionHoverCard = () => {
  const { isReducedMotion } = useMotion();

  const hoverVariant = isReducedMotion ? {} : motionContract.hoverCard;
  const tapVariant = isReducedMotion ? {} : motionContract.tap;

  return (
    <motion.div whileHover={hoverVariant} whileTap={tapVariant}>
      <Card className="w-full md:w-1/2 transition-shadow duration-200 ease-out hover:shadow-2xl">
        <CardHeader>
          <CardTitle>Hover Me</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This demonstrates the `hoverCard` and `tap` motion contracts.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function UIPage() {
  return (
    <>
      <SEOHead title="UI Kit - Pure Living Pro" description="Design system and component library for Pure Living Pro." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        <section>
          <h1 className="text-4xl font-bold font-display mb-4">Design System</h1>
          <p className="text-lg text-muted-foreground">A showcase of reusable components for Pure Living Pro.</p>
        </section>

        {/* Colors Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ColorSwatch name="Background" className="bg-background" />
            <ColorSwatch name="Foreground" className="bg-foreground" />
            <ColorSwatch name="Card" className="bg-card" />
            <ColorSwatch name="Primary" className="bg-primary" />
            <ColorSwatch name="Primary Foreground" className="bg-primary-foreground border" />
            <ColorSwatch name="Secondary" className="bg-secondary" />
            <ColorSwatch name="Muted" className="bg-muted" />
            <ColorSwatch name="Accent" className="bg-accent" />
            <ColorSwatch name="Destructive" className="bg-destructive" />
            <ColorSwatch name="Success" className="bg-success" />
            <ColorSwatch name="Warning" className="bg-warning" />
            <ColorSwatch name="Info" className="bg-info" />
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Typography</h2>
          <div className="space-y-4">
            <h1 className="font-display text-6xl font-extrabold">Display Heading (Manrope)</h1>
            <h2 className="font-display text-4xl font-bold">Headline 1 (Manrope)</h2>
            <h3 className="font-display text-2xl font-bold">Headline 2 (Manrope)</h3>
            <p className="text-lg font-body">
              This is the body text (Inter). It's designed for readability. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.
            </p>
            <p className="font-body text-muted-foreground">
              This is muted body text (Inter). Used for secondary information.
            </p>
            <p className="font-article text-lg">
              This is long-form article text (Spectral). It offers a more classic, serif feel for extended reading.
            </p>
          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button>
              <Mail className="mr-2 h-4 w-4" /> Login with Email
            </Button>
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Badges</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-success hover:bg-success/80 text-success-foreground">
              <CheckCircle className="mr-2 h-3 w-3" /> Evidence-backed
            </Badge>
            <Badge className="bg-warning hover:bg-warning/80 text-warning-foreground">
              <Star className="mr-2 h-3 w-3" /> Editor's Pick
            </Badge>
          </div>
        </section>

        {/* Alerts Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Alerts</h2>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>This is a standard informational alert.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>This is a destructive alert for errors.</AlertDescription>
            </Alert>
            <Alert className="bg-success/10 border-success/20 text-success-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">Success</AlertTitle>
              <AlertDescription className="text-success/80">Your action was completed successfully.</AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is a basic card component used for general content containers.</p>
              </CardContent>
            </Card>
            {/* InsightCard and ProductCard would be rendered here */}
          </div>
        </section>

        {/* Forms Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Forms</h2>
          <div className="space-y-4 max-w-sm">
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            {/* NewsletterSignup component would be rendered here */}
          </div>
        </section>

        {/* Motion & Animation Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Motion & Animation</h2>
          <div className="space-y-8">
            <MotionWrapper>
              <Card>
                <CardHeader>
                  <CardTitle>Scroll Reveal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card fades and slides in when it enters the viewport, if motion is enabled.</p>
                </CardContent>
              </Card>
            </MotionWrapper>

            <div>
              <h3 className="text-xl font-bold font-display mb-4">Hover & Tap</h3>
              <p className="text-muted-foreground mb-4">This card lifts on hover and shrinks on tap.</p>
              <MotionHoverCard />
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
