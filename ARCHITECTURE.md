# PureLivingPro Architecture Documentation

## Overview

PureLivingPro is a comprehensive affiliate marketing website built with **Encore.ts** for the backend and **React** for the frontend. The platform focuses on health and wellness content with AI-powered product recommendations, affiliate link tracking, and comprehensive analytics.

### Key Features
- 🏥 Health & wellness content management
- 🤖 AI-powered product recommendations and content generation
- 🔗 Affiliate link tracking, health checks, and analytics
- 📊 Comprehensive analytics dashboard and reporting
- 🔍 Full-text search capabilities
- 📱 Responsive design with mobile optimization
- 🚀 SEO-optimized with dynamic sitemaps
- 🔄 Automated content pipeline: Google Sheets -> AI Draft -> WordPress/Medium

## Architecture Principles

1. **Microservices with Encore.ts**: Each domain (content, affiliate, analytics, AI, automation, seo) is a separate service
2. **Type Safety**: End-to-end TypeScript with shared types between frontend and backend
3. **Graceful Degradation**: System works without external API keys (AI, payments)
4. **Performance First**: Optimized queries, caching, and lazy loading
5. **SEO Optimized**: Server-side sitemap generation and meta tag management
6. **Automation-driven**: Cron jobs for ingestion, publishing, monitoring, and optimization.

## Backend Architecture (Encore.ts)

### Service Structure

```
backend/
├── content/          # Content management service
├── affiliate/        # Affiliate tracking and management
├── analytics/        # User behavior and performance analytics
├── ai/               # AI-powered recommendations and chat
├── automation/       # Automation workflows, scheduling, and integrations
└── seo/              # SEO utilities (sitemap, robots.txt)
```

### Core Services

#### Content Service (`backend/content/`)
- **Purpose**: Manages articles, categories, tags, and content relationships
- **Database**: PostgreSQL with full-text search capabilities
- **Key Features**:
  - Article CRUD operations with slug-based routing
  - Category and tag management
  - Related article recommendations
  - View count tracking
  - SEO-friendly URLs
  - Publishing to WordPress and Medium

**Key Endpoints**:
- `GET /articles` - List articles with filtering and pagination
- `GET /articles/:slug` - Get single article by slug
- `POST /articles` - Create new article
- `GET /articles/search` - Full-text search with relevance scoring
- `POST /content/publish-to-wordpress` - Publish article to WordPress
- `POST /content/publish-to-medium` - Publish article to Medium

#### Affiliate Service (`backend/affiliate/`)
- **Purpose**: Manages affiliate programs, products, and click tracking
- **Key Features**:
  - Short URL generation (`/r/:shortCode`)
  - Click tracking with device/location data
  - Conversion tracking and commission calculation
  - Comprehensive analytics
  - Full CRUD for products and programs

**Key Endpoints**:
- `GET /r/:shortCode` - Redirect and track affiliate clicks
- `POST /affiliate/links` - Create new affiliate tracking links
- `GET /affiliate/stats` - Comprehensive affiliate analytics
- `GET /affiliate/products` - List affiliate products with filtering
- `POST /affiliate/products` - Create a new affiliate product
- `PUT /affiliate/products/:id` - Update an affiliate product
- `DELETE /affiliate/products/:id` - Delete an affiliate product

#### Analytics Service (`backend/analytics/`)
- **Purpose**: Tracks user behavior and provides insights
- **Key Features**:
  - Page view tracking
  - Search query analytics
  - User session management
  - Performance metrics

**Key Endpoints**:
- `POST /analytics/page-view` - Track page views
- `POST /analytics/search` - Track search queries
- `GET /analytics/summary` - Analytics dashboard data

#### AI Service (`backend/ai/`)
- **Purpose**: AI-powered features with graceful fallbacks
- **Key Features**:
  - Product recommendations based on user input
  - Health & wellness chat assistant
  - Conversation history and analytics
  - Fallback responses when AI unavailable

**Key Endpoints**:
- `POST /ai/chat` - AI chat assistant
- `POST /ai/recommendations` - Get product recommendations

#### Automation Service (`backend/automation/`)
- **Purpose**: Manages all automated workflows and integrations.
- **Key Features**:
  - Google Sheets content ingestion
  - Automated content generation and publishing pipeline
  - Scheduled affiliate link health checks
  - SEO performance tracking
  - Weekly performance reporting

**Key Endpoints**:
- `POST /automation/ingest/sheets` - Ingest content ideas from Google Sheets
- `POST /automation/run-tasks` - Manually trigger scheduled tasks
- `GET /automation/weekly-report` - Generate weekly performance report

#### SEO Service (`backend/seo/`)
- **Purpose**: SEO optimization utilities
- **Key Features**:
  - Dynamic sitemap generation
  - Robots.txt with proper directives
  - Health check endpoint

