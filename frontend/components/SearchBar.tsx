import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import backend from "~backend/client";
import { useAnalytics } from "../hooks/useAnalytics";
import { useDebounce } from "../hooks/useDebounce";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const { trackSearch } = useAnalytics();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => backend.content.searchArticles({ query: debouncedQuery, limit: 5 }),
    enabled: debouncedQuery.length > 2,
  });

  useEffect(() => {
    if (searchResults && debouncedQuery) {
      trackSearch(debouncedQuery, searchResults.total);
    }
  }, [searchResults, debouncedQuery, trackSearch]);

  const handleArticleClick = (slug: string) => {
    navigate(`/article/${slug}`);
    onClose();
    setQuery("");
  };

  const handleViewAllResults = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search articles, topics, and more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Results */}
          {query.length > 2 && (
            <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults && searchResults.articles.length > 0 ? (
                  <>
                    {searchResults.articles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => handleArticleClick(article.slug)}
                        className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                        {article.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.excerpt}</p>
                        )}
                        <div className="flex items-center gap-2">
                          {article.category && (
                            <Badge variant="secondary" className="text-xs">
                              {article.category.name}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {article.viewCount} views
                          </span>
                        </div>
                      </div>
                    ))}
                    {searchResults.total > 5 && (
                      <div className="p-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          onClick={handleViewAllResults}
                          className="w-full"
                        >
                          View all {searchResults.total} results
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No articles found for "{query}"
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
