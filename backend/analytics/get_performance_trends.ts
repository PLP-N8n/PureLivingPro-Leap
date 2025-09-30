import { api } from "encore.dev/api";
import { analyticsDB } from "./db";
import { affiliateDB } from "../affiliate/db";
import { contentDB } from "../content/db";

export interface TrendDataPoint {
  date: string;
  value: number;
  change?: number;
}

export interface CategoryTrend {
  category: string;
  trend: TrendDataPoint[];
  growth: number;
}

export interface PerformanceTrends {
  revenue: {
    daily: TrendDataPoint[];
    weekly: TrendDataPoint[];
    monthly: TrendDataPoint[];
    forecast: TrendDataPoint[];
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

interface TrendsRequest {
  days?: number;
}

export const getPerformanceTrends = api<TrendsRequest, PerformanceTrends>(
  { expose: true, method: "GET", path: "/analytics/trends" },
  async (req) => {
    const days = req.days || 30;

    const dailyRevenue = await affiliateDB.queryAll<{
      date: string;
      value: number;
    }>`
      SELECT 
        DATE(converted_at) as date,
        COALESCE(SUM(commission_earned), 0) as value
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(converted_at)
      ORDER BY date ASC
    `;

    const revenueWithChange = dailyRevenue.map((point, index) => {
      const change = index > 0 
        ? ((point.value - dailyRevenue[index - 1].value) / (dailyRevenue[index - 1].value || 1)) * 100 
        : 0;
      return { ...point, change };
    });

    const weeklyRevenue = await affiliateDB.queryAll<{
      date: string;
      value: number;
    }>`
      SELECT 
        DATE_TRUNC('week', converted_at)::DATE as date,
        COALESCE(SUM(commission_earned), 0) as value
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '${days * 2} days'
      GROUP BY DATE_TRUNC('week', converted_at)
      ORDER BY date ASC
    `;

    const weeklyWithChange = weeklyRevenue.map((point, index) => {
      const change = index > 0 
        ? ((point.value - weeklyRevenue[index - 1].value) / (weeklyRevenue[index - 1].value || 1)) * 100 
        : 0;
      return { ...point, change };
    });

    const monthlyRevenue = await affiliateDB.queryAll<{
      date: string;
      value: number;
    }>`
      SELECT 
        DATE_TRUNC('month', converted_at)::DATE as date,
        COALESCE(SUM(commission_earned), 0) as value
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', converted_at)
      ORDER BY date ASC
    `;

    const monthlyWithChange = monthlyRevenue.map((point, index) => {
      const change = index > 0 
        ? ((point.value - monthlyRevenue[index - 1].value) / (monthlyRevenue[index - 1].value || 1)) * 100 
        : 0;
      return { ...point, change };
    });

    const forecast = generateForecast(dailyRevenue.slice(-14), 7);

    const dailyTraffic = await analyticsDB.queryAll<{
      date: string;
      value: number;
    }>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as value
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const trafficWithChange = dailyTraffic.map((point, index) => {
      const change = index > 0 
        ? ((point.value - dailyTraffic[index - 1].value) / (dailyTraffic[index - 1].value || 1)) * 100 
        : 0;
      return { ...point, change };
    });

    const weeklyTraffic = await analyticsDB.queryAll<{
      date: string;
      value: number;
    }>`
      SELECT 
        DATE_TRUNC('week', created_at)::DATE as date,
        COUNT(*) as value
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '${days * 2} days'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY date ASC
    `;

    const weeklyTrafficWithChange = weeklyTraffic.map((point, index) => {
      const change = index > 0 
        ? ((point.value - weeklyTraffic[index - 1].value) / (weeklyTraffic[index - 1].value || 1)) * 100 
        : 0;
      return { ...point, change };
    });

    const topPages = await analyticsDB.queryAll<{ path: string; views: number }>`
      SELECT 
        page_path as path,
        COUNT(*) as views
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 5
    `;

    const topPageTrends = await Promise.all(
      topPages.map(async (page) => {
        const trend = await analyticsDB.queryAll<{
          date: string;
          value: number;
        }>`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as value
          FROM page_views
          WHERE page_path = ${page.path}
            AND created_at >= NOW() - INTERVAL '${days} days'
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;

        const growth = trend.length > 1 
          ? ((trend[trend.length - 1].value - trend[0].value) / (trend[0].value || 1)) * 100 
          : 0;

        return {
          path: page.path,
          trend,
          growth,
        };
      })
    );

    const dailyConversions = await affiliateDB.queryAll<{
      date: string;
      value: number;
    }>`
      SELECT 
        DATE(converted_at) as date,
        COUNT(*) as value
      FROM affiliate_conversions
      WHERE converted_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(converted_at)
      ORDER BY date ASC
    `;

    const conversionsWithChange = dailyConversions.map((point, index) => {
      const change = index > 0 
        ? ((point.value - dailyConversions[index - 1].value) / (dailyConversions[index - 1].value || 1)) * 100 
        : 0;
      return { ...point, change };
    });

    const topConvertingProducts = await affiliateDB.queryAll<{
      productId: number;
      productName: string;
      conversions: number;
      clicks: number;
    }>`
      SELECT 
        p.id as "productId",
        p.name as "productName",
        COUNT(DISTINCT ac.id) as conversions,
        COUNT(DISTINCT acl.id) as clicks
      FROM affiliate_products p
      LEFT JOIN affiliate_links al ON p.id = al.product_id
      LEFT JOIN affiliate_clicks acl ON al.id = acl.link_id AND acl.clicked_at >= NOW() - INTERVAL '30 days'
      LEFT JOIN affiliate_conversions ac ON acl.id = ac.click_id AND ac.converted_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.name
      HAVING COUNT(DISTINCT ac.id) > 0
      ORDER BY conversions DESC
      LIMIT 5
    `;

    const productTrends = await Promise.all(
      topConvertingProducts.map(async (product) => {
        const trend = await affiliateDB.queryAll<{
          date: string;
          value: number;
        }>`
          SELECT 
            DATE(ac.converted_at) as date,
            COUNT(DISTINCT ac.id) as value
          FROM affiliate_conversions ac
          LEFT JOIN affiliate_clicks acl ON ac.click_id = acl.id
          LEFT JOIN affiliate_links al ON acl.link_id = al.id
          WHERE al.product_id = ${product.productId}
            AND ac.converted_at >= NOW() - INTERVAL '${days} days'
          GROUP BY DATE(ac.converted_at)
          ORDER BY date ASC
        `;

        const conversionRate = product.clicks > 0 
          ? (product.conversions / product.clicks) * 100 
          : 0;

        return {
          productId: product.productId,
          productName: product.productName,
          trend,
          conversionRate,
        };
      })
    );

    const publishingRate = await contentDB.queryAll<{
      date: string;
      value: number;
    }>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as value
      FROM articles
      WHERE published = true
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const publishingWithChange = publishingRate.map((point, index) => {
      const change = index > 0 
        ? ((point.value - publishingRate[index - 1].value) / (publishingRate[index - 1].value || 1)) * 100 
        : 0;
      return { ...point, change };
    });

    const categories = await contentDB.queryAll<{ id: number; name: string }>`
      SELECT id, name FROM categories ORDER BY name
    `;

    const categoryTrends = await Promise.all(
      categories.map(async (category) => {
        const trend = await contentDB.queryAll<{
          date: string;
          value: number;
        }>`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as value
          FROM articles
          WHERE category_id = ${category.id}
            AND published = true
            AND created_at >= NOW() - INTERVAL '${days} days'
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;

        const growth = trend.length > 1 
          ? ((trend[trend.length - 1].value - trend[0].value) / (trend[0].value || 1)) * 100 
          : 0;

        return {
          category: category.name,
          trend,
          growth,
        };
      })
    );

    const engagementTrend = await analyticsDB.queryAll<{
      date: string;
      value: number;
    }>`
      SELECT 
        DATE(pv.created_at) as date,
        COUNT(DISTINCT pv.ip_address)::FLOAT / NULLIF(COUNT(*)::FLOAT, 0) * 100 as value
      FROM page_views pv
      WHERE pv.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(pv.created_at)
      ORDER BY date ASC
    `;

    const engagementWithChange = engagementTrend.map((point, index) => {
      const change = index > 0 
        ? ((point.value - engagementTrend[index - 1].value) / (engagementTrend[index - 1].value || 1)) * 100 
        : 0;
      return { ...point, change };
    });

    return {
      revenue: {
        daily: revenueWithChange,
        weekly: weeklyWithChange,
        monthly: monthlyWithChange,
        forecast,
      },
      traffic: {
        daily: trafficWithChange,
        weekly: weeklyTrafficWithChange,
        topPages: topPageTrends,
      },
      conversions: {
        daily: conversionsWithChange,
        byProduct: productTrends,
      },
      content: {
        publishingRate: publishingWithChange,
        categoryTrends: categoryTrends.filter(ct => ct.trend.length > 0),
        engagementTrend: engagementWithChange,
      },
    };
  }
);

function generateForecast(historicalData: TrendDataPoint[], daysAhead: number): TrendDataPoint[] {
  if (historicalData.length < 3) {
    return [];
  }

  const values = historicalData.map(d => d.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  const recentTrend = values.slice(-7);
  const trendSlope = recentTrend.length > 1 
    ? (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length 
    : 0;

  const forecast: TrendDataPoint[] = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  let lastValue = historicalData[historicalData.length - 1].value;

  for (let i = 1; i <= daysAhead; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    const forecastValue = lastValue + (trendSlope * i);
    const adjustedValue = Math.max(0, forecastValue * (0.9 + Math.random() * 0.2));

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      value: adjustedValue,
    });
  }

  return forecast;
}