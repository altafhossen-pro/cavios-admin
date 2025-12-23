import httpClient from '@/helpers/httpClient';

/**
 * Analytics API Service
 * Handles analytics-related API calls for admin
 */

export interface SalesDashboardParams {
  period?: 'today' | 'yesterday' | '7d' | '30d' | '90d' | '1y';
  startDate?: string; // ISO date string for custom range
  endDate?: string; // ISO date string for custom range
}

export interface ChartDataPoint {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  revenue: number;
  orders: number;
}

export interface CategorySales {
  _id: string;
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
}

export interface SalesDashboardStats {
  stats: {
    totalSales: number;
    totalOrders: number;
    salesGrowth: number;
    profit: number;
  };
  chartData: ChartDataPoint[];
  categorySales: CategorySales[];
  recentOrders: any[];
  transactions: {
    id: string;
    date: string;
    amount: string;
    status: 'Cr' | 'Dr';
    description: string;
  }[];
  recentUsers: any[];
}

export interface SalesDashboardResponse {
  success: boolean;
  data: SalesDashboardStats;
  message: string;
}

/**
 * Get sales dashboard stats
 */
export const getSalesDashboardStats = async (params: SalesDashboardParams = {}): Promise<SalesDashboardResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = `/admin/analytics/sales-dashboard${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: response.data.data || {
        stats: { totalSales: 0, totalOrders: 0, salesGrowth: 0, profit: 0 },
        chartData: [],
        categorySales: [],
        recentOrders: [],
        transactions: [],
        recentUsers: []
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching sales dashboard stats:', error);
    return {
      success: false,
      data: {
        stats: { totalSales: 0, totalOrders: 0, salesGrowth: 0, profit: 0 },
        chartData: [],
        categorySales: [],
        recentOrders: [],
        transactions: [],
        recentUsers: []
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch sales dashboard stats',
    };
  }
};

