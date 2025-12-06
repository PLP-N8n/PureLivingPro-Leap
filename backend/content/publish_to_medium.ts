import { api, APIError } from "encore.dev/api";
import { contentDB } from "./db";
import { publishToMedium as publishToMediumAPI, getMediumUser } from "../integrations/medium";
import { mediumToken } from "./secrets";

interface PublishToMediumRequest {
  articleId: number;
  publishStatus?: 'draft' | 'public';
  canonicalUrl?: string;
}

interface PublishToMediumResponse {
  mediumPostId: string;
  mediumUrl: string;
  publishStatus: string;
}

// Publishes an article to Medium.
export const publishArticleToMedium = api<PublishToMediumRequest, PublishToMediumResponse>(
  { expose: true, method: "POST", path: "/content/publish-to-medium" },
  async (req) => {
    // Get article from database
    const article = await contentDB.queryRow<{
      title: string;
      content: string;
      excerpt?: string;
      slug: string;
      categoryName?: string;
    }>`
      SELECT 
        a.title, a.content, a.excerpt, a.slug,
        c.name as "categoryName"
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ${req.articleId}
    `;

    if (!article) {
      throw APIError.notFound("Article not found");
    }

    try {
      const token = await mediumToken();
      // Get Medium user info
      const mediumUser = await getMediumUser(token);

      // Convert HTML content to Markdown for Medium
      const markdownContent = convertHtmlToMarkdown(article.content);

      // Add affiliate disclosure
      const contentWithDisclosure = `
${markdownContent}

---

**Affiliate Disclosure:** This post contains affiliate links. If you purchase through these links, we may earn a commission at no additional cost to you. We only recommend products we believe will benefit your health journey.
      `;

      // Publish to Medium
      const mediumResponse = await publishToMediumAPI(token, mediumUser.id, {
        title: article.title,
        content: contentWithDisclosure,
        contentFormat: 'markdown',
        publishStatus: req.publishStatus || 'draft',
        tags: article.categoryName ? [article.categoryName, 'wellness', 'health'] : ['wellness', 'health'],
        canonicalUrl: req.canonicalUrl || `https://purelivingpro.com/article/${article.slug}`
      });

      return {
        mediumPostId: mediumResponse.id,
        mediumUrl: mediumResponse.url,
        publishStatus: mediumResponse.publishStatus
      };
    } catch (error) {
      console.error('Medium publishing error:', error);
      throw APIError.internal("Failed to publish to Medium");
    }
  }
);

function convertHtmlToMarkdown(html: string): string {
  // Simple HTML to Markdown conversion
  // In production, you'd want to use a proper library like turndown
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      let counter = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
    })
    .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
    .replace(/\n\n\n+/g, '\n\n') // Clean up extra newlines
    .trim();
}
