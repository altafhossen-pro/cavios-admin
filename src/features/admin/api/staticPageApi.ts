import httpClient from '@/helpers/httpClient';

/**
 * Static Page API Service
 * Handles static page-related API calls for admin
 */

export interface StaticPage {
  _id: string;
  title: string;
  slug: string;
  content: string; // HTML content
  pageType: 'shipping' | 'return-refund' | 'privacy-policy' | 'terms-conditions' | 'faqs' | 'other';
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaticPagesParams {
  page?: number;
  limit?: number;
  search?: string;
  pageType?: string;
  isActive?: boolean;
}

export interface StaticPagesResponse {
  success: boolean;
  data: {
    pages: StaticPage[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message: string;
}

export interface StaticPageResponse {
  success: boolean;
  data: {
    page: StaticPage;
  };
  message: string;
}

/**
 * Get all static pages for admin (with pagination, search, filter)
 */
export const getStaticPages = async (params: StaticPagesParams = {}): Promise<StaticPagesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.pageType) queryParams.append('pageType', params.pageType);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString();
    const url = `/static-page${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: {
        pages: response.data.data?.pages || [],
        pagination: response.data.data?.pagination,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching static pages:', error);
    return {
      success: false,
      data: {
        pages: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch static pages',
    };
  }
};

/**
 * Get static page by ID
 */
export const getStaticPageById = async (id: string): Promise<StaticPageResponse> => {
  try {
    const response = await httpClient.get(`/static-page/${id}`);
    return {
      success: response.data.success,
      data: {
        page: response.data.data?.page || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching static page:', error);
    throw {
      success: false,
      data: { page: {} as StaticPage },
      message: error.response?.data?.message || error.message || 'Failed to fetch static page',
    };
  }
};

/**
 * Create static page
 */
export interface CreateStaticPageRequest {
  title: string;
  slug: string;
  content: string; // HTML content from TinyMCE
  pageType?: 'shipping' | 'return-refund' | 'privacy-policy' | 'terms-conditions' | 'faqs' | 'other';
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export const createStaticPage = async (pageData: CreateStaticPageRequest): Promise<StaticPageResponse> => {
  try {
    const response = await httpClient.post('/static-page', pageData);
    return {
      success: response.data.success,
      data: {
        page: response.data.data?.page || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error creating static page:', error);
    throw {
      success: false,
      data: { page: {} as StaticPage },
      message: error.response?.data?.message || error.message || 'Failed to create static page',
    };
  }
};

/**
 * Update static page
 */
export interface UpdateStaticPageRequest {
  title?: string;
  slug?: string;
  content?: string; // HTML content from TinyMCE
  pageType?: 'shipping' | 'return-refund' | 'privacy-policy' | 'terms-conditions' | 'faqs' | 'other';
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export const updateStaticPage = async (
  id: string,
  pageData: UpdateStaticPageRequest
): Promise<StaticPageResponse> => {
  try {
    const response = await httpClient.patch(`/static-page/${id}`, pageData);
    return {
      success: response.data.success,
      data: {
        page: response.data.data?.page || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating static page:', error);
    throw {
      success: false,
      data: { page: {} as StaticPage },
      message: error.response?.data?.message || error.message || 'Failed to update static page',
    };
  }
};

/**
 * Delete static page
 */
export const deleteStaticPage = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.delete(`/static-page/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error deleting static page:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete static page',
    };
  }
};

/**
 * Check if a slug is available
 */
export const checkSlugAvailability = async (slug: string, pageId?: string): Promise<{ available: boolean; slug?: string }> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('slug', slug);
    if (pageId) {
      queryParams.append('pageId', pageId);
    }
    const url = `/static-page/check-slug?${queryParams.toString()}`;
    const response = await httpClient.get(url);
    return {
      available: response.data.data?.available ?? false,
      slug: response.data.data?.slug,
    };
  } catch (error: any) {
    console.error('Error checking slug availability:', error);
    return { available: false };
  }
};

