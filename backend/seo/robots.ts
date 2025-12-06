import { api } from "encore.dev/api";

interface RobotsResponse {
  content: string;
}

// Generates robots.txt for search engine crawling guidelines.
export const generateRobots = api<void, RobotsResponse>(
  { expose: true, method: "GET", path: "/robots.txt" },
  async () => {
    const baseUrl = "https://purelivingpro.com";
    
    const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /r/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

    return { content };
  }
);