**Key Endpoints**:
- `GET /sitemap.xml` - Dynamic XML sitemap
- `GET /robots.txt` - Search engine directives
- `GET /healthz` - Health check for monitoring

### Database Schema

#### Content Tables
```sql
-- Categories for organizing content
CREATE TABLE categories ( ... );

-- Main articles/blog posts
CREATE TABLE articles (
  -- ... existing columns ...
  wp_post_id BIGINT,
  medium_post_id TEXT,
  seo_meta JSONB,
  affiliate_blocks JSONB
);
```

#### Affiliate Tables
```sql
-- Affiliate programs (Amazon, iHerb, etc.)
CREATE TABLE affiliate_programs ( ... );

-- Products from affiliate programs
CREATE TABLE affiliate_products ( ... );

-- Short links for tracking
CREATE TABLE affiliate_links (
  -- ... existing columns ...
  last_status TEXT,
  last_status_code INT,
  last_checked TIMESTAMPTZ,
  ctr_14d NUMERIC DEFAULT 0,
  revenue_14d NUMERIC DEFAULT 0
);

-- Click tracking
CREATE TABLE affiliate_clicks ( ... );
```

#### Automation Tables
```sql
-- Content publishing pipeline
CREATE TABLE content_pipeline (
  -- ... existing columns ...
  last_error TEXT,
  attempts INT NOT NULL DEFAULT 0
);

-- Affiliate link health checks
CREATE TABLE affiliate_link_health ( ... );

-- Google Sheets ingestion history
CREATE TABLE sheets_ingest_runs (
  id BIGSERIAL PRIMARY KEY,
  sheet_id TEXT NOT NULL,
  range TEXT NOT NULL,
  imported_rows INT NOT NULL DEFAULT 0,
  errors JSONB,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Environment Variables & Secrets

#### Required
- `SESSION_SECRET` - Session encryption key (32+ characters)
- `OpenAIKey` - OpenAI API key for AI features
- `GoogleSheetsId` - Google Sheet ID for content ingestion
- `GoogleClientEmail` - Google Service Account client email
- `GooglePrivateKey` - Google Service Account private key
- `WordPressUrl` - Base URL for WordPress site
- `WordPressUsername` - WordPress application username
- `WordPressPassword` - WordPress application password
- `MediumToken` - Medium integration token

## Frontend Architecture (React + Vite)

### Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin dashboard components
│   ├── AIAssistant.tsx # AI chat widget
│   └── ProductCard.tsx # Product display component
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── AdminPage.tsx   # Admin dashboard shell
│   └── ...
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── App.tsx            # Main app component
```

### Key Components

#### Admin Dashboard (`frontend/pages/AdminPage.tsx` & `frontend/components/admin/*`)
- A modular dashboard with a persistent sidebar for navigation.
- **Overview**: Displays KPIs, quick actions, and recent activity.
- **Blog Management**: Table view for posts with search/filter, and a modal-based editor with AI helper placeholders.
- **Product Management**: Table view for affiliate products, and a modal-based editor for CRUD operations.
- **Automation Hub**: Control panel for content ingestion, publishing pipelines, and monitoring automated tasks.

#### AIAssistant (`frontend/components/AIAssistant.tsx`)
- Floating chat widget for health advice
- Conversation history management
- Graceful fallback when AI unavailable

### State Management

- **TanStack Query**: Server state management and caching
- **React Router**: Client-side routing
- **React Hooks**: Local component state

## Data Flow

### Content Automation Flow
1. **Content idea added to Google Sheet** with status "Planned".
2. **Hourly cron job** (`ingest_from_sheets`) runs, fetching new rows.
3. **New rows are added** to the `content_pipeline` table in the `automation` database with status `scheduled`.
4. **5-minute cron job** (`process_scheduled_content`) picks up due items from the pipeline.
5. **AI service generates** a full article draft from the topic and keywords.
6. **Article is saved** to the `articles` table as a draft.
7. **SEO and affiliate optimization** steps are applied (can be manual or automated).
8. **Article is published** to WordPress and cross-posted to Medium.
9. **Article record is updated** with WordPress/Medium post IDs.
10. **Pipeline status is marked** as `published`.

### Affiliate Link Health Flow
1. **Daily cron job** (`check_affiliate_links`) runs.
2. **Each active affiliate link** is checked via a HEAD request.
3. **Result is stored** in `affiliate_link_health` table.
4. **Link status is updated** on the `affiliate_links` table.
5. **Broken links are flagged** in the admin dashboard for review.

---

This architecture provides a solid foundation for a profitable, highly-automated affiliate marketing website while maintaining flexibility for future growth.
