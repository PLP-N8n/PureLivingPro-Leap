import { cron } from "encore.dev/cron";
import { ingestFromSheets } from "./ingest_from_sheets";
import { processScheduledContent } from "./pipeline";
import { checkAffiliateLinks } from "./link_checker";
import { rotateAffiliateLinks } from "./rotate_links";
import { updateKeywordRankings } from "./seo_tracker";
import { runAnalyticsRollup } from "./analytics_rollup";
import { generateWeeklyDigest } from "./weekly_digest";

// Ingest from Sheets hourly
export const ingestJob = cron.schedule("15 * * * *", {
  name: "ingest-from-sheets",
  handler: async () => {
    await ingestFromSheets({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID || "",
      range: "Content!A1:Z10000",
    });
  },
});

// Publish queue tick every 5 minutes
export const publishQueueJob = cron.schedule("*/5 * * * *", {
  name: "process-publish-queue",
  handler: processScheduledContent,
});

// Dead link check daily at 02:00
export const linkCheckJob = cron.schedule("0 2 * * *", {
  name: "check-affiliate-links",
  handler: checkAffiliateLinks,
});

// Weekly affiliate link rotation Monday at 03:00
export const linkRotationJob = cron.schedule("0 3 * * 1", {
  name: "rotate-affiliate-links",
  handler: rotateAffiliateLinks,
});

// SERP snapshot Sunday at 04:00
export const serpSnapshotJob = cron.schedule("0 4 * * 0", {
  name: "update-serp-rankings",
  handler: updateKeywordRankings,
});

// Analytics rollup nightly at 01:00
export const analyticsRollupJob = cron.schedule("0 1 * * *", {
  name: "analytics-rollup",
  handler: runAnalyticsRollup,
});

// Weekly digest Monday at 08:00
export const weeklyDigestJob = cron.schedule("0 8 * * 1", {
  name: "send-weekly-digest",
  handler: generateWeeklyDigest,
});
