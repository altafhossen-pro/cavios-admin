import httpClient from '@/helpers/httpClient';

/**
 * Admin API Service
 * Handles admin-related API calls
 */

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  data: {
    admin: {
      _id: string;
      name: string;
      email: string;
      role: string;
      [key: string]: any;
    };
    token: string;
  };
  message: string;
}

/**
 * Admin login
 * @param {AdminLoginRequest} loginData - Login credentials
 * @returns {Promise<AdminLoginResponse>} API response with admin data and token
 */
export const adminLogin = async (loginData: AdminLoginRequest): Promise<AdminLoginResponse> => {
  try {
    // httpClient already has baseURL configured, so just use the path
    const response = await httpClient.post('/admin/user/login', loginData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error in admin login:', error);
    return {
      success: false,
      data: {
        admin: {} as any,
        token: '',
      },
      message: error.response?.data?.message || error.message || 'Failed to login',
    };
  }
};

export interface AdminProfileResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    roleId?: any;
    status: string;
    avatar?: string;
    roleDetails?: {
      _id: string;
      name: string;
      slug: string;
      isSuperAdmin: boolean;
      permissions: any[];
    };
    permissions?: any[];
    [key: string]: any;
  };
  message: string;
}

/**
 * Get admin profile
 * @returns {Promise<AdminProfileResponse>} API response with admin profile data
 */
export const getAdminProfile = async (): Promise<AdminProfileResponse> => {
  try {
    // Using user profile endpoint with admin token
    const response = await httpClient.get('/user/profile');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    return {
      success: false,
      data: {} as any,
      message: error.response?.data?.message || error.message || 'Failed to fetch profile',
    };
  }
};

