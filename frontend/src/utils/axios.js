import axios from 'axios';
import { serverUrl } from '../App';

// Create an axios instance
const apiClient = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

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

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if needed
      localStorage.removeItem('token');
      // You can add redux dispatch here to clear user data if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;