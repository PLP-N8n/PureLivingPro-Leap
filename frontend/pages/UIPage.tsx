import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SEOHead } from "../components/SEOHead";
import {
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { MotionWrapper } from "../components/design-system/MotionWrapper";
import { motion } from "framer-motion";
import { useMotion } from "../providers/MotionProvider";
import { motionContract } from "../lib/motion";
import { Hero } from "../components/Hero";
import { CategoryCard } from "../components/CategoryCard";
import { InsightCard } from "../components/InsightCard";
import { ProductCard } from "../components/ProductCard";
import { AffiliateDisclosure } from "../components/AffiliateDisclosure";
import { NewsletterForm } from "../components/NewsletterForm";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { TableOfContents } from "../components/TableOfContents";
import { TagChips } from "../components/TagChips";
import { Pagination } from "../components/Pagination";
import { Callout } from "../components/Callout";
import { sampleCategories, sampleProducts } from "../data/fixtures";
import type { Article } from "~backend/content/types";

const ColorSwatch = ({ name, className }: { name: string; className: string }) => (
  <div className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg ${className} border border-slate-200`}></div>
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

const sampleArticle: Article = {
  id: 1,
  title: "The Ultimate Guide to Mindful Eating",
  slug: "the-ultimate-guide-to-mindful-eating",
  content: "<h2>What is Mindful Eating?</h2><p>Mindful eating is the practice of maintaining an in-the-moment awareness of the food and drink you put into your body.</p><h3>Key Benefits</h3><p>It involves observing how the food makes you feel and the signals your body sends about taste, satisfaction, and fullness.</p>",
  excerpt: "Learn how to transform your relationship with food through the practice of mindful eating. Discover the benefits, techniques, and simple exercises to get started.",
  featuredImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop&crop=center",
  categoryId: 1,
  authorName: "Jane Doe",
  authorEmail: "jane@example.com",
  published: true,
  featured: true,
  viewCount: 12345,
  createdAt: new Date(),
  updatedAt: new Date(),
  category: { id: 1, name: "Mindfulness", slug: "mindfulness", createdAt: new Date() },
  tags: [{ id: 1, name: "Nutrition", slug: "nutrition", createdAt: new Date() }, { id: 2, name: "Wellness", slug: "wellness", createdAt: new Date() }],
};

const sampleProduct = {
  ...sampleProducts[0],
  affiliateUrl: "#",
};

export function UIPage() {
  return (
    <>
      <SEOHead title="UI Kit - Pure Living Pro" description="Design system and component library for Pure Living Pro." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        <section>
          <h1 className="text-4xl font-bold font-display mb-4">Component & Design System</h1>
          <p className="text-lg text-muted-foreground">A visual contract for all reusable components and design tokens.</p>
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

        {/* Hero Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Hero</h2>
          <Hero
            mediaType="image"
            mediaSrc="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&h=900&fit=crop"
            headline={<>Hero Component</>}
            subhead="This is a demonstration of the hero component with a primary CTA."
            primaryCta={{ text: "Get Started", href: "#" }}
          />
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CategoryCard category={sampleCategories[0]} />
            <InsightCard article={sampleArticle} />
            <ProductCard product={sampleProduct} />
          </div>
        </section>

        {/* Forms & CTA Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Forms & CTAs</h2>
          <div className="space-y-8">
            <NewsletterForm />
            <AffiliateDisclosure />
          </div>
        </section>

        {/* Navigation Elements Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Navigation Elements</h2>
          <div className="space-y-8">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Insights", href: "/insights" }, { name: "Article Title" }]} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <TableOfContents content={sampleArticle.content} />
              </div>
              <div className="md:col-span-2 space-y-4">
                <TagChips tags={sampleCategories} selectedTagId="nutrition" onSelectTag={() => {}} />
                <Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />
              </div>
            </div>
          </div>
        </section>

        {/* Callouts & Alerts Section */}
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Callouts & Alerts</h2>
          <div className="space-y-4">
            <Callout type="info" title="Informational Tip">
              <p>This is an informational callout to provide extra context or tips to the user.</p>
            </Callout>
            <Callout type="success" title="Success!">
              <p>This callout indicates a successful operation or a positive outcome.</p>
            </Callout>
            <Callout type="warning" title="Warning">
              <p>This callout warns the user about a potential issue or something to be cautious of.</p>
            </Callout>
            <Callout type="danger" title="Danger">
              <p>This callout is for critical errors or important warnings that need immediate attention.</p>
            </Callout>
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
