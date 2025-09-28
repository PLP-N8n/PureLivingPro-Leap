import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import backend from "~backend/client";
import { InsightCard } from "../components/InsightCard";
import { ProductCard } from "../components/ProductCard";
import { AffiliateDisclosure } from "../components/AffiliateDisclosure";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SEOHead } from "../components/SEOHead";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "../components/CategoryCard";
import { Hero } from "../components/Hero";
import { NewsletterForm } from "../components/NewsletterForm";
import { sampleCategories } from "../data/fixtures";
import { useAnalytics } from "../hooks/useAnalytics";

export function HomePage() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("/");
  }, [trackPageView]);

  const { data: featuredArticles, isLoading: featuredLoading } = useQuery({
    queryKey: ["articles", "featured"],
    queryFn: () => backend.content.listArticles({ featured: true, published: true, limit: 4 }),
  });

  const { data: curatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["curated-products"],
    queryFn: () => backend.affiliate.listAffiliateProducts({ limit: 3 }),
  });

  if (featuredLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEOHead />
      
      <Hero
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&h=900&fit=crop"
        headline={
          <>
            Your Journey to
            <span className="block bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
              Pure Living
            </span>
          </>
        }
        subhead="Discover AI-powered wellness insights, expert-curated content, and premium products tailored to your unique health goals."
        primaryCta={{ text: "Explore Insights", href: "/insights" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 my-24">
        {/* Foundations Series */}
        {featuredArticles && featuredArticles.articles.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-2">Foundations Series</h2>
            <p className="text-lg text-gray-600 text-center mb-8">Featured articles to kickstart your wellness journey.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredArticles.articles.map((article) => (
                <InsightCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Category Grid */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sampleCategories.slice(0, 7).map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>

        {/* Our Picks Teaser */}
        {curatedProducts && curatedProducts.products.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Our Picks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {curatedProducts.products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    category: product.category,
                    affiliateUrl: `/r/product-${product.id}`,
                    program: product.program
                  }} 
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <AffiliateDisclosure />
            </div>
          </section>
        )}

        {/* Newsletter Inline Block */}
        <section className="bg-primary/10 p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Wellness Circle</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Get exclusive wellness tips, product recommendations, and early access to content delivered straight to your inbox.
          </p>
          <div className="flex justify-center">
            <NewsletterForm />
          </div>
        </section>
      </div>
    </>
  );
}
