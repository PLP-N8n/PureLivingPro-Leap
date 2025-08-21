import { useCallback } from "react";
import backend from "~backend/client";

// A mapping of our app's analytics events to a potential external service like Google Analytics.
const eventMap = {
  post_view: "ai:post_view",
  cta_click: "ai:cta_click",
  affiliate_click: "ai:affiliate_click",
  newsletter_submit: "ai:newsletter_submit",
};

export function useAnalytics() {
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }, []);

  const trackPageView = useCallback(async (pagePath: string, articleId?: number) => {
    try {
      await backend.analytics.trackPageView({
        pagePath,
        articleId,
        referrer: document.referrer,
        sessionId: getSessionId(),
      });
      // Example of sending to an external service
      // window.gtag('event', 'page_view', { page_path: pagePath });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [getSessionId]);

  const trackSearch = useCallback(async (query: string, resultsCount: number) => {
    try {
      await backend.analytics.trackSearch({
        query,
        resultsCount,
        sessionId: getSessionId(),
      });
    } catch (error) {
      console.warn('Search tracking failed:', error);
    }
  }, [getSessionId]);

  const trackCtaClick = useCallback((ctaIdentifier: string) => {
    console.log(`Analytics: CTA Clicked - ${ctaIdentifier}`);
    // window.gtag('event', eventMap.cta_click, { cta_id: ctaIdentifier });
  }, []);

  const trackAffiliateClick = useCallback((productId: number, affiliateUrl: string, contentId?: string) => {
    console.log(`Analytics: Affiliate Click - Product ID ${productId}`);
    // window.gtag('event', eventMap.affiliate_click, { product_id: productId, content_id: contentId });
  }, []);

  const trackNewsletterSubmit = useCallback((email: string) => {
    console.log(`Analytics: Newsletter Submitted`);
    // window.gtag('event', eventMap.newsletter_submit);
  }, []);

  return { 
    trackPageView, 
    trackSearch,
    trackCtaClick,
    trackAffiliateClick,
    trackNewsletterSubmit
  };
}
