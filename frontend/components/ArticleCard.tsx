import { Link } from "react-router-dom";
import { Calendar, Eye, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "~backend/content/types";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-300 ${featured ? "md:col-span-2" : ""}`}>
      <CardHeader className="p-0">
        {article.featuredImageUrl && (
          <div className={`relative overflow-hidden rounded-t-lg ${featured ? "h-64" : "h-48"}`}>
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {article.featured && (
              <Badge className="absolute top-4 left-4 bg-green-600">
                Featured
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
            {article.viewCount}
          </div>
        </div>

        <Link to={`/article/${article.slug}`}>
          <h3 className={`font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2 ${
            featured ? "text-2xl" : "text-xl"
          }`}>
            {article.title}
          </h3>
        </Link>

        {article.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            {article.authorName}
          </div>
          
          <Link
            to={`/article/${article.slug}`}
            className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
          >
            Read More →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
