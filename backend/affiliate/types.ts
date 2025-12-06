import { Query } from "encore.dev/api";

export interface AffiliateProgram {
  id: number;
  name: string;
  description?: string;
  commissionRate: number;
  cookieDuration: number;
  trackingDomain?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateProduct {
  id: number;
  programId: number;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  originalUrl: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  program?: {
    name: string;
    commissionRate: number;
  };
}

export interface AffiliateLink {
  id: number;
  productId: number;
  shortCode: string;
  originalUrl: string;
  trackingParams?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateAffiliateLinkRequest {
  productId: number;
  originalUrl: string;
  trackingParams?: Record<string, any>;
}

export interface ListAffiliateProductsRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  category?: Query<string>;
  programId?: Query<number>;
  search?: Query<string>;
}

export interface ListAffiliateProductsResponse {
  products: AffiliateProduct[];
  total: number;
}

export interface CreateAffiliateProgramRequest {
  name: string;
  description?: string;
  commissionRate: number;
  cookieDuration?: number;
  trackingDomain?: string;
  isActive?: boolean;
}

export interface ListAffiliateProgramsResponse {
  programs: AffiliateProgram[];
}

export interface CreateAffiliateProductRequest {
  programId: number;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  originalUrl: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateAffiliateProductRequest {
  programId?: number;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  originalUrl?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}
