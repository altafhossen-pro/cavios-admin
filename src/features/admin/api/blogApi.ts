import httpClient from '@/helpers/httpClient';

/**
 * Blog API Service
 * Handles blog-related API calls for admin
 */

export interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string; // HTML content
  image: string;
  author?: string;
  slug: string;
  isActive: boolean;
  publishedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
}

export interface BlogsResponse {
  success: boolean;
  data: {
    blogs: Blog[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message: string;
}

export interface BlogResponse {
  success: boolean;
  data: {
    blog: Blog;
  };
  message: string;
}

/**
 * Get all blogs for admin (with pagination, search, filter)
 */
export const getBlogs = async (params: BlogsParams = {}): Promise<BlogsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/blog${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpClient.get(url);
    return {
      success: response.data.success,
      data: {
        blogs: response.data.data?.blogs || [],
        pagination: response.data.data?.pagination,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return {
      success: false,
      data: {
        blogs: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch blogs',
    };
  }
};

/**
 * Get blog by ID
 */
export const getBlogById = async (id: string): Promise<BlogResponse> => {
  try {
    const response = await httpClient.get(`/blog/${id}`);
    return {
      success: response.data.success,
      data: {
        blog: response.data.data?.blog || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    throw {
      success: false,
      data: { blog: {} as Blog },
      message: error.response?.data?.message || error.message || 'Failed to fetch blog',
    };
  }
};

/**
 * Create blog
 */
export interface CreateBlogRequest {
  title: string;
  slug?: string;
  description: string;
  content: string; // HTML content from TinyMCE
  image: string;
  author?: string;
  isActive?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const createBlog = async (blogData: CreateBlogRequest): Promise<BlogResponse> => {
  try {
    const response = await httpClient.post('/blog', blogData);
    return {
      success: response.data.success,
      data: {
        blog: response.data.data?.blog || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error creating blog:', error);
    throw {
      success: false,
      data: { blog: {} as Blog },
      message: error.response?.data?.message || error.message || 'Failed to create blog',
    };
  }
};

/**
 * Update blog
 */
export interface UpdateBlogRequest {
  title?: string;
  slug?: string;
  description?: string;
  content?: string; // HTML content from TinyMCE
  image?: string;
  author?: string;
  isActive?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const updateBlog = async (
  id: string,
  blogData: UpdateBlogRequest
): Promise<BlogResponse> => {
  try {
    const response = await httpClient.patch(`/blog/${id}`, blogData);
    return {
      success: response.data.success,
      data: {
        blog: response.data.data?.blog || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating blog:', error);
    throw {
      success: false,
      data: { blog: {} as Blog },
      message: error.response?.data?.message || error.message || 'Failed to update blog',
    };
  }
};

/**
 * Check if a slug is available
 */
export const checkSlugAvailability = async (slug: string, blogId?: string): Promise<{ success: boolean; available: boolean; slug: string; message: string }> => {
  try {
    const params: { slug: string; blogId?: string } = { slug };
    if (blogId) {
      params.blogId = blogId;
    }
    const response = await httpClient.get('/blog/check-slug', { params });
    return {
      success: response.data.success,
      available: response.data.data?.available || false,
      slug: response.data.data?.slug || slug,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error checking slug availability:', error);
    return {
      success: false,
      available: false,
      slug,
      message: error.response?.data?.message || error.message || 'Failed to check slug availability',
    };
  }
};

/**
 * Delete blog
 */
export const deleteBlog = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.delete(`/blog/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete blog',
    };
  }
};

/**
 * Toggle blog status (active/inactive)
 */
export const toggleBlogStatus = async (id: string): Promise<BlogResponse> => {
  try {
    const response = await httpClient.patch(`/blog/${id}/toggle-status`);
    return {
      success: response.data.success,
      data: {
        blog: response.data.data?.blog || response.data.data,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error toggling blog status:', error);
    throw {
      success: false,
      data: { blog: {} as Blog },
      message: error.response?.data?.message || error.message || 'Failed to toggle blog status',
    };
  }
};

