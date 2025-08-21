import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { affiliateDB } from "../affiliate/db";

interface LinkHealthReport {
  totalLinks: number;
  workingLinks: number;
  brokenLinks: number;
  slowLinks: number;
  recentlyFixed: number;
}

// Checks all affiliate links for availability and performance.
export const checkAffiliateLinks = api<void, LinkHealthReport>(
  { expose: true, method: "POST", path: "/automation/check-links" },
  async () => {
    const links = await affiliateDB.queryAll<{
      id: number;
      originalUrl: string;
      shortCode: string;
    }>`
      SELECT id, original_url as "originalUrl", short_code as "shortCode"
      FROM affiliate_links
      WHERE is_active = true
    `;

    let workingLinks = 0;
    let brokenLinks = 0;
    let slowLinks = 0;
    let recentlyFixed = 0;

    for (const link of links) {
      try {
        const startTime = Date.now();
        const response = await fetch(link.originalUrl, {
          method: 'HEAD',
          timeout: 10000,
          redirect: 'follow'
        });
        const responseTime = Date.now() - startTime;

        const isWorking = response.ok;
        const isSlow = responseTime > 3000;

        if (isWorking) {
          workingLinks++;
          if (isSlow) slowLinks++;
        } else {
          brokenLinks++;
        }

        // Get previous status
        const previousCheck = await automationDB.queryRow<{
          isWorking: boolean;
          consecutiveFailures: number;
        }>`
          SELECT is_working as "isWorking", consecutive_failures as "consecutiveFailures"
          FROM affiliate_link_health
          WHERE affiliate_link_id = ${link.id}
          ORDER BY last_checked_at DESC
          LIMIT 1
        `;

        const consecutiveFailures = isWorking ? 0 : (previousCheck?.consecutiveFailures || 0) + 1;
        
        // Check if recently fixed
        if (isWorking && previousCheck && !previousCheck.isWorking) {
          recentlyFixed++;
        }

        // Store health check result
        await automationDB.exec`
          INSERT INTO affiliate_link_health (
            affiliate_link_id, status_code, is_working, response_time_ms, consecutive_failures
          ) VALUES (
            ${link.id}, ${response.status}, ${isWorking}, ${responseTime}, ${consecutiveFailures}
          )
        `;

        // Deactivate links with 3+ consecutive failures
        if (consecutiveFailures >= 3) {
          await affiliateDB.exec`
            UPDATE affiliate_links SET is_active = false WHERE id = ${link.id}
          `;
        }

      } catch (error) {
        brokenLinks++;
        
        await automationDB.exec`
          INSERT INTO affiliate_link_health (
            affiliate_link_id, status_code, is_working, error_message, consecutive_failures
          ) VALUES (
            ${link.id}, 0, false, ${error.message}, 
            COALESCE((
              SELECT consecutive_failures + 1 
              FROM affiliate_link_health 
              WHERE affiliate_link_id = ${link.id} 
              ORDER BY last_checked_at DESC 
              LIMIT 1
            ), 1)
          )
        `;
      }
    }

    return {
      totalLinks: links.length,
      workingLinks,
      brokenLinks,
      slowLinks,
      recentlyFixed
    };
  }
);

// Gets detailed health report for admin dashboard.
export const getLinkHealthReport = api<void, {
  summary: LinkHealthReport;
  brokenLinks: Array<{
    id: number;
    shortCode: string;
    originalUrl: string;
    consecutiveFailures: number;
    lastError: string;
  }>;
  slowLinks: Array<{
    id: number;
    shortCode: string;
    averageResponseTime: number;
  }>;
}>(
  { expose: true, method: "GET", path: "/automation/link-health" },
  async () => {
    // Get summary stats
    const summary = await checkAffiliateLinks();

    // Get broken links details
    const brokenLinks = await automationDB.queryAll<{
      id: number;
      shortCode: string;
      originalUrl: string;
      consecutiveFailures: number;
      lastError: string;
    }>`
      SELECT 
        al.id, al.short_code as "shortCode", al.original_url as "originalUrl",
        alh.consecutive_failures as "consecutiveFailures",
        alh.error_message as "lastError"
      FROM affiliate_links al
      JOIN affiliate_link_health alh ON al.id = alh.affiliate_link_id
      WHERE alh.is_working = false
      AND alh.last_checked_at = (
        SELECT MAX(last_checked_at) 
        FROM affiliate_link_health 
        WHERE affiliate_link_id = al.id
      )
      ORDER BY alh.consecutive_failures DESC
      LIMIT 20
    `;

    // Get slow links
    const slowLinks = await automationDB.queryAll<{
      id: number;
      shortCode: string;
      averageResponseTime: number;
    }>`
      SELECT 
        al.id, al.short_code as "shortCode",
        AVG(alh.response_time_ms) as "averageResponseTime"
      FROM affiliate_links al
      JOIN affiliate_link_health alh ON al.id = alh.affiliate_link_id
      WHERE alh.last_checked_at >= NOW() - INTERVAL '7 days'
      AND alh.is_working = true
      GROUP BY al.id, al.short_code
      HAVING AVG(alh.response_time_ms) > 3000
      ORDER BY "averageResponseTime" DESC
      LIMIT 10
    `;

    return {
      summary,
      brokenLinks,
      slowLinks
    };
  }
);
