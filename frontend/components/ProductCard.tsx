import { ExternalLink, Star, DollarSign, Heart, ShoppingBag } from "lucide-react";
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

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-1">
      <CardHeader className="p-0">
        {product.imageUrl && (
          <div className="relative h-56 overflow-hidden rounded-t-xl">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            {product.category && (
              <Badge className="absolute top-4 left-4 bg-white/90 text-slate-700 backdrop-blur-sm border-0">
                {product.category}
              </Badge>
            )}
            
            {confidenceScore && confidenceScore > 0.8 && (
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg">
                <Star className="h-3 w-3 mr-1" />
                Top Pick
              </Badge>
            )}

            <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
              <Heart className="h-5 w-5 text-slate-600 hover:text-red-500" />
            </button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors leading-tight">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
            {product.description}
          </p>
        )}

        {reason && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong className="font-semibold">Why we recommend this:</strong> {reason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          {product.price && (
            <div className="flex items-center text-emerald-600 font-bold text-xl">
              <DollarSign className="h-5 w-5" />
              {product.price.toFixed(2)}
            </div>
          )}
          
          {product.program && (
            <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
              {product.program.name}
            </Badge>
          )}
        </div>

        <Button 
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold"
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          View Product
        </Button>

        {confidenceScore && (
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${confidenceScore * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-slate-600">
                {Math.round(confidenceScore * 100)}% match
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
