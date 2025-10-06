import { google } from 'googleapis';
import { googleClientEmail, googlePrivateKey, googleSheetsId } from '../config/secrets';
import type { SheetRow } from '../automation/types';

export async function fetchSheetData(range: string, spreadsheetId?: string): Promise<SheetRow[]> {
  const clientEmail = await googleClientEmail();
  const privateKey = await googlePrivateKey();
  const sheetsId = spreadsheetId || await googleSheetsId();
  
  if (!clientEmail || !privateKey || !sheetsId) {
    throw new Error('Google Sheets credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth: (await auth.getClient()) as any });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetsId,
    range,
  });

  const [header, ...rows] = (res.data.values || []) as string[][];
  if (!header) {
    return [];
  }
  const idx = (k: string) => header.indexOf(k);

  return rows.map((r) => ({
    Status: r[idx('Status')] as SheetRow['Status'],
    Title: r[idx('Title')],
    Category: r[idx('Category')] as SheetRow['Category'],
    'Angle / Notes': r[idx('Angle / Notes')],
    Keywords: r[idx('Keywords')],
    'Call to Action': r[idx('Call to Action')],
    'Affiliate Link': r[idx('Affiliate Link')],
    'Product Name': r[idx('Product Name')],
    'Image URL': r[idx('Image URL')],
    'Brief Description or Benefit': r[idx('Brief Description or Benefit')],
    'Target Date': r[idx('Target Date')],
    'Draft URL': r[idx('Draft URL')],
    'Live URL': r[idx('Live URL')],
    'Batch ID': r[idx('Batch ID')],
  })) as SheetRow[];
}
