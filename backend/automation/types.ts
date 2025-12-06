export type SheetRow = {
  Status: 'Planned' | 'Drafted' | 'Published' | 'Needs Product';
  Title: string;
  Category: 'Nutrition' | 'Mindfulness & Meditation' | 'Fitness & Exercise' | 'Natural Remedies' | 'Healthy Recipes' | 'Premium Supplements' | 'Skin Care';
  'Angle / Notes': string;
  Keywords: string;
  'Call to Action': string;
  'Affiliate Link'?: string;
  'Product Name'?: string;
  'Image URL'?: string;
  'Brief Description or Benefit'?: string;
  'Target Date'?: string;               // ISO
  'Draft URL'?: string;
  'Live URL'?: string;
  'Batch ID'?: string;
};

export type PublishStage =
  | 'INGESTED' | 'DRAFTED' | 'SEO_APPLIED' | 'AFFILIATE_ENRICHED' | 'READY_TO_PUBLISH' | 'PUBLISHED';

export type GeneratedPost = {
  title: string;
  html: string;
  excerpt?: string;
  tags?: string[];
  seo?: { title?: string; description?: string; schema?: any };
  affiliateBlocks?: Array<{ name: string; link: string; img?: string; blurb?: string }>;
  disclosureInjected?: boolean;
};
