import axios from 'axios'

// API Base URL - Update this with your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookie (cookies-next stores session in cookie)
    if (typeof document !== 'undefined') {
      const authKey = '_REBACK_AUTH_KEY_';
      // Get cookie value
      const cookies = document.cookie.split('; ');
      const authCookie = cookies.find(cookie => cookie.startsWith(`${authKey}=`));
      
      if (authCookie) {
        try {
          // Extract and decode cookie value (may be URL encoded)
          const cookieValue = decodeURIComponent(authCookie.split('=').slice(1).join('='));
          const parsed = JSON.parse(cookieValue);
          
          if (parsed && parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        } catch (e) {
          // If parsing fails, cookie might be in different format
          console.warn('Failed to parse auth cookie:', e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear session and redirect to login
      if (typeof window !== 'undefined') {
        const authKey = '_REBACK_AUTH_KEY_';
        // Clear cookie (cookies-next format)
        document.cookie = `${authKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/auth/sign-in')) {
          window.location.href = '/auth/sign-in';
        }
      }
    }
    return Promise.reject(error);
  }
);

function HttpClient() {
  return {
    get: (url: string, config?: any) => axiosInstance.get(url, config),
    post: (url: string, data?: any, config?: any) => axiosInstance.post(url, data, config),
    patch: (url: string, data?: any, config?: any) => axiosInstance.patch(url, data, config),
    put: (url: string, data?: any, config?: any) => axiosInstance.put(url, data, config),
    delete: (url: string, config?: any) => axiosInstance.delete(url, config),
  }
}

export default HttpClient()
