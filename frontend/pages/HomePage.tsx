import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import backend from "~backend/client";
import { ArticleCard } from "../components/ArticleCard";
import { ProductCard } from "../components/ProductCard";
import { AffiliateDisclosure } from "../components/AffiliateDisclosure";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SEOHead } from "../components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Heart, Dumbbell, Brain, Sparkles, ArrowRight } from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";

export function HomePage() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("/");
  }, [trackPageView]);

  const { data: featuredArticles, isLoading: featuredLoading } = useQuery({
    queryKey: ["articles", "featured"],
    queryFn: () => backend.content.listArticles({ featured: true, published: true, limit: 3 }),
  });

  const { data: curatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["curated-products"],
    queryFn: () => backend.affiliate.listAffiliateProducts({ limit: 4 }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.content.listCategories(),
  });

  if (featuredLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleAffiliateClick = (productId: number) => {
    console.log(`Affiliate click tracked for product ${productId}`);
  };

  return (
    <>
      <SEOHead />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16 py-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Clean, Mindful Living
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            AI-assisted wellness & product recommendations for your journey to pure, balanced living. 
            Discover expert content and curated products that support your health goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/blog">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Explore Blog
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline">
                <Sparkles className="h-5 w-5 mr-2" />
                Wellness Picks
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles?.articles && featuredArticles.articles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
              <Link to="/blog">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Curated Picks */}
        {curatedProducts?.products && curatedProducts.products.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Curated Picks</h2>
              <Link to="/products">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {curatedProducts.products.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    category: product.category,
                    affiliateUrl: `/r/product-${product.id}`,
                    program: product.program
                  }}
                  contentId="homepage_curated"
                  onAffiliateClick={handleAffiliateClick}
                />
              ))}
            </div>
          </section>
        )}

        {/* Quick Navigation Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Explore Your Wellness Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/wellness-plan">
              <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <Brain className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">AI Wellness Plan</h3>
                  <p className="text-gray-600 text-sm">Get personalized 7-day wellness plans powered by AI</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/products">
              <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Wellness Products</h3>
                  <p className="text-gray-600 text-sm">Curated products to support your health journey</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard">
              <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <Dumbbell className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Your Dashboard</h3>
                  <p className="text-gray-600 text-sm">Track your progress and get personalized insights</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />
      </div>
    </>
  );
}
