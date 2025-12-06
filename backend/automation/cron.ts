import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";
import { ingestFromSheets } from "./ingest_from_sheets";
import { processScheduledContent } from "./pipeline";
import { checkAffiliateLinks } from "./link_checker";
import { rotateAffiliateLinks } from "./rotate_links";
import { updateKeywordRankings } from "./seo_tracker";
import { runAnalyticsRollup } from "./analytics_rollup";
import { generateWeeklyDigest } from "./weekly_digest";

// Cron endpoint wrappers
export const cronIngestFromSheets = api<void, { success: boolean }>(
  { expose: false, method: "POST", path: "/cron/ingest-sheets" },
  async () => {
    await ingestFromSheets({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID || "",
      range: "Content!A1:Z10000",
    });
    return { success: true };
  }
);

export const cronProcessContent = api<void, { success: boolean }>(
  { expose: false, method: "POST", path: "/cron/process-content" },
  async () => {
    await processScheduledContent();
    return { success: true };
  }
);

export const cronCheckLinks = api<void, { success: boolean }>(
  { expose: false, method: "POST", path: "/cron/check-links" },
  async () => {
    await checkAffiliateLinks();
    return { success: true };
  }
);

export const cronRotateLinks = api<void, { success: boolean }>(
  { expose: false, method: "POST", path: "/cron/rotate-links" },
  async () => {
    await rotateAffiliateLinks();
    return { success: true };
  }
);

export const cronUpdateRankings = api<void, { success: boolean }>(
  { expose: false, method: "POST", path: "/cron/update-rankings" },
  async () => {
    await updateKeywordRankings();
    return { success: true };
  }
);

export const cronAnalyticsRollup = api<void, { success: boolean }>(
  { expose: false, method: "POST", path: "/cron/analytics-rollup" },
  async () => {
    await runAnalyticsRollup();
    return { success: true };
  }
);

export const cronWeeklyDigest = api<void, { success: boolean }>(
  { expose: false, method: "POST", path: "/cron/weekly-digest" },
  async () => {
    await generateWeeklyDigest();
    return { success: true };
  }
);

// Cron job definitions
export const ingestJob = new CronJob("ingest-from-sheets", {
  title: "Ingest from Google Sheets",
  schedule: "15 * * * *",
  endpoint: cronIngestFromSheets,
});

export const publishQueueJob = new CronJob("process-publish-queue", {
  title: "Process Publish Queue",
  schedule: "*/5 * * * *",
  endpoint: cronProcessContent,
});

export const linkCheckJob = new CronJob("check-affiliate-links", {
  title: "Check Affiliate Links", 
  schedule: "0 2 * * *",
  endpoint: cronCheckLinks,
});

export const linkRotationJob = new CronJob("rotate-affiliate-links", {
  title: "Rotate Affiliate Links",
  schedule: "0 3 * * 1",
  endpoint: cronRotateLinks,
});

export const serpSnapshotJob = new CronJob("update-serp-rankings", {
  title: "Update SERP Rankings",
  schedule: "0 4 * * 0",
  endpoint: cronUpdateRankings,
});

export const analyticsRollupJob = new CronJob("analytics-rollup", {
  title: "Analytics Rollup",
  schedule: "0 1 * * *",
  endpoint: cronAnalyticsRollup,
});

export const weeklyDigestJob = new CronJob("send-weekly-digest", {
  title: "Send Weekly Digest",
  schedule: "0 8 * * 1",
  endpoint: cronWeeklyDigest,
});
