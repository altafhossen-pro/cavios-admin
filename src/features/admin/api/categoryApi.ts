import httpClient from '@/helpers/httpClient';

/**
 * Category API Service
 * Handles category-related API calls
 */

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  parent?: string | Category;
  children?: Category[];
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

/**
 * Get all categories
 * @param {Object} params - Query parameters (page, limit, sort, isActive, parent)
 * @returns {Promise<CategoriesResponse>} API response with categories
 */
export const getCategories = async (params: {
  page?: number;
  limit?: number;
  sort?: string;
  isActive?: boolean;
  parent?: string | null;
} = {}): Promise<CategoriesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.parent !== undefined) {
      queryParams.append('parent', params.parent === null ? 'null' : params.parent);
    }

    const queryString = queryParams.toString();
    const url = `/category${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: response.data.data || [],
      pagination: response.data.pagination,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch categories',
    };
  }
};

/**
 * Get all categories (no pagination) - for dropdowns
 * @returns {Promise<Category[]>} Array of categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await getCategories({ limit: 1000, isActive: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }
};

