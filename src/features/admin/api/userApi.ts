import httpClient from '@/helpers/httpClient';

/**
 * Admin User API Service
 * Handles user-related API calls for admin (customers and staff)
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  roleId?: string;
  status?: string;
  image?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  ordersCount?: number;
}

export interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  customersOnly?: boolean;
  staffOnly?: boolean;
  sort?: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

/**
 * Get all users (customers or staff)
 * @param {UsersParams} params - Query parameters
 * @returns {Promise<UsersResponse>} API response with users and pagination
 */
export const getUsers = async (params: UsersParams = {}): Promise<UsersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.role) queryParams.append('role', params.role);
    if (params.customersOnly !== undefined) queryParams.append('customersOnly', params.customersOnly.toString());
    if (params.staffOnly !== undefined) queryParams.append('staffOnly', params.staffOnly.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/admin/user${queryString ? `?${queryString}` : ''}`;
    
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    console.error('Error fetching users:', error);
    return {
      success: false,
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
      message: err.response?.data?.message || err.message || 'Failed to fetch users',
    };
  }
};

/**
 * Get all customers
 * @param {Omit<UsersParams, 'customersOnly' | 'staffOnly'>} params - Query parameters
 * @returns {Promise<UsersResponse>} API response with customers
 */
export const getCustomers = async (params: Omit<UsersParams, 'customersOnly' | 'staffOnly'> = {}): Promise<UsersResponse> => {
  return getUsers({ ...params, customersOnly: true });
};

/**
 * Get all staff
 * @param {Omit<UsersParams, 'customersOnly' | 'staffOnly'>} params - Query parameters
 * @returns {Promise<UsersResponse>} API response with staff
 */
export const getStaff = async (params: Omit<UsersParams, 'customersOnly' | 'staffOnly'> = {}): Promise<UsersResponse> => {
  return getUsers({ ...params, staffOnly: true });
};

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  role?: string;
  roleId?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<ApiResponse<User>>} API response with user data
 */
export const getUserById = async (userId: string): Promise<ApiResponse<User>> => {
  try {
    const response = await httpClient.get(`/admin/user/${userId}`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    console.error('Error fetching user:', error);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to fetch user',
    };
  }
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {UpdateUserRequest} userData - User data to update
 * @returns {Promise<ApiResponse<User>>} API response with updated user
 */
export const updateUser = async (userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> => {
  try {
    const response = await httpClient.put(`/admin/user/${userId}`, userData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    console.error('Error updating user:', error);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to update user',
    };
  }
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<ApiResponse<null>>} API response
 */
export const deleteUser = async (userId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await httpClient.delete(`/admin/user/${userId}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    console.error('Error deleting user:', error);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to delete user',
    };
  }
};

/**
 * Create staff member
 * @param {CreateStaffRequest} staffData - Staff data
 * @returns {Promise<ApiResponse<User>>} API response with created staff
 */
export interface CreateStaffRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  roleId?: string;
  status?: string;
}

export const createStaff = async (staffData: CreateStaffRequest): Promise<ApiResponse<User>> => {
  try {
    const response = await httpClient.post('/admin/user', {
      ...staffData,
      role: 'admin', // Set role to admin for staff
      status: staffData.status || 'active',
    });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    console.error('Error creating staff:', error);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to create staff',
    };
  }
};

/**
 * Search users by email or phone (for manual order creation)
 */
export interface SearchUsersResponse {
  success: boolean;
  data: User[];
  message: string;
}

export const searchUsers = async (query: string): Promise<SearchUsersResponse> => {
  try {
    const response = await httpClient.get(`/admin/user/search?q=${encodeURIComponent(query)}`);
    return {
      success: response.data.success,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('Error searching users:', error);
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || err.message || 'Failed to search users',
    };
  }
};
