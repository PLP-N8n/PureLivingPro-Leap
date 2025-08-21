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
import { Search, Filter, Sparkles, Award } from "lucide-react";

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
        {/* Hero Section with Enhanced Wellness Image */}
        <section className="relative mb-16 rounded-3xl overflow-hidden">
          <div className="relative h-96">
            <img
              src="https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=1200&h=600&fit=crop&crop=center"
              alt="Premium wellness products and natural supplements"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-3xl mx-auto px-8 text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Award className="h-4 w-4" />
                  Premium Quality Guaranteed
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  {category ? `${category} Products` : "Health & Wellness Products"}
                </h1>
                <p className="text-xl md:text-2xl leading-relaxed max-w-2xl">
                  Carefully selected products to support your health and wellness journey. 
                  All recommendations are based on quality, effectiveness, and customer reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <div className="mb-12 space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search wellness products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 text-lg border-2 border-slate-200 focus:border-emerald-500 rounded-xl"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48 h-12 border-2 border-slate-200 rounded-xl">
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
            
            <Button type="submit" size="lg" className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </Button>
          </form>

          {/* Enhanced Category Showcase with More Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group cursor-pointer" onClick={() => handleCategoryChange("supplements")}>
              <div className="relative h-32 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?w=400&h=200&fit=crop&crop=center"
                  alt="Natural supplements and vitamins"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-teal-600/80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Sparkles className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-bold text-lg">Supplements</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group cursor-pointer" onClick={() => handleCategoryChange("skincare")}>
              <div className="relative h-32 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=200&fit=crop&crop=center"
                  alt="Natural skincare and beauty products"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 to-rose-600/80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Sparkles className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-bold text-lg">Skincare</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group cursor-pointer" onClick={() => handleCategoryChange("fitness")}>
              <div className="relative h-32 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center"
                  alt="Home fitness equipment and yoga accessories"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Sparkles className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-bold text-lg">Fitness</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Wellness Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative group cursor-pointer" onClick={() => handleCategoryChange("nutrition")}>
              <div className="relative h-24 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=150&fit=crop&crop=center"
                  alt="Healthy nutrition and superfoods"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-600/80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h4 className="font-bold text-white text-sm">Nutrition</h4>
                </div>
              </div>
            </div>

            <div className="relative group cursor-pointer" onClick={() => handleCategoryChange("wellness")}>
              <div className="relative h-24 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=150&fit=crop&crop=center"
                  alt="Wellness and mindfulness products"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-600/80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h4 className="font-bold text-white text-sm">Wellness</h4>
                </div>
              </div>
            </div>

            <div className="relative group cursor-pointer">
              <div className="relative h-24 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=150&fit=crop&crop=center"
                  alt="Essential oils and aromatherapy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 to-yellow-600/80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h4 className="font-bold text-white text-sm">Aromatherapy</h4>
                </div>
              </div>
            </div>

            <div className="relative group cursor-pointer">
              <div className="relative h-24 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=150&fit=crop&crop=center"
                  alt="Yoga and meditation accessories"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-blue-600/80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h4 className="font-bold text-white text-sm">Yoga & Meditation</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
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
                    affiliateUrl: `/r/product-${product.id}`,
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
                  className="border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  Load More Products
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No products found</h3>
            <p className="text-slate-600 mb-8 text-lg">
              Try adjusting your search terms or browse different categories.
            </p>
            <Button 
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setPage(0);
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
