import { useCallback } from "react";
import backend from "~backend/client";

export function useAnalytics() {
  const trackPageView = useCallback(async (pagePath: string, articleId?: number) => {
    try {
      const sessionId = sessionStorage.getItem('sessionId') || 
        (() => {
          const id = Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('sessionId', id);
          return id;
        })();

      await backend.analytics.trackPageView({
        pagePath,
        articleId,
        referrer: document.referrer,
        sessionId,
      });
    } catch (error) {
      // Silently fail analytics tracking to prevent app crashes
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  const trackSearch = useCallback(async (query: string, resultsCount: number) => {
    try {
      const sessionId = sessionStorage.getItem('sessionId') || 
        (() => {
          const id = Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('sessionId', id);
          return id;
        })();

      await backend.analytics.trackSearch({
        query,
        resultsCount,
        sessionId,
      });
    } catch (error) {
      // Silently fail analytics tracking to prevent app crashes
      console.warn('Search tracking failed:', error);
    }
  }, []);

  return { trackPageView, trackSearch };
}
