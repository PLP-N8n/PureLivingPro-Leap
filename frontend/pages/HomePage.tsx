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
import { Leaf, Heart, Dumbbell, Brain, Sparkles, ArrowRight, Star, Users, Award, TrendingUp, Zap, Shield, Target } from "lucide-react";
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
      <SEOHead 
        title="Pure Living Pro - Transform Your Life with AI-Powered Wellness Solutions"
        description="Discover the ultimate wellness platform combining AI-driven health insights, expert-curated content, and premium wellness products. Start your transformation journey today with personalized nutrition plans, fitness guidance, and mindfulness practices."
        keywords={["wellness platform", "AI health coaching", "personalized nutrition", "fitness guidance", "mindfulness", "healthy lifestyle", "wellness products", "health transformation", "holistic wellness", "preventive healthcare"]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-24 relative">
          {/* 3D Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/30 to-lime-300/30 rounded-full blur-3xl animate-pulse transform rotate-12"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-green-300/20 to-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000 transform -rotate-12"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-lime-300/15 to-green-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-lime-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-green-200/50 shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-lime-400 rounded-full animate-ping"></div>
              </div>
              <span>AI-Powered Wellness Revolution</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-tight">
              <span className="block transform hover:scale-105 transition-transform duration-500">
                Transform Your
              </span>
              <span className="block bg-gradient-to-r from-green-600 via-lime-600 to-green-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-500 delay-100 relative">
                Wellness Journey
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-lime-400 to-green-400 rounded-full animate-bounce opacity-80"></div>
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
              Experience the future of wellness with our 
              <span className="text-green-600 font-semibold"> AI-powered platform</span> that delivers 
              <span className="text-lime-600 font-semibold"> personalized health insights</span>, 
              expert-curated content, and premium wellness products tailored to your unique journey.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link to="/blog">
                <Button size="lg" className="relative bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 h-16 px-10 text-lg font-bold rounded-2xl transform hover:scale-105 hover:-translate-y-1 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center">
                    Start Your Journey
                    <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="border-3 border-slate-300 hover:border-green-500 hover:bg-green-50 h-16 px-10 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl backdrop-blur-sm group">
                  <Sparkles className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Explore Products
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black text-slate-900 mb-2 bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">50K+</div>
                <div className="text-slate-600 font-medium">Lives Transformed</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black text-slate-900 mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">1000+</div>
                <div className="text-slate-600 font-medium">Expert Articles</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black text-slate-900 mb-2 bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">5K+</div>
                <div className="text-slate-600 font-medium">Premium Products</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black text-slate-900 mb-2 bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent">99%</div>
                <div className="text-slate-600 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Enhanced Wellness Images */}
        <section className="py-24">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-lime-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <TrendingUp className="h-5 w-5" />
              Revolutionary Wellness Technology
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8">
              Everything You Need for
              <span className="block bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
                Optimal Wellness
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform combines cutting-edge AI technology with expert knowledge to deliver personalized wellness solutions that actually work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/wellness-plan">
              <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-4 transform perspective-1000 hover:rotate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center"
                    alt="AI Wellness Plans - Meditation and mindfulness"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                <CardContent className="p-10 text-center relative z-10">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-lime-100 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl">
                      <Brain className="h-12 w-12 text-green-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-lime-400 to-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-black text-2xl text-slate-900 mb-4">AI Wellness Plans</h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">Get personalized 7-day wellness plans powered by advanced AI algorithms that adapt to your lifestyle and goals.</p>
                  <div className="flex items-center justify-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Start Planning <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/products">
              <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-4 transform perspective-1000 hover:rotate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center"
                    alt="Curated Products - Home fitness and wellness equipment"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                <CardContent className="p-10 text-center relative z-10">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl">
                      <Heart className="h-12 w-12 text-green-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-lime-400 to-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-black text-2xl text-slate-900 mb-4">Curated Products</h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">Discover premium wellness products carefully selected by our team of health experts and verified by thousands of users.</p>
                  <div className="flex items-center justify-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Shop Now <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard">
              <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-4 transform perspective-1000 hover:rotate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop&crop=center"
                    alt="Progress Tracking - Healthy nutrition and meal planning"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                <CardContent className="p-10 text-center relative z-10">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-lime-100 to-green-100 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl">
                      <Target className="h-12 w-12 text-green-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-lime-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-black text-2xl text-slate-900 mb-4">Progress Tracking</h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">Monitor your wellness journey with detailed analytics, personalized insights, and achievement milestones.</p>
                  <div className="flex items-center justify-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Track Progress <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Enhanced Wellness Showcase Section */}
        <section className="py-24">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-lime-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <Leaf className="h-5 w-5" />
              Natural Wellness Solutions
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8">
              Pure Ingredients for
              <span className="block bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
                Pure Living
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=800&h=600&fit=crop&crop=center"
                alt="Natural herbs and essential oils for wellness"
                className="w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-slate-900">Natural Remedies & Supplements</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Discover the power of nature with our carefully curated selection of herbs, essential oils, and natural supplements. Each product is sourced from trusted suppliers and backed by scientific research.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">100% Natural</h4>
                  <p className="text-sm text-green-700">Pure, organic ingredients</p>
                </div>
                <div className="p-4 bg-lime-50 rounded-xl">
                  <h4 className="font-semibold text-lime-800 mb-2">Lab Tested</h4>
                  <p className="text-sm text-lime-700">Quality guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6 lg:order-2">
              <h3 className="text-3xl font-bold text-slate-900">Nutritious Meal Planning</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Transform your health with our AI-powered meal planning system. Get personalized nutrition recommendations based on your goals, dietary preferences, and lifestyle.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">AI Powered</h4>
                  <p className="text-sm text-green-700">Smart recommendations</p>
                </div>
                <div className="p-4 bg-lime-50 rounded-xl">
                  <h4 className="font-semibold text-lime-800 mb-2">Personalized</h4>
                  <p className="text-sm text-lime-700">Tailored to your needs</p>
                </div>
              </div>
            </div>
            <div className="relative lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&crop=center"
                alt="Healthy nutritious meal bowls with fresh ingredients"
                className="w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
            </div>
          </div>

          {/* Additional Wellness Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&crop=center"
                alt="Home fitness and yoga practice"
                className="w-full h-64 object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-bold text-lg mb-2">Home Fitness</h4>
                <p className="text-sm">Transform your space into a wellness sanctuary</p>
              </div>
            </div>
            
            <div className="relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&h=400&fit=crop&crop=center"
                alt="Mindfulness and meditation practice"
                className="w-full h-64 object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-bold text-lg mb-2">Mindful Living</h4>
                <p className="text-sm">Cultivate peace and presence in daily life</p>
              </div>
            </div>
            
            <div className="relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop&crop=center"
                alt="Natural skincare and beauty products"
                className="w-full h-64 object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-bold text-lg mb-2">Natural Beauty</h4>
                <p className="text-sm">Nourish your skin with pure ingredients</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles?.articles && featuredArticles.articles.length > 0 && (
          <section className="py-24">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-lime-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <Star className="h-5 w-5 animate-pulse" />
                Editor's Choice Content
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8">
                Expert-Curated
                <span className="block bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
                  Wellness Insights
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Dive deep into evidence-based wellness content created by certified health professionals and wellness experts.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {featuredArticles.articles.map((article, index) => (
                <div key={article.id} className="transform hover:scale-105 transition-all duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/blog">
                <Button variant="outline" size="lg" className="border-3 border-slate-300 hover:border-green-500 hover:bg-green-50 h-14 px-8 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Explore All Articles
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Premium Products Section */}
        {curatedProducts?.products && curatedProducts.products.length > 0 && (
          <section className="py-24">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-lime-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <Award className="h-5 w-5" />
                Premium Wellness Collection
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8">
                Handpicked
                <span className="block bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
                  Wellness Essentials
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Discover premium wellness products that have been rigorously tested and approved by our team of health experts.
              </p>
            </div>

            {/* Product Showcase with Enhanced Images */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=800&h=600&fit=crop&crop=center"
                  alt="Premium wellness supplements and natural products"
                  className="w-full h-96 object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 mb-2">Premium Quality Guaranteed</h4>
                    <p className="text-sm text-slate-600">All products are third-party tested for purity and potency</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900">Scientifically Backed Supplements</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Our supplement collection features only the highest quality ingredients, backed by scientific research and manufactured in certified facilities.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700">Third-party tested for purity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                    <span className="text-slate-700">Manufactured in FDA-approved facilities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700">Backed by clinical research</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {curatedProducts.products.slice(0, 4).map((product, index) => (
                <div key={product.id} className="transform hover:scale-105 transition-all duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <ProductCard
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
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/products">
                <Button variant="outline" size="lg" className="border-3 border-slate-300 hover:border-green-500 hover:bg-green-50 h-14 px-8 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  View All Products
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Trust & Security Section */}
        <section className="py-24">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/20 to-lime-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/80 text-slate-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg backdrop-blur-sm">
                <Shield className="h-5 w-5 text-green-600" />
                Trusted by Wellness Professionals
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
                Your Wellness Journey,
                <span className="block bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
                  Scientifically Backed
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">Evidence-Based</h3>
                  <p className="text-slate-600">All recommendations backed by peer-reviewed research and clinical studies.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">Privacy First</h3>
                  <p className="text-slate-600">Your health data is encrypted and never shared with third parties.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-lime-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">Expert Approved</h3>
                  <p className="text-slate-600">Reviewed by certified nutritionists, fitness trainers, and wellness coaches.</p>
                </div>
              </div>
              
              <blockquote className="text-2xl md:text-3xl font-medium text-slate-900 mb-8 leading-relaxed max-w-4xl mx-auto italic">
                "Pure Living Pro has revolutionized how I approach wellness. The AI recommendations are incredibly accurate, and the content quality is unmatched."
              </blockquote>
              
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-lime-500 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-xl">DR</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">Dr. Sarah Rodriguez</div>
                  <div className="text-slate-600">Certified Wellness Coach & Nutritionist</div>
                </div>
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
