import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import backend from "~backend/client";
import { InsightCard } from "../components/InsightCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SEOHead } from "../components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "../components/Pagination";
import { TagChips } from "../components/TagChips";
import { Search, BookOpen, TrendingUp } from "lucide-react";

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const limit = 9;

  const { data: categoriesData } = useQuery({
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
    keepPreviousData: true,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [searchQuery, selectedCategory, currentPage, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string | number) => {
    setSelectedCategory(categoryId.toString());
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = articles ? Math.ceil(articles.total / limit) : 0;
  const categories = categoriesData?.categories || [];

  return (
    <>
      <SEOHead
        title="Insights - Health & Wellness Articles"
        description="Explore our comprehensive collection of health and wellness articles. Expert insights on nutrition, fitness, mindfulness, and healthy living."
        keywords={["blog", "health articles", "wellness", "nutrition", "fitness", "mindfulness"]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <BookOpen className="h-4 w-4" />
            Expert Content
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Health & Wellness Insights
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Expert insights, practical tips, and inspiring stories to support your wellness journey.
          </p>
        </div>

        <div className="mb-12 space-y-8">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
              <Input
                type="search"
                placeholder="Search articles, topics, wellness tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-slate-200 focus:border-primary rounded-xl"
              />
            </div>
          </form>

          <TagChips
            tags={[{ id: "", name: "All Articles" }, ...categories]}
            selectedTagId={selectedCategory}
            onSelectTag={(id) => handleCategoryFilter(id)}
            className="justify-center"
          />
        </div>

        {articles && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              {searchQuery && `Search results for "${searchQuery}" • `}
              {articles.total} article{articles.total !== 1 ? 's' : ''} found
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : articles && articles.articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {articles.articles.map((article) => (
                <InsightCard key={article.id} article={article} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
