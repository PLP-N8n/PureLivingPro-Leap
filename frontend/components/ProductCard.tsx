import { ExternalLink, Star, DollarSign, Heart, ShoppingBag, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { handleProductClick, getSessionId } from "../utils/affiliate";

interface Product {
  id: number;
  name: string;
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
  onAffiliateClick?: (productId: number) => void;
}

export function ProductCard({ 
  product, 
  reason, 
  confidenceScore,
  contentId,
  onAffiliateClick 
}: ProductCardProps) {
  const handleClick = () => {
    handleProductClick(product, {
      contentId,
      campaign: 'product_recommendation',
      source: 'product_card'
    });
    
    if (onAffiliateClick) {
      onAffiliateClick(product.id);
    }
  };

  // Enhanced wellness product images with more variety
  const getProductImage = () => {
    if (product.imageUrl) return product.imageUrl;
    
    // Enhanced fallback images based on category
    const fallbackImages = {
      supplements: [
        "https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center"
      ],
      skincare: [
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop&crop=center"
      ],
      fitness: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1434596922112-19c563067271?w=400&h=300&fit=crop&crop=center"
      ],
      wellness: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop&crop=center"
      ],
      nutrition: [
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&h=300&fit=crop&crop=center"
      ]
    };
    
    const categoryName = product.category?.toLowerCase() || 'wellness';
    const categoryImages = fallbackImages[categoryName as keyof typeof fallbackImages] || fallbackImages.wellness;
    
    // Use product ID to consistently select the same image for each product
    const imageIndex = product.id % categoryImages.length;
    return categoryImages[imageIndex];
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:bg-white hover:-translate-y-3 transform perspective-1000 hover:rotate-x-1 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="p-0 relative">
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <img
            src={getProductImage()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          
          {/* Floating badges */}
          {product.category && (
            <Badge className="absolute top-4 left-4 bg-white/95 text-slate-700 backdrop-blur-sm border-0 shadow-lg font-semibold">
              {product.category}
            </Badge>
          )}
          
          {confidenceScore && confidenceScore > 0.8 && (
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-xl animate-pulse">
              <Star className="h-3 w-3 mr-1" />
              Top Pick
            </Badge>
          )}

          {/* Wishlist button */}
          <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl transform scale-90 group-hover:scale-100">
            <Heart className="h-5 w-5 text-slate-600 hover:text-red-500 transition-colors duration-300" />
          </button>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 relative z-10">
        <h3 className="font-black text-xl text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
            {product.description}
          </p>
        )}

        {reason && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <p className="text-sm text-blue-800 relative z-10">
              <strong className="font-bold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Why we recommend this:
              </strong> 
              {reason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          {product.price && (
            <div className="flex items-center text-emerald-600 font-black text-2xl">
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
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-14 text-base font-bold rounded-xl transform hover:scale-105 group/btn relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 mr-3" />
            View Product
          </span>
        </Button>

        {confidenceScore && (
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${confidenceScore * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                {Math.round(confidenceScore * 100)}% match
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
