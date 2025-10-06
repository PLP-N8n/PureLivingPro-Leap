import { api } from "encore.dev/api";
import { automationDB } from "./db";
import { affiliateDB } from "../affiliate/db";
import { amazonAccessKey, amazonSecretKey, amazonStoreId } from "../config/secrets";
import crypto from "crypto";

interface ProductSearchRequest {
  keywords: string;
  category?: string;
  maxResults?: number;
}

interface AmazonProduct {
  asin: string;
  title: string;
  price?: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductSyncResponse {
  searched: number;
  found: number;
  imported: number;
  updated: number;
  errors: string[];
}

interface SearchProductsResponse {
  products: AmazonProduct[];
}

export const searchAmazonProducts = api<ProductSearchRequest, SearchProductsResponse>(
  { expose: true, method: "POST", path: "/automation/amazon/search" },
  async (req) => {
    const accessKey = await amazonAccessKey();
    const secretKey = await amazonSecretKey();
    const storeId = await amazonStoreId();

    if (!accessKey || !secretKey || !storeId) {
      throw new Error("Amazon Associates credentials not configured");
    }

    try {
      const searchIndex = getSearchIndex(req.category);
      const results = await callAmazonProductAPI('SearchItems', {
        Keywords: req.keywords,
        SearchIndex: searchIndex,
        Resources: [
          "Images.Primary.Large",
          "ItemInfo.Title",
          "ItemInfo.Features",
          "Offers.Listings.Price",
          "CustomerReviews.StarRating",
          "CustomerReviews.Count"
        ],
        ItemCount: Math.min(req.maxResults || 10, 10),
        PartnerTag: storeId,
        PartnerType: "Associates",
        Marketplace: "www.amazon.com"
      });

      const products: AmazonProduct[] = [];

      if (results.SearchResult?.Items) {
        for (const item of results.SearchResult.Items) {
          const product: AmazonProduct = {
            asin: item.ASIN,
            title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
            category: req.category,
          };

          // Extract price
          if (item.Offers?.Listings?.[0]?.Price?.DisplayAmount) {
            const priceStr = item.Offers.Listings[0].Price.DisplayAmount;
            product.price = parseFloat(priceStr.replace(/[£$,]/g, ''));
          }

          // Extract image URL
          if (item.Images?.Primary?.Large?.URL) {
            product.imageUrl = item.Images.Primary.Large.URL;
          }

          // Extract description from features
          if (item.ItemInfo?.Features?.DisplayValues) {
            product.description = item.ItemInfo.Features.DisplayValues.slice(0, 3).join('. ');
          }

          // Extract rating and review count
          if (item.CustomerReviews?.StarRating?.Value) {
            product.rating = parseFloat(item.CustomerReviews.StarRating.Value);
          }
          if (item.CustomerReviews?.Count?.Value) {
            product.reviewCount = parseInt(item.CustomerReviews.Count.Value);
          }

          products.push(product);
        }
      }

      return { products };
    } catch (error) {
      console.error('Amazon product search error:', error);
      throw new Error(`Amazon API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const syncAmazonProducts = api<{ categories: string[] }, ProductSyncResponse>(
  { expose: true, method: "POST", path: "/automation/amazon/sync" },
  async (req) => {
    let searched = 0;
    let found = 0;
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const category of req.categories) {
      try {
        searched++;
        
        // Get trending keywords for this category
        const keywords = await getTrendingKeywords(category);
        
        for (const keyword of keywords) {
          try {
            const searchResult = await searchAmazonProducts({
              keywords: keyword,
              category,
              maxResults: 5
            });
            
            found += searchResult.products.length;

            for (const product of searchResult.products) {
              try {
                // Generate a unique slug for the product
                const baseSlug = generateSlug(product.title, product.asin);
                const slug = await ensureUniqueSlug(baseSlug);
                
                // Get default Amazon affiliate program
                const amazonProgram = await getOrCreateAmazonProgram();
                
                // Check if product already exists by ASIN (most reliable) or exact title match
                const amazonUrl = `https://amazon.com/dp/${product.asin}?tag=${await amazonStoreId()}`;
                
                const existing = await affiliateDB.queryRow<{ id: number }>`
                  SELECT id FROM affiliate_products 
                  WHERE original_url LIKE ${'%' + product.asin + '%'} OR name = ${product.title}
                  LIMIT 1
                `;

                let productId: number;
                
                if (existing) {
                  // Update existing product with current data
                  await affiliateDB.exec`
                    UPDATE affiliate_products SET
                      price = COALESCE(${product.price || null}, price),
                      description = COALESCE(${product.description || null}, description),
                      image_url = COALESCE(${product.imageUrl || null}, image_url),
                      category = COALESCE(${product.category || null}, category),
                      updated_at = NOW()
                    WHERE id = ${existing.id}
                  `;
                  productId = existing.id;
                  updated++;
                } else {
                  // Create new product with all required fields populated
                  const newProduct = await affiliateDB.queryRow<{ id: number }>`
                    INSERT INTO affiliate_products (
                      program_id, name, slug, description, price, original_url, image_url, category, is_active
                    ) VALUES (
                      ${amazonProgram.id}, ${product.title}, ${slug}, ${product.description || 'Amazon product'}, 
                      ${product.price || null}, ${amazonUrl}, ${product.imageUrl || null}, 
                      ${product.category || 'general'}, true
                    )
                    RETURNING id
                  `;
                  
                  if (!newProduct) {
                    throw new Error(`Failed to create product for ASIN ${product.asin}`);
                  }
                  
                  productId = newProduct.id;
                  imported++;
                }

                // Create affiliate link if it doesn't exist
                const existingLink = await affiliateDB.queryRow<{ id: number }>`
                  SELECT id FROM affiliate_links WHERE product_id = ${productId}
                `;
                
                if (!existingLink) {
                  const shortCode = generateShortCode();
                  
                  // Ensure short code is unique
                  let uniqueShortCode = shortCode;
                  let attempts = 0;
                  while (attempts < 5) {
                    const codeExists = await affiliateDB.queryRow<{ id: number }>`
                      SELECT id FROM affiliate_links WHERE short_code = ${uniqueShortCode}
                    `;
                    
                    if (!codeExists) break;
                    
                    uniqueShortCode = generateShortCode();
                    attempts++;
                  }
                  
                  if (attempts >= 5) {
                    throw new Error(`Failed to generate unique short code for product ${product.asin}`);
                  }
                  
                  await affiliateDB.exec`
                    INSERT INTO affiliate_links (product_id, short_code, original_url, is_active)
                    VALUES (${productId}, ${uniqueShortCode}, ${amazonUrl}, true)
                  `;
                }

              } catch (productError) {
                errors.push(`Product ${product.asin}: ${productError instanceof Error ? productError.message : 'Unknown error'}`);
              }
            }

          } catch (keywordError) {
            errors.push(`Keyword ${keyword}: ${keywordError instanceof Error ? keywordError.message : 'Unknown error'}`);
          }
        }

      } catch (categoryError) {
        errors.push(`Category ${category}: ${categoryError instanceof Error ? categoryError.message : 'Unknown error'}`);
      }
    }

    // Log sync run
    await automationDB.exec`
      INSERT INTO amazon_sync_runs (
        categories_searched, products_found, products_imported, products_updated, errors
      ) VALUES (
        ${searched}, ${found}, ${imported}, ${updated}, ${JSON.stringify(errors)}
      )
    `;

    return {
      searched,
      found,
      imported,
      updated,
      errors
    };
  }
);

