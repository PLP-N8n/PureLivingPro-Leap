import { Star, DollarSign, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useMotion } from "../providers/MotionProvider";
import { motionContract } from "../lib/motion";
import { useAnalytics } from "../hooks/useAnalytics";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  affiliateUrl: string;
  program?: {
    name: string;
    commissionRate: number;
  };
}

interface ProductCardProps {
  product: Product;
  reason?: string;
  confidenceScore?: number;
  contentId?: string;
}

export function ProductCard({ 
  product, 
  reason, 
  confidenceScore,
  contentId,
}: ProductCardProps) {
  const { isReducedMotion } = useMotion();
  const { trackAffiliateClick } = useAnalytics();

  const handleAffiliateLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackAffiliateClick(product.id, product.affiliateUrl, contentId);
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
  };

  const getProductImage = () => {
    if (product.imageUrl) return product.imageUrl;
    const fallbackImages = {
      supplements: "https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=400&h=300&fit=crop&crop=center",
      skincare: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop&crop=center",
      fitness: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
      wellness: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center",
      nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&crop=center",
    };
    const categoryName = product.category?.toLowerCase() || 'wellness';
    return fallbackImages[categoryName as keyof typeof fallbackImages] || fallbackImages.wellness;
  };

  const cardHover = isReducedMotion ? {} : motionContract.hoverCard;
  const imageHover = isReducedMotion ? {} : { scale: 1.1 };

  return (
    <motion.div whileHover={cardHover} className="h-full">
      <Card className="h-full flex flex-col transition-shadow duration-300 hover:shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative overflow-hidden rounded-2xl">
        <CardHeader className="p-0 relative">
          <Link to={`/picks/${product.slug}`} className="block">
            <div className="relative h-64 overflow-hidden rounded-t-2xl">
              <motion.img
                src={getProductImage()}
                alt={product.name}
                className="w-full h-full object-cover"
                whileHover={imageHover}
                transition={{ duration: 0.7, ease: "easeOut" }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              {product.category && (
                <Badge className="absolute top-4 left-4 bg-white/95 text-slate-700 backdrop-blur-sm border-0 shadow-lg font-semibold">
                  {product.category}
                </Badge>
              )}
              {confidenceScore && confidenceScore > 0.8 && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-lime-600 text-white border-0 shadow-xl animate-pulse">
                  <Star className="h-3 w-3 mr-1" />
                  Top Pick
                </Badge>
              )}
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-8 relative z-10 flex flex-col flex-grow">
          <Link to={`/picks/${product.slug}`} className="block">
            <h3 className="font-black text-xl text-slate-900 mb-4 group-hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-grow">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mb-8 mt-auto">
            {product.price && (
              <div className="flex items-center text-primary font-black text-2xl">
                <DollarSign className="h-6 w-6" />
                {product.price.toFixed(2)}
              </div>
            )}
            {product.program && (
              <Badge variant="outline" className="text-xs border-slate-200 text-slate-600 bg-slate-50">
                {product.program.name}
              </Badge>
            )}
          </div>
          <Button 
            asChild
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 h-14 text-base font-bold rounded-xl transform hover:scale-105"
          >
            <a 
              href={product.affiliateUrl} 
              onClick={handleAffiliateLinkClick} 
              target="_blank" 
              rel="nofollow sponsored noopener"
              data-product-id={product.id}
              {...(contentId && { 'data-content-id': contentId })}
            >
              <ShoppingBag className="h-5 w-5 mr-3" />
              View on Amazon
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
