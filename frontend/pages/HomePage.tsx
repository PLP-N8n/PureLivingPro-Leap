import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { ArticleCard } from "../components/ArticleCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function HomePage() {
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: featuredArticles, isLoading: featuredLoading } = useQuery({
    queryKey: ["articles", "featured"],
    queryFn: () => backend.content.listArticles({ featured: true, published: true, limit: 3 }),
  });

  const { data: recentArticles, isLoading: recentLoading } = useQuery({
    queryKey: ["articles", "recent", page],
    queryFn: () => backend.content.listArticles({ 
      published: true, 
      limit, 
      offset: page * limit 
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.content.listCategories(),
  });

  if (featuredLoading || recentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-green-600">Pure Living Pro</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Discover the secrets to a healthier, more balanced lifestyle through our expert-curated 
          content on nutrition, fitness, wellness, and sustainable living.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {categories?.categories.slice(0, 4).map((category) => (
            <Button key={category.id} variant="outline" size="lg">
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles?.articles && featuredArticles.articles.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.articles.map((article, index) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                featured={index === 0}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Articles */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentArticles?.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Load More */}
        {recentArticles && recentArticles.articles.length === limit && (
          <div className="text-center mt-12">
            <Button 
              onClick={() => setPage(page + 1)}
              size="lg"
              variant="outline"
            >
              Load More Articles
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
