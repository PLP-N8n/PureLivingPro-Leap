import { google } from 'googleapis';
import { googleClientEmail, googlePrivateKey } from '../automation/secrets';
import type { SheetRow } from '../automation/types';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: googleClientEmail(),
    private_key: googlePrivateKey().replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

export async function fetchSheetData(range: string): Promise<SheetRow[]> {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
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
