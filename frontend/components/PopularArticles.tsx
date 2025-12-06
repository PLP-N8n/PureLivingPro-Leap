import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { ArticleCard } from "./ArticleCard";
import { LoadingSpinner } from "./LoadingSpinner";

interface PopularArticlesProps {
  limit?: number;
  days?: number;
  title?: string;
}

export function PopularArticles({ 
  limit = 6, 
  days = 30, 
  title = "Popular Articles" 
}: PopularArticlesProps) {
  const { data: popularArticles, isLoading } = useQuery({
    queryKey: ["popular-articles", limit, days],
    queryFn: () => backend.content.getPopularArticles({ limit, days }),
  });

  if (isLoading) {
    return (
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        <LoadingSpinner />
      </section>
    );
  }

  if (!popularArticles || popularArticles.articles.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {popularArticles.articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