async function callAmazonProductAPI(operation: string, params: any): Promise<any> {
  const accessKey = await amazonAccessKey();
  const secretKey = await amazonSecretKey();
  
  const AWS_HOST = 'webservices.amazon.com';
  const AWS_REGION = 'us-east-1';
  const AWS_SERVICE = 'ProductAdvertisingAPI';
  
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substr(0, 8);
  
  const canonicalUri = `/paapi5/${operation.toLowerCase()}`;
  const canonicalQuerystring = '';
  const canonicalHeaders = `host:${AWS_HOST}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-date';
  
  const payload = JSON.stringify(params);
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
  
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
      'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`
    },
    body: payload
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Amazon API error ${response.status}: ${errorText}`);
  }

  return await response.json();
}

function getSearchIndex(category?: string): string {
  const categoryMap: Record<string, string> = {
    'health': 'HealthPersonalCare',
    'fitness': 'SportingGoods',
    'nutrition': 'HealthPersonalCare',
    'supplements': 'HealthPersonalCare',
    'wellness': 'HealthPersonalCare',
    'beauty': 'Beauty',
    'home': 'HomeGarden',
    'kitchen': 'KitchenDining'
  };

  return categoryMap[category?.toLowerCase() || ''] || 'All';
}

async function getTrendingKeywords(category: string): Promise<string[]> {
  // Get keywords from successful articles in this category
  const keywords = await automationDB.queryAll<{ keyword: string }>`
    SELECT DISTINCT unnest(target_keywords) as keyword
    FROM content_pipeline
    WHERE status = 'published'
    AND topic ILIKE ${`%${category}%`}
    ORDER BY keyword
    LIMIT 5
  `;

  if (keywords.length > 0) {
    return keywords.map(k => k.keyword);
  }

  // Fallback keywords by category
  const fallbackKeywords: Record<string, string[]> = {
    'health': ['wellness products', 'health supplements', 'natural health'],
    'fitness': ['workout equipment', 'fitness gear', 'exercise tools'],
    'nutrition': ['protein powder', 'vitamins', 'healthy snacks'],
    'wellness': ['aromatherapy', 'meditation tools', 'stress relief'],
    'beauty': ['skincare', 'natural beauty', 'organic cosmetics']
  };

  return fallbackKeywords[category.toLowerCase()] || ['wellness', 'health', 'natural'];
}

function generateSlug(title: string, asin: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  
  // Include ASIN to ensure uniqueness across products
  return `${baseSlug}-${asin.toLowerCase()}`;
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (counter <= 10) {
    const existing = await affiliateDB.queryRow<{ id: number }>`
      SELECT id FROM affiliate_products WHERE slug = ${slug}
    `;
    
    if (!existing) {
      return slug;
    }
    
    // If slug exists, append counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  // If we still can't find a unique slug after 10 attempts, use timestamp
  return `${baseSlug}-${Date.now()}`;
}

function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getOrCreateAmazonProgram(): Promise<{ id: number }> {
  // Try to find existing Amazon program
  let program = await affiliateDB.queryRow<{ id: number }>`
    SELECT id FROM affiliate_programs WHERE name = 'Amazon Associates'
  `;
  
  if (!program) {
    // Create Amazon program if it doesn't exist
    program = await affiliateDB.queryRow<{ id: number }>`
      INSERT INTO affiliate_programs (name, description, commission_rate, cookie_duration, tracking_domain)
      VALUES ('Amazon Associates', 'Amazon affiliate program', 0.05, 24, 'amazon.com')
      RETURNING id
    `;
  }
  
  if (!program) {
    throw new Error('Failed to create or find Amazon affiliate program');
  }
  
  return program;
}