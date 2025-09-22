import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';

// Create an axios instance
const apiClient = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage as fallback
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token using cookie-based auth
        const response = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        
        if (response.data?.user) {
          // Token refresh successful via cookie
          processQueue(null, null);
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, clear everything and redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear local storage
        localStorage.removeItem('token');
        
        // Dispatch action to clear user data if store is available
        if (window.__REDUX_STORE__) {
          window.__REDUX_STORE__.dispatch({ type: 'user/setUserData', payload: null });
          window.__REDUX_STORE__.dispatch({ type: 'user/setToken', payload: null });
        }
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please login again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other error status codes
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission.');
    } else if (error.response?.status === 404) {
      // Don't show toast for 404s as they might be expected
      console.warn('Resource not found:', originalRequest.url);
    }

    return Promise.reject(error);
  }
);

export default apiClient;