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
- 💌 "Wellness Circle" email list growth functionality

## Architecture Principles

1. **Microservices with Encore.ts**: Each domain (content, affiliate, analytics, AI, automation, seo, newsletter) is a separate service.
2. **Type Safety**: End-to-end TypeScript with shared types between frontend and backend.
3. **Graceful Degradation**: System works without external API keys (AI, payments).
4. **Performance First**: Optimized queries, caching, and lazy loading.
5. **SEO Optimized**: Server-side sitemap generation and meta tag management.
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
├── seo/              # SEO utilities (sitemap, robots.txt)
└── newsletter/       # Manages email subscriptions
```

### Core Services

#### Content Service (`backend/content/`)
- **Purpose**: Manages articles, categories, tags, and content relationships.
- **Database**: PostgreSQL with full-text search capabilities.
- **Key Features**: Article CRUD, category/tag management, related article recommendations, view count tracking, publishing to WordPress/Medium.

#### Affiliate Service (`backend/affiliate/`)
- **Purpose**: Manages affiliate programs, products, and click tracking.
- **Key Features**: Short URL generation, click/conversion tracking, analytics, product/program CRUD.

#### Analytics Service (`backend/analytics/`)
- **Purpose**: Tracks user behavior and provides insights.
- **Key Features**: Page view/search query tracking, session management, performance metrics.

#### AI Service (`backend/ai/`)
- **Purpose**: AI-powered features with graceful fallbacks.
- **Key Features**: Product recommendations, chat assistant, conversation history.

#### Automation Service (`backend/automation/`)
- **Purpose**: Manages all automated workflows and integrations.
- **Key Features**: Google Sheets ingestion, content pipeline, affiliate link health checks, SEO tracking, weekly reporting.

#### SEO Service (`backend/seo/`)
- **Purpose**: SEO optimization utilities.
- **Key Features**: Dynamic sitemap generation, robots.txt, health check endpoint.

#### Newsletter Service (`backend/newsletter/`)
- **Purpose**: Manages "Wellness Circle" email subscriptions.
- **Key Features**: Secure email subscription with validation and duplicate prevention.

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

#### Newsletter Table
```sql
-- Email subscriptions
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Environment Variables & Secrets

- `SESSION_SECRET`, `OpenAIKey`, `GoogleSheetsId`, `GoogleClientEmail`, `GooglePrivateKey`, `WordPressUrl`, `WordPressUsername`, `WordPressPassword`, `MediumToken`

## Frontend Architecture (React + Vite)

### Design Philosophy
- **Brand Identity**: Targets Gen Z & Millennials with a focus on clean living, mindfulness, and natural health.
- **Tone**: Clear, modern, warm, and credible. Avoids "fluff" and dark patterns.
- **UI/UX**: Aims to drive affiliate clicks, grow email signups, and maximize reader engagement on long-form content.
- **System**: A cohesive design system based on brand tokens for color, typography, spacing, and motion ensures consistency and rapid development.

### Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin dashboard components
│   └── design-system/  # Core design system components
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── ArticlePage.tsx # Individual article view
│   └── UIPage.tsx      # Design system showcase
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global styles and theming
└── App.tsx             # Main app component
```

### Key Components

#### Admin Dashboard (`frontend/pages/AdminPage.tsx` & `frontend/components/admin/*`)
- A modular dashboard for managing content, products, and automation.

#### Design System (`frontend/components/design-system/*`)
- A library of reusable, brand-aligned components including `Hero`, `InsightCard`, `ProductCard`, `CTASection`, `NewsletterSignup`, and more.

#### `ArticlePage.tsx`
- Optimized for readability with features like a reading progress bar, table of contents, and clear typographic hierarchy to keep users engaged.

### State Management

- **TanStack Query**: Server state management and caching.
- **React Router**: Client-side routing.
- **React Hooks**: Local component state.

## Data Flow

### Content Automation Flow
1. **Idea**: Content idea added to Google Sheet with status "Planned".
2. **Ingestion**: Hourly cron job (`ingest_from_sheets`) fetches new rows.
3. **Queue**: New rows are added to the `content_pipeline` table.
4. **Processing**: 5-minute cron job (`process_scheduled_content`) picks up due items.
5. **Generation**: AI service generates a full article draft.
6. **Drafting**: Article is saved to the `articles` table as a draft.
7. **Optimization**: SEO and affiliate optimization steps are applied.
8. **Publishing**: Article is published to WordPress and cross-posted to Medium.
9. **Updating**: Article record is updated with external post IDs.
10. **Completion**: Pipeline status is marked as `published`.

### Affiliate Link Health Flow
1. **Check**: Daily cron job (`check_affiliate_links`) runs a HEAD request on each active link.
2. **Store**: Result is stored in `affiliate_link_health` table.
3. **Update**: Link status is updated on the `affiliate_links` table.
4. **Flag**: Broken links are flagged in the admin dashboard.

---

This architecture provides a solid foundation for a profitable, highly-automated affiliate marketing website while maintaining flexibility for future growth.
