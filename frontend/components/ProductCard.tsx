import { ExternalLink, Star, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  onAffiliateClick?: (productId: number) => void;
}

export function ProductCard({ 
  product, 
  reason, 
  confidenceScore,
  onAffiliateClick 
}: ProductCardProps) {
  const handleAffiliateClick = () => {
    if (onAffiliateClick) {
      onAffiliateClick(product.id);
    }
    // Open affiliate link in new tab
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        {product.imageUrl && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.category && (
              <Badge className="absolute top-2 left-2 bg-green-600">
                {product.category}
              </Badge>
            )}
            {confidenceScore && confidenceScore > 0.8 && (
              <Badge className="absolute top-2 right-2 bg-blue-600">
                <Star className="h-3 w-3 mr-1" />
                Top Pick
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {product.description}
          </p>
        )}

        {reason && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Why we recommend this:</strong> {reason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          {product.price && (
            <div className="flex items-center text-green-600 font-semibold">
              <DollarSign className="h-4 w-4" />
              {product.price.toFixed(2)}
            </div>
          )}
          
          {product.program && (
            <Badge variant="outline" className="text-xs">
              {product.program.name}
            </Badge>
          )}
        </div>

        <Button 
          onClick={handleAffiliateClick}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Product
        </Button>

        {confidenceScore && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Match Score: {Math.round(confidenceScore * 100)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
