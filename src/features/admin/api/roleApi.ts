import httpClient from '@/helpers/httpClient';

/**
 * Role API Service
 * Handles role-related API calls
 */

export interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isSuperAdmin?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

/**
 * Get all roles
 * @param {Object} params - Query parameters (page, limit, search, sort)
 * @returns {Promise<RolesResponse>} API response with roles
 */
export const getRoles = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
} = {}): Promise<RolesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/admin/role${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: response.data.data || [],
      pagination: response.data.pagination,
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('Error fetching roles:', error);
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || err.message || 'Failed to fetch roles',
    };
  }
};

/**
 * Get all active roles (no pagination) - for dropdowns
 * @returns {Promise<Role[]>} Array of active roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await getRoles({ limit: 1000 });
    return response.data.filter((role) => role.isActive !== false);
  } catch (error) {
    console.error('Error fetching all roles:', error);
    return [];
  }
};

