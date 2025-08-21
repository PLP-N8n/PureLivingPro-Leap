import { api } from "encore.dev/api";
import { contentDB } from "./db";

interface SampleContentResponse {
  message: string;
  created: {
    categories: number;
    articles: number;
    tags: number;
  };
}

// Creates sample content for development and testing purposes.
export const createSampleContent = api<void, SampleContentResponse>(
  { expose: true, method: "POST", path: "/admin/sample-content" },
  async () => {
    // Create sample categories
    const categories = [
      { name: "Nutrition", description: "Expert nutrition advice and healthy eating tips", slug: "nutrition" },
      { name: "Fitness", description: "Workout routines and fitness guidance", slug: "fitness" },
      { name: "Wellness", description: "Mental health and overall wellness strategies", slug: "wellness" },
      { name: "Recipes", description: "Healthy and delicious recipe ideas", slug: "recipes" },
      { name: "Supplements", description: "Guide to vitamins and supplements", slug: "supplements" }
    ];

    let categoriesCreated = 0;
    for (const category of categories) {
      try {
        await contentDB.exec`
          INSERT INTO categories (name, description, slug)
          VALUES (${category.name}, ${category.description}, ${category.slug})
          ON CONFLICT (slug) DO NOTHING
        `;
        categoriesCreated++;
      } catch (error) {
        console.warn(`Failed to create category ${category.name}:`, error);
      }
    }

    // Create sample tags
    const tags = [
      "healthy-living", "weight-loss", "muscle-building", "heart-health", 
      "mental-wellness", "organic", "plant-based", "keto", "mediterranean", 
      "yoga", "cardio", "strength-training", "mindfulness", "sleep"
    ];

    let tagsCreated = 0;
    for (const tag of tags) {
      try {
        await contentDB.exec`
          INSERT INTO tags (name, slug)
          VALUES (${tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}, ${tag})
          ON CONFLICT (slug) DO NOTHING
        `;
        tagsCreated++;
      } catch (error) {
        console.warn(`Failed to create tag ${tag}:`, error);
      }
    }

    // Get category IDs for articles
    const nutritionCategory = await contentDB.queryRow<{ id: number }>`
      SELECT id FROM categories WHERE slug = 'nutrition'
    `;
    const fitnessCategory = await contentDB.queryRow<{ id: number }>`
      SELECT id FROM categories WHERE slug = 'fitness'
    `;
    const wellnessCategory = await contentDB.queryRow<{ id: number }>`
      SELECT id FROM categories WHERE slug = 'wellness'
    `;

    // Create sample articles
    const articles = [
      {
        title: "10 Superfoods That Will Transform Your Health",
        slug: "10-superfoods-transform-health",
        content: `<h2>Discover the Power of Superfoods</h2>
        <p>Superfoods are nutrient-dense foods that provide exceptional health benefits. Here are 10 superfoods that can transform your health:</p>
        <h3>1. Blueberries</h3>
        <p>Packed with antioxidants and vitamin C, blueberries support brain health and immune function.</p>
        <h3>2. Salmon</h3>
        <p>Rich in omega-3 fatty acids, salmon promotes heart health and reduces inflammation.</p>
        <h3>3. Quinoa</h3>
        <p>A complete protein source that provides all essential amino acids.</p>
        <p>Incorporating these superfoods into your daily diet can lead to improved energy, better digestion, and enhanced overall wellness.</p>`,
        excerpt: "Discover 10 nutrient-dense superfoods that can revolutionize your health and boost your energy levels naturally.",
        categoryId: nutritionCategory?.id,
        authorName: "Dr. Sarah Johnson",
        authorEmail: "sarah@purelivingpro.com",
        published: true,
        featured: true,
        featuredImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800"
      },
      {
        title: "The Ultimate Beginner's Guide to Home Workouts",
        slug: "ultimate-beginners-guide-home-workouts",
        content: `<h2>Start Your Fitness Journey at Home</h2>
        <p>You don't need a gym membership to get fit. This comprehensive guide will help you create an effective workout routine from the comfort of your home.</p>
        <h3>Essential Equipment</h3>
        <ul>
        <li>Yoga mat</li>
        <li>Resistance bands</li>
        <li>Dumbbells (adjustable)</li>
        <li>Stability ball</li>
        </ul>
        <h3>Sample Workout Routine</h3>
        <p>Start with 3 days per week, 30 minutes per session. Focus on compound movements that work multiple muscle groups.</p>`,
        excerpt: "Everything you need to know to start an effective home workout routine, including equipment recommendations and sample exercises.",
        categoryId: fitnessCategory?.id,
        authorName: "Mike Thompson",
        authorEmail: "mike@purelivingpro.com",
        published: true,
        featured: false,
        featuredImageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
      },
      {
        title: "5 Mindfulness Techniques for Stress Relief",
        slug: "5-mindfulness-techniques-stress-relief",
        content: `<h2>Find Peace in a Busy World</h2>
        <p>Stress is a common part of modern life, but mindfulness techniques can help you find calm and clarity.</p>
        <h3>1. Deep Breathing</h3>
        <p>Practice the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.</p>
        <h3>2. Body Scan Meditation</h3>
        <p>Systematically focus on each part of your body to release tension.</p>
        <h3>3. Mindful Walking</h3>
        <p>Pay attention to each step and your surroundings during a slow walk.</p>`,
        excerpt: "Learn simple yet powerful mindfulness techniques that can help reduce stress and improve your mental well-being.",
        categoryId: wellnessCategory?.id,
        authorName: "Dr. Emily Chen",
        authorEmail: "emily@purelivingpro.com",
        published: true,
        featured: true,
        featuredImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
      }
    ];

    let articlesCreated = 0;
    for (const article of articles) {
      try {
        await contentDB.exec`
          INSERT INTO articles (
            title, slug, content, excerpt, featured_image_url, category_id,
            author_name, author_email, published, featured
          ) VALUES (
            ${article.title}, ${article.slug}, ${article.content}, ${article.excerpt},
            ${article.featuredImageUrl}, ${article.categoryId}, ${article.authorName},
            ${article.authorEmail}, ${article.published}, ${article.featured}
          )
          ON CONFLICT (slug) DO NOTHING
        `;
        articlesCreated++;
      } catch (error) {
        console.warn(`Failed to create article ${article.title}:`, error);
      }
    }

    return {
      message: "Sample content created successfully",
      created: {
        categories: categoriesCreated,
        articles: articlesCreated,
        tags: tagsCreated
      }
    };
  }
);
