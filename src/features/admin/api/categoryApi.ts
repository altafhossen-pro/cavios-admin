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
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || err.message || 'Failed to fetch categories',
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

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Promise<CategoryResponse>} API response with category
 */
export interface CategoryResponse {
  success: boolean;
  data: Category;
  message: string;
}

export const getCategoryById = async (id: string): Promise<CategoryResponse> => {
  try {
    const response = await httpClient.get(`/category/${id}`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error fetching category:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw {
      success: false,
      data: {} as Category,
      message: err.response?.data?.message || err.message || 'Failed to fetch category',
    };
  }
};

/**
 * Create category
 * @param {Object} categoryData - Category data
 * @returns {Promise<CategoryResponse>} API response with created category
 */
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  image?: string;
  parent?: string | null;
  isFeatured?: boolean;
}

export const createCategory = async (categoryData: CreateCategoryRequest): Promise<CategoryResponse> => {
  try {
    const response = await httpClient.post('/category', categoryData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw {
      success: false,
      data: {} as Category,
      message: err.response?.data?.message || err.message || 'Failed to create category',
    };
  }
};

/**
 * Update category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<CategoryResponse>} API response with updated category
 */
export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  image?: string;
  parent?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
}

export const updateCategory = async (id: string, categoryData: UpdateCategoryRequest): Promise<CategoryResponse> => {
  try {
    const response = await httpClient.put(`/category/${id}`, categoryData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw {
      success: false,
      data: {} as Category,
      message: err.response?.data?.message || err.message || 'Failed to update category',
    };
  }
};

/**
 * Delete category
 * @param {string} id - Category ID
 * @returns {Promise<{success: boolean; message: string}>} API response
 */
export const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.delete(`/category/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to delete category',
    };
  }
};

