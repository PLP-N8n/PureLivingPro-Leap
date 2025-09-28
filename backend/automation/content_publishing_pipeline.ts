import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { contentDB } from "../content/db";
import { generateContent } from "./content_generator";
import { optimizeArticleContent } from "./ai_content_optimizer";
import { publishToMedium as publishToMediumAPI } from "../integrations/medium";
import { createWordPressPost } from "../integrations/wordpress";
import { mediumToken } from "../content/secrets";
import { wordpressUrl, wordpressUsername, wordpressPassword } from "../content/secrets";
import { searchAmazonProducts } from "./amazon_product_sync";

interface ContentPipelineRequest {
  topics: string[];
  autoPublish?: boolean;
  platforms?: ('medium' | 'wordpress')[];
  includeAffiliateProducts?: boolean;
}

interface PipelineResult {
  topic: string;
  articleId?: number;
  generationStatus: 'success' | 'failed';
  optimizationStatus: 'success' | 'failed' | 'skipped';
  publishingStatus: {
    medium?: 'success' | 'failed' | 'skipped';
    wordpress?: 'success' | 'failed' | 'skipped';
  };
  errors: string[];
}

interface ContentPipelineResponse {
  totalTopics: number;
  successful: number;
  failed: number;
  results: PipelineResult[];
}

