export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  createdAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  categoryId?: number;
  authorName: string;
  authorEmail: string;
  published: boolean;
  featured: boolean;
  viewCount: number;
  wpPostId?: number;
  mediumPostId?: string;
  seoMeta?: any;
  affiliateBlocks?: any;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  tags?: Tag[];
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  categoryId?: number;
  authorName: string;
  authorEmail: string;
  published?: boolean;
  featured?: boolean;
  tagIds?: number[];
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImageUrl?: string;
  categoryId?: number;
  published?: boolean;
  featured?: boolean;
  tagIds?: number[];
  seoMeta?: any;
  affiliateBlocks?: any;
  wpPostId?: number;
  mediumPostId?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface ListArticlesRequest {
  limit?: number;
  offset?: number;
  categoryId?: number;
  published?: boolean;
  featured?: boolean;
  search?: string;
}

export interface ListArticlesResponse {
  articles: Article[];
  total: number;
}

export interface ListCategoriesResponse {
  categories: Category[];
}

export interface ListTagsResponse {
  tags: Tag[];
}
