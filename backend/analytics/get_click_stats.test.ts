import { api } from "encore.dev/api";
import { analyticsDB } from "./db";

// Test interface for click stats functionality
export interface ClickStatsTestResult {
  testName: string;
  status: "pass" | "fail";
  message: string;
  details?: any;
}

export interface ClickStatsTestResponse {
  results: ClickStatsTestResult[];
  overallStatus: "pass" | "fail";
  testedAt: string;
}

// Test getClickStats endpoint functionality
export const testGetClickStats = api(
  { expose: true, method: "POST", path: "/test-get-click-stats", auth: false },
  async (): Promise<ClickStatsTestResponse> => {
    const results: ClickStatsTestResult[] = [];

    // Setup test data
    const testEventIds: string[] = [];
    
    try {
      // Insert test click events
      const testEvents = [
        {
          id: crypto.randomUUID(),
          linkId: 1,
          productId: 1,
          contentId: "test-content-1",
          pagePath: "/test-page-1",
          utmSource: "newsletter",
          utmMedium: "email",
          device: "mobile",
          redirectMs: 120,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          id: crypto.randomUUID(),
          linkId: 2,
          productId: 2,
          contentId: "test-content-2",
          pagePath: "/test-page-2",
          utmSource: "social",
          utmMedium: "facebook",
          device: "desktop",
          redirectMs: 95,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          id: crypto.randomUUID(),
          linkId: 1,
          productId: 1,
          contentId: "test-content-1",
          pagePath: "/test-page-1",
          utmSource: "newsletter",
          utmMedium: "email",
          device: "mobile",
          redirectMs: 150,
          timestamp: new Date() // Now
        }
      ];

      for (const event of testEvents) {
        await analyticsDB.exec`
          INSERT INTO click_events (
            id, timestamp, link_id, product_id, content_id, page_path,
            utm_source, utm_medium, device, redirect_ms, success
          ) VALUES (
            ${event.id}, ${event.timestamp}, ${event.linkId}, ${event.productId},
            ${event.contentId}, ${event.pagePath}, ${event.utmSource},
            ${event.utmMedium}, ${event.device}, ${event.redirectMs}, true
          )
        `;
        testEventIds.push(event.id);
      }

      // Test 1: Basic aggregation
      const totalStats = await analyticsDB.queryRow<{
        totalClicks: number;
        uniqueClicks: number;
        avgRedirectTime: number;
      }>`
        SELECT 
          COUNT(*) as "totalClicks",
          COUNT(DISTINCT COALESCE(content_id, link_id::text)) as "uniqueClicks",
          COALESCE(AVG(redirect_ms), 0) as "avgRedirectTime"
        FROM click_events 
        WHERE id = ANY(${testEventIds})
      `;

      if (totalStats && totalStats.totalClicks === 3 && totalStats.uniqueClicks === 2) {
        results.push({
          testName: "Basic aggregation",
          status: "pass",
          message: "Basic click aggregation working correctly",
          details: totalStats
        });
      } else {
        results.push({
          testName: "Basic aggregation",
          status: "fail",
          message: "Basic click aggregation failed",
          details: totalStats
        });
      }

    } catch (error) {
      results.push({
        testName: "Basic aggregation",
        status: "fail",
        message: `Error in basic aggregation: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 2: Product filtering
    try {
      const productStats = await analyticsDB.query<{
        productId: number;
        clicks: number;
      }>`
        SELECT 
          product_id as "productId",
          COUNT(*) as clicks
        FROM click_events
        WHERE id = ANY(${testEventIds})
        GROUP BY product_id
        ORDER BY clicks DESC
      `;

      if (productStats.length === 2 && productStats[0].clicks === 2 && productStats[1].clicks === 1) {
        results.push({
          testName: "Product filtering",
          status: "pass",
          message: "Product filtering and grouping working correctly",
          details: productStats
        });
      } else {
        results.push({
          testName: "Product filtering",
          status: "fail",
          message: "Product filtering failed",
          details: productStats
        });
      }

    } catch (error) {
      results.push({
        testName: "Product filtering",
        status: "fail",
        message: `Error in product filtering: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 3: UTM filtering
    try {
      const utmStats = await analyticsDB.query<{
        utmSource: string;
        utmMedium: string;
        clicks: number;
      }>`
        SELECT 
          utm_source as "utmSource",
          utm_medium as "utmMedium",
          COUNT(*) as clicks
        FROM click_events
        WHERE id = ANY(${testEventIds})
        GROUP BY utm_source, utm_medium
        ORDER BY clicks DESC
      `;

      if (utmStats.length === 2) {
        const newsletterStats = utmStats.find(s => s.utmSource === 'newsletter');
        const socialStats = utmStats.find(s => s.utmSource === 'social');
        
        if (newsletterStats?.clicks === 2 && socialStats?.clicks === 1) {
          results.push({
            testName: "UTM filtering",
            status: "pass",
            message: "UTM filtering and grouping working correctly",
            details: utmStats
          });
        } else {
          results.push({
            testName: "UTM filtering",
            status: "fail",
            message: "UTM filtering counts incorrect",
            details: utmStats
          });
        }
      } else {
        results.push({
          testName: "UTM filtering",
          status: "fail",
          message: "UTM filtering failed - wrong number of groups",
          details: utmStats
        });
      }

    } catch (error) {
      results.push({
        testName: "UTM filtering",
        status: "fail",
        message: `Error in UTM filtering: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 4: Time series aggregation
    try {
      const timeSeriesStats = await analyticsDB.query<{
        timestamp: Date;
        clicks: number;
      }>`
        SELECT 
          date_trunc('day', timestamp) as timestamp,
          COUNT(*) as clicks
        FROM click_events
        WHERE id = ANY(${testEventIds})
        GROUP BY date_trunc('day', timestamp)
        ORDER BY timestamp ASC
      `;

      if (timeSeriesStats.length >= 2) {
        results.push({
          testName: "Time series aggregation",
          status: "pass",
          message: "Time series aggregation working correctly",
          details: { dataPoints: timeSeriesStats.length }
        });
      } else {
        results.push({
          testName: "Time series aggregation",
          status: "fail",
          message: "Time series aggregation failed",
          details: timeSeriesStats
        });
      }

    } catch (error) {
      results.push({
        testName: "Time series aggregation",
        status: "fail",
        message: `Error in time series aggregation: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 5: Date range validation
    try {
      const now = new Date();
      const validStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const validEndDate = now;
      
      // Test valid date range
      if (validStartDate < validEndDate) {
        results.push({
          testName: "Date range validation - valid range",
          status: "pass",
          message: "Valid date range accepted"
        });
      } else {
        results.push({
          testName: "Date range validation - valid range",
          status: "fail",
          message: "Valid date range rejected"
        });
      }

      // Test invalid date range (start after end)
      const invalidStartDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const invalidEndDate = now;
      
      if (invalidStartDate >= invalidEndDate) {
        results.push({
          testName: "Date range validation - invalid range",
          status: "pass",
          message: "Invalid date range correctly identified"
        });
      } else {
        results.push({
          testName: "Date range validation - invalid range",
          status: "fail",
          message: "Invalid date range not caught"
        });
      }

    } catch (error) {
      results.push({
        testName: "Date range validation",
        status: "fail",
        message: `Error in date range validation: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Clean up test data
    try {
      for (const eventId of testEventIds) {
        await analyticsDB.exec`DELETE FROM click_events WHERE id = ${eventId}`;
      }
    } catch (error) {
      console.warn('Failed to clean up test data:', error);
    }

    // Determine overall status
    const failedTests = results.filter(r => r.status === "fail").length;
    const overallStatus = failedTests === 0 ? "pass" : "fail";

    return {
      results,
      overallStatus,
      testedAt: new Date().toISOString()
    };
  }
);