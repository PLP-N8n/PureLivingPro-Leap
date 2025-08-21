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
import { Leaf, Heart, Dumbbell, Brain, Sparkles, ArrowRight, Star, Users, Award, TrendingUp } from "lucide-react";
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-20 relative">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-emerald-200">
              <Sparkles className="h-4 w-4" />
              AI-Powered Wellness Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              Clean, Mindful
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Living
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              AI-assisted wellness & product recommendations for your journey to pure, balanced living. 
              Discover expert content and curated products that support your health goals.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link to="/blog">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-200 h-14 px-8 text-lg font-semibold">
                  Explore Blog
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 h-14 px-8 text-lg font-semibold">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Wellness Picks
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">10K+</div>
                <div className="text-slate-600">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
                <div className="text-slate-600">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">1K+</div>
                <div className="text-slate-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">98%</div>
                <div className="text-slate-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles?.articles && featuredArticles.articles.length > 0 && (
          <section className="py-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Editor's Choice
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Featured Articles</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Handpicked content to inspire and guide your wellness journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredArticles.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/blog">
                <Button variant="outline" size="lg" className="border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50">
                  View All Articles
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Curated Picks */}
        {curatedProducts?.products && curatedProducts.products.length > 0 && (
          <section className="py-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4" />
                Curated Selection
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Wellness Essentials</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Carefully selected products to support your health and wellness goals
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
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
            
            <div className="text-center">
              <Link to="/products">
                <Button variant="outline" size="lg" className="border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50">
                  Explore All Products
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4" />
              Your Wellness Journey
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Everything You Need</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools and resources to support every aspect of your wellness journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/wellness-plan">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900 mb-4">AI Wellness Plans</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">Get personalized 7-day wellness plans powered by AI technology</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/products">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900 mb-4">Curated Products</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">Handpicked wellness products to support your health journey</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Dumbbell className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900 mb-4">Progress Tracking</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">Monitor your wellness journey with personalized insights</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Users className="h-4 w-4" />
              Community Love
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-slate-900 mb-8 leading-relaxed max-w-4xl mx-auto">
              "Pure Living Pro has transformed my approach to wellness. The AI recommendations are spot-on, and the content is incredibly valuable."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">SJ</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Sarah Johnson</div>
                <div className="text-slate-600">Wellness Enthusiast</div>
              </div>
            </div>
          </div>
        </section>

        {/* Affiliate Disclosure */}
        <section className="py-12">
          <AffiliateDisclosure />
        </section>
      </div>
    </>
  );
}
