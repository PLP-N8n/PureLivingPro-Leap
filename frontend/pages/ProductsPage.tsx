import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import backend from "~backend/client";
import { ProductCard } from "../components/ProductCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SEOHead } from "../components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export function ProductsPage() {
  const { category } = useParams<{ category?: string }>();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: products, isLoading } = useQuery({
    queryKey: ["affiliate-products", search, selectedCategory, page],
    queryFn: () => backend.affiliate.listAffiliateProducts({
      search: search || undefined,
      category: selectedCategory || undefined,
      limit,
      offset: page * limit,
    }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(0);
  };

  const handleAffiliateClick = (productId: number) => {
    // Track affiliate click for analytics
    console.log(`Affiliate click tracked for product ${productId}`);
  };

  return (
    <>
      <SEOHead
        title={category ? `${category} Products` : "Health & Wellness Products"}
        description="Discover our curated selection of health and wellness products. From supplements to fitness equipment, find everything you need for your wellness journey."
        keywords={["health products", "wellness", "supplements", "fitness", category].filter(Boolean)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {category ? `${category} Products` : "Health & Wellness Products"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Carefully selected products to support your health and wellness journey. 
            All recommendations are based on quality, effectiveness, and customer reviews.
          </p>
        </header>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="supplements">Supplements</SelectItem>
                <SelectItem value="fitness">Fitness Equipment</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="skincare">Skincare</SelectItem>
              </SelectContent>
            </Select>
            
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : products && products.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    category: product.category,
                    affiliateUrl: `/r/product-${product.id}`, // This would be generated from actual affiliate links
                    program: product.program
                  }}
                  onAffiliateClick={handleAffiliateClick}
                />
              ))}
            </div>

            {/* Load More */}
            {products.products.length === limit && (
              <div className="text-center mt-12">
                <Button 
                  onClick={() => setPage(page + 1)}
                  size="lg"
                  variant="outline"
                >
                  Load More Products
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or browse different categories.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
