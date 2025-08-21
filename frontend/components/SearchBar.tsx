import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X, TrendingUp } from "lucide-react";
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
    <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="search"
              placeholder="Search articles, topics, wellness tips..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg border-2 border-slate-200 focus:border-emerald-500 rounded-xl bg-white/80 backdrop-blur-sm"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Results */}
          {query.length > 2 && (
            <Card className="absolute top-full left-0 right-0 mt-4 max-h-96 overflow-y-auto border-0 shadow-2xl bg-white/95 backdrop-blur-md">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 text-center text-slate-500">
                    <div className="animate-pulse">Searching...</div>
                  </div>
                ) : searchResults && searchResults.articles.length > 0 ? (
                  <>
                    {searchResults.articles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => handleArticleClick(article.slug)}
                        className="p-6 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors duration-200"
                      >
                        <div className="flex gap-4">
                          {article.featuredImageUrl && (
                            <img
                              src={article.featuredImageUrl}
                              alt={article.title}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-2 text-lg">{article.title}</h4>
                            {article.excerpt && (
                              <p className="text-slate-600 line-clamp-2 mb-3 leading-relaxed">{article.excerpt}</p>
                            )}
                            <div className="flex items-center gap-3">
                              {article.category && (
                                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                                  {article.category.name}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <TrendingUp className="h-3 w-3" />
                                {article.viewCount.toLocaleString()} views
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {searchResults.total > 5 && (
                      <div className="p-6 border-t border-slate-100 bg-slate-50">
                        <Button
                          variant="outline"
                          onClick={handleViewAllResults}
                          className="w-full border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50"
                        >
                          View all {searchResults.total} results
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    <div className="mb-2">No articles found for "{query}"</div>
                    <div className="text-sm">Try different keywords or browse our categories</div>
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
