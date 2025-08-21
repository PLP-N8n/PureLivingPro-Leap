import { api } from "encore.dev/api";
import { contentDB } from "./db";
import { fetchSheetData } from "../integrations/google-sheets";
import { googleSheetsApiKey } from "./secrets";

interface SyncFromSheetsRequest {
  spreadsheetId: string;
  range?: string;
  dryRun?: boolean;
}

interface SyncFromSheetsResponse {
  processed: number;
  created: number;
  updated: number;
  errors: string[];
}

// Syncs content from Google Sheets to the content database.
export const syncFromSheets = api<SyncFromSheetsRequest, SyncFromSheetsResponse>(
  { expose: true, method: "POST", path: "/content/sync-from-sheets" },
  async (req) => {
    const range = req.range || 'Sheet1!A:N';
    let processed = 0;
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      const rows = await fetchSheetData(googleSheetsApiKey(), req.spreadsheetId, range);
      
      for (const row of rows) {
        processed++;
        
        try {
          // Skip empty rows
          if (!row.title || !row.category) {
            continue;
          }

          // Check if article already exists
          const existingArticle = await contentDB.queryRow`
            SELECT id FROM articles WHERE title = ${row.title}
          `;

          if (existingArticle) {
            // Update existing article
            if (!req.dryRun) {
              await contentDB.exec`
                UPDATE articles 
                SET 
                  content = ${row.description || ''},
                  excerpt = ${row.angle || ''},
                  updated_at = NOW()
                WHERE id = ${existingArticle.id}
              `;
            }
            updated++;
          } else {
            // Create new article
            if (!req.dryRun) {
              // Get or create category
              let categoryId = null;
              if (row.category) {
                const category = await contentDB.queryRow<{ id: number }>`
                  SELECT id FROM categories WHERE name = ${row.category}
                `;
                
                if (category) {
                  categoryId = category.id;
                } else {
                  const newCategory = await contentDB.queryRow<{ id: number }>`
                    INSERT INTO categories (name, slug)
                    VALUES (${row.category}, ${row.category.toLowerCase().replace(/\s+/g, '-')})
                    RETURNING id
                  `;
                  categoryId = newCategory?.id;
                }
              }

              // Create article
              await contentDB.exec`
                INSERT INTO articles (
                  title, slug, content, excerpt, category_id,
                  author_name, author_email, published
                ) VALUES (
                  ${row.title},
                  ${row.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')},
                  ${row.description || ''},
                  ${row.angle || ''},
                  ${categoryId},
                  'Content Team',
                  'content@purelivingpro.com',
                  ${row.status === 'Published'}
                )
              `;
            }
            created++;
          }
        } catch (error) {
          errors.push(`Row ${processed}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        processed,
        created,
        updated,
        errors
      };
    } catch (error) {
      errors.push(`Failed to fetch sheet data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        processed,
        created,
        updated,
        errors
      };
    }
  }
);
