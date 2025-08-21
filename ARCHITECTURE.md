# PureLivingPro Architecture Documentation

## Overview

PureLivingPro is a comprehensive affiliate marketing website built with **Encore.ts** for the backend and **React** for the frontend. The platform focuses on health and wellness content with AI-powered product recommendations, affiliate link tracking, and comprehensive analytics.

### Key Features
- 🏥 Health & wellness content management
- 🤖 AI-powered product recommendations
- 🔗 Affiliate link tracking and analytics
- 📊 Comprehensive analytics dashboard
- 🔍 Full-text search capabilities
- 📱 Responsive design with mobile optimization
- 🚀 SEO-optimized with dynamic sitemaps

## Architecture Principles

1. **Microservices with Encore.ts**: Each domain (content, affiliate, analytics, AI) is a separate service
2. **Type Safety**: End-to-end TypeScript with shared types between frontend and backend
3. **Graceful Degradation**: System works without external API keys (AI, payments)
4. **Performance First**: Optimized queries, caching, and lazy loading
5. **SEO Optimized**: Server-side sitemap generation and meta tag management

## Backend Architecture (Encore.ts)

### Service Structure

```
backend/
├── content/          # Content management service
├── affiliate/        # Affiliate tracking and management
├── analytics/        # User behavior and performance analytics
├── ai/              # AI-powered recommendations and chat
└── seo/             # SEO utilities (sitemap, robots.txt)
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

**Key Endpoints**:
- `GET /articles` - List articles with filtering and pagination
- `GET /articles/:slug` - Get single article by slug
- `POST /articles` - Create new article
- `GET /articles/search` - Full-text search with relevance scoring

#### Affiliate Service (`backend/affiliate/`)
- **Purpose**: Manages affiliate programs, products, and click tracking
- **Key Features**:
  - Short URL generation (`/r/:shortCode`)
  - Click tracking with device/location data
  - Conversion tracking and commission calculation
  - Comprehensive analytics

**Key Endpoints**:
- `GET /r/:shortCode` - Redirect and track affiliate clicks
- `POST /affiliate/links` - Create new affiliate tracking links
- `GET /affiliate/stats` - Comprehensive affiliate analytics
- `GET /affiliate/products` - List affiliate products with filtering

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
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main articles/blog posts
CREATE TABLE articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  category_id BIGINT REFERENCES categories(id),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Affiliate Tables
```sql
-- Affiliate programs (Amazon, iHerb, etc.)
CREATE TABLE affiliate_programs (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  commission_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  cookie_duration INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE
);

-- Products from affiliate programs
CREATE TABLE affiliate_products (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT REFERENCES affiliate_programs(id),
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION,
  original_url TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Short links for tracking
CREATE TABLE affiliate_links (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES affiliate_products(id),
  short_code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Click tracking
CREATE TABLE affiliate_clicks (
  id BIGSERIAL PRIMARY KEY,
  link_id BIGINT REFERENCES affiliate_links(id),
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  content_id TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Environment Variables

#### Required
- `SESSION_SECRET` - Session encryption key (32+ characters)

#### Optional
- `OpenAIKey` - OpenAI API key for AI features
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 4000)

## Frontend Architecture (React + Vite)

### Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AIAssistant.tsx # AI chat widget
│   ├── ProductCard.tsx # Product display component
│   └── ...
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── ArticlePage.tsx # Article detail page
│   ├── AdminPage.tsx   # Admin dashboard
│   └── ...
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── App.tsx            # Main app component
```

### Key Components

#### ProductCard (`frontend/components/ProductCard.tsx`)
- Displays affiliate products with tracking
- Handles click tracking and attribution
- Supports confidence scoring for AI recommendations

#### AIAssistant (`frontend/components/AIAssistant.tsx`)
- Floating chat widget for health advice
- Conversation history management
- Graceful fallback when AI unavailable

#### AdminPage (`frontend/pages/AdminPage.tsx`)
- Comprehensive admin dashboard
- Content management (articles, categories, tags)
- Analytics visualization
- Affiliate product management

### State Management

- **TanStack Query**: Server state management and caching
- **React Router**: Client-side routing
- **React Hooks**: Local component state

### Affiliate Tracking

The frontend includes sophisticated affiliate tracking:

```typescript
// Generate tracking URLs
const trackingUrl = buildAffiliateUrl(shortCode, {
  contentId: 'ai_recommendations',
  campaign: 'product_recommendation',
  source: 'product_card'
});

// Track clicks with analytics
trackAffiliateClick(productId, shortCode, contentId);
```

## Data Flow

### Content Flow
1. **Admin creates content** → Content Service → Database
2. **User visits page** → Analytics tracking → Page view recorded
3. **User searches** → Search Service → Analytics tracking
4. **Content displayed** → SEO optimization → Search engines

### Affiliate Flow
1. **Product recommendation** → AI Service → Product matching
2. **User clicks product** → Affiliate tracking → Click recorded
3. **Redirect to merchant** → Commission tracking → Analytics
4. **Purchase conversion** → Webhook → Commission calculation

### AI Flow
1. **User asks question** → AI Service → OpenAI API (if available)
2. **AI response** → Conversation storage → Display to user
3. **Product recommendation** → Keyword matching → Affiliate products
4. **Fallback handling** → Graceful degradation → Static responses

## Deployment

### Build Process
1. **Frontend**: Vite builds React app to `dist/`
2. **Backend**: Encore.ts compiles services
3. **Database**: Migrations run automatically
4. **Assets**: Static files served by Encore.ts

### Environment Setup
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Health Monitoring
- **Health Check**: `GET /healthz` returns service status
- **Database**: Connection health monitoring
- **AI Services**: API key validation
- **Affiliate System**: Link validation

## Security

### Data Protection
- **Input Validation**: All API inputs validated
- **SQL Injection**: Parameterized queries only
- **XSS Protection**: Content sanitization
- **CORS**: Configured for production domain

### Privacy
- **IP Anonymization**: Last octet removed from stored IPs
- **Session Management**: Secure session handling
- **Data Retention**: Configurable analytics retention

## Performance

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Query result caching where appropriate
- **Connection Pooling**: Efficient database connections

### Frontend Optimizations
- **Code Splitting**: Lazy loading of admin components
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Optimization**: Tree shaking and minification

## Monitoring & Analytics

### Built-in Analytics
- Page view tracking with referrer data
- Search query analytics
- Affiliate click tracking
- User session analysis

### External Integration
- Google Analytics 4 ready
- Custom event tracking
- Conversion funnel analysis

## Future Enhancements

### Planned Features
1. **Email Marketing**: Newsletter integration
2. **User Accounts**: Personalized recommendations
3. **Advanced AI**: GPT-4 integration for better recommendations
4. **Mobile App**: React Native companion app
5. **A/B Testing**: Built-in experimentation framework

### Scalability Considerations
- **Microservices**: Easy to scale individual services
- **Database Sharding**: User-based data partitioning
- **CDN Integration**: Static asset optimization
- **Caching Layer**: Redis for high-traffic scenarios

---

This architecture provides a solid foundation for a profitable affiliate marketing website while maintaining flexibility for future growth and feature additions.
