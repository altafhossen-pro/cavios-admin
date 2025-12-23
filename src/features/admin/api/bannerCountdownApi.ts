import httpClient from '@/helpers/httpClient';

/**
 * Banner Countdown API Service
 * Handles banner countdown-related API calls for admin
 */

export interface BannerCountdown {
  _id: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  endDate: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerCountdownsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
}

export interface BannerCountdownsResponse {
  success: boolean;
  data: {
    bannerCountdowns: BannerCountdown[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message: string;
}

export interface BannerCountdownResponse {
  success: boolean;
  data: {
    bannerCountdown: BannerCountdown;
  };
  message: string;
}

/**
 * Get all banner countdowns for admin (with pagination, search, filter)
 */
export const getBannerCountdowns = async (params: BannerCountdownsParams = {}): Promise<BannerCountdownsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/banner-countdown${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: {
        bannerCountdowns: response.data.data?.bannerCountdowns || [],
        pagination: response.data.data?.pagination,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching banner countdowns:', error);
    return {
      success: false,
      data: {
        bannerCountdowns: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch banner countdowns',
    };
  }
};

/**
 * Get banner countdown by ID
 */
export const getBannerCountdownById = async (id: string): Promise<BannerCountdownResponse> => {
  try {
    const response = await httpClient.get(`/banner-countdown/${id}`);
    return {
      success: response.data.success,
      data: {
        bannerCountdown: response.data.data?.bannerCountdown || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching banner countdown:', error);
    throw {
      success: false,
      data: { bannerCountdown: {} as BannerCountdown },
      message: error.response?.data?.message || error.message || 'Failed to fetch banner countdown',
    };
  }
};

/**
 * Create banner countdown
 */
export interface CreateBannerCountdownRequest {
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  endDate: string;
  isActive?: boolean;
  order?: number;
}

export const createBannerCountdown = async (bannerCountdownData: CreateBannerCountdownRequest): Promise<BannerCountdownResponse> => {
  try {
    const response = await httpClient.post('/banner-countdown', bannerCountdownData);
    return {
      success: response.data.success,
      data: {
        bannerCountdown: response.data.data?.bannerCountdown || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error creating banner countdown:', error);
    throw {
      success: false,
      data: { bannerCountdown: {} as BannerCountdown },
      message: error.response?.data?.message || error.message || 'Failed to create banner countdown',
    };
  }
};

/**
 * Update banner countdown
 */
export interface UpdateBannerCountdownRequest {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  endDate?: string;
  isActive?: boolean;
  order?: number;
}

export const updateBannerCountdown = async (
  id: string,
  bannerCountdownData: UpdateBannerCountdownRequest
): Promise<BannerCountdownResponse> => {
  try {
    const response = await httpClient.put(`/banner-countdown/${id}`, bannerCountdownData);
    return {
      success: response.data.success,
      data: {
        bannerCountdown: response.data.data?.bannerCountdown || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating banner countdown:', error);
    throw {
      success: false,
      data: { bannerCountdown: {} as BannerCountdown },
      message: error.response?.data?.message || error.message || 'Failed to update banner countdown',
    };
  }
};

/**
 * Delete banner countdown
 */
export const deleteBannerCountdown = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.delete(`/banner-countdown/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error deleting banner countdown:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete banner countdown',
    };
  }
};

/**
 * Toggle banner countdown status (active/inactive)
 */
export const toggleBannerCountdownStatus = async (id: string): Promise<BannerCountdownResponse> => {
  try {
    const response = await httpClient.patch(`/banner-countdown/${id}/toggle-status`);
    return {
      success: response.data.success,
      data: {
        bannerCountdown: response.data.data?.bannerCountdown || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error toggling banner countdown status:', error);
    throw {
      success: false,
      data: { bannerCountdown: {} as BannerCountdown },
      message: error.response?.data?.message || error.message || 'Failed to toggle banner countdown status',
    };
  }
};

