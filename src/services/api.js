import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'https://dev.veyu.cc/api/v1';

// Create axios instance with proper configuration
// withCredentials is explicitly set to false to prevent CORS issues
// when the backend uses wildcard (*) for Access-Control-Allow-Origin
// NOTE: We don't set a default Content-Type here because:
// - FormData needs 'multipart/form-data' with boundary (set automatically by axios)
// - JSON needs 'application/json' (set in request interceptor)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: {
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
    console.log('🔐 TokenManager: Storing tokens...', {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NULL'
    });
    localStorage.setItem('veyu_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('veyu_refresh_token', refreshToken);
    }
  },
  clearTokens: () => {
    console.log('🗑️ TokenManager: Clearing all tokens and user data');
    localStorage.removeItem('veyu_access_token');
    localStorage.removeItem('veyu_refresh_token');
    localStorage.removeItem('veyu_user_data');
    localStorage.removeItem('veyu-auth-user'); // Also clear old format
  },
  isAuthenticated: () => {
    const hasAccessToken = !!TokenManager.getAccessToken();
    const hasRefreshToken = !!TokenManager.getRefreshToken();

    if (!hasAccessToken && !hasRefreshToken) {
      console.log('❌ TokenManager: No tokens found - user not authenticated');
      return false;
    }

    if (!hasAccessToken && hasRefreshToken) {
      console.log('⚠️ TokenManager: Access token missing but refresh token exists');
      return true; // Can try to refresh
    }

    return true;
  },
  // Decode JWT token to check expiration (without verification)
  isTokenExpired: (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const isExpired = currentTime >= expirationTime;

      if (isExpired) {
        console.log('⏰ TokenManager: Token has expired');
      }

      return isExpired;
    } catch (e) {
      console.error('❌ TokenManager: Failed to decode token', e);
      return true; // Assume expired if we can't decode
    }
  },
  // Check if access token is expired
  isAccessTokenExpired: () => {
    const token = TokenManager.getAccessToken();
    return TokenManager.isTokenExpired(token);
  }
};

