import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

export function SEOHead({
  title = "Pure Living Pro - Transform Your Life with AI-Powered Wellness Solutions",
  description = "Discover the ultimate wellness platform combining AI-driven health insights, expert-curated content, and premium wellness products. Start your transformation journey today with personalized nutrition plans, fitness guidance, and mindfulness practices.",
  keywords = [
    "wellness platform", "AI health coaching", "personalized nutrition", "fitness guidance", 
    "mindfulness", "healthy lifestyle", "wellness products", "health transformation", 
    "holistic wellness", "preventive healthcare", "wellness technology", "health optimization",
    "nutrition planning", "fitness tracking", "mental wellness", "lifestyle medicine"
  ],
  image = "/og-image.jpg",
  url = "https://purelivingpro.com",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
}: SEOHeadProps) {
  const fullTitle = title.includes("Pure Living Pro") ? title : `${title} | Pure Living Pro`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="author" content={author || "Pure Living Pro"} />
      <link rel="canonical" href={url} />

      {/* Enhanced SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="theme-color" content="#10b981" />
      
      {/* Structured Data for Better SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "Article" : "WebSite",
          "name": "Pure Living Pro",
          "description": description,
          "url": url,
          "logo": "https://purelivingpro.com/logo.png",
          "sameAs": [
            "https://facebook.com/purelivingpro",
            "https://twitter.com/purelivingpro",
            "https://instagram.com/purelivingpro"
          ],
          ...(type === "article" && {
            "headline": title,
            "author": {
              "@type": "Person",
              "name": author || "Pure Living Pro Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Pure Living Pro",
              "logo": {
                "@type": "ImageObject",
                "url": "https://purelivingpro.com/logo.png"
              }
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "image": image,
            "articleSection": section
          })
        })}
      </script>

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Pure Living Pro" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific Open Graph tags */}
      {type === "article" && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          <meta property="article:tag" content={keywords.join(", ")} />
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@purelivingpro" />
      <meta name="twitter:creator" content="@purelivingpro" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Performance and SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Pure Living Pro" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      
      {/* DNS prefetch for better performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
    </Helmet>
  );
}
