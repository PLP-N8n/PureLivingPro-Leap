import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { ArticleCard } from "../components/ArticleCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.content.listCategories(),
  });

  const category = categories?.categories.find(cat => cat.slug === slug);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles", "category", category?.id, page],
    queryFn: () => backend.content.listArticles({
      categoryId: category?.id,
      published: true,
      limit,
      offset: page * limit,
    }),
    enabled: !!category?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      {/* Category Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 capitalize">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {category.description}
          </p>
        )}
      </header>

      {/* Articles */}
      {articles && articles.articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Load More */}
          {articles.articles.length === limit && (
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
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No articles found in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
