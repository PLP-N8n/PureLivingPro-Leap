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
      console.error('Failed to track page view:', error);
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
      console.error('Failed to track search:', error);
    }
  }, []);

  return { trackPageView, trackSearch };
}
