import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { contentDB } from "./db";
import type { ListArticlesRequest, ListArticlesResponse, Article } from "./types";

// Retrieves all articles with optional filtering and pagination.
export const listArticles = api<ListArticlesRequest, ListArticlesResponse>(
  { expose: true, method: "GET", path: "/articles" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.published !== undefined) {
      whereConditions.push(`a.published = $${paramIndex++}`);
      params.push(req.published);
    }

    if (req.featured !== undefined) {
      whereConditions.push(`a.featured = $${paramIndex++}`);
      params.push(req.featured);
    }

    if (req.categoryId) {
      whereConditions.push(`a.category_id = $${paramIndex++}`);
      params.push(req.categoryId);
    }

    if (req.search) {
      whereConditions.push(`(a.title ILIKE $${paramIndex++} OR a.content ILIKE $${paramIndex++})`);
      const searchTerm = `%${req.search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM articles a
      ${whereClause}
    `;
    
    const countResult = await contentDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get articles with category information
    const articlesQuery = `
      SELECT 
        a.id, a.title, a.slug, a.content, a.excerpt,
        a.featured_image_url as "featuredImageUrl", a.category_id as "categoryId",
        a.author_name as "authorName", a.author_email as "authorEmail",
        a.published, a.featured, a.view_count as "viewCount",
        a.wp_post_id as "wpPostId", a.medium_post_id as "mediumPostId",
        a.seo_meta as "seoMeta", a.affiliate_blocks as "affiliateBlocks",
        a.created_at as "createdAt", a.updated_at as "updatedAt",
        c.name as "categoryName", c.slug as "categorySlug"
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);
    
    const articles = await contentDB.rawQueryAll<Article & { categoryName?: string; categorySlug?: string }>(
      articlesQuery, 
      ...params
    );

    // Add category information to articles
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
      total
    };
  }
);
