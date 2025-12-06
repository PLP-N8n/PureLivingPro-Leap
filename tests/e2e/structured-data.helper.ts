import { Page, expect } from '@playwright/test';
import { z } from 'zod';

const BreadcrumbListSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('BreadcrumbList'),
  itemListElement: z.array(z.object({
    '@type': z.literal('ListItem'),
    position: z.number().int().positive(),
    name: z.string().min(1),
    item: z.string().url().optional(),
  })).min(1),
});

const ArticleSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('Article'),
  headline: z.string().min(1),
  author: z.object({
    '@type': z.literal('Person'),
    name: z.string().min(1),
  }),
  datePublished: z.string().datetime(),
  dateModified: z.string().datetime(),
  image: z.string().url().optional(),
});

const ProductSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('Product'),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().optional(),
  offers: z.object({
    '@type': z.literal('Offer'),
    price: z.string().optional(),
    priceCurrency: z.string(),
    availability: z.string().url(),
    url: z.string().url(),
  }).optional(),
});

async function getStructuredData(page: Page, type: 'Article' | 'BreadcrumbList' | 'Product') {
  const ldJsonElements = await page.locator('script[type="application/ld+json"]').all();
  for (const element of ldJsonElements) {
    const ldJsonText = await element.textContent();
    if (ldJsonText) {
      try {
        const data = JSON.parse(ldJsonText);
        if (data['@type'] === type) {
          return data;
        }
      } catch (e) {
        console.error('Failed to parse JSON-LD:', ldJsonText);
      }
    }
  }
  return null;
}

export async function validateBreadcrumbs(page: Page) {
  const data = await getStructuredData(page, 'BreadcrumbList');
  expect(data, 'BreadcrumbList schema not found on page').not.toBeNull();
  const result = BreadcrumbListSchema.safeParse(data);
  expect(result.success, `Breadcrumb schema validation failed: ${result.error?.message}`).toBe(true);
}

export async function validateArticleSchema(page: Page) {
  const data = await getStructuredData(page, 'Article');
  expect(data, 'Article schema not found on page').not.toBeNull();
  const result = ArticleSchema.safeParse(data);
  expect(result.success, `Article schema validation failed: ${result.error?.message}`).toBe(true);
}

export async function validateProductSchema(page: Page) {
  const data = await getStructuredData(page, 'Product');
  expect(data, 'Product schema not found on page').not.toBeNull();
  const result = ProductSchema.safeParse(data);
  expect(result.success, `Product schema validation failed: ${result.error?.message}`).toBe(true);
}
