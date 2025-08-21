interface SheetRow {
  status: string;
  title: string;
  category: string;
  angle: string;
  keywords: string;
  cta: string;
  affiliateLink: string;
  productName: string;
  imageUrl: string;
  description: string;
  targetDate: string;
  draftUrl: string;
  liveUrl: string;
  batchId: string;
}

export async function fetchSheetData(apiKey: string, spreadsheetId: string, range: string): Promise<SheetRow[]> {
  if (!apiKey) {
    throw new Error("Google Sheets API key not configured");
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    // Skip header row
    return rows.slice(1).map((row: string[]) => ({
      status: row[0] || '',
      title: row[1] || '',
      category: row[2] || '',
      angle: row[3] || '',
      keywords: row[4] || '',
      cta: row[5] || '',
      affiliateLink: row[6] || '',
      productName: row[7] || '',
      imageUrl: row[8] || '',
      description: row[9] || '',
      targetDate: row[10] || '',
      draftUrl: row[11] || '',
      liveUrl: row[12] || '',
      batchId: row[13] || ''
    }));
  } catch (error) {
    console.error('Failed to fetch Google Sheets data:', error);
    throw error;
  }
}

export async function updateSheetRow(
  apiKey: string,
  spreadsheetId: string, 
  range: string, 
  values: string[][]
): Promise<void> {
  if (!apiKey) {
    throw new Error("Google Sheets API key not configured");
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW&key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values
      })
    });

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to update Google Sheets:', error);
    throw error;
  }
}
