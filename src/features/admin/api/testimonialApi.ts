import httpClient from '@/helpers/httpClient';

/**
 * Testimonial API Service
 * Handles testimonial-related API calls for admin
 */

export interface Testimonial {
  _id: string;
  profilePic?: string;
  name: string;
  designation?: string;
  rating: number;
  reviewText: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
}

export interface TestimonialsResponse {
  success: boolean;
  data: {
    testimonials: Testimonial[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message: string;
}

export interface TestimonialResponse {
  success: boolean;
  data: Testimonial;
  message: string;
}

/**
 * Get all testimonials for admin (with pagination, search, filter)
 */
export const getTestimonials = async (params: TestimonialsParams = {}): Promise<TestimonialsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/testimonial${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: {
        testimonials: response.data.data?.testimonials || [],
        pagination: response.data.data?.pagination,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    return {
      success: false,
      data: {
        testimonials: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch testimonials',
    };
  }
};

/**
 * Get testimonial by ID
 */
export const getTestimonialById = async (id: string): Promise<TestimonialResponse> => {
  try {
    const response = await httpClient.get(`/testimonial/${id}`);
    return {
      success: response.data.success,
      data: response.data.data?.testimonial || response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching testimonial:', error);
    throw {
      success: false,
      data: {} as Testimonial,
      message: error.response?.data?.message || error.message || 'Failed to fetch testimonial',
    };
  }
};

/**
 * Create testimonial
 */
export interface CreateTestimonialRequest {
  profilePic: string;
  name: string;
  designation?: string;
  rating: number;
  reviewText: string;
  isActive?: boolean;
  order?: number;
}

export const createTestimonial = async (testimonialData: CreateTestimonialRequest): Promise<TestimonialResponse> => {
  try {
    const response = await httpClient.post('/testimonial', testimonialData);
    return {
      success: response.data.success,
      data: response.data.data?.testimonial || response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    throw {
      success: false,
      data: {} as Testimonial,
      message: error.response?.data?.message || error.message || 'Failed to create testimonial',
    };
  }
};

/**
 * Update testimonial
 */
export interface UpdateTestimonialRequest {
  profilePic?: string;
  name?: string;
  designation?: string;
  rating?: number;
  reviewText?: string;
  isActive?: boolean;
  order?: number;
}

export const updateTestimonial = async (
  id: string,
  testimonialData: UpdateTestimonialRequest
): Promise<TestimonialResponse> => {
  try {
    const response = await httpClient.put(`/testimonial/${id}`, testimonialData);
    return {
      success: response.data.success,
      data: response.data.data?.testimonial || response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating testimonial:', error);
    throw {
      success: false,
      data: {} as Testimonial,
      message: error.response?.data?.message || error.message || 'Failed to update testimonial',
    };
  }
};

/**
 * Delete testimonial
 */
export const deleteTestimonial = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.delete(`/testimonial/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete testimonial',
    };
  }
};

/**
 * Toggle testimonial status (active/inactive)
 */
export const toggleTestimonialStatus = async (id: string): Promise<TestimonialResponse> => {
  try {
    const response = await httpClient.patch(`/testimonial/${id}/toggle-status`);
    return {
      success: response.data.success,
      data: response.data.data?.testimonial || response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error toggling testimonial status:', error);
    throw {
      success: false,
      data: {} as Testimonial,
      message: error.response?.data?.message || error.message || 'Failed to toggle testimonial status',
    };
  }
};

