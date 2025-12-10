import httpClient from '@/helpers/httpClient';

/**
 * Admin Product API Service
 * Handles product-related API calls for admin
 */

export interface AdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  filterStatus?: string;
  sort?: string;
}

export interface AdminProductsResponse {
  success: boolean;
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

/**
 * Get all products for admin (with pagination, search, filter)
 * @param {AdminProductsParams} params - Query parameters
 * @returns {Promise<AdminProductsResponse>} API response with products and pagination
 */
export const getAdminProducts = async (params: AdminProductsParams = {}): Promise<AdminProductsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.filterStatus) queryParams.append('filterStatus', params.filterStatus);
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/product/admin/list${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: response.data.data || [],
      pagination: response.data.pagination || {
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return {
      success: false,
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch products',
    };
  }
};

export interface AdminProductResponse {
  success: boolean;
  data: any;
  message: string;
}

/**
 * Get single product by ID for admin
 * @param {string} productId - Product ID
 * @returns {Promise<AdminProductResponse>} API response with product data
 */
export const getAdminProductById = async (productId: string): Promise<AdminProductResponse> => {
  try {
    const response = await httpClient.get(`/product/admin/${productId}`);
    return {
      success: response.data.success,
      data: response.data.data || null,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching admin product:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to fetch product',
    };
  }
};

export interface CreateProductRequest {
  title: string;
  shortDescription?: string;
  description: string;
  category: string;
  subCategories?: string[];
  brand?: string;
  tags?: string[];
  productType?: 'simple' | 'variable' | 'grouped' | 'digital';
  isBracelet?: boolean;
  isRing?: boolean;
  braceletSizes?: string[];
  ringSizes?: string[];
  featuredImage?: string;
  gallery?: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  productVideos?: string[];
  variants?: Array<{
    sku: string;
    barcode?: string;
    attributes?: Array<{
      name: string;
      value: string;
      displayValue?: string;
      hexCode?: string;
      image?: string;
    }>;
    currentPrice: number;
    originalPrice?: number;
    costPrice?: number;
    salePrice?: number;
    stockQuantity?: number;
    lowStockThreshold?: number;
    stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock' | 'pre_order';
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    images?: Array<{
      url: string;
      altText?: string;
      isPrimary?: boolean;
      sortOrder?: number;
    }>;
    isActive?: boolean;
    availableFrom?: string;
    availableUntil?: string;
  }>;
  basePrice?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  specifications?: Array<{
    key: string;
    value: string;
    group?: string;
  }>;
  availableAttributes?: Array<{
    name: string;
    values: string[];
  }>;
  totalStock?: number;
  status?: 'draft' | 'published' | 'archived' | 'out_of_stock';
  isActive?: boolean;
  isFeatured?: boolean;
  isBestselling?: boolean;
  isNewArrival?: boolean;
  shippingInfo?: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    shippingClass?: string;
    freeShippingEligible?: boolean;
    handlingTime?: number;
  };
  additionalInfo?: string;
  deliveryInfo?: string;
  returnPolicy?: string;
  warrantyInfo?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  slug?: string;
}

export interface CreateProductResponse {
  success: boolean;
  data: any;
  message: string;
}

/**
 * Create a new product
 * @param {CreateProductRequest} productData - Product data
 * @returns {Promise<CreateProductResponse>} API response with created product
 */
export const createProduct = async (productData: CreateProductRequest): Promise<CreateProductResponse> => {
  try {
    const response = await httpClient.post('/product', productData);
    return {
      success: response.data.success,
      data: response.data.data || null,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to create product',
    };
  }
};

