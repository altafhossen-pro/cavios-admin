import httpClient from '@/helpers/httpClient';

/**
 * Banner Collection API Service
 * Handles banner collection-related API calls for admin
 */

export interface BannerCollection {
  _id: string;
  image: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  style: 'default' | 'position';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerCollectionsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
}

export interface BannerCollectionsResponse {
  success: boolean;
  data: {
    bannerCollections: BannerCollection[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message: string;
}

export interface BannerCollectionResponse {
  success: boolean;
  data: {
    bannerCollection: BannerCollection;
  };
  message: string;
}

/**
 * Get all banner collections for admin (with pagination, search, filter)
 */
export const getBannerCollections = async (params: BannerCollectionsParams = {}): Promise<BannerCollectionsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/banner-collection${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: {
        bannerCollections: response.data.data?.bannerCollections || [],
        pagination: response.data.data?.pagination,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching banner collections:', error);
    return {
      success: false,
      data: {
        bannerCollections: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch banner collections',
    };
  }
};

/**
 * Get banner collection by ID
 */
export const getBannerCollectionById = async (id: string): Promise<BannerCollectionResponse> => {
  try {
    const response = await httpClient.get(`/banner-collection/${id}`);
    return {
      success: response.data.success,
      data: {
        bannerCollection: response.data.data?.bannerCollection || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching banner collection:', error);
    throw {
      success: false,
      data: { bannerCollection: {} as BannerCollection },
      message: error.response?.data?.message || error.message || 'Failed to fetch banner collection',
    };
  }
};

/**
 * Create banner collection
 */
export interface CreateBannerCollectionRequest {
  image: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  style?: 'default' | 'position';
  isActive?: boolean;
  order?: number;
}

export const createBannerCollection = async (bannerCollectionData: CreateBannerCollectionRequest): Promise<BannerCollectionResponse> => {
  try {
    const response = await httpClient.post('/banner-collection', bannerCollectionData);
    return {
      success: response.data.success,
      data: {
        bannerCollection: response.data.data?.bannerCollection || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error creating banner collection:', error);
    throw {
      success: false,
      data: { bannerCollection: {} as BannerCollection },
      message: error.response?.data?.message || error.message || 'Failed to create banner collection',
    };
  }
};

/**
 * Update banner collection
 */
export interface UpdateBannerCollectionRequest {
  image?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  style?: 'default' | 'position';
  isActive?: boolean;
  order?: number;
}

export const updateBannerCollection = async (
  id: string,
  bannerCollectionData: UpdateBannerCollectionRequest
): Promise<BannerCollectionResponse> => {
  try {
    const response = await httpClient.put(`/banner-collection/${id}`, bannerCollectionData);
    return {
      success: response.data.success,
      data: {
        bannerCollection: response.data.data?.bannerCollection || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating banner collection:', error);
    throw {
      success: false,
      data: { bannerCollection: {} as BannerCollection },
      message: error.response?.data?.message || error.message || 'Failed to update banner collection',
    };
  }
};

/**
 * Delete banner collection
 */
export const deleteBannerCollection = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.delete(`/banner-collection/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error deleting banner collection:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete banner collection',
    };
  }
};

/**
 * Toggle banner collection status (active/inactive)
 */
export const toggleBannerCollectionStatus = async (id: string): Promise<BannerCollectionResponse> => {
  try {
    const response = await httpClient.patch(`/banner-collection/${id}/toggle-status`);
    return {
      success: response.data.success,
      data: {
        bannerCollection: response.data.data?.bannerCollection || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error toggling banner collection status:', error);
    throw {
      success: false,
      data: { bannerCollection: {} as BannerCollection },
      message: error.response?.data?.message || error.message || 'Failed to toggle banner collection status',
    };
  }
};

