import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import backend from "~backend/client";
import { ArticleCard } from "../components/ArticleCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SEOHead } from "../components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Filter, BookOpen, TrendingUp } from "lucide-react";

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const limit = 9;

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.content.listCategories(),
  });

  const { data: articles, isLoading } = useQuery({
    queryKey: ["blog-articles", selectedCategory, searchQuery, currentPage],
    queryFn: () => backend.content.listArticles({
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      search: searchQuery || undefined,
      published: true,
      limit,
      offset: (currentPage - 1) * limit,
    }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateSearchParams({ search: searchQuery, page: "1" });
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    updateSearchParams({ category: categoryId, page: "1" });
  };

  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const totalPages = articles ? Math.ceil(articles.total / limit) : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEOHead
        title="Blog - Health & Wellness Articles"
        description="Explore our comprehensive collection of health and wellness articles. Expert insights on nutrition, fitness, mindfulness, and healthy living."
        keywords={["blog", "health articles", "wellness", "nutrition", "fitness", "mindfulness"]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <BookOpen className="h-4 w-4" />
            Expert Content
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Health & Wellness
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Expert insights, practical tips, and inspiring stories to support your wellness journey
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
              <Input
                type="search"
                placeholder="Search articles, topics, wellness tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-slate-200 focus:border-emerald-500 rounded-xl bg-white/80 backdrop-blur-sm"
              />
            </div>
          </form>
        </div>

        {/* Category Filters */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => handleCategoryFilter("")}
              className={`mb-2 rounded-full px-6 py-2 ${
                selectedCategory === "" 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0" 
                  : "border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
              }`}
            >
              All Articles
            </Button>
            {categories?.categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category.id.toString())}
                className={`mb-2 rounded-full px-6 py-2 ${
                  selectedCategory === category.id.toString()
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0"
                    : "border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {articles && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              {searchQuery && `Search results for "${searchQuery}" • `}
              {articles.total} article{articles.total !== 1 ? 's' : ''} found
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : articles && articles.articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {articles.articles.map((article) => (
                <div key={article.id} className="group">
                  <ArticleCard article={article} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs border-slate-200 text-slate-600">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-12 h-12 p-0 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0"
                            : "border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No articles found</h3>
            <p className="text-slate-600 mb-8 text-lg">
              Try adjusting your search terms or browse different categories.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setCurrentPage(1);
                setSearchParams({});
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
