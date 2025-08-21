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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const limit = 9; // 3x3 grid

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Health & Wellness Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert insights, practical tips, and inspiring stories to support your wellness journey
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </form>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => handleCategoryFilter("")}
              className="mb-2"
            >
              All
            </Button>
            {categories?.categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category.id.toString())}
                className="mb-2"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {articles && (
          <div className="mb-6 text-center text-gray-600">
            {searchQuery && (
              <p>Search results for "{searchQuery}" • </p>
            )}
            <p>{articles.total} article{articles.total !== 1 ? 's' : ''} found</p>
          </div>
        )}

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : articles && articles.articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.articles.map((article) => (
                <div key={article.id} className="group">
                  <ArticleCard article={article} />
                  <div className="mt-4 flex flex-wrap gap-1">
                    {article.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
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
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>

                {/* Page Numbers */}
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
                        className="w-10 h-10 p-0"
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
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or browse different categories.
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setCurrentPage(1);
              setSearchParams({});
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
