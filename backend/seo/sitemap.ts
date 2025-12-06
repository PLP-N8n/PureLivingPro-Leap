import { api } from "encore.dev/api";
import { contentDB } from "../content/db";
import { affiliateDB } from "../affiliate/db";

interface SitemapResponse {
  xml: string;
}

// Generates XML sitemap for SEO optimization.
export const generateSitemap = api<void, SitemapResponse>(
  { expose: true, method: "GET", path: "/sitemap.xml" },
  async () => {
    const baseUrl = "https://purelivingpro.com";
    
    // Get all published articles
    const articles = await contentDB.queryAll<{ slug: string; updatedAt: Date }>`
      SELECT slug, updated_at as "updatedAt"
      FROM articles
      WHERE published = true
      ORDER BY updated_at DESC
    `;

    // Get all categories
    const categories = await contentDB.queryAll<{ slug: string }>`
      SELECT slug FROM categories ORDER BY name
    `;

    // Get product categories for affiliate pages
    const productCategories = await affiliateDB.queryAll<{ category: string }>`
      SELECT DISTINCT category
      FROM affiliate_products
      WHERE category IS NOT NULL AND is_active = true
    `;

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Add article pages
    for (const article of articles) {
      sitemap += `
  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Add category pages
    for (const category of categories) {
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    // Add product category pages
    for (const productCategory of productCategories) {
      const slug = productCategory.category.toLowerCase().replace(/\s+/g, '-');
      sitemap += `
  <url>
    <loc>${baseUrl}/products/${slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    // Add static pages
    const staticPages = ['/search', '/about', '/contact', '/privacy', '/terms'];
    for (const page of staticPages) {
      sitemap += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }

    sitemap += `
</urlset>`;

    return { xml: sitemap };
  }
);
