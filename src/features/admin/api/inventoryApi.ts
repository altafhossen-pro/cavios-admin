import httpClient from '@/helpers/httpClient';

/**
 * Inventory API Service
 * Handles inventory-related API calls for admin
 */

export interface InventoryProduct {
  _id: string;
  title: string;
  slug: string;
  brand?: string;
  category: {
    _id: string;
    name: string;
  };
  featuredImage?: string;
  totalStock: number;
  variants: Array<{
    _id: string;
    sku: string;
    attributes: Array<{
      name: string;
      value: string;
      displayValue?: string;
      hexCode?: string;
    }>;
    stockQuantity: number;
    currentPrice: number;
    originalPrice?: number;
  }>;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  calculatedTotalStock?: number;
}

export interface InventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  stockFilter?: 'all' | 'low' | 'out' | 'in';
  sort?: string;
}

export interface InventoryResponse {
  success: boolean;
  data: InventoryProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface UpdateStockRequest {
  productId: string;
  variantSku?: string;
  type: 'add' | 'remove';
  quantity: number;
  reason?: string;
  reference?: string;
  cost?: number;
  notes?: string;
}

export interface UpdateStockResponse {
  success: boolean;
  data: {
    product: {
      _id: string;
      title: string;
      totalStock: number;
      variant?: {
        sku: string;
        stockQuantity: number;
      };
    };
    tracking: {
      _id: string;
      type: string;
      quantity: number;
      previousStock: number;
      newStock: number;
      reason?: string;
      notes?: string;
      createdAt: string;
    };
  };
  message: string;
}

/**
 * Get inventory products
 * @param {InventoryParams} params - Query parameters
 * @returns {Promise<InventoryResponse>} API response with products and pagination
 */
export const getInventory = async (params: InventoryParams = {}): Promise<InventoryResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.stockFilter) queryParams.append('stockFilter', params.stockFilter);
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/inventory${queryString ? `?${queryString}` : ''}`;
    const response = await httpClient.get(url);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

/**
 * Update product stock
 * @param {UpdateStockRequest} data - Stock update data
 * @returns {Promise<UpdateStockResponse>} API response with updated stock info
 */
export const updateStock = async (data: UpdateStockRequest): Promise<UpdateStockResponse> => {
  try {
    const response = await httpClient.post('/inventory/update-stock', data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating stock:', error);
    throw error;
  }
};

/**
 * Get product by ID for inventory
 * @param {string} productId - Product ID
 * @returns {Promise<{ success: boolean; data: InventoryProduct; message: string }>} API response
 */
export const getInventoryProductById = async (productId: string): Promise<{ success: boolean; data: InventoryProduct; message: string }> => {
  try {
    // Use product API to get product details
    const response = await httpClient.get(`/product/admin/${productId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching inventory product:', error);
    throw error;
  }
};

