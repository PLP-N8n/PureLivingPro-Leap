import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  slug: z.string(),
  description: z.string().optional(),
});

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const ArticleSchema = z.object({
  id: z.number(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string(),
  content: z.string().min(100, "Content must be at least 100 characters"),
  excerpt: z.string().optional(),
  featuredImageUrl: z.string().url().optional(),
  categoryId: z.number().optional(),
  authorName: z.string(),
  authorEmail: z.string().email(),
  published: z.boolean(),
  featured: z.boolean(),
  viewCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: CategorySchema.optional(),
  tags: z.array(TagSchema).optional(),
});

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  slug: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  imageUrl: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  affiliateUrl: z.string().url("A valid affiliate URL is required"),
  program: z.object({
    name: z.string(),
    commissionRate: z.number(),
  }).optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Product = z.infer<typeof ProductSchema>;
