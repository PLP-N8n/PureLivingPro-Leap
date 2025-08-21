import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import backend from "~backend/client";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { RelatedArticles } from "../components/RelatedArticles";
import { ProductCard } from "../components/ProductCard";
import { SEOHead } from "../components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, User, ArrowLeft, Share2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";
import { useToast } from "@/components/ui/use-toast";
import { ReadingProgressBar } from "../components/ReadingProgressBar";
import { AffiliateDisclosure } from "../components/AffiliateDisclosure";
import { Breadcrumbs } from "../components/Breadcrumbs";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { trackPageView } = useAnalytics();
  const { toast } = useToast();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => backend.content.getArticle({ slug: slug! }),
    enabled: !!slug,
  });

  const { data: recommendedProducts } = useQuery({
    queryKey: ["article-recommended-products", article?.category?.slug],
    queryFn: () => backend.affiliate.listAffiliateProducts({ 
      category: article?.category?.slug || "wellness",
      limit: 3 
    }),
    enabled: !!article,
  });

  useEffect(() => {
    if (article) {
      trackPageView(`/article/${slug}`, article.id);
    }
  }, [article, slug, trackPageView]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <>
        <SEOHead title="Article Not Found" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const articleKeywords = [
    ...(article.category ? [article.category.name.toLowerCase()] : []),
    ...(article.tags ? article.tags.map(tag => tag.name.toLowerCase()) : []),
    "healthy living",
    "wellness"
  ];

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.excerpt || `Read ${article.title} on Pure Living Pro. Expert insights on healthy living, wellness, and lifestyle.`}
        keywords={articleKeywords}
        image={article.featuredImageUrl}
        url={`https://purelivingpro.com/article/${article.slug}`}
        type="article"
        publishedTime={article.createdAt.toISOString()}
        modifiedTime={article.updatedAt.toISOString()}
        author={article.authorName}
        section={article.category?.name}
      />
      <ReadingProgressBar />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumbs items={[
            { name: "Home", href: "/" },
            { name: "Insights", href: "/insights" },
            ...(article.category ? [{ name: article.category.name, href: `/category/${article.category.slug}` }] : []),
            { name: article.title }
          ]} />
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {article.authorName}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.viewCount} views
            </div>
            <span>•</span>
            <span>5 min read</span>
          </div>

          {article.featuredImageUrl && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
              <img
                src={article.featuredImageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              {article.featured && (
                <Badge className="absolute top-4 left-4 bg-green-600">
                  Featured
                </Badge>
              )}
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>

          {article.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-green-600">
              {article.excerpt}
            </p>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="text-gray-800 leading-relaxed"
          />
        </div>

        {/* Recommended Products Section */}
        {recommendedProducts?.products && recommendedProducts.products.length > 0 && (
          <div className="my-12 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Products</h3>
            <p className="text-gray-600 mb-2">
              Products that complement this article and support your wellness journey.
            </p>
            <AffiliateDisclosure variant="inline" className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedProducts.products.map((product) => (
                <ProductCard key={product.id} product={product} contentId={article.slug} />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center py-8 border-t border-gray-200">
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous Post
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            Next Post
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Author Info */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{article.authorName}</h3>
              <p className="text-gray-600">{article.authorEmail}</p>
              <p className="text-sm text-gray-500 mt-1">
                Health and wellness expert passionate about helping others live their best lives.
              </p>
            </div>
          </div>
        </footer>

        {/* Related Articles */}
        <RelatedArticles articleSlug={article.slug} />
      </article>
    </>
  );
}
