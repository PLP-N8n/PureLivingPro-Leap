import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => backend.content.getArticle({ slug: slug! }),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Articles
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        {article.featuredImageUrl && (
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            {article.featured && (
              <Badge className="absolute top-4 left-4 bg-green-600">
                Featured
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          {article.category && (
            <Badge variant="secondary">
              {article.category.name}
            </Badge>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(article.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {article.viewCount} views
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {article.authorName}
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <div 
          dangerouslySetInnerHTML={{ __html: article.content }}
          className="text-gray-800 leading-relaxed"
        />
      </div>

      {/* Author Info */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{article.authorName}</h3>
            <p className="text-gray-600">{article.authorEmail}</p>
          </div>
        </div>
      </footer>
    </article>
  );
}