export const runContentPipeline = api<ContentPipelineRequest, ContentPipelineResponse>(
  { expose: true, method: "POST", path: "/automation/content-pipeline" },
  async (req) => {
    const results: PipelineResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const topic of req.topics) {
      const result: PipelineResult = {
        topic,
        generationStatus: 'failed',
        optimizationStatus: 'skipped',
        publishingStatus: {},
        errors: []
      };

      try {
        // Step 1: Generate content with AI
        console.log(`Generating content for: ${topic}`);
        const keywords = await extractKeywords(topic);
        
        const generatedContent = await generateContent({
          topic,
          targetKeywords: keywords,
          includeAffiliateProducts: req.includeAffiliateProducts
        });

        result.generationStatus = 'success';

        // Step 2: Create article in database
        const articleResult = await contentDB.queryRow<{ id: number }>`
          INSERT INTO articles (
            title, content, excerpt, slug, published, created_at, updated_at
          ) VALUES (
            ${generatedContent.title},
            ${generatedContent.content},
            ${generatedContent.excerpt},
            ${createSlug(generatedContent.title)},
            ${req.autoPublish || false},
            NOW(),
            NOW()
          )
          RETURNING id
        `;

        if (!articleResult) {
          throw new Error('Failed to create article in database');
        }

        result.articleId = articleResult.id;

        // Step 3: Optimize content if requested
        if (req.includeAffiliateProducts) {
          try {
            await optimizeArticleContent({
              articleId: articleResult.id,
              optimizationType: 'affiliate'
            });
            result.optimizationStatus = 'success';
          } catch (error) {
            result.optimizationStatus = 'failed';
            result.errors.push(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Step 4: Publish to platforms if auto-publish is enabled
        if (req.autoPublish && req.platforms) {
          if (req.platforms.includes('medium')) {
            try {
              const token = await mediumToken();
              if (token) {
                const mediumUser = await getMediumUser(token);
                await publishToMediumAPI(token, mediumUser.id, {
                  title: generatedContent.title,
                  content: generatedContent.content,
                  contentFormat: 'html',
                  publishStatus: 'draft',
                  tags: keywords.slice(0, 3)
                });
                result.publishingStatus.medium = 'success';
              } else {
                result.publishingStatus.medium = 'skipped';
                result.errors.push('Medium token not configured');
              }
            } catch (error) {
              result.publishingStatus.medium = 'failed';
              result.errors.push(`Medium publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }

          if (req.platforms.includes('wordpress')) {
            try {
              const wpUrl = await wordpressUrl();
              const wpUsername = await wordpressUsername();
              const wpPassword = await wordpressPassword();

              if (wpUrl && wpUsername && wpPassword) {
                await createWordPressPost(
                  { baseUrl: wpUrl, username: wpUsername, password: wpPassword },
                  {
                    title: generatedContent.title,
                    content: generatedContent.content,
                    excerpt: generatedContent.excerpt,
                    status: 'draft'
                  }
                );
                result.publishingStatus.wordpress = 'success';
              } else {
                result.publishingStatus.wordpress = 'skipped';
                result.errors.push('WordPress credentials not configured');
              }
            } catch (error) {
              result.publishingStatus.wordpress = 'failed';
              result.errors.push(`WordPress publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }

        successful++;

      } catch (error) {
        result.generationStatus = 'failed';
        result.errors.push(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failed++;
      }

      results.push(result);

      // Add delay between requests to respect rate limits
      if (req.topics.indexOf(topic) < req.topics.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Log pipeline run
    await automationDB.exec`
      INSERT INTO pipeline_runs (
        topics, successful, failed, auto_publish, platforms, results
      ) VALUES (
        ${req.topics}, ${successful}, ${failed}, ${req.autoPublish || false},
        ${JSON.stringify(req.platforms || [])}, ${JSON.stringify(results)}
      )
    `;

    return {
      totalTopics: req.topics.length,
      successful,
      failed,
      results
    };
  }
);

export const scheduleContentGeneration = api<{
  schedule: 'daily' | 'weekly' | 'monthly';
  topicsPerRun: number;
  autoPublish?: boolean;
  platforms?: ('medium' | 'wordpress')[];
}, { scheduleName: string; nextRun: string }>(
  { expose: true, method: "POST", path: "/automation/schedule-content-generation" },
  async (req) => {
    const cronExpressions = {
      'daily': '0 9 * * *',     // 9 AM daily
      'weekly': '0 9 * * 1',    // 9 AM every Monday
      'monthly': '0 9 1 * *'    // 9 AM first day of month
    };

    const scheduleName = `Content Generation - ${req.schedule}`;
    const cronExpression = cronExpressions[req.schedule];

    await automationDB.exec`
      INSERT INTO automation_schedules (name, type, cron_expression, config, is_active)
      VALUES (
        ${scheduleName},
        'content_generation',
        ${cronExpression},
        ${JSON.stringify({
          topicsPerRun: req.topicsPerRun,
          autoPublish: req.autoPublish || false,
          platforms: req.platforms || [],
          includeAffiliateProducts: true
        })},
        true
      )
      ON CONFLICT (name) DO UPDATE SET
        cron_expression = EXCLUDED.cron_expression,
        config = EXCLUDED.config,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `;

    // Calculate next run time
    const nextRun = calculateNextRunTime(cronExpression);

    return {
      scheduleName,
      nextRun
    };
  }
);

export const enhanceContentWithProducts = api<{
  articleId: number;
  category?: string;
}, {
  productsAdded: number;
  estimatedRevenue: number;
}>(
  { expose: true, method: "POST", path: "/automation/enhance-content-products" },
  async (req) => {
    try {
      // Get article details
      const article = await contentDB.queryRow<{
        title: string;
        content: string;
        categoryName?: string;
      }>`
        SELECT 
          a.title, a.content,
          c.name as "categoryName"
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = ${req.articleId}
      `;

      if (!article) {
        throw new Error('Article not found');
      }

      // Extract keywords from title and content
      const keywords = extractKeywordsFromText(article.title + ' ' + article.content);
      const category = req.category || article.categoryName || 'health';

      // Search for relevant Amazon products
      const searchResult = await searchAmazonProducts({
        keywords: keywords.slice(0, 2).join(' '), // Use top 2 keywords
        category: category.toLowerCase(),
        maxResults: 3
      });
      const products = searchResult.products;

      let productsAdded = 0;
      let estimatedRevenue = 0;

      // Add product recommendations to content
      if (products.length > 0) {
        const productSection = `
          <div class="recommended-products">
            <h3>Recommended Products</h3>
            ${products.map(product => `
              <div class="product-recommendation" style="border: 1px solid #e0e0e0; padding: 15px; margin: 10px 0; border-radius: 8px;">
                <h4>${product.title}</h4>
                ${product.description ? `<p>${product.description}</p>` : ''}
                ${product.price ? `<p class="price" style="font-weight: bold; color: #ff9800;">£${product.price}</p>` : ''}
                <a href="/r/amazon-${product.asin}" class="affiliate-link" style="background: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View on Amazon</a>
              </div>
            `).join('')}
          </div>
        `;

        // Update article content
        const updatedContent = article.content + productSection;
        
        await contentDB.exec`
          UPDATE articles 
          SET content = ${updatedContent}, updated_at = NOW()
          WHERE id = ${req.articleId}
        `;

        productsAdded = products.length;
        estimatedRevenue = products.reduce((sum, p) => sum + (p.price || 20) * 0.05, 0); // Assume 5% commission
      }

      return {
        productsAdded,
        estimatedRevenue
      };

    } catch (error) {
      console.error('Content enhancement error:', error);
      throw new Error(`Failed to enhance content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

async function extractKeywords(topic: string): Promise<string[]> {
  // Get related keywords from successful content
  const relatedKeywords = await automationDB.queryAll<{ keyword: string }>`
    SELECT DISTINCT unnest(target_keywords) as keyword
    FROM content_pipeline
    WHERE topic ILIKE ${`%${topic}%`}
    AND status = 'published'
    LIMIT 5
  `;

  if (relatedKeywords.length > 0) {
    return relatedKeywords.map(k => k.keyword);
  }

  // Fallback to topic-based keywords
  const topicWords = topic.toLowerCase().split(' ');
  const healthKeywords = ['wellness', 'health', 'natural', 'lifestyle', 'tips'];
  
  return [...topicWords, ...healthKeywords.slice(0, 3)];
}

function extractKeywordsFromText(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'about'].includes(word));

  // Get most frequent words
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function calculateNextRunTime(cronExpression: string): string {
  // Simplified next run calculation
  const now = new Date();
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');

  if (dayOfWeek !== '*') {
    // Weekly schedule
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    nextWeek.setHours(parseInt(hour), parseInt(minute), 0, 0);
    return nextWeek.toISOString();
  } else if (dayOfMonth !== '*') {
    // Monthly schedule
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, parseInt(dayOfMonth));
    nextMonth.setHours(parseInt(hour), parseInt(minute), 0, 0);
    return nextMonth.toISOString();
  } else {
    // Daily schedule
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(parseInt(hour), parseInt(minute), 0, 0);
    return tomorrow.toISOString();
  }
}

// Import the required function - this would normally be imported from the medium integration
async function getMediumUser(token: string): Promise<{ id: string; username: string; name: string }> {
  const response = await fetch('https://api.medium.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Medium API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}