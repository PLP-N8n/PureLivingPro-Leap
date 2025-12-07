import { api, APIError } from "encore.dev/api";
import { affiliateDB } from "./db";
import type { AffiliateProduct } from "./types";

interface GetProductParams {
  slug: string;
}

// Retrieves a single affiliate product by its slug (URL-friendly identifier).
export const getProduct = api<GetProductParams, AffiliateProduct>(
  { expose: true, method: "GET", path: "/affiliate/products/by-slug/:slug" },
  async ({ slug }) => {
    const product = await affiliateDB.queryRow<AffiliateProduct & { programName?: string; commissionRate?: number }>`
      SELECT 
        p.id, p.program_id as "programId", p.name, p.slug, p.description, p.price, p.original_url as "originalUrl",
        p.image_url as "imageUrl", p.category, p.tags, p.is_active as "isActive",
        p.created_at as "createdAt", p.updated_at as "updatedAt",
        prog.name as "programName", prog.commission_rate as "commissionRate"
      FROM affiliate_products p
      LEFT JOIN affiliate_programs prog ON p.program_id = prog.id
      WHERE p.slug = ${slug} AND p.is_active = true
    `;

    if (!product) {
      throw APIError.notFound("Product not found");
    }

    return {
      ...product,
      program: product.programName ? {
        name: product.programName,
        commissionRate: product.commissionRate || 0
      } : undefined
    };
  }
);
