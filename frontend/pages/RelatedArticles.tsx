import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { InsightCard } from "../components/InsightCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface RelatedArticlesProps {
  articleSlug: string;
}

export function RelatedArticles({ articleSlug }: RelatedArticlesProps) {
  const { data: relatedArticles, isLoading } = useQuery({
    queryKey: ["related-articles", articleSlug],
    queryFn: () => backend.content.getRelatedArticles({ slug: articleSlug, limit: 3 }),
  });

  if (isLoading) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
        <LoadingSpinner />
      </div>
    );
  }

  if (!relatedArticles || relatedArticles.articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedArticles.articles.map((article) => (
          <InsightCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
