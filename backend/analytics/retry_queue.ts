import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import { analyticsDB } from "./db";
import { RetryQueueItem } from "./types";

// Process retry queue handler
export const processRetryQueueHandler = api(
  { expose: false, method: "POST", path: "/analytics/retry-queue/process" },
  async (): Promise<void> => {
  try {
    console.log('Processing analytics retry queue...');
    
    // Get items ready for retry
    const retryItems = await getRetryItems();
    
    if (retryItems.length === 0) {
      console.log('No items in retry queue');
      return;
    }

    console.log(`Processing ${retryItems.length} retry items`);
    
    let processed = 0;
    let failed = 0;

    for (const item of retryItems) {
      try {
        await processRetryItem(item);
        await markAsProcessed(item.id);
        processed++;
      } catch (error) {
        console.error(`Failed to process retry item ${item.id}:`, error);
        await incrementRetryCount(item.id);
        failed++;
      }
    }

    console.log(`Retry queue processing complete: ${processed} processed, ${failed} failed`);

    // Clean up old processed items (older than 7 days)
    await cleanupProcessedItems();

  } catch (error) {
    console.error('Error processing retry queue:', error);
  }
});

// Cron job to process retry queue
export const processRetryQueue = new CronJob("process-analytics-retry", {
  title: "Process Analytics Retry Queue",
  schedule: "*/5 * * * *", // Every 5 minutes
  endpoint: processRetryQueueHandler,
});

// Get items ready for retry
async function getRetryItems(): Promise<RetryQueueItem[]> {
  const results = await analyticsDB.query<{
    id: string;
    eventType: string;
    eventData: any;
    retryCount: number;
    maxRetries: number;
    nextRetryAt: Date;
    createdAt: Date;
  }>`
    SELECT 
      id, event_type as "eventType", event_data as "eventData",
      retry_count as "retryCount", max_retries as "maxRetries",
      next_retry_at as "nextRetryAt", created_at as "createdAt"
    FROM analytics_retry_queue
    WHERE processed_at IS NULL
      AND next_retry_at <= NOW()
      AND retry_count < max_retries
    ORDER BY created_at ASC
    LIMIT 100
  `;

  return results.map(row => ({
    id: row.id,
    eventType: row.eventType,
    eventData: row.eventData,
    retryCount: row.retryCount,
    maxRetries: row.maxRetries,
    nextRetryAt: row.nextRetryAt,
    createdAt: row.createdAt
  }));
}

// Process individual retry item
async function processRetryItem(item: RetryQueueItem): Promise<void> {
  switch (item.eventType) {
    case 'click_event':
      await processClickEventRetry(item.eventData);
      break;
    default:
      console.warn(`Unknown event type for retry: ${item.eventType}`);
      throw new Error(`Unknown event type: ${item.eventType}`);
  }
}

// Process click event retry
async function processClickEventRetry(eventData: any): Promise<void> {
  // Validate required fields
  if (!eventData.linkId || !eventData.productId) {
    throw new Error('Missing required fields for click event retry');
  }

  // Insert click event
  await analyticsDB.exec`
    INSERT INTO click_events (
      id, timestamp, link_id, product_id, content_id, pick_id, variant_id,
      page_path, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      device, country, browser, redirect_ms, success
    ) VALUES (
      ${eventData.eventId || crypto.randomUUID()}, 
      ${eventData.timestamp ? new Date(eventData.timestamp) : new Date()},
      ${eventData.linkId}, ${eventData.productId}, ${eventData.contentId || null},
      ${eventData.pickId || null}, ${eventData.variantId || null}, 
      ${eventData.pagePath || null}, ${eventData.referrer || null}, 
      ${eventData.utmSource || eventData.source || null}, 
      ${eventData.utmMedium || eventData.medium || null},
      ${eventData.utmCampaign || eventData.campaign || null}, 
      ${eventData.utmTerm || eventData.term || null}, 
      ${eventData.utmContent || eventData.content || null},
      ${eventData.device || null}, ${eventData.country || null}, 
      ${eventData.browser || null}, ${eventData.redirectMs || null}, 
      ${eventData.success !== false}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

// Mark item as processed
async function markAsProcessed(itemId: string): Promise<void> {
  await analyticsDB.exec`
    UPDATE analytics_retry_queue
    SET processed_at = NOW()
    WHERE id = ${itemId}
  `;
}

// Increment retry count and schedule next retry
async function incrementRetryCount(itemId: string): Promise<void> {
  await analyticsDB.exec`
    UPDATE analytics_retry_queue
    SET 
      retry_count = retry_count + 1,
      next_retry_at = NOW() + INTERVAL '5 minutes' * POWER(2, retry_count + 1)
    WHERE id = ${itemId}
  `;
}

// Clean up old processed items
async function cleanupProcessedItems(): Promise<void> {
  const result = await analyticsDB.exec`
    DELETE FROM analytics_retry_queue
    WHERE processed_at IS NOT NULL
      AND processed_at < NOW() - INTERVAL '7 days'
  `;

  if (result.rowCount > 0) {
    console.log(`Cleaned up ${result.rowCount} old processed retry items`);
  }
}

// Manual API endpoint to trigger retry queue processing (for testing/debugging)
export const triggerRetryQueueProcessing = api(
  { expose: true, method: "POST", path: "/trigger-retry-processing", auth: false },
  async (): Promise<{ message: string }> => {
    await processRetryQueueHandler();
    return { message: "Retry queue processing triggered" };
  }
);

// Get retry queue status
export const getRetryQueueStatus = api(
  { expose: true, method: "GET", path: "/retry-queue-status", auth: false },
  async (): Promise<{
    pendingItems: number;
    processedItems: number;
    failedItems: number;
  }> => {
    const stats = await analyticsDB.queryRow<{
      pendingItems: number;
      processedItems: number;
      failedItems: number;
    }>`
      SELECT 
        COUNT(*) FILTER (WHERE processed_at IS NULL AND retry_count < max_retries) as "pendingItems",
        COUNT(*) FILTER (WHERE processed_at IS NOT NULL) as "processedItems",
        COUNT(*) FILTER (WHERE processed_at IS NULL AND retry_count >= max_retries) as "failedItems"
      FROM analytics_retry_queue
    `;

    return stats || { pendingItems: 0, processedItems: 0, failedItems: 0 };
  }
);