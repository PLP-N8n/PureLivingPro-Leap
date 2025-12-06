import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";
import type { Article } from "./types";

interface GetArticleParams {
  slug: string;
}

// Retrieves a single article by slug and increments view count.
export const getArticle = api<GetArticleParams, Article>(
  { expose: true, method: "GET", path: "/articles/by-slug/:slug" },
  async ({ slug }) => {
    // Get article with category
    const article = await contentDB.queryRow<Article & { categoryName?: string; categorySlug?: string }>`
      SELECT 
        a.id, a.title, a.slug, a.content, a.excerpt,
        a.featured_image_url as "featuredImageUrl", a.category_id as "categoryId",
        a.author_name as "authorName", a.author_email as "authorEmail",
        a.published, a.featured, a.view_count as "viewCount",
        a.created_at as "createdAt", a.updated_at as "updatedAt",
        c.name as "categoryName", c.slug as "categorySlug"
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.slug = ${slug}
    `;

    if (!article) {
      throw APIError.notFound("Article not found");
    }

    // Get tags for the article
    const tags = await contentDB.queryAll<{ id: number; name: string; slug: string }>`
      SELECT t.id, t.name, t.slug
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ${article.id}
    `;

    // Increment view count
    await contentDB.exec`
      UPDATE articles SET view_count = view_count + 1 WHERE id = ${article.id}
    `;

    return {
      ...article,
      viewCount: article.viewCount + 1,
      category: article.categoryName ? {
        id: article.categoryId!,
        name: article.categoryName,
        slug: article.categorySlug!,
        createdAt: new Date()
      } : undefined,
      tags: tags.map(tag => ({ ...tag, createdAt: new Date() }))
    };
  }
);
