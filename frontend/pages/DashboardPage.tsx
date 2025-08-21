import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import backend from "~backend/client";
import { SEOHead } from "../components/SEOHead";
import { ArticleCard } from "../components/ArticleCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  BookOpen, 
  ShoppingBag, 
  TrendingUp, 
  Heart, 
  Target,
  ArrowRight,
  Sparkles
} from "lucide-react";

export function DashboardPage() {
  const { data: recentArticles } = useQuery({
    queryKey: ["recent-articles-dashboard"],
    queryFn: () => backend.content.listArticles({ 
      published: true, 
      limit: 3 
    }),
  });

  const { data: analytics } = useQuery({
    queryKey: ["user-analytics"],
    queryFn: () => backend.analytics.getAnalyticsSummary(),
  });

  const { data: recommendedProducts } = useQuery({
    queryKey: ["recommended-products-dashboard"],
    queryFn: () => backend.affiliate.listAffiliateProducts({ 
      limit: 4 
    }),
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <SEOHead
        title="Your Wellness Dashboard"
        description="Track your wellness journey, discover new content, and get personalized recommendations for healthy living."
        keywords={["wellness dashboard", "health tracking", "personal wellness", "healthy living"]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Good day! Welcome back to your wellness journey
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {currentDate}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/wellness-plan">
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Wellness Plan</h3>
                <p className="text-sm text-gray-600">Continue your 7-day journey</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/products">
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Explore Picks</h3>
                <p className="text-sm text-gray-600">Discover wellness products</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/blog">
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Latest Posts</h3>
                <p className="text-sm text-gray-600">Read new articles</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Your Wellness Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">7</div>
                    <div className="text-sm text-gray-600">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Articles Read</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-sm text-gray-600">Products Viewed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <div className="text-sm text-gray-600">Plans Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Latest Articles
                  </CardTitle>
                  <Link to="/blog">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentArticles?.articles ? (
                  <div className="space-y-4">
                    {recentArticles.articles.map((article) => (
                      <div key={article.id} className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        {article.featuredImageUrl && (
                          <img
                            src={article.featuredImageUrl}
                            alt={article.title}
                            className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <Link to={`/article/${article.slug}`}>
                            <h4 className="font-medium text-gray-900 hover:text-green-600 transition-colors mb-1">
                              {article.title}
                            </h4>
                          </Link>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2">
                            {article.category && (
                              <Badge variant="secondary" className="text-xs">
                                {article.category.name}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <LoadingSpinner />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Today's Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    Mindful Movement
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Take 10 minutes today to move your body mindfully - whether it's stretching, walking, or dancing.
                  </p>
                  <Badge className="bg-green-600">Day 3 of 7</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendedProducts?.products ? (
                  <div className="space-y-4">
                    {recommendedProducts.products.slice(0, 2).map((product) => (
                      <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-24 object-cover rounded-md mb-2"
                          />
                        )}
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          {product.price && (
                            <span className="text-sm font-semibold text-green-600">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <LoadingSpinner />
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to="/wellness-plan" className="block text-sm text-gray-600 hover:text-green-600 transition-colors">
                    → Generate New Wellness Plan
                  </Link>
                  <Link to="/products?category=supplements" className="block text-sm text-gray-600 hover:text-green-600 transition-colors">
                    → Browse Supplements
                  </Link>
                  <Link to="/blog?category=nutrition" className="block text-sm text-gray-600 hover:text-green-600 transition-colors">
                    → Nutrition Articles
                  </Link>
                  <Link to="/admin" className="block text-sm text-gray-600 hover:text-green-600 transition-colors">
                    → Admin Dashboard
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
