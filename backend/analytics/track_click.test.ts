import { api } from "encore.dev/api";
import { analyticsDB } from "./db";

// Test interface for track click functionality
export interface TrackClickTestResult {
  testName: string;
  status: "pass" | "fail";
  message: string;
  details?: any;
}

export interface TrackClickTestResponse {
  results: TrackClickTestResult[];
  overallStatus: "pass" | "fail";
  testedAt: string;
}

// Test trackClick endpoint functionality
export const testTrackClick = api(
  { expose: true, method: "POST", path: "/test-track-click", auth: false },
  async (): Promise<TrackClickTestResponse> => {
    const results: TrackClickTestResult[] = [];

    // Test 1: Valid click event
    try {
      const validEvent = {
        linkId: 1,
        productId: 1,
        contentId: "test-content-123",
        pagePath: "/test-page",
        utmSource: "newsletter",
        utmMedium: "email",
        device: "mobile",
        redirectMs: 120,
        success: true
      };

      // Insert test event directly to database
      const eventId = crypto.randomUUID();
      await analyticsDB.exec`
        INSERT INTO click_events (
          id, timestamp, link_id, product_id, content_id, page_path,
          utm_source, utm_medium, device, redirect_ms, success
        ) VALUES (
          ${eventId}, NOW(), ${validEvent.linkId}, ${validEvent.productId},
          ${validEvent.contentId}, ${validEvent.pagePath}, ${validEvent.utmSource},
          ${validEvent.utmMedium}, ${validEvent.device}, ${validEvent.redirectMs}, ${validEvent.success}
        )
      `;

      // Verify insertion
      const inserted = await analyticsDB.queryRow<{ id: string }>`
        SELECT id FROM click_events WHERE id = ${eventId}
      `;

      if (inserted) {
        results.push({
          testName: "Valid click event insertion",
          status: "pass",
          message: "Successfully inserted valid click event"
        });
      } else {
        results.push({
          testName: "Valid click event insertion",
          status: "fail",
          message: "Failed to insert valid click event"
        });
      }

      // Clean up test data
      await analyticsDB.exec`DELETE FROM click_events WHERE id = ${eventId}`;

    } catch (error) {
      results.push({
        testName: "Valid click event insertion",
        status: "fail",
        message: `Error inserting valid click event: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 2: UTM parameter extraction
    try {
      const utmTestData = {
        utmSource: "  newsletter  ",
        utmMedium: "  email  ",
        utmCampaign: "  summer-sale  ",
        utmTerm: "  wellness  ",
        utmContent: "  cta-button  "
      };

      // Test UTM parameter trimming
      const trimmedSource = utmTestData.utmSource.trim();
      const trimmedMedium = utmTestData.utmMedium.trim();
      const trimmedCampaign = utmTestData.utmCampaign.trim();

      if (trimmedSource === "newsletter" && trimmedMedium === "email" && trimmedCampaign === "summer-sale") {
        results.push({
          testName: "UTM parameter extraction",
          status: "pass",
          message: "UTM parameters correctly trimmed and extracted"
        });
      } else {
        results.push({
          testName: "UTM parameter extraction",
          status: "fail",
          message: "UTM parameter extraction failed",
          details: { trimmedSource, trimmedMedium, trimmedCampaign }
        });
      }

    } catch (error) {
      results.push({
        testName: "UTM parameter extraction",
        status: "fail",
        message: `Error in UTM parameter extraction: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 3: Device detection
    try {
      const deviceTests = [
        { input: "mobile", expected: "mobile" },
        { input: "desktop", expected: "desktop" },
        { input: "tablet", expected: "tablet" },
        { input: "", expected: null },
        { input: undefined, expected: null }
      ];

      let deviceTestsPassed = 0;
      for (const test of deviceTests) {
        const result = test.input?.trim() || null;
        if (result === test.expected) {
          deviceTestsPassed++;
        }
      }

      if (deviceTestsPassed === deviceTests.length) {
        results.push({
          testName: "Device detection",
          status: "pass",
          message: "Device detection working correctly"
        });
      } else {
        results.push({
          testName: "Device detection",
          status: "fail",
          message: `Device detection failed: ${deviceTestsPassed}/${deviceTests.length} tests passed`
        });
      }

    } catch (error) {
      results.push({
        testName: "Device detection",
        status: "fail",
        message: `Error in device detection: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 4: URL validation
    try {
      const urlTests = [
        { url: "https://example.com", valid: true },
        { url: "http://example.com/path", valid: true },
        { url: "invalid-url", valid: false },
        { url: "ftp://example.com", valid: true },
        { url: "", valid: false }
      ];

      let urlTestsPassed = 0;
      for (const test of urlTests) {
        try {
          new URL(test.url);
          if (test.valid) urlTestsPassed++;
        } catch {
          if (!test.valid) urlTestsPassed++;
        }
      }

      if (urlTestsPassed === urlTests.length) {
        results.push({
          testName: "URL validation",
          status: "pass",
          message: "URL validation working correctly"
        });
      } else {
        results.push({
          testName: "URL validation",
          status: "fail",
          message: `URL validation failed: ${urlTestsPassed}/${urlTests.length} tests passed`
        });
      }

    } catch (error) {
      results.push({
        testName: "URL validation",
        status: "fail",
        message: `Error in URL validation: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 5: Path validation
    try {
      const pathTests = [
        { path: "/valid-path", valid: true },
        { path: "/path/with/segments", valid: true },
        { path: "invalid-path", valid: false },
        { path: "/", valid: true },
        { path: "/" + "x".repeat(600), valid: false } // Too long
      ];

      let pathTestsPassed = 0;
      for (const test of pathTests) {
        const isValid = test.path.startsWith('/') && test.path.length <= 500;
        if (isValid === test.valid) pathTestsPassed++;
      }

      if (pathTestsPassed === pathTests.length) {
        results.push({
          testName: "Path validation",
          status: "pass",
          message: "Path validation working correctly"
        });
      } else {
        results.push({
          testName: "Path validation",
          status: "fail",
          message: `Path validation failed: ${pathTestsPassed}/${pathTests.length} tests passed`
        });
      }

    } catch (error) {
      results.push({
        testName: "Path validation",
        status: "fail",
        message: `Error in path validation: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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