import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { contentDB } from "./db";
import type { ListArticlesResponse, Article } from "./types";

interface SearchArticlesRequest {
  query: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
  categoryId?: Query<number>;
}

// Searches articles by title, content, and tags with full-text search capabilities.
export const searchArticles = api<SearchArticlesRequest, ListArticlesResponse>(
  { expose: true, method: "GET", path: "/articles/search" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    const searchQuery = req.query.trim();

    if (!searchQuery) {
      return { articles: [], total: 0 };
    }

    let whereConditions = ["a.published = true"];
    let params: any[] = [];
    let paramIndex = 1;

    // Add full-text search conditions
    whereConditions.push(`(
      a.title ILIKE $${paramIndex++} OR 
      a.content ILIKE $${paramIndex++} OR 
      a.excerpt ILIKE $${paramIndex++} OR
      EXISTS (
        SELECT 1 FROM tags t 
        JOIN article_tags at ON t.id = at.tag_id 
        WHERE at.article_id = a.id AND t.name ILIKE $${paramIndex++}
      )
    )`);
    
    const searchTerm = `%${searchQuery}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);

    if (req.categoryId) {
      whereConditions.push(`a.category_id = $${paramIndex++}`);
      params.push(req.categoryId);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM articles a
      ${whereClause}
    `;
    
    const countResult = await contentDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get articles with relevance scoring
    const articlesQuery = `
      SELECT 
        a.id, a.title, a.slug, a.content, a.excerpt,
        a.featured_image_url as "featuredImageUrl", a.category_id as "categoryId",
        a.author_name as "authorName", a.author_email as "authorEmail",
        a.published, a.featured, a.view_count as "viewCount",
        a.created_at as "createdAt", a.updated_at as "updatedAt",
        c.name as "categoryName", c.slug as "categorySlug",
        (
          CASE 
            WHEN a.title ILIKE $${paramIndex++} THEN 3
            WHEN a.excerpt ILIKE $${paramIndex++} THEN 2
            ELSE 1
          END
        ) as relevance
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY relevance DESC, a.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(searchTerm, searchTerm, limit, offset);
    
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
