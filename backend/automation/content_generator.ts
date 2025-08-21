import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { contentDB } from "../content/db";
import { affiliateDB } from "../affiliate/db";
import { openAIKey } from "./secrets";

interface GenerateContentRequest {
  topic: string;
  targetKeywords: string[];
  includeAffiliateProducts?: boolean;
}

interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
  seoScore: number;
  suggestedProducts: Array<{
    id: number;
    placement: string;
    reason: string;
  }>;
}

// Generates SEO-optimized content with affiliate product integration.
export const generateContent = api<GenerateContentRequest, GeneratedContent>(
  { expose: true, method: "POST", path: "/automation/generate-content" },
  async (req) => {
    const apiKey = openAIKey();
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Get relevant affiliate products for the topic
    const products = await affiliateDB.queryAll<{
      id: number;
      name: string;
      description: string;
      category: string;
      price: number;
    }>`
      SELECT id, name, description, category, price
      FROM affiliate_products
      WHERE is_active = true
      AND (
        category ILIKE ANY(${req.targetKeywords.map(k => `%${k}%`)})
        OR name ILIKE ANY(${req.targetKeywords.map(k => `%${k}%`)})
        OR description ILIKE ANY(${req.targetKeywords.map(k => `%${k}%`)})
      )
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const systemPrompt = `You are an expert health and wellness content writer for PureLivingPro. 
    Create comprehensive, SEO-optimized articles that naturally integrate affiliate product recommendations.
    
    REQUIREMENTS:
    - Write 1500-2000 words
    - Use target keywords naturally (density 1-2%)
    - Include H2 and H3 subheadings
    - Add product recommendations in context
    - Include actionable tips and advice
    - Maintain conversational, helpful tone
    - Add FAQ section at the end
    
    TARGET KEYWORDS: ${req.targetKeywords.join(", ")}
    AVAILABLE PRODUCTS: ${products.map(p => `${p.name} (${p.category}) - £${p.price}`).join(", ")}
    
    Format as JSON with: title, content (HTML), excerpt, productPlacements (array of {productId, placement, reason})`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Write an article about: ${req.topic}` }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      // Parse JSON response
      const parsed = JSON.parse(aiResponse);
      
      // Calculate SEO score
      const seoScore = calculateSEOScore(parsed.content, req.targetKeywords);
      
      // Store in pipeline
      await automationDB.exec`
        INSERT INTO content_pipeline (
          topic, status, target_keywords, generated_title, generated_content,
          affiliate_products_inserted, seo_score
        ) VALUES (
          ${req.topic}, 'reviewing', ${req.targetKeywords}, ${parsed.title},
          ${parsed.content}, ${JSON.stringify(parsed.productPlacements)}, ${seoScore}
        )
      `;

      return {
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt,
        seoScore,
        suggestedProducts: parsed.productPlacements || []
      };

    } catch (error) {
      console.error('Content generation error:', error);
      
      // Fallback content generation
      const fallbackContent = generateFallbackContent(req.topic, req.targetKeywords, products);
      
      await automationDB.exec`
        INSERT INTO content_pipeline (
          topic, status, target_keywords, generated_title, generated_content, seo_score
        ) VALUES (
          ${req.topic}, 'failed', ${req.targetKeywords}, ${fallbackContent.title},
          ${fallbackContent.content}, 50
        )
      `;
      
      return fallbackContent;
    }
  }
);

function calculateSEOScore(content: string, keywords: string[]): number {
  let score = 0;
  const contentLower = content.toLowerCase();
  
  // Check keyword density
  keywords.forEach(keyword => {
    const keywordCount = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const density = (keywordCount / content.split(' ').length) * 100;
    if (density >= 1 && density <= 2) score += 20;
  });
  
  // Check structure
  if (content.includes('<h2>')) score += 15;
  if (content.includes('<h3>')) score += 10;
  if (content.includes('<ul>') || content.includes('<ol>')) score += 10;
  if (content.length > 1500) score += 15;
  if (content.includes('FAQ')) score += 10;
  
  return Math.min(score, 100);
}

function generateFallbackContent(topic: string, keywords: string[], products: any[]): GeneratedContent {
  const title = `The Complete Guide to ${topic}`;
  const content = `
    <h2>Introduction to ${topic}</h2>
    <p>Welcome to your comprehensive guide on ${topic}. This article covers everything you need to know about ${keywords.join(", ")}.</p>
    
    <h2>Key Benefits</h2>
    <ul>
      <li>Improved overall wellness</li>
      <li>Better understanding of ${keywords[0]}</li>
      <li>Practical tips for daily implementation</li>
    </ul>
    
    <h2>Recommended Products</h2>
    ${products.slice(0, 2).map(p => `
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>Price: £${p.price}</strong></p>
    `).join('')}
    
    <h2>Conclusion</h2>
    <p>Implementing these strategies for ${topic} can significantly improve your wellness journey.</p>
  `;
  
  return {
    title,
    content,
    excerpt: `Discover everything you need to know about ${topic} with our comprehensive guide.`,
    seoScore: 60,
    suggestedProducts: products.slice(0, 2).map(p => ({
      id: p.id,
      placement: "middle",
      reason: "Relevant to topic"
    }))
  };
}
