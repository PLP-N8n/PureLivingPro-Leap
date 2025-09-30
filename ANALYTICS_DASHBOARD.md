# Unified Analytics Dashboard

A comprehensive, real-time analytics dashboard that aggregates data from all services (content performance, affiliate revenue, automation status) into actionable insights with performance trends.

## Features

### 1. **Real-Time Metrics** (`/analytics/real-time`)
Provides live data updated every 10 seconds:
- **Live Visitors**: Active users in the last 5 minutes
- **Clicks & Conversions**: Last hour activity
- **Revenue Tracking**: Real-time revenue from affiliate conversions
- **Automation Activity**: Jobs in progress and completed
- **Active Pages**: Most visited pages right now
- **Recent Conversions**: Latest affiliate sales with commission amounts
- **Recent Clicks**: All affiliate link clicks in the last hour
- **System Performance**: Response time, success rate, and error rate

**Backend Endpoint**: `GET /analytics/real-time`
**Frontend Component**: `RealTimeMetrics.tsx`
**Auto-refresh**: Every 10 seconds

### 2. **Actionable Insights** (`/analytics/insights`)
AI-powered analysis that identifies issues and opportunities:

#### Performance Scorecard
- **Overall Score**: Composite health metric (0-100)
- **Category Scores**: Revenue, Content, Traffic, Automation
- Visual progress bars showing performance in each area

#### Intelligent Insights
Automatically detects and reports:
- **Broken affiliate links** (high priority warning)
- **Revenue decline/growth** trends
- **Low-converting products** (< 2% conversion rate)
- **Content production gaps** (below average publishing rate)
- **Traffic decline** (> 15% drop)
- **Automation failures** (multiple failed jobs)
- **High-performing categories** (for content strategy)
- **Stale content** (popular articles needing updates)

Each insight includes:
- Priority level (high/medium/low)
- Type indicator (warning/success/info/action)
- Category badge (revenue/content/traffic/automation/performance)
- Metric values and percentage changes
- **Suggested actions** for resolution

**Backend Endpoint**: `GET /analytics/insights`
**Frontend Component**: `InsightsPanel.tsx`
**Auto-refresh**: Every 60 seconds

### 3. **Performance Trends** (`/analytics/trends`)
Historical data analysis and forecasting:

#### Revenue Trends
- Daily, weekly, and monthly revenue charts
- 7-day revenue forecast using trend analysis
- Historical comparison and growth rates

#### Traffic Trends
- Daily and weekly page view trends
- Top pages performance with individual trend charts
- Growth percentages for each page

#### Conversion Trends
- Daily conversion charts
- Top converting products with trend lines
- Conversion rate tracking by product

#### Content Trends
- Publishing rate over time
- Category performance trends
- Engagement trend analysis

**Backend Endpoint**: `GET /analytics/trends?days={7|14|30|60|90}`
**Frontend Component**: `PerformanceTrendsChart.tsx`
**Auto-refresh**: Every 5 minutes

### 4. **Enhanced Unified Dashboard**
Improved main dashboard with 7 comprehensive tabs:

#### Overview Tab
- Key metrics cards (Revenue, Page Views, Conversion Rate, Articles)
- Revenue trend chart (14 days)
- Traffic overview chart
- Quick stats panel

#### Revenue Tab
- Monthly revenue trend comparison
- Daily revenue chart
- Top performing products with detailed metrics

#### Content Tab
- Content performance by category
- Publishing statistics (today/week/month)
- Top performing articles

#### Automation Tab
- Pipeline job status
- Link health monitoring
- Recent automation activity

#### Insights Tab
- Performance scorecard
- Actionable insights list
- Priority-based recommendations

#### Real-Time Tab
- Live visitor tracking
- Active pages monitoring
- Recent conversions and clicks
- System performance metrics

#### Trends Tab
- Historical revenue analysis
- Traffic patterns
- Conversion trends
- Content publishing trends

## Backend API Endpoints

### 1. Get Actionable Insights
```typescript
GET /analytics/insights

Response: {
  insights: InsightItem[];
  summary: {
    totalInsights: number;
    highPriority: number;
    actionableItems: number;
    lastGenerated: Date;
  };
  performanceScore: {
    overall: number;
    revenue: number;
    content: number;
    traffic: number;
    automation: number;
  };
}
```

**Scoring Algorithm**:
- Base score: 50
- Revenue: +/- based on growth, conversion rate, absolute revenue
- Content: +/- based on publishing rate, avg views, total articles
- Traffic: +/- based on week-over-week growth, unique visitors
- Automation: +/- based on failures, completed jobs, link health

