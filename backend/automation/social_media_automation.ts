import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { automationDB } from "./db";
import { contentDB } from "../content/db";

const openAIKey = secret("OpenAIKey");

interface SocialMediaPost {
  platform: string;
  content: string;
  hashtags: string[];
  mediaUrls?: string[];
  scheduledAt: Date;
}

interface GenerateSocialContentRequest {
  articleId: number;
  platforms: string[];
}

interface GenerateSocialContentResponse {
  posts: SocialMediaPost[];
}

interface PublishPostsResponse {
  published: number;
  failed: number;
}

// Generates social media content from published articles.
export const generateSocialContent = api<GenerateSocialContentRequest, GenerateSocialContentResponse>(
  { expose: true, method: "POST", path: "/automation/generate-social" },
  async (req) => {
    const article = await contentDB.queryRow<{
      title: string;
      excerpt: string;
      slug: string;
      category: string;
    }>`
      SELECT 
        a.title, a.excerpt, a.slug,
        c.name as category
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ${req.articleId} AND a.published = true
    `;

    if (!article) {
      throw new Error("Article not found or not published");
    }

    const posts: SocialMediaPost[] = [];
    const baseUrl = "https://purelivingpro.com";
    const articleUrl = `${baseUrl}/article/${article.slug}`;

    for (const platform of req.platforms) {
      const post = await generatePlatformContent(platform, article, articleUrl);
      if (post) {
        posts.push(post);
        
        // Store in database
        await automationDB.exec`
          INSERT INTO social_media_posts (
            article_id, platform, post_type, content, hashtags, scheduled_at
          ) VALUES (
            ${req.articleId}, ${platform}, 'text', ${post.content}, 
            ${post.hashtags}, ${post.scheduledAt}
          )
        `;
      }
    }

    return { posts };
  }
);

async function generatePlatformContent(
  platform: string, 
  article: any, 
  articleUrl: string
): Promise<SocialMediaPost | null> {
  const apiKey = openAIKey();
  
  const platformSpecs = {
    pinterest: {
      maxLength: 500,
      style: "inspirational and visual",
      hashtags: 10,
      cta: "Save this pin!"
    },
    instagram: {
      maxLength: 2200,
      style: "engaging and personal",
      hashtags: 15,
      cta: "Link in bio!"
    },
    tiktok: {
      maxLength: 150,
      style: "trendy and energetic",
      hashtags: 5,
      cta: "Check our bio!"
    },
    twitter: {
      maxLength: 280,
      style: "concise and informative",
      hashtags: 3,
      cta: "Read more:"
    },
    medium: {
      maxLength: 200,
      style: "professional and thoughtful",
      hashtags: 5,
      cta: "Continue reading"
    }
  };

  const spec = platformSpecs[platform];
  if (!spec) return null;

  try {
    if (apiKey) {
      const prompt = `Create a ${platform} post for this article:
      Title: ${article.title}
      Excerpt: ${article.excerpt}
      Category: ${article.category}
      
      Requirements:
      - Max ${spec.maxLength} characters
      - ${spec.style} tone
      - Include ${spec.hashtags} relevant hashtags
      - End with: ${spec.cta}
      - Focus on health/wellness audience
      
      Return JSON: {content: "post text", hashtags: ["tag1", "tag2"]}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.choices[0]?.message?.content || '{}');
        
        return {
          platform,
          content: result.content + (platform === 'twitter' ? ` ${articleUrl}` : ''),
          hashtags: result.hashtags || [],
          scheduledAt: getOptimalPostTime(platform)
        };
      }
    }

    // Fallback content generation
    return generateFallbackSocialContent(platform, article, articleUrl, spec);

  } catch (error) {
    console.error(`Error generating ${platform} content:`, error);
    return generateFallbackSocialContent(platform, article, articleUrl, spec);
  }
}

function generateFallbackSocialContent(
  platform: string, 
  article: any, 
  articleUrl: string, 
  spec: any
): SocialMediaPost {
  const baseHashtags = ['#wellness', '#health', '#pureliving', '#mindfulness'];
  const categoryHashtags = {
    'nutrition': ['#nutrition', '#healthyeating', '#superfood'],
    'fitness': ['#fitness', '#workout', '#exercise'],
    'wellness': ['#selfcare', '#mentalhealth', '#balance'],
    'recipes': ['#healthyrecipes', '#cleaneating', '#wholefood']
  };

  const hashtags = [
    ...baseHashtags,
    ...(categoryHashtags[article.category?.toLowerCase()] || [])
  ].slice(0, spec.hashtags);

  let content = `${article.title}\n\n${article.excerpt?.substring(0, 100)}...\n\n${spec.cta}`;
  
  if (platform === 'twitter') {
    content = `${article.title}\n\n${spec.cta} ${articleUrl}`;
  }

  return {
    platform,
    content: content.substring(0, spec.maxLength),
    hashtags,
    scheduledAt: getOptimalPostTime(platform)
  };
}

function getOptimalPostTime(platform: string): Date {
  const now = new Date();
  const optimal = {
    pinterest: { hour: 20, delay: 2 }, // 8 PM, 2 hours from now
    instagram: { hour: 18, delay: 1 }, // 6 PM, 1 hour from now
    tiktok: { hour: 19, delay: 3 }, // 7 PM, 3 hours from now
    twitter: { hour: 12, delay: 0.5 }, // 12 PM, 30 minutes from now
    medium: { hour: 10, delay: 4 } // 10 AM next day, 4 hours from now
  };

  const config = optimal[platform] || { hour: 12, delay: 1 };
  const scheduledTime = new Date(now.getTime() + (config.delay * 60 * 60 * 1000));
  
  return scheduledTime;
}

// Publishes scheduled social media posts.
export const publishScheduledPosts = api<void, PublishPostsResponse>(
  { expose: true, method: "POST", path: "/automation/publish-social" },
  async () => {
    const pendingPosts = await automationDB.queryAll<{
      id: number;
      platform: string;
      content: string;
      hashtags: string[];
    }>`
      SELECT id, platform, content, hashtags
      FROM social_media_posts
      WHERE status = 'scheduled'
      AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
      LIMIT 10
    `;

    let published = 0;
    let failed = 0;

    for (const post of pendingPosts) {
      try {
        // Here you would integrate with actual social media APIs
        // For now, we'll simulate successful posting
        const success = await simulatePostPublishing(post);
        
        if (success) {
          await automationDB.exec`
            UPDATE social_media_posts 
            SET status = 'posted', posted_at = NOW()
            WHERE id = ${post.id}
          `;
          published++;
        } else {
          await automationDB.exec`
            UPDATE social_media_posts 
            SET status = 'failed'
            WHERE id = ${post.id}
          `;
          failed++;
        }
      } catch (error) {
        console.error(`Failed to publish post ${post.id}:`, error);
        failed++;
      }
    }

    return { published, failed };
  }
);

async function simulatePostPublishing(post: any): Promise<boolean> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 95% success rate
  return Math.random() > 0.05;
}
