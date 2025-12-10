import httpClient from '@/helpers/httpClient';

/**
 * Admin Order API Service
 * Handles order-related API calls for admin
 */

export interface AdminOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}

export interface AdminOrdersResponse {
  success: boolean;
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message: string;
}

export interface AdminOrderResponse {
  success: boolean;
  data: any;
  message: string;
}

export interface UpdateOrderStatusParams {
  status: string;
  reason?: string;
  notes?: string;
}

export interface UpdateOrderParams {
  status?: string;
  paymentStatus?: string;
  shippingAddress?: any;
  billingAddress?: any;
  shippingCost?: number;
  discount?: number;
  couponDiscount?: number;
  items?: any[];
  orderNotes?: string;
  adminNotes?: string;
  reason?: string;
}

/**
 * Get all orders for admin (with pagination, search, filter)
 */
export const getAdminOrders = async (params: AdminOrdersParams = {}): Promise<AdminOrdersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.paymentStatus && params.paymentStatus !== 'all') queryParams.append('paymentStatus', params.paymentStatus);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.includeDeleted) queryParams.append('includeDeleted', params.includeDeleted.toString());

    const queryString = queryParams.toString();
    const url = `/order/admin/list${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: response.data.data || [],
      pagination: response.data.pagination || {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch orders',
    };
  }
};

/**
 * Get order by ID
 */
export const getAdminOrderById = async (orderId: string): Promise<AdminOrderResponse> => {
  try {
    const response = await httpClient.get(`/order/${orderId}`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to fetch order',
    };
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, params: UpdateOrderStatusParams): Promise<AdminOrderResponse> => {
  try {
    const response = await httpClient.patch(`/order/${orderId}`, {
      status: params.status,
      ...(params.reason && { reason: params.reason }),
      ...(params.notes && { adminNotes: params.notes }),
    });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to update order status',
    };
  }
};

/**
 * Update order comprehensively (status, shipping, payment, items, etc.)
 */
export const updateOrderComprehensive = async (orderId: string, params: UpdateOrderParams): Promise<AdminOrderResponse> => {
  try {
    const response = await httpClient.put(`/order/${orderId}/comprehensive`, params);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating order:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to update order',
    };
  }
};

/**
 * Delete order (soft delete)
 */
export const deleteOrder = async (orderId: string): Promise<AdminOrderResponse> => {
  try {
    const response = await httpClient.delete(`/order/${orderId}`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to delete order',
    };
  }
};

