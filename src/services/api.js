import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'https://dev.veyu.cc/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access, refresh } = response.data;
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API response wrapper
const handleApiResponse = (response) => {
  if (response.data.error) {
    throw new Error(response.data.message || 'API Error');
  }
  return response.data;
};

// API error handler
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const errorData = error.response.data;
    throw new Error(errorData.message || `HTTP ${error.response.status}: ${error.response.statusText}`);
  } else if (error.request) {
    // Request made but no response received
    throw new Error('Network error: No response from server');
  } else {
    // Something else happened
    throw new Error(error.message || 'Unknown error occurred');
  }
};

export { apiClient, handleApiResponse, handleApiError };