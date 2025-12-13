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
            Build Your Best Life
            <span className="block bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
              Pure Living
            </span>
          </>
        }
        subhead="Expert insights + AI-powered tools"
        primaryCta={{ text: "Explore Insights", href: "/insights" }}
        secondaryCta={{ text: "Explore Products", href: "/products" }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        {/* Foundations Series */}
        {featuredArticles && featuredArticles.articles.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-3 text-green-950">Foundations Series</h2>
            <p className="text-lg text-green-700 text-center mb-12">Featured articles to kickstart your wellness journey.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredArticles.articles.map((article) => (
                <InsightCard key={article.id} article={article} featured={false} />
              ))}
            </div>
          </section>
        )}

        {/* Category Grid */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-3 text-green-950">Explore by Category</h2>
          <p className="text-lg text-green-700 text-center mb-12">Discover content tailored to your wellness interests.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sampleCategories.slice(0, 7).map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>

        {/* Our Picks Teaser */}
        {curatedProducts && curatedProducts.products.length > 0 && (
          <section className="mt-30">
            <h2 className="text-3xl font-bold text-center mb-3 text-green-950">Our Picks</h2>
            <p className="text-lg text-green-700 text-center mb-12">Premium products we recommend for your wellness journey.</p>
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
              <span className="text-green-700">
                <AffiliateDisclosure />
              </span>
            </div>
          </section>
        )}

        {/* Newsletter Inline Block */}
        <section className="mt-24 mb-24">
          <div className="bg-gradient-to-r from-green-50 to-lime-50 p-12 rounded-2xl border-2 border-green-200/50 text-center">
            <h2 className="text-3xl font-bold mb-4 text-green-950">Join the Wellness Circle</h2>
            <p className="text-lg text-green-700 max-w-2xl mx-auto mb-8">
              Get exclusive wellness tips, product recommendations, and early access to content delivered straight to your inbox.
            </p>
            <div className="flex justify-center">
              <NewsletterForm />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
