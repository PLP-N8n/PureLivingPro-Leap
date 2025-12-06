interface AffiliateUrlOptions {
  contentId?: string;
  campaign?: string;
  source?: string;
}

/**
 * Generates affiliate tracking URLs in the format /r/:shortCode
 * This matches the original architecture's affiliate redirect pattern
 */
export function buildAffiliateUrl(shortCode: string, options: AffiliateUrlOptions = {}): string {
  const baseUrl = `/r/${shortCode}`;
  const params = new URLSearchParams();
  
  if (options.contentId) {
    params.append('contentId', options.contentId);
  }
  
  if (options.campaign) {
    params.append('utm_campaign', options.campaign);
  }
  
  if (options.source) {
    params.append('utm_source', options.source);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Tracks affiliate link clicks for analytics
 */
export function trackAffiliateClick(productId: number, shortCode: string, contentId?: string) {
  // Track the click event
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'affiliate_click', {
      product_id: productId,
      short_code: shortCode,
      content_id: contentId,
      event_category: 'affiliate',
      event_label: shortCode
    });
  }
  
  // You could also send this to your analytics backend
  console.log('Affiliate click tracked:', { productId, shortCode, contentId });
}

/**
 * Generates session ID for tracking user sessions
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('affiliate_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('affiliate_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Enhanced product card click handler with full tracking
 */
export function handleProductClick(product: {
  id: number;
  name: string;
  affiliateUrl?: string;
}, options: AffiliateUrlOptions = {}) {
  // Extract short code from affiliate URL if it's in /r/:code format
  const shortCodeMatch = product.affiliateUrl?.match(/\/r\/([^?]+)/);
  const shortCode = shortCodeMatch?.[1];
  
  if (shortCode) {
    // Track the click
    trackAffiliateClick(product.id, shortCode, options.contentId);
    
    // Build the tracking URL
    const trackingUrl = buildAffiliateUrl(shortCode, {
      ...options,
      source: 'product_card'
    });
    
    // Open in new tab
    window.open(trackingUrl, '_blank', 'noopener,noreferrer');
  } else if (product.affiliateUrl) {
    // Fallback for direct affiliate URLs
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  }
}
