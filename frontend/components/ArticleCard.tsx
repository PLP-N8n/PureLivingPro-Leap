import { Link } from "react-router-dom";
import { Calendar, Eye, User, Clock, ArrowRight, Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "~backend/content/types";
import { motion } from "framer-motion";
import { useMotion } from "../providers/MotionProvider";
import { motionContract } from "../lib/motion";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const { isReducedMotion } = useMotion();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const estimatedReadTime = Math.ceil(article.content.length / 1000) || 3;

  const getArticleImage = () => {
    if (article.featuredImageUrl) return article.featuredImageUrl;
    const fallbackImages = {
      nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop&crop=center",
      fitness: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center",
      wellness: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center",
      supplements: "https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=800&h=400&fit=crop&crop=center",
      recipes: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop&crop=center",
      mindfulness: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=400&fit=crop&crop=center",
    };
    const categoryName = article.category?.name?.toLowerCase() || 'wellness';
    return fallbackImages[categoryName as keyof typeof fallbackImages] || fallbackImages.wellness;
  };

  const cardHover = isReducedMotion ? {} : motionContract.hoverCard;
  const imageHover = isReducedMotion ? {} : { scale: 1.1 };

  return (
    <motion.div whileHover={cardHover} className="h-full">
      <Card className={`h-full flex flex-col transition-shadow duration-300 hover:shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative overflow-hidden rounded-2xl ${featured ? "md:col-span-2" : ""}`}>
        <CardHeader className="p-0 relative">
          <div className={`relative overflow-hidden rounded-t-2xl ${featured ? "h-80" : "h-64"}`}>
            <motion.img
              src={getArticleImage()}
              alt={article.title}
              className="w-full h-full object-cover"
              whileHover={imageHover}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            {article.featured && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-lime-600 text-white border-0 shadow-xl backdrop-blur-sm animate-pulse">
                <Bookmark className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              {article.category && (
                <Badge variant="secondary" className="bg-white/95 text-slate-700 backdrop-blur-sm shadow-lg border-0 font-semibold">
                  {article.category.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 relative z-10 flex flex-col flex-grow">
          <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{article.viewCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{estimatedReadTime} min read</span>
            </div>
          </div>
          <Link to={`/article/${article.slug}`} className="group">
            <h3 className={`font-black text-slate-900 group-hover:text-primary transition-colors mb-6 leading-tight ${featured ? "text-3xl" : "text-xl"}`}>
              {article.title}
            </h3>
          </Link>
          {article.excerpt && (
            <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed text-base flex-grow">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-lime-100 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{article.authorName}</p>
                <p className="text-slate-500 text-xs">Wellness Expert</p>
              </div>
            </div>
            <Link to={`/article/${article.slug}`} className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-sm transition-all duration-300 group/link">
              Read More
              <div className="group-hover/link:translate-x-1 transition-transform duration-300">
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
