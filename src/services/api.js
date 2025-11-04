import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'https://dev.veyu.cc/api/v1';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management utilities
const TokenManager = {
  getAccessToken: () => {
    // First try the new token format
    let token = localStorage.getItem('veyu_access_token');
    
    // If not found, try to get from old auth user format
    if (!token) {
      try {
        const oldAuthUser = localStorage.getItem('veyu-auth-user');
        if (oldAuthUser) {
          const authData = JSON.parse(oldAuthUser);
          if (authData.token) {
            console.log('🔄 TokenManager: Using token from old auth format');
            token = authData.token;
            // Migrate to new format
            localStorage.setItem('veyu_access_token', token);
          }
        }
      } catch (e) {
        console.log('🔄 TokenManager: Could not parse old auth data');
      }
    }
    
    return token;
  },
  getRefreshToken: () => localStorage.getItem('veyu_refresh_token'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('veyu_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('veyu_refresh_token', refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem('veyu_access_token');
    localStorage.removeItem('veyu_refresh_token');
    localStorage.removeItem('veyu_user_data');
    localStorage.removeItem('veyu-auth-user'); // Also clear old format
  },
  isAuthenticated: () => !!TokenManager.getAccessToken(),
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log(`🔑 API Request: ${config.method?.toUpperCase()} ${config.url} - Token attached`);
    } else {
      console.log(`🚫 API Request: ${config.method?.toUpperCase()} ${config.url} - No token found`);
    }

    // Add request ID for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    // Log response time for debugging
    if (response.config.metadata) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          console.log('Attempting token refresh...');

          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access, refresh } = response.data;
          TokenManager.setTokens(access, refresh);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Token ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, clear tokens and redirect to login
        TokenManager.clearTokens();

        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Log error details for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

// Standardized API response handler
const handleApiResponse = (response) => {
  // Handle different response formats from the API
  const data = response.data;

  // Check for explicit error flag
  if (data.error === true) {
    throw new ApiError(data.message || 'API Error', response.status, data);
  }

  // Return the data, handling different response structures
  return data.data || data;
};

// Custom API Error class
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Enhanced API error handler
const handleApiError = (error) => {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    let message = 'An error occurred';

    // Handle different error response formats
    if (typeof data === 'string') {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.error) {
      message = data.error;
    } else if (status === 400) {
      message = 'Bad request - please check your input';
    } else if (status === 401) {
      message = 'Authentication required';
    } else if (status === 403) {
      message = 'Access denied';
    } else if (status === 404) {
      message = 'Resource not found';
    } else if (status === 429) {
      message = 'Too many requests - please try again later';
    } else if (status >= 500) {
      message = 'Server error - please try again later';
    }

    throw new ApiError(message, status, data);
  } else if (error.request) {
    // Request made but no response received
    throw new ApiError('Network error - please check your connection', 0, null);
  } else {
    // Something else happened
    throw new ApiError(error.message || 'Unknown error occurred', 0, null);
  }
};

// Utility function to create form data
const createFormData = (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  return formData;
};

// Export everything needed
export {
  apiClient,
  handleApiResponse,
  handleApiError,
  TokenManager,
  ApiError,
  createFormData,
  API_BASE_URL
};