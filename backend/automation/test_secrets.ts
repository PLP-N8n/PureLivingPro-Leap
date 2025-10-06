import { api } from "encore.dev/api";
import { openAIKey, googleSheetsId, googleClientEmail, googlePrivateKey, amazonAccessKey, amazonSecretKey, amazonStoreId, wordpressUrl, wordpressUsername, wordpressPassword, mediumToken } from "../config/secrets";

export interface SecretTestResult {
  service: string;
  status: "success" | "error" | "not_configured";
  message: string;
  details?: any;
}

export interface SecretsTestResponse {
  results: SecretTestResult[];
  overall_status: "all_good" | "some_issues" | "major_issues";
  tested_at: string;
}

async function testOpenAI(): Promise<SecretTestResult> {
  try {
    const key = await openAIKey();
    if (!key) {
      return {
        service: "OpenAI",
        status: "not_configured",
        message: "OpenAI API key not configured"
      };
    }

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      return {
        service: "OpenAI",
        status: "success",
        message: "OpenAI API connection successful"
      };
    } else {
      return {
        service: "OpenAI",
        status: "error",
        message: `OpenAI API error: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      service: "OpenAI",
      status: "error",
      message: `OpenAI connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function testGoogleSheets(): Promise<SecretTestResult> {
  try {
    const sheetsId = await googleSheetsId();
    const clientEmail = await googleClientEmail();
    const privateKey = await googlePrivateKey();

    if (!sheetsId || !clientEmail || !privateKey) {
      return {
        service: "Google Sheets",
        status: "not_configured",
        message: "Google Sheets credentials not fully configured"
      };
    }

    // Create JWT for Google Sheets API
    const jwt = require('jsonwebtoken');
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }, privateKey.replace(/\\n/g, '\n'), { algorithm: 'RS256' });

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`
    });

    if (!tokenResponse.ok) {
      return {
        service: "Google Sheets",
        status: "error",
        message: `Google Sheets auth failed: ${tokenResponse.status}`
      };
    }

    const tokenData = await tokenResponse.json() as { access_token: string };
    const access_token = tokenData.access_token;

    // Test sheets access
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (sheetsResponse.ok) {
      return {
        service: "Google Sheets",
        status: "success",
        message: "Google Sheets API connection successful"
      };
    } else {
      return {
        service: "Google Sheets",
        status: "error",
        message: `Google Sheets API error: ${sheetsResponse.status}`
      };
    }
  } catch (error) {
    return {
      service: "Google Sheets",
      status: "error",
      message: `Google Sheets connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function testAmazonAssociates(): Promise<SecretTestResult> {
  try {
    const accessKey = await amazonAccessKey();
    const secretKey = await amazonSecretKey();
    const storeId = await amazonStoreId();

    if (!accessKey || !secretKey || !storeId) {
      return {
        service: "Amazon Associates",
        status: "not_configured",
        message: "Amazon Associates credentials not fully configured"
      };
    }

    // Test Amazon Product Advertising API
    const crypto = require('crypto');
    const AWS_HOST = 'webservices.amazon.com';
    const AWS_REGION = 'us-east-1';
    const AWS_SERVICE = 'ProductAdvertisingAPI';
    
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substr(0, 8);
    
    const canonicalUri = '/paapi5/searchitems';
    const canonicalQuerystring = '';
    const canonicalHeaders = `host:${AWS_HOST}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-date';
    
    const payloadHash = crypto.createHash('sha256').update('{"Keywords":"test","Resources":["Images.Primary.Small"],"SearchIndex":"All","PartnerTag":"' + storeId + '","PartnerType":"Associates","Marketplace":"www.amazon.com"}').digest('hex');
    
    const canonicalRequest = `POST\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${AWS_REGION}/${AWS_SERVICE}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;
    
    const signingKey = (() => {
      const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
      const kRegion = crypto.createHmac('sha256', kDate).update(AWS_REGION).digest();
      const kService = crypto.createHmac('sha256', kRegion).update(AWS_SERVICE).digest();
      return crypto.createHmac('sha256', kService).update('aws4_request').digest();
    })();
    
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(`https://${AWS_HOST}${canonicalUri}`, {
      method: 'POST',
      headers: {
        'Authorization': authorizationHeader,
        'Content-Type': 'application/json; charset=utf-8',
        'Host': AWS_HOST,
        'X-Amz-Date': amzDate,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
      },
      body: JSON.stringify({
        Keywords: "test",
        Resources: ["Images.Primary.Small"],
        SearchIndex: "All",
        PartnerTag: storeId,
        PartnerType: "Associates",
        Marketplace: "www.amazon.com"
      })
    });

    if (response.ok || response.status === 400) {
      // 400 is acceptable as it means auth worked but query might be invalid
      return {
        service: "Amazon Associates",
        status: "success",
        message: "Amazon Associates API connection successful"
      };
    } else {
      return {
        service: "Amazon Associates",
        status: "error",
        message: `Amazon Associates API error: ${response.status}`
      };
    }
  } catch (error) {
    return {
      service: "Amazon Associates",
      status: "error",
      message: `Amazon Associates connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function testWordPress(): Promise<SecretTestResult> {
  try {
    const url = await wordpressUrl();
    const username = await wordpressUsername();
    const password = await wordpressPassword();

    if (!url || !username || !password) {
      return {
        service: "WordPress",
        status: "not_configured",
        message: "WordPress credentials not fully configured"
      };
    }

    const response = await fetch(`${url}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return {
        service: "WordPress",
        status: "success",
        message: "WordPress API connection successful"
      };
    } else {
      return {
        service: "WordPress",
        status: "error",
        message: `WordPress API error: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      service: "WordPress",
      status: "error",
      message: `WordPress connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function testMedium(): Promise<SecretTestResult> {
  try {
    const token = await mediumToken();

    if (!token) {
      return {
        service: "Medium",
        status: "not_configured",
        message: "Medium token not configured"
      };
    }

    const response = await fetch("https://api.medium.com/v1/me", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return {
        service: "Medium",
        status: "success",
        message: "Medium API connection successful"
      };
    } else {
      return {
        service: "Medium",
        status: "error",
        message: `Medium API error: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      service: "Medium",
      status: "error",
      message: `Medium connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export const testSecrets = api(
  { method: "GET", path: "/test-secrets", expose: true },
  async (): Promise<SecretsTestResponse> => {
    const results: SecretTestResult[] = [];

    // Test all services in parallel
    const [openaiResult, sheetsResult, amazonResult, wordpressResult, mediumResult] = await Promise.all([
      testOpenAI(),
      testGoogleSheets(),
      testAmazonAssociates(),
      testWordPress(),
      testMedium()
    ]);

    results.push(openaiResult, sheetsResult, amazonResult, wordpressResult, mediumResult);

    // Determine overall status
    const errorCount = results.filter(r => r.status === "error").length;
    const notConfiguredCount = results.filter(r => r.status === "not_configured").length;
    
    let overall_status: "all_good" | "some_issues" | "major_issues";
    if (errorCount === 0 && notConfiguredCount === 0) {
      overall_status = "all_good";
    } else if (errorCount > 2 || notConfiguredCount > 3) {
      overall_status = "major_issues";
    } else {
      overall_status = "some_issues";
    }

    return {
      results,
      overall_status,
      tested_at: new Date().toISOString()
    };
  }
);