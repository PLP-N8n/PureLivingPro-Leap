import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { contentDB } from "../content/db";
import { affiliateDB } from "../affiliate/db";

interface ScheduleContentRequest {
  topic: string;
  targetKeywords: string[];
  publishDate: Date;
  includeAffiliateProducts: boolean;
  socialPlatforms: string[];
}

interface ScheduledContent {
  id: number;
  topic: string;
  status: string;
  scheduledAt: Date;
  generatedTitle?: string;
  estimatedRevenue: number;
}

interface GetScheduleResponse {
  scheduledContent: ScheduledContent[];
  totalScheduled: number;
  nextPublishDate?: Date;
}

// Schedules content generation and publishing with revenue optimization.
export const scheduleContent = api<ScheduleContentRequest, ScheduledContent>(
  { expose: true, method: "POST", path: "/automation/schedule-content" },
  async (req) => {
    // Calculate estimated revenue based on topic and keywords
    const estimatedRevenue = await calculateEstimatedRevenue(req.topic, req.targetKeywords);
    
    // Find optimal affiliate products for the topic
    const relevantProducts = await affiliateDB.queryAll<{ id: number; name: string; commissionRate: number }>`
      SELECT p.id, p.name, prog.commission_rate as "commissionRate"
      FROM affiliate_products p
      JOIN affiliate_programs prog ON p.program_id = prog.id
      WHERE p.is_active = true
      AND (
        p.name ILIKE ANY(${req.targetKeywords.map(k => `%${k}%`)})
        OR p.description ILIKE ANY(${req.targetKeywords.map(k => `%${k}%`)})
        OR p.category ILIKE ANY(${req.targetKeywords.map(k => `%${k}%`)})
      )
      ORDER BY prog.commission_rate DESC
      LIMIT 5
    `;

    const scheduledContent = await automationDB.queryRow<ScheduledContent>`
      INSERT INTO content_pipeline (
        topic, status, target_keywords, scheduled_publish_at, 
        affiliate_products_inserted, estimated_revenue
      ) VALUES (
        ${req.topic}, 'scheduled', ${req.targetKeywords}, ${req.publishDate.toISOString()},
        ${JSON.stringify(relevantProducts)}, ${estimatedRevenue}
      )
      RETURNING 
        id, topic, status, scheduled_publish_at as "scheduledAt",
        estimated_revenue as "estimatedRevenue"
    `;

    if (!scheduledContent) {
      throw new Error("Failed to schedule content");
    }

    // Schedule social media posts
    if (req.socialPlatforms.length > 0) {
      for (const platform of req.socialPlatforms) {
        const postTime = new Date(req.publishDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours after publish
        await automationDB.exec`
          INSERT INTO social_media_posts (
            platform, post_type, content, scheduled_at, status
          ) VALUES (
            ${platform}, 'text', 'Auto-generated post for: ${req.topic}', 
            ${postTime.toISOString()}, 'scheduled'
          )
        `;
      }
    }

    return scheduledContent;
  }
);

// Retrieves the content publishing schedule with revenue projections.
export const getContentSchedule = api<void, GetScheduleResponse>(
  { expose: true, method: "GET", path: "/automation/content-schedule" },
  async () => {
    const scheduledContent = await automationDB.queryAll<ScheduledContent>`
      SELECT 
        id, topic, status, scheduled_publish_at as "scheduledAt",
        generated_title as "generatedTitle", estimated_revenue as "estimatedRevenue"
      FROM content_pipeline
      WHERE status IN ('scheduled', 'generating', 'reviewing')
      ORDER BY scheduled_publish_at ASC
      LIMIT 20
    `;

    const nextPublish = scheduledContent.find(c => c.status === 'scheduled');

    return {
      scheduledContent,
      totalScheduled: scheduledContent.length,
      nextPublishDate: nextPublish?.scheduledAt
    };
  }
);

// Processes scheduled content for publication.
export const processScheduledContent = api<void, { processed: number; failed: number }>(
  { expose: true, method: "POST", path: "/automation/process-scheduled" },
  async () => {
    const dueContent = await automationDB.queryAll<{
      id: number;
      topic: string;
      targetKeywords: string[];
      affiliateProducts: any[];
    }>`
      SELECT 
        id, topic, target_keywords as "targetKeywords",
        affiliate_products_inserted as "affiliateProducts"
      FROM content_pipeline
      WHERE status = 'scheduled'
      AND scheduled_publish_at <= NOW()
      ORDER BY scheduled_publish_at ASC
      LIMIT 5
    `;

    let processed = 0;
    let failed = 0;

    for (const content of dueContent) {
      try {
        // Update status to generating
        await automationDB.exec`
          UPDATE content_pipeline 
          SET status = 'generating', updated_at = NOW()
          WHERE id = ${content.id}
        `;

        // Generate content using AI
        const { generateContent } = await import('./content_generator');
        const generatedContent = await generateContent({
          topic: content.topic,
          targetKeywords: content.targetKeywords,
          includeAffiliateProducts: true
        });

        // Create article in content service
        const article = await contentDB.queryRow<{ id: number; slug: string }>`
          INSERT INTO articles (
            title, slug, content, excerpt, author_name, author_email, published
          ) VALUES (
            ${generatedContent.title}, 
            ${generateSlug(generatedContent.title)},
            ${generatedContent.content},
            ${generatedContent.excerpt},
            'AI Content Generator',
            'ai@purelivingpro.com',
            true
          )
          RETURNING id, slug
        `;

        if (article) {
          // Update pipeline with published article
          await automationDB.exec`
            UPDATE content_pipeline 
            SET status = 'published', published_article_id = ${article.id},
                generated_title = ${generatedContent.title}, updated_at = NOW()
            WHERE id = ${content.id}
          `;

          processed++;
        } else {
          failed++;
        }

      } catch (error) {
        console.error(`Failed to process content ${content.id}:`, error);
        
        await automationDB.exec`
          UPDATE content_pipeline 
          SET status = 'failed', updated_at = NOW()
          WHERE id = ${content.id}
        `;
        
        failed++;
      }
    }

    return { processed, failed };
  }
);

async function calculateEstimatedRevenue(topic: string, keywords: string[]): Promise<number> {
  // Get historical performance for similar topics
  const historicalData = await automationDB.queryRow<{ avgRevenue: number }>`
    SELECT AVG(estimated_revenue) as "avgRevenue"
    FROM content_pipeline
    WHERE status = 'published'
    AND (
      topic ILIKE ANY(${keywords.map(k => `%${k}%`)})
      OR target_keywords && ${keywords}
    )
  `;

  // Base estimate on historical data or default
  const baseRevenue = historicalData?.avgRevenue || 25.0;
  
  // Adjust based on keyword competitiveness and affiliate product availability
  const keywordMultiplier = keywords.length > 3 ? 1.2 : 1.0;
  
  return Math.round(baseRevenue * keywordMultiplier * 100) / 100;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
