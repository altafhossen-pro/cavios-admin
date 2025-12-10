import httpClient from '@/helpers/httpClient';

/**
 * Upload API Service
 * Handles file upload API calls
 */

export interface UploadResponse {
  success: boolean;
  data: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
  };
  message: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data: Array<{
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
  }>;
  message: string;
}

/**
 * Upload a single image
 * @param {File} file - Image file to upload
 * @returns {Promise<UploadResponse>} API response with uploaded file info
 */
export const uploadSingleImage = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await httpClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    console.error('Error uploading image:', error);
    throw new Error(err.response?.data?.message || err.message || 'Failed to upload image');
  }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<MultipleUploadResponse>} API response with uploaded files info
 */
export const uploadMultipleImages = async (files: File[]): Promise<MultipleUploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await httpClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: response.data.success,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    console.error('Error uploading images:', error);
    throw new Error(err.response?.data?.message || err.message || 'Failed to upload images');
  }
};

