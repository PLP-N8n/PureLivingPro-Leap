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
3. **Graceful Degradation**: System works without external API keys (AI, payments) and respects user motion preferences.
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

(Core services documentation remains unchanged)

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
├── providers/          # React Context providers (e.g., MotionProvider)
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

### Motion & Animation System
- **Library**: `framer-motion` is used for all animations.
- **Graceful Degradation**: A `MotionProvider` checks for the `prefers-reduced-motion` OS setting. All significant animations are disabled if this setting is active.
- **Motion Contract**: A centralized `motion.ts` file defines standard animation variants (e.g., `reveal`, `hoverCard`) to ensure consistency.
- **Implementation**: Components like cards and sections use a `MotionWrapper` or directly use `motion` components to apply animations conditionally based on the `useMotion` context.

### State Management

- **TanStack Query**: Server state management and caching.
- **React Router**: Client-side routing.
- **React Hooks**: Local component state.

## Data Flow

(Data flow documentation remains unchanged)

---

This architecture provides a solid foundation for a profitable, highly-automated affiliate marketing website while maintaining flexibility for future growth.
