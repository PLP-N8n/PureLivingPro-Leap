import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { ArticleCard } from "../components/ArticleCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "../components/SEOHead";
import { useAnalytics } from "../hooks/useAnalytics";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 12;
  const { trackSearch } = useAnalytics();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.content.listCategories(),
  });

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", query, categoryFilter, page],
    queryFn: () => backend.content.searchArticles({
      query,
      categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
      limit,
      offset: page * limit,
    }),
    enabled: query.length > 0,
  });

  useEffect(() => {
    if (searchResults && query) {
      trackSearch(query, searchResults.total);
    }
  }, [searchResults, query, trackSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearchParams({ q: query, ...(categoryFilter && { category: categoryFilter }) });
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(0);
    const params = new URLSearchParams({ q: query });
    if (value) params.set("category", value);
    setSearchParams(params);
  };

  return (
    <>
      <SEOHead
        title={query ? `Search Results for "${query}"` : "Search Articles"}
        description={`Search through our collection of articles on healthy living, nutrition, fitness, and wellness. ${query ? `Results for "${query}".` : ""}`}
        keywords={["search", "articles", "healthy living", query].filter(Boolean)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {query ? `Search Results for "${query}"` : "Search Articles"}
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button type="submit">Search</Button>
          </form>

          {/* Results Summary */}
          {searchResults && query && (
            <p className="text-gray-600">
              Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{query}"
              {categoryFilter && categories && (
                <span>
                  {' '}in {categories.categories.find(c => c.id.toString() === categoryFilter)?.name}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Search Results */}
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : searchResults && searchResults.articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load More */}
            {searchResults.articles.length === limit && (
              <div className="text-center mt-12">
                <Button 
                  onClick={() => setPage(page + 1)}
                  size="lg"
                  variant="outline"
                >
                  Load More Results
                </Button>
              </div>
            )}
          </>
        ) : query ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or browse our categories below.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories?.categories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter(category.id.toString());
                    setQuery("");
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start your search</h3>
            <p className="text-gray-600">
              Enter a search term above to find articles on healthy living, nutrition, fitness, and more.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