### 2. Get Performance Trends
```typescript
GET /analytics/trends?days=30

Response: {
  revenue: {
    daily: TrendDataPoint[];
    weekly: TrendDataPoint[];
    monthly: TrendDataPoint[];
    forecast: TrendDataPoint[];  // 7-day forecast
  };
  traffic: {
    daily: TrendDataPoint[];
    weekly: TrendDataPoint[];
    topPages: Array<{
      path: string;
      trend: TrendDataPoint[];
      growth: number;
    }>;
  };
  conversions: {
    daily: TrendDataPoint[];
    byProduct: Array<{
      productId: number;
      productName: string;
      trend: TrendDataPoint[];
      conversionRate: number;
    }>;
  };
  content: {
    publishingRate: TrendDataPoint[];
    categoryTrends: CategoryTrend[];
    engagementTrend: TrendDataPoint[];
  };
}
```

### 3. Get Real-Time Metrics
```typescript
GET /analytics/real-time

Response: {
  timestamp: Date;
  liveVisitors: number;
  activePages: Array<{
    path: string;
    visitors: number;
    avgTimeOnPage: number;
  }>;
  recentConversions: Array<{
    id: number;
    productName: string;
    commission: number;
    convertedAt: Date;
  }>;
  recentClicks: Array<{...}>;
  currentMetrics: {
    clicksLastHour: number;
    conversionsLastHour: number;
    revenueLastHour: number;
    pageViewsLastHour: number;
    uniqueVisitorsLastHour: number;
  };
  automationActivity: {...};
  performanceIndicators: {...};
}
```

## Frontend Components

### InsightsPanel
Location: `frontend/components/admin/InsightsPanel.tsx`

Features:
- Performance scorecard with visual progress bars
- Prioritized list of insights
- Color-coded severity indicators
- Actionable recommendations
- Category and type badges

### RealTimeMetrics
Location: `frontend/components/admin/RealTimeMetrics.tsx`

Features:
- Auto-refreshing every 10 seconds
- Live visitor counter
- Recent activity feeds
- System health monitoring
- Time-ago formatting for recent events

### PerformanceTrendsChart
Location: `frontend/components/admin/PerformanceTrendsChart.tsx`

Features:
- Interactive charts using Recharts
- Time range selector (7/14/30/60/90 days)
- Multiple visualization types (line, area, bar charts)
- Trend indicators (up/down arrows with percentages)
- Forecast visualization

## Data Flow

1. **Analytics Service** aggregates data from:
   - Analytics DB (page views, searches)
   - Affiliate DB (clicks, conversions, revenue)
   - Content DB (articles, categories)
   - Automation DB (pipeline jobs, link health)

2. **Real-time Updates**:
   - Real-time metrics: 10s refresh
   - Insights: 60s refresh
   - Trends: 5min refresh
   - Unified dashboard: 30s refresh

3. **Performance Optimization**:
   - Database queries optimized with indexes
   - React Query caching
   - Stale-while-revalidate pattern
   - Error boundaries for resilience

## Usage

### Accessing the Dashboard
Navigate to `/admin` and select the "Analytics" or "Dashboard" tab.

### Interpreting Insights

**Priority Levels**:
- 🔴 **High**: Immediate attention required (revenue drop, broken links, failures)
- 🟡 **Medium**: Should address soon (content gaps, stale content)
- 🟢 **Low**: Informational (benchmarks, success metrics)

**Insight Types**:
- ⚠️ **Warning**: Problem detected
- ✅ **Success**: Positive performance
- ℹ️ **Info**: Neutral information
- ⚡ **Action**: Specific action recommended

### Performance Scores

**90-100**: Excellent - System performing optimally
**70-89**: Good - Minor improvements possible
**50-69**: Fair - Some areas need attention
**0-49**: Poor - Significant issues requiring immediate action

## Integration

The dashboard integrates with:
- **Content Service**: Article creation and performance
- **Affiliate Service**: Product tracking and revenue
- **Automation Service**: Pipeline jobs and scheduling
- **Analytics Service**: Tracking and reporting

All endpoints use the existing database connections and are protected by the same authentication as other admin endpoints.

## Future Enhancements

Potential additions:
- Predictive analytics using ML models
- Custom alert thresholds
- Export reports to PDF/Excel
- Scheduled email digests
- A/B testing insights
- SEO performance tracking
- Social media integration metrics
- Custom dashboard layouts
- Widget customization