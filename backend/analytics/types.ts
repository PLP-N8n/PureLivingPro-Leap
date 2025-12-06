import { Query } from "encore.dev/api";

export interface ClickEvent {
  id: string;
  timestamp: Date;
  linkId: number;
  productId: number;
  contentId?: string;
  pickId?: string;
  variantId?: string;
  pagePath?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  device?: string;
  country?: string;
  browser?: string;
  redirectMs?: number;
  success: boolean;
}

export interface TrackClickRequest {
  linkId: number;
  productId: number;
  contentId?: string;
  pickId?: string;
  variantId?: string;
  pagePath?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  device?: string;
  country?: string;
  browser?: string;
  redirectMs?: number;
  success?: boolean;
}

export interface TrackClickResponse {
  eventId: string;
  success: boolean;
}

export interface GetClickStatsRequest {
  productId?: Query<number>;
  contentId?: Query<string>;
  category?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
  utmSource?: Query<string>;
  utmMedium?: Query<string>;
  utmCampaign?: Query<string>;
  device?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  clicks: number;
  uniqueClicks: number;
  ctr?: number;
  avgRedirectTime?: number;
}

export interface ProductStats {
  productId: number;
  productName: string;
  clicks: number;
  uniqueClicks: number;
  ctr: number;
  avgRedirectTime: number;
}

export interface PageStats {
  pagePath: string;
  clicks: number;
  uniqueClicks: number;
  ctr: number;
}

export interface ClickStats {
  totalClicks: number;
  uniqueClicks: number;
  ctr: number;
  avgRedirectTime: number;
  topProducts: ProductStats[];
  topPages: PageStats[];
  timeSeries: TimeSeriesPoint[];
}

export interface RetryQueueItem {
  id: string;
  eventType: string;
  eventData: any;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date;
  createdAt: Date;
  processedAt?: Date;
}

export interface ExportClicksRequest {
  startDate?: Query<string>;
  endDate?: Query<string>;
  productId?: Query<number>;
  contentId?: Query<string>;
  category?: Query<string>;
  utmSource?: Query<string>;
  utmMedium?: Query<string>;
  format?: Query<'csv' | 'json'>;
  limit?: Query<number>;
}

export interface ExportClicksResponse {
  downloadUrl: string;
  filename: string;
  recordCount: number;
}