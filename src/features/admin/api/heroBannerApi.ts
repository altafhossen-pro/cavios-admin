import httpClient from '@/helpers/httpClient';

/**
 * Hero Banner API Service
 * Handles hero banner-related API calls for admin
 */

export interface HeroBanner {
  _id: string;
  imgSrc: string;
  alt?: string;
  subheading?: string;
  heading: string;
  btnText: string;
  buttonLink?: string;
  // Legacy fields
  title?: string;
  description?: string;
  modelImage?: string;
  backgroundGradient?: string;
  button1Text?: string;
  button1Link?: string;
  button2Text?: string;
  button2Link?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeroBannersResponse {
  success: boolean;
  data: HeroBanner[];
  message: string;
}

export interface HeroBannerResponse {
  success: boolean;
  data: HeroBanner;
  message: string;
}

/**
 * Get all hero banners for admin (including inactive)
 */
export const getAllHeroBanners = async (): Promise<HeroBannersResponse> => {
  try {
    const response = await httpClient.get('/hero-banner/admin');
    return {
      success: response.data.success,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching hero banners:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch hero banners',
    };
  }
};

/**
 * Get hero banner by ID
 */
export const getHeroBannerById = async (id: string): Promise<HeroBannerResponse> => {
  try {
    const response = await httpClient.get(`/hero-banner/${id}`);
    return {
      success: response.data.success,
      data: response.data.data || ({} as HeroBanner),
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching hero banner:', error);
    throw {
      success: false,
      data: {} as HeroBanner,
      message: error.response?.data?.message || error.message || 'Failed to fetch hero banner',
    };
  }
};

/**
 * Create hero banner
 */
export interface CreateHeroBannerRequest {
  imgSrc: string;
  alt?: string;
  subheading?: string;
  heading: string;
  btnText: string;
  buttonLink?: string;
  isActive?: boolean;
  order?: number;
}

export const createHeroBanner = async (bannerData: CreateHeroBannerRequest): Promise<HeroBannerResponse> => {
  try {
    const response = await httpClient.post('/hero-banner', bannerData);
    return {
      success: response.data.success,
      data: response.data.data || ({} as HeroBanner),
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error creating hero banner:', error);
    throw {
      success: false,
      data: {} as HeroBanner,
      message: error.response?.data?.message || error.message || 'Failed to create hero banner',
    };
  }
};

/**
 * Update hero banner
 */
export interface UpdateHeroBannerRequest {
  imgSrc?: string;
  alt?: string;
  subheading?: string;
  heading?: string;
  btnText?: string;
  buttonLink?: string;
  isActive?: boolean;
  order?: number;
}

export const updateHeroBanner = async (
  id: string,
  bannerData: UpdateHeroBannerRequest
): Promise<HeroBannerResponse> => {
  try {
    const response = await httpClient.put(`/hero-banner/${id}`, bannerData);
    return {
      success: response.data.success,
      data: response.data.data || ({} as HeroBanner),
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating hero banner:', error);
    throw {
      success: false,
      data: {} as HeroBanner,
      message: error.response?.data?.message || error.message || 'Failed to update hero banner',
    };
  }
};

/**
 * Delete hero banner
 */
export const deleteHeroBanner = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.delete(`/hero-banner/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error deleting hero banner:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete hero banner',
    };
  }
};

/**
 * Update banner order
 */
export interface UpdateBannerOrderRequest {
  banners: Array<{ id: string; order: number }>;
}

export const updateBannerOrder = async (banners: Array<{ id: string; order: number }>): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.put('/hero-banner/order/update', { banners });
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating banner order:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update banner order',
    };
  }
};
