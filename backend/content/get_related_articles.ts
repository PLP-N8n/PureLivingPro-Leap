import { api } from "encore.dev/api";
import { contentDB } from "./db";
import type { ListArticlesResponse, Article } from "./types";

interface GetRelatedArticlesParams {
  slug: string;
}

interface GetRelatedArticlesRequest {
  limit?: number;
}

// Retrieves articles related to the given article based on category and tags.
export const getRelatedArticles = api<GetRelatedArticlesParams & GetRelatedArticlesRequest, ListArticlesResponse>(
  { expose: true, method: "GET", path: "/articles/:slug/related" },
  async ({ slug, limit = 5 }) => {
    // First get the current article's category and tags
    const currentArticle = await contentDB.queryRow<{ id: number; categoryId?: number }>`
      SELECT id, category_id as "categoryId"
      FROM articles 
      WHERE slug = ${slug} AND published = true
    `;

    if (!currentArticle) {
      return { articles: [], total: 0 };
    }

    // Get related articles based on category and tags
    const articles = await contentDB.rawQueryAll<Article & { categoryName?: string; categorySlug?: string }>`
      SELECT DISTINCT
        a.id, a.title, a.slug, a.content, a.excerpt,
        a.featured_image_url as "featuredImageUrl", a.category_id as "categoryId",
        a.author_name as "authorName", a.author_email as "authorEmail",
        a.published, a.featured, a.view_count as "viewCount",
        a.created_at as "createdAt", a.updated_at as "updatedAt",
        c.name as "categoryName", c.slug as "categorySlug",
        (
          CASE 
            WHEN a.category_id = ${currentArticle.categoryId || null} THEN 2
            WHEN EXISTS (
              SELECT 1 FROM article_tags at1 
              JOIN article_tags at2 ON at1.tag_id = at2.tag_id 
              WHERE at1.article_id = ${currentArticle.id} AND at2.article_id = a.id
            ) THEN 1
            ELSE 0
          END
        ) as relevance
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = true 
        AND a.id != ${currentArticle.id}
        AND (
          a.category_id = ${currentArticle.categoryId || null}
          OR EXISTS (
            SELECT 1 FROM article_tags at1 
            JOIN article_tags at2 ON at1.tag_id = at2.tag_id 
            WHERE at1.article_id = ${currentArticle.id} AND at2.article_id = a.id
          )
        )
      ORDER BY relevance DESC, a.created_at DESC
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
