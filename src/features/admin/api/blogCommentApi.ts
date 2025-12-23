import httpClient from '@/helpers/httpClient'

export interface BlogComment {
  _id: string
  blogId: {
    _id: string
    title: string
    slug: string
  }
  name: string
  email: string
  comment: string
  parentId?: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export interface BlogCommentsResponse {
  success: boolean
  data: {
    comments: BlogComment[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }
  message: string
}

export interface BlogCommentsParams {
  page?: number
  limit?: number
  blogId?: string
  isApproved?: boolean
}

/**
 * Get all blog comments (admin)
 */
export const getAllBlogComments = async (params: BlogCommentsParams = {}): Promise<BlogCommentsResponse> => {
  try {
    const response = await httpClient.get('/blog-comment', { params })
    return {
      success: response.data.success,
      data: {
        comments: response.data.data?.comments || [],
        pagination: response.data.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 50,
        },
      },
      message: response.data.message,
    }
  } catch (error: any) {
    console.error('Error fetching blog comments:', error)
    throw {
      success: false,
      data: {
        comments: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 50,
        },
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch blog comments',
    }
  }
}

/**
 * Toggle comment approval status
 */
export const toggleCommentApproval = async (id: string): Promise<{ success: boolean; data: { comment: BlogComment }; message: string }> => {
  try {
    const response = await httpClient.patch(`/blog-comment/${id}/toggle-approval`)
    return {
      success: response.data.success,
      data: {
        comment: response.data.data?.comment || {} as BlogComment,
      },
      message: response.data.message,
    }
  } catch (error: any) {
    console.error('Error toggling comment approval:', error)
    throw {
      success: false,
      data: { comment: {} as BlogComment },
      message: error.response?.data?.message || error.message || 'Failed to toggle comment approval',
    }
  }
}

/**
 * Delete comment
 */
export const deleteComment = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await httpClient.delete(`/blog-comment/${id}`)
    return {
      success: response.data.success,
      message: response.data.message,
    }
  } catch (error: any) {
    console.error('Error deleting comment:', error)
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete comment',
    }
  }
}

