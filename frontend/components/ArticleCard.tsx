import { Link } from "react-router-dom";
import { Calendar, Eye, User, Clock, ArrowRight } from "lucide-react";
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

  const estimatedReadTime = Math.ceil(article.content.length / 1000) || 3;

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-1 ${featured ? "md:col-span-2" : ""}`}>
      <CardHeader className="p-0">
        {article.featuredImageUrl && (
          <div className={`relative overflow-hidden rounded-t-xl ${featured ? "h-80" : "h-56"}`}>
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            {article.featured && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
                Featured
              </Badge>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              {article.category && (
                <Badge variant="secondary" className="bg-white/90 text-slate-700 backdrop-blur-sm">
                  {article.category.name}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{article.viewCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{estimatedReadTime} min read</span>
          </div>
        </div>

        <Link to={`/article/${article.slug}`}>
          <h3 className={`font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-4 leading-tight ${
            featured ? "text-3xl" : "text-xl"
          }`}>
            {article.title}
          </h3>
        </Link>

        {article.excerpt && (
          <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed text-base">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">{article.authorName}</p>
              <p className="text-slate-500 text-xs">Author</p>
            </div>
          </div>
          
          <Link
            to={`/article/${article.slug}`}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors group/link"
          >
            Read More
            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
