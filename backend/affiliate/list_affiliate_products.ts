import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { affiliateDB } from "./db";
import type { ListAffiliateProductsRequest, ListAffiliateProductsResponse, AffiliateProduct } from "./types";

// Retrieves affiliate products with optional filtering.
export const listAffiliateProducts = api<ListAffiliateProductsRequest, ListAffiliateProductsResponse>(
  { expose: true, method: "GET", path: "/affiliate/products" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    let whereConditions: string[] = ["p.is_active = true"];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.category) {
      whereConditions.push(`p.category = $${paramIndex++}`);
      params.push(req.category);
    }

    if (req.programId) {
      whereConditions.push(`p.program_id = $${paramIndex++}`);
      params.push(req.programId);
    }

    if (req.search) {
      whereConditions.push(`(p.name ILIKE $${paramIndex++} OR p.description ILIKE $${paramIndex++})`);
      const searchTerm = `%${req.search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM affiliate_products p
      ${whereClause}
    `;
    
    const countResult = await affiliateDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get products with program information
    const productsQuery = `
      SELECT 
        p.id, p.program_id as "programId", p.name, p.slug, p.description, p.price, p.original_url as "originalUrl",
        p.image_url as "imageUrl", p.category, p.tags, p.is_active as "isActive",
        p.created_at as "createdAt", p.updated_at as "updatedAt",
        prog.name as "programName", prog.commission_rate as "commissionRate"
      FROM affiliate_products p
      LEFT JOIN affiliate_programs prog ON p.program_id = prog.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);
    
    const products = await affiliateDB.rawQueryAll<AffiliateProduct & { programName?: string; commissionRate?: number }>(
      productsQuery, 
      ...params
    );

    const productsWithProgram = products.map(product => ({
      ...product,
      program: product.programName ? {
        name: product.programName,
        commissionRate: product.commissionRate || 0
      } : undefined
    }));

    return {
      products: productsWithProgram,
      total
    };
  }
);
