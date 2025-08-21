import { Link } from "react-router-dom";
import { Calendar, Eye, User, Clock, ArrowRight, Bookmark } from "lucide-react";
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

  // Enhanced wellness images based on category and content
  const getArticleImage = () => {
    if (article.featuredImageUrl) return article.featuredImageUrl;
    
    // Enhanced fallback images with more variety
    const fallbackImages = {
      nutrition: [
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1547496502-affa22d38842?w=800&h=400&fit=crop&crop=center"
      ],
      fitness: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=400&fit=crop&crop=center"
      ],
      wellness: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop&crop=center"
      ],
      supplements: [
        "https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&h=400&fit=crop&crop=center"
      ],
      recipes: [
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop&crop=center"
      ],
      mindfulness: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=400&fit=crop&crop=center"
      ]
    };
    
    const categoryName = article.category?.name?.toLowerCase() || 'wellness';
    const categoryImages = fallbackImages[categoryName as keyof typeof fallbackImages] || fallbackImages.wellness;
    
    // Use article ID to consistently select the same image for each article
    const imageIndex = article.id % categoryImages.length;
    return categoryImages[imageIndex];
  };

  return (
    <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:bg-white hover:-translate-y-2 transform perspective-1000 hover:rotate-x-1 relative overflow-hidden ${featured ? "md:col-span-2" : ""}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="p-0 relative">
        <div className={`relative overflow-hidden rounded-t-2xl ${featured ? "h-80" : "h-64"}`}>
          <img
            src={getArticleImage()}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          
          {/* Floating elements */}
          {article.featured && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-xl backdrop-blur-sm animate-pulse">
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
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 relative z-10">
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

        <Link to={`/article/${article.slug}`}>
          <h3 className={`font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-6 leading-tight ${
            featured ? "text-3xl" : "text-xl"
          }`}>
            {article.title}
          </h3>
        </Link>

        {article.excerpt && (
          <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed text-base">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{article.authorName}</p>
              <p className="text-slate-500 text-xs">Wellness Expert</p>
            </div>
          </div>
          
          <Link
            to={`/article/${article.slug}`}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-all duration-300 group/link bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full"
          >
            Read More
            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
