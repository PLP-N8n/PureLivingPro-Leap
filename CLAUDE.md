# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PureLivingPro is a full-stack affiliate marketing platform for health and wellness content, built with **Encore.ts** (backend microservices) and **React** (frontend SPA). The platform features AI-powered content generation, affiliate link tracking, automated publishing pipelines, and comprehensive analytics.

## Development Commands

### Initial Setup

**Prerequisites:**
- Install Encore CLI: `brew install encoredev/tap/encore` (macOS) or see DEVELOPMENT.md for other platforms
- Install Bun: `npm install -g bun`

### Backend Development

```bash
cd backend
encore run                    # Start Encore dev server (http://localhost:4000)
encore gen client --target leap  # Generate TypeScript client for frontend
```

### Frontend Development

```bash
cd frontend
npm install                   # Install dependencies
npx vite dev                  # Start dev server (http://localhost:5173)
vite build                    # Production build
npm run lint                  # Run ESLint checks
```

### Testing

```bash
npm run test:e2e              # Run Playwright E2E tests
npm run test:a11y             # Run accessibility linting
npm run test:lhci             # Run Lighthouse CI audits
```

### Building for Production

```bash
cd backend
bun run build                 # Builds frontend into backend/frontend/dist/
```

## Architecture

### Backend: Encore.ts Microservices

The backend uses **Encore.ts**, a TypeScript backend framework with built-in infrastructure. Each service is independent with its own database and migrations.

**Services:**
- `content/` - Article CMS, categories, tags, multi-platform publishing (WordPress, Medium)
- `affiliate/` - Product management, affiliate link generation, click tracking, redirect handling
- `analytics/` - Page views, search tracking, unified dashboard
- `ai/` - Chat assistant, product recommendations
- `automation/` - Cron jobs for content generation, scheduling, publishing, link health checks, SEO tracking, analytics rollups
- `seo/` - Sitemap generation, robots.txt
- `newsletter/` - Email subscription management

**Key Architectural Points:**
- Each service declares endpoints in `encore.service.ts` files
- PostgreSQL databases are service-isolated (defined per service)
- SQL migrations in each service's `migrations/` folder (numbered sequentially: `1_*.up.sql`, `2_*.up.sql`)
- Type-safe API client auto-generated for frontend (`frontend/client.ts`)

### Frontend: React + Vite

**Core Stack:**
- React 19 + React Router v7 for routing
- Vite 6 for build tooling
- TanStack Query (React Query) for server state
- Tailwind CSS v4 + shadcn/ui components
- Framer Motion for animations (with reduced-motion support)
- Zod for validation

**Directory Structure:**
- `components/ui/` - shadcn/ui primitives (button, card, dropdown, etc.)
- `components/design-system/` - Core design components (MotionWrapper)
- `components/admin/` - Admin dashboard components
- `pages/` - Route page components
- `hooks/` - Custom hooks (useAnalytics, useAdminApi, useDebounce)
- `providers/` - React contexts (MotionProvider, ThemeProvider)
- `lib/` - Utilities, schemas, motion variants

**Design System:**
- All UI uses design tokens from `styles/globals.css` (never hardcode colors/spacing)
- Components documented in `components/COMPONENTS.md`
- Motion system: All animations guarded by `useMotion()` hook which checks `prefers-reduced-motion`
- Accessibility: WCAG 2.1 AA compliance enforced via eslint-plugin-jsx-a11y

### Critical Workflows

**Content Pipeline:**
1. Google Sheets → Ingestion (`automation/ingest_from_sheets.ts`)
2. AI generates draft content (`automation/content_generator.ts`)
3. Approval/editing
4. Scheduled publishing (`automation/content_scheduler.ts`)
5. Multi-platform distribution (`automation/content_publishing_pipeline.ts` → WordPress, Medium, internal)

**Affiliate System:**
- Products managed via `affiliate/create_product.ts`, `update_product.ts`
- Links generated with tracking (`affiliate/create_affiliate_link.ts`)
- Redirects handled by `affiliate/redirect_handler.ts` (tracks click before redirecting)
- Health monitoring via `automation/link_checker.ts`
- A/B testing via `automation/rotate_links.ts`

**Type Safety:**
- Backend API types auto-flow to frontend via generated client
- Run `encore gen client --target leap` after backend API changes
- Frontend imports from `./client` for all API calls

## Testing & Quality

### Playwright E2E Tests
- Config: `playwright.config.ts`
- Tests: `tests/e2e/*.spec.ts`
- Runs on Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Includes Axe accessibility scans via `@axe-core/playwright`

### Lighthouse CI
- Config: `lighthouserc.js`
- Enforces minimum scores: 90% performance, 95% accessibility, 90% best practices & SEO
- Tests key pages: home, blog index, article, products, product detail

### Accessibility
- Static: `eslint-plugin-jsx-a11y` in ESLint config
- Runtime: Axe scans in E2E tests
- All interactive elements must be keyboard accessible
- All animations must respect `prefers-reduced-motion`

## Contributing New Components

When adding UI components (see CONTRIBUTING.md for details):
1. Use Tailwind design tokens (e.g., `bg-primary`, not hardcoded colors)
2. Guard animations with `useMotion()` hook
3. Ensure keyboard accessibility and semantic HTML
4. Add all variants to `pages/UIPage.tsx` for visual regression testing
5. Run `npm run lint` and `npm run test:e2e` before PR

## Deployment

**Encore Cloud:** Push to `git remote add encore encore://pure-living-pro-4mhi` or connect GitHub integration
**Frontend:** Vercel (configured in `vercel.json`)
**Self-hosting:** Use `encore build docker` for containerized deployment
