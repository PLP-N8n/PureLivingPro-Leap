import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";
import type { CreateArticleRequest, Article } from "./types";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Creates a new article.
export const createArticle = api<CreateArticleRequest, Article>(
  { expose: true, method: "POST", path: "/articles" },
  async (req) => {
    const slug = generateSlug(req.title);
    
    // Check if slug already exists
    const existingArticle = await contentDB.queryRow`
      SELECT id FROM articles WHERE slug = ${slug}
    `;
    
    if (existingArticle) {
      throw APIError.alreadyExists("An article with this title already exists");
    }

    // Create the article
    const article = await contentDB.queryRow<Article>`
      INSERT INTO articles (
        title, slug, content, excerpt, featured_image_url, category_id,
        author_name, author_email, published, featured
      ) VALUES (
        ${req.title}, ${slug}, ${req.content}, ${req.excerpt || null},
        ${req.featuredImageUrl || null}, ${req.categoryId || null},
        ${req.authorName}, ${req.authorEmail}, ${req.published || false}, ${req.featured || false}
      )
      RETURNING id, title, slug, content, excerpt, featured_image_url as "featuredImageUrl",
                category_id as "categoryId", author_name as "authorName", author_email as "authorEmail",
                published, featured, view_count as "viewCount", wp_post_id as "wpPostId", 
                medium_post_id as "mediumPostId", seo_meta as "seoMeta", affiliate_blocks as "affiliateBlocks",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (!article) {
      throw APIError.internal("Failed to create article");
    }

    // Add tags if provided
    if (req.tagIds && req.tagIds.length > 0) {
      for (const tagId of req.tagIds) {
        await contentDB.exec`
          INSERT INTO article_tags (article_id, tag_id) VALUES (${article.id}, ${tagId})
        `;
      }
    }

    return article;
  }
);
