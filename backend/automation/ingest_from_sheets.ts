import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { fetchSheetData } from "../integrations/google-sheets";
import { googleSheetsId } from "./secrets";
import type { SheetRow } from "./types";

interface IngestFromSheetsRequest {
  spreadsheetId: string;
  range?: string;
}

interface IngestFromSheetsResponse {
  processed: number;
  ingested: number;
  errors: string[];
}

// Ingests content ideas from Google Sheets and enqueues them for processing.
export const ingestFromSheets = api<IngestFromSheetsRequest, IngestFromSheetsResponse>(
  { expose: true, method: "POST", path: "/automation/ingest/sheets" },
  async (req) => {
    const sheetId = req.spreadsheetId || googleSheetsId();
    const range = req.range || "Content!A1:Z10000";
    let processed = 0;
    let ingested = 0;
    const errors: string[] = [];

    try {
      const rows = await fetchSheetData(range, sheetId);
      
      for (const row of rows) {
        processed++;
        
        try {
          // Skip empty rows or rows not in "Planned" status
          if (!row.Title || row.Status !== 'Planned') {
            continue;
          }

          // Check if this title has already been ingested
          const existing = await automationDB.queryRow`
            SELECT id FROM content_pipeline WHERE topic = ${row.Title}
          `;
          if (existing) {
            continue;
          }

          // Enqueue the job in the content pipeline
          await automationDB.exec`
            INSERT INTO content_pipeline (
              topic, status, target_keywords, scheduled_publish_at
            ) VALUES (
              ${row.Title}, 
              'scheduled', 
              ${row.Keywords.split(',').map(k => k.trim())},
              ${row['Target Date'] ? new Date(row['Target Date']).toISOString() : new Date().toISOString()}
            )
          `;
          ingested++;

        } catch (error) {
          errors.push(`Row ${processed}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Log the ingestion run
      await automationDB.exec`
        INSERT INTO sheets_ingest_runs (sheet_id, range, imported_rows, errors)
        VALUES (${sheetId}, ${range}, ${ingested}, ${JSON.stringify(errors)})
      `;

      return {
        processed,
        ingested,
        errors
      };
    } catch (error) {
      const errorMessage = `Failed to fetch sheet data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMessage);
      
      await automationDB.exec`
        INSERT INTO sheets_ingest_runs (sheet_id, range, imported_rows, errors)
        VALUES (${sheetId}, ${range}, 0, ${JSON.stringify(errors)})
      `;

      return {
        processed,
        ingested,
        errors
      };
    }
  }
);
