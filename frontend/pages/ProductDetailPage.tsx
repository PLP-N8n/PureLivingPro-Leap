import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { SEOHead } from "../components/SEOHead";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AffiliateDisclosure } from "../components/AffiliateDisclosure";
import { ProductCard } from "../components/ProductCard";
import { useAnalytics } from "../hooks/useAnalytics";
import { Star, CheckCircle, XCircle, ArrowRight, ShoppingBag } from "lucide-react";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { trackAffiliateClick } = useAnalytics();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => backend.affiliate.getProduct({ slug: slug! }),
    enabled: !!slug,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: () => backend.affiliate.listAffiliateProducts({
      category: product?.category,
      limit: 4,
    }),
    enabled: !!product,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !product) {
    return <div>Product not found</div>;
  }

  const handleAffiliateLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackAffiliateClick(product.id, product.affiliateUrl);
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
  };

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.description}
        image={product.imageUrl}
        url={`https://purelivingpro.com/picks/${product.slug}`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Breadcrumbs items={[
            { name: "Home", href: "/" },
            { name: "Our Picks", href: "/picks" },
            { name: product.name }
          ]} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <img src={product.imageUrl} alt={product.name} className="w-full rounded-lg shadow-lg" />
          </div>

          {/* Product Details */}
          <div>
            {product.category && <Badge className="mb-2">{product.category}</Badge>}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
              <span className="text-gray-600">(4.8 from 2,345 reviews)</span>
            </div>
            <p className="text-lg text-gray-600 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Key Benefits</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Supports stress reduction</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Enhances cognitive function</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Promotes restful sleep</li>
              </ul>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              {product.price && <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>}
              <span className="text-gray-500">One-time purchase</span>
            </div>

            <Button asChild size="lg" className="w-full mb-4">
              <a href={product.affiliateUrl} onClick={handleAffiliateLinkClick} target="_blank" rel="nofollow sponsored">
                <ShoppingBag className="h-5 w-5 mr-2" />
                View on Amazon
              </a>
            </Button>
            <AffiliateDisclosure />
          </div>
        </div>

        {/* Pros and Cons */}
        <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-2xl font-bold text-green-800 mb-4">Pros</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" /> Highly absorbable form for maximum effectiveness.</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" /> USDA Organic and third-party tested for purity.</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" /> Vegan, non-GMO, and gluten-free.</li>
            </ul>
          </div>
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <h3 className="text-2xl font-bold text-red-800 mb-4">Cons</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" /> May take several weeks of consistent use to notice effects.</li>
              <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" /> Earthy taste may not be for everyone.</li>
            </ul>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.products.length > 0 && (
          <div className="my-16">
            <h2 className="text-3xl font-bold text-center mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.products
                .filter(p => p.id !== product.id)
                .slice(0, 4)
                .map(p => (
                  <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
