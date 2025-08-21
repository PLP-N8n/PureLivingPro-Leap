import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X, TrendingUp, Sparkles } from "lucide-react";
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
    <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
            <Input
              type="search"
              placeholder="Search wellness articles, nutrition tips, fitness guides..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-16 pr-16 h-16 text-lg border-2 border-slate-200 focus:border-emerald-500 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl focus:shadow-2xl transition-all duration-300"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 hover:bg-slate-100 rounded-full transition-all duration-300 hover:scale-110"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Search Results */}
          {query.length > 2 && (
            <Card className="absolute top-full left-0 right-0 mt-6 max-h-96 overflow-y-auto border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="h-5 w-5 animate-pulse text-emerald-500" />
                      <span className="animate-pulse">Searching wellness content...</span>
                    </div>
                  </div>
                ) : searchResults && searchResults.articles.length > 0 ? (
                  <>
                    {searchResults.articles.map((article, index) => (
                      <div
                        key={article.id}
                        onClick={() => handleArticleClick(article.slug)}
                        className="p-6 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex gap-6">
                          {article.featuredImageUrl && (
                            <img
                              src={article.featuredImageUrl}
                              alt={article.title}
                              className="w-20 h-20 object-cover rounded-xl flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-3 text-lg leading-tight">
                              {article.title}
                            </h4>
                            {article.excerpt && (
                              <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">{article.excerpt}</p>
                            )}
                            <div className="flex items-center gap-4">
                              {article.category && (
                                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
                                  {article.category.name}
                                </Badge>
                              )}
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <TrendingUp className="h-3 w-3" />
                                {article.viewCount.toLocaleString()} views
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {searchResults.total > 5 && (
                      <div className="p-6 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                        <Button
                          variant="outline"
                          onClick={handleViewAllResults}
                          className="w-full border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 h-12 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                        >
                          View all {searchResults.total} results
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <div className="mb-4">
                      <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <div className="text-lg font-semibold mb-2">No articles found for "{query}"</div>
                      <div className="text-sm">Try different keywords or explore our wellness categories</div>
                    </div>
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
