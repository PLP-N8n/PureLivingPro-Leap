import { api } from "encore.dev/api";
import { contentDB } from "./db";
import type { ListArticlesResponse, Article } from "./types";

interface GetPopularArticlesRequest {
  limit?: number;
  days?: number;
}

// Retrieves the most popular articles based on view count within a specified time period.
export const getPopularArticles = api<GetPopularArticlesRequest, ListArticlesResponse>(
  { expose: true, method: "GET", path: "/articles/popular" },
  async (req) => {
    const limit = req.limit || 10;
    const days = req.days || 30;

    const articles = await contentDB.rawQueryAll<Article & { categoryName?: string; categorySlug?: string }>`
      SELECT 
        a.id, a.title, a.slug, a.content, a.excerpt,
        a.featured_image_url as "featuredImageUrl", a.category_id as "categoryId",
        a.author_name as "authorName", a.author_email as "authorEmail",
        a.published, a.featured, a.view_count as "viewCount",
        a.created_at as "createdAt", a.updated_at as "updatedAt",
        c.name as "categoryName", c.slug as "categorySlug"
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = true 
        AND a.created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY a.view_count DESC, a.created_at DESC
      LIMIT ${limit}
    `;

    const articlesWithCategory = articles.map(article => ({
      ...article,
      category: article.categoryName ? {
        id: article.categoryId!,
        name: article.categoryName,
        slug: article.categorySlug!,
        createdAt: new Date()
      } : undefined
    }));

    return {
      articles: articlesWithCategory,
      total: articlesWithCategory.length
    };
  }
);