// Request interceptor to add auth token and set Content-Type
apiClient.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }

    // Set Content-Type based on data type
    // IMPORTANT: Don't set Content-Type for FormData - axios will set it automatically with boundary
    if (config.data instanceof FormData) {
      // IMPORTANT: Only delete Content-Type if this is NOT a retry
      // On retry, we want to preserve all headers including Authorization
      if (!config._isRetry) {
        delete config.headers['Content-Type'];
        console.log(`📦 FormData detected - letting axios set Content-Type with boundary`);
      } else {
        console.log(`📦 FormData retry - preserving all headers`);
      }
    } else if (config.data && typeof config.data === 'object') {
      // For JSON data, explicitly set Content-Type
      config.headers['Content-Type'] = 'application/json';
    }

    // List of endpoints that should NOT have tokens attached
    const publicEndpoints = [
      '/accounts/login/',
      '/accounts/signup/',
      '/accounts/password/reset/',
      '/accounts/password/reset/validate/',
      '/accounts/password/reset/confirm/',
      '/token/',
      '/token/refresh/',
      '/token/verify/'
    ];

    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 API Request: ${config.method?.toUpperCase()} ${config.url} - Bearer token attached (${token.substring(0, 20)}...)`);
      } else {
        console.log(`🚫 API Request: ${config.method?.toUpperCase()} ${config.url} - No token found`);
        console.log('🔍 Debug: Checking localStorage for tokens...');
        console.log('veyu_access_token:', localStorage.getItem('veyu_access_token') ? 'EXISTS' : 'NOT FOUND');
        console.log('veyu-auth-user:', localStorage.getItem('veyu-auth-user') ? 'EXISTS' : 'NOT FOUND');
      }
    } else {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url} - Public endpoint (no token)`);
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
          console.log('🔄 Attempting token refresh...');

          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access, refresh } = response.data;
          TokenManager.setTokens(access, refresh);

          // Retry original request with new token
          // IMPORTANT: For FormData requests, we must preserve the Authorization header
          // and prevent the interceptor from deleting Content-Type

          // Mark this as a retry to skip Content-Type manipulation
          originalRequest._isRetry = true;

          // Update the Authorization header with the new token
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${access}`;

          console.log('✅ Token refreshed successfully, retrying request:', originalRequest.url);
          console.log('🔍 Retry config:', {
            hasAuth: !!originalRequest.headers.Authorization,
            authHeader: originalRequest.headers.Authorization ? originalRequest.headers.Authorization.substring(0, 30) + '...' : 'MISSING',
            hasContentType: !!originalRequest.headers['Content-Type'],
            isFormData: originalRequest.data instanceof FormData,
            isRetry: originalRequest._isRetry
          });

          return apiClient(originalRequest);
        } else {
          console.log('❌ No refresh token available, redirecting to login');
          TokenManager.clearTokens();

          // Show user-friendly notification
          if (window.notify) {
            window.notify({
              title: 'Session Expired',
              description: 'Your session has expired. Please log in again.',
              status: 'warning',
              duration: 5000,
              isClosable: true
            });
          }

          if (!window.location.pathname.includes('/login')) {
            setTimeout(() => {
              window.location.href = '/login?session_expired=true';
            }, 1000);
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);

        // Check if refresh token itself is invalid/expired
        const isRefreshTokenInvalid = refreshError.response?.status === 401;

        if (isRefreshTokenInvalid) {
          console.log('❌ Refresh token is invalid or expired');
        }

        // Refresh failed, clear tokens and redirect to login
        TokenManager.clearTokens();

        // Show user-friendly notification
        if (window.notify) {
          window.notify({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again to continue.',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }

        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login?session_expired=true';
          }, 1000);
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

// Enhanced API error handler with detailed logging and user-friendly messages
const handleApiError = (error) => {
  // Log detailed error information for debugging
  console.error('🚨 API Error Details:', {
    error: error,
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString(),
    stack: error.stack
  });

  if (error instanceof ApiError) {
    throw error;
  }

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    let message = 'An error occurred';

    // Handle different error response formats with more specific messages
    if (typeof data === 'string') {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.error) {
      message = data.error;
    } else if (data?.non_field_errors) {
      // Handle Django REST framework non-field errors
      message = Array.isArray(data.non_field_errors)
        ? data.non_field_errors.join(' ')
        : data.non_field_errors;
    } else if (status === 400) {
      // Handle field-specific validation errors
      if (data && typeof data === 'object') {
        const fieldErrors = [];
        Object.entries(data).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            fieldErrors.push(`${field}: ${errors.join(', ')}`);
          } else if (typeof errors === 'string') {
            fieldErrors.push(`${field}: ${errors}`);
          }
        });

        if (fieldErrors.length > 0) {
          message = fieldErrors.join('; ');
        } else {
          message = 'Invalid input - please check your information and try again';
        }
      } else {
        message = 'Invalid input - please check your information and try again';
      }
    } else if (status === 401) {
      message = 'Authentication required - please log in again';
    } else if (status === 403) {
      message = 'Access denied - you don\'t have permission to perform this action';
    } else if (status === 404) {
      message = 'The requested resource was not found';
    } else if (status === 409) {
      message = 'Conflict - this information already exists or is in use';
    } else if (status === 413) {
      message = 'File too large - please choose a smaller file';
    } else if (status === 422) {
      message = 'Invalid data - please check your information';
    } else if (status === 429) {
      message = 'Too many requests - please wait a few minutes before trying again';
    } else if (status >= 500) {
      // For 500 errors, try to extract more details for debugging
      console.error('🚨 Server Error Details:', {
        status,
        data,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
        headers: error.config?.headers
      });

      if (data && typeof data === 'object' && data.message) {
        message = `Server error: ${data.message}`;
      } else if (data && typeof data === 'string' && data.includes('error')) {
        message = 'Server error - please check your input and try again';
      } else if (status === 502) {
        message = 'Server temporarily unavailable - please try again in a few minutes';
      } else if (status === 503) {
        message = 'Service temporarily unavailable - please try again later';
      } else if (status === 504) {
        message = 'Server timeout - please try again';
      } else {
        message = 'Server error - please try again later';
      }
    }

    throw new ApiError(message, status, data);
  } else if (error.request) {
    // Request made but no response received
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new ApiError('Connection timeout - the server is taking too long to respond. Please check your internet connection and try again.', 0, null);
    } else if (error.code === 'ERR_NETWORK') {
      throw new ApiError('Network error - please check your internet connection and try again', 0, null);
    } else if (error.code === 'ERR_INTERNET_DISCONNECTED') {
      throw new ApiError('No internet connection - please check your connection and try again', 0, null);
    } else {
      throw new ApiError('Network error - unable to reach the server. Please check your connection and try again.', 0, null);
    }
  } else {
    // Something else happened during request setup
    if (error.message.includes('timeout')) {
      throw new ApiError('Request timeout - please try again', 0, null);
    } else if (error.message.includes('Network Error')) {
      throw new ApiError('Network error - please check your connection and try again', 0, null);
    }
    throw new ApiError(error.message || 'An unexpected error occurred - please try again', 0, null);
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