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
  async (config) => {
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
      // Get token from localStorage
      let token = TokenManager.getAccessToken();

      if (config._isRetry) {
        // For retry requests after token refresh, use the fresh token from storage
        console.log(`🔄 Retry request after token refresh - using fresh token from storage`);
        console.log(`🔑 API Request: ${config.method?.toUpperCase()} ${config.url} - Using refreshed token (${token ? token.substring(0, 20) + '...' : 'NOT FOUND'})`);
      } else {
        // Check if token exists and is expired (only for non-retry requests)
        if (token && TokenManager.isTokenExpired(token)) {
          console.log('⚠️ Access token is expired - attempting proactive refresh before request');

          const refreshToken = TokenManager.getRefreshToken();
          if (refreshToken && !TokenManager.isTokenExpired(refreshToken)) {
            try {
              // Use a separate axios instance to avoid interceptor loops
              const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
              }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              // Backend returns tokens in response.data.data (nested structure)
              const tokenData = response.data.data || response.data;
              const { access, refresh } = tokenData;
              if (access) {
                console.log('✅ Proactive token refresh successful');
                TokenManager.setTokens(access, refresh || refreshToken);
                token = access;
              }
            } catch (refreshError) {
              console.error('❌ Proactive token refresh failed:', refreshError.message);
              // Continue with expired token - the response interceptor will handle it
            }
          } else {
            console.log('⚠️ Refresh token is missing or expired - request will likely fail with 401');
          }
        }
      }

      // Attach token to request (for both retry and normal requests)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 API Request: ${config.method?.toUpperCase()} ${config.url} - Bearer token attached (${token.substring(0, 20)}...)`);
      } else {
        console.log(`🚫 API Request: ${config.method?.toUpperCase()} ${config.url} - No token found`);
        console.log('🔍 Debug: Checking localStorage for tokens...');
        console.log('veyu_access_token:', localStorage.getItem('veyu_access_token') ? 'EXISTS' : 'NOT FOUND');
        console.log('veyu_refresh_token:', localStorage.getItem('veyu_refresh_token') ? 'EXISTS' : 'NOT FOUND');
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
    console.error('❌ Request interceptor error:', error);
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
      console.log(`✅ API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    // CRITICAL: Only attempt refresh once per request to prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔴 401 Unauthorized - Attempting to refresh token...');
      console.log('🔍 Request URL:', originalRequest.url);
      console.log('🔍 Request method:', originalRequest.method);
      originalRequest._retry = true;
      originalRequest._isRetry = true; // Also set this flag for request interceptor
      const AUTH_ENDPOINTS = [
        '/accounts/login/',
        '/accounts/signup/',
        '/accounts/logout/',
        '/token/',
        '/token/refresh/',
        '/token/verify/'
      ];
      const isAuthEndpoint = (url) => AUTH_ENDPOINTS.some(e => url?.includes(e));

      try {
        const refreshToken = TokenManager.getRefreshToken();
        const accessToken = TokenManager.getAccessToken();

        console.log('🔍 Token status:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          accessTokenExpired: accessToken ? TokenManager.isTokenExpired(accessToken) : 'N/A'
        });

        if (!refreshToken) {
          console.log('❌ No refresh token available - clearing tokens and redirecting to login');
          if (isAuthEndpoint(originalRequest.url)) {
            TokenManager.clearTokens();
            if (window.notify) {
              window.notify({
                title: 'Session Expired',
                body: 'Your session has expired. Please log in again.',
                color: 'orange'
              });
            }
            if (!window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/signup') &&
              !window.location.pathname.includes('/forgot-password')) {
              setTimeout(() => {
                window.location.href = '/login?session_expired=true';
              }, 1000);
            }
          }
          return Promise.reject(error);
        }

        console.log('🔄 Attempting token refresh with refresh token...');
        console.log('🔍 Refresh token preview:', refreshToken.substring(0, 30) + '...');

        // Decode and check the refresh token before using it
        try {
          const refreshPayload = JSON.parse(atob(refreshToken.split('.')[1]));
          console.log('🔍 Refresh token payload:', {
            exp: refreshPayload.exp,
            expiresAt: new Date(refreshPayload.exp * 1000).toISOString(),
            user_id: refreshPayload.user_id,
            token_type: refreshPayload.token_type,
            isExpired: TokenManager.isTokenExpired(refreshToken)
          });
        } catch (e) {
          console.error('❌ Failed to decode refresh token:', e);
        }

        // Use a separate axios instance to avoid interceptor loops
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 Raw refresh response:', JSON.stringify(response.data, null, 2));

        // Backend returns tokens in response.data.data (nested structure)
        const tokenData = response.data.data || response.data;
        console.log('🔍 Token data extracted:', {
          hasData: !!response.data.data,
          hasFallback: !!response.data,
          tokenData: tokenData
        });

        const { access, refresh } = tokenData;

        if (!access) {
          console.error('❌ No access token in refresh response:', response.data);
          console.error('❌ Token data structure:', tokenData);
          throw new Error('No access token received from refresh endpoint');
        }

        console.log('✅ Received new access token from refresh endpoint');
        console.log('🔍 New access token preview:', access.substring(0, 30) + '...');
        console.log('🔍 Full refresh response:', response.data);

        // Decode and check the new token
        try {
          const payload = JSON.parse(atob(access.split('.')[1]));
          console.log('🔍 New token payload:', {
            exp: payload.exp,
            expiresAt: new Date(payload.exp * 1000).toISOString(),
            user_id: payload.user_id,
            isExpired: TokenManager.isTokenExpired(access)
          });
        } catch (e) {
          console.error('❌ Failed to decode new token:', e);
        }

        console.log('✅ Token refresh successful - storing new tokens');
        TokenManager.setTokens(access, refresh || refreshToken);

        // CRITICAL FIX: Verify the new token was actually stored
        const verifyToken = TokenManager.getAccessToken();
        if (verifyToken !== access) {
          console.error('❌ Token storage verification failed!', {
            expected: access.substring(0, 20),
            actual: verifyToken ? verifyToken.substring(0, 20) : 'NULL'
          });
        } else {
          console.log('✅ Token storage verified');
        }

        // Retry original request with new token
        // CRITICAL FIX: Store the new token BEFORE retrying so the request interceptor can use it
        // The request interceptor will pick up the new token from localStorage
        console.log('🔄 Retrying original request with new token:', originalRequest.url);
        console.log('🔍 Retry token preview:', access.substring(0, 30) + '...');

        // Verify token is in localStorage
        const storedToken = TokenManager.getAccessToken();
        console.log('🔍 Token in localStorage:', storedToken ? storedToken.substring(0, 30) + '...' : 'NOT FOUND');

        // CRITICAL: Keep _retry flag set to prevent infinite loops
        // The _retry flag must stay true so if this retry fails with 401, we don't try to refresh again
        // originalRequest._retry is already set to true above

        // CRITICAL: Explicitly set the new Authorization header with the refreshed token
        // Don't rely on the request interceptor - set it directly here
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers.Authorization = `Bearer ${access}`;

        console.log('🔍 Retry flags set:', { _retry: originalRequest._retry, _isRetry: originalRequest._isRetry });
        console.log('🔍 Authorization header explicitly set with new token');

        // Try the retry and log detailed error if it fails
        try {
          const retryResponse = await apiClient(originalRequest);
          console.log('✅ Retry successful!');
          return retryResponse;
        } catch (retryError) {
          console.error('❌ Retry failed after token refresh:', {
            status: retryError.response?.status,
            statusText: retryError.response?.statusText,
            data: retryError.response?.data,
            headers: retryError.response?.headers,
            url: originalRequest.url,
            requestHeaders: retryError.config?.headers
          });

          // If retry fails with 401, it means the refreshed token is also invalid
          // This is a critical issue - the backend refresh endpoint gave us a bad token
          if (retryError.response?.status === 401) {
            console.error('🚨 CRITICAL: Refreshed token was rejected by backend!');
            console.error('🚨 This indicates the /token/refresh/ endpoint returned an invalid token');

            // Only force re-login for auth endpoints
            if (isAuthEndpoint(originalRequest.url)) {
              TokenManager.clearTokens();
              if (window.notify) {
                window.notify({
                  title: 'Authentication Error',
                  body: 'There was a problem with your session. Please log in again.',
                  color: 'red'
                });
              }
              if (!window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/signup') &&
                !window.location.pathname.includes('/forgot-password')) {
                setTimeout(() => {
                  window.location.href = '/login?auth_error=true';
                }, 1000);
              }
            }
          }

          // CRITICAL: Don't throw the error back to the interceptor
          // Return a rejected promise directly to prevent the interceptor from catching it again
          return Promise.reject(retryError);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', {
          error: refreshError.message,
          status: refreshError.response?.status,
          data: refreshError.response?.data,
          fullError: refreshError
        });

        // CRITICAL DEBUG: Don't immediately logout, let's see what's happening
        console.error('🚨 REFRESH ERROR DETAILS:');
        console.error('  - Error message:', refreshError.message);
        console.error('  - Response status:', refreshError.response?.status);
        console.error('  - Response data:', JSON.stringify(refreshError.response?.data, null, 2));
        console.error('  - Request URL:', refreshError.config?.url);
        console.error('  - Request data:', refreshError.config?.data);

        // Check if refresh token itself is invalid/expired
        const isRefreshTokenInvalid = refreshError.response?.status === 401 ||
          refreshError.response?.status === 400;

        if (isRefreshTokenInvalid) {
          console.log('❌ Refresh token is invalid or expired - clearing all tokens');

          // Only force logout for auth endpoints; otherwise, surface the error
          if (isAuthEndpoint(originalRequest.url)) {
            TokenManager.clearTokens();
            if (window.notify) {
              window.notify({
                title: 'Session Expired',
                body: 'Your session has expired. Please log in again to continue.',
                color: 'red'
              });
            }
            if (!window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/signup') &&
              !window.location.pathname.includes('/forgot-password')) {
              setTimeout(() => {
                window.location.href = '/login?session_expired=true';
              }, 1000);
            }
          }
        } else {
          // Some other error - don't logout, just log it
          console.error('🚨 Refresh failed with non-auth error - NOT logging out');
        }

        return Promise.reject(refreshError);
      }
    }

    // Log error details for debugging
    console.error('❌ API Error:', {
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

// Debug utility to check token status
const debugTokenStatus = () => {
  const accessToken = TokenManager.getAccessToken();
  const refreshToken = TokenManager.getRefreshToken();

  console.log('🔍 Token Status Debug:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'NONE',
    refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NONE',
    accessTokenExpired: accessToken ? TokenManager.isTokenExpired(accessToken) : 'N/A',
    refreshTokenExpired: refreshToken ? TokenManager.isTokenExpired(refreshToken) : 'N/A',
    isAuthenticated: TokenManager.isAuthenticated(),
    localStorage: {
      veyu_access_token: !!localStorage.getItem('veyu_access_token'),
      veyu_refresh_token: !!localStorage.getItem('veyu_refresh_token'),
      veyu_user_data: !!localStorage.getItem('veyu_user_data'),
      'veyu-auth-user': !!localStorage.getItem('veyu-auth-user')
    }
  });
};

// Test function to manually call refresh endpoint
const testRefreshEndpoint = async () => {
  const refreshToken = TokenManager.getRefreshToken();
  if (!refreshToken) {
    console.error('❌ No refresh token found');
    return;
  }

  console.log('🧪 Testing refresh endpoint...');
  console.log('🔍 Using refresh token:', refreshToken.substring(0, 30) + '...');

  try {
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
      refresh: refreshToken,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Refresh endpoint response:', response);
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
    console.log('📦 Response status:', response.status);
    console.log('📦 Response headers:', response.headers);

    return response.data;
  } catch (error) {
    console.error('❌ Refresh endpoint error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
};

// Make debug functions available globally for troubleshooting
if (typeof window !== 'undefined') {
  window.debugTokenStatus = debugTokenStatus;
  window.testRefreshEndpoint = testRefreshEndpoint;
}

// Export everything needed
export {
  apiClient,
  handleApiResponse,
  handleApiError,
  TokenManager,
  ApiError,
  createFormData,
  API_BASE_URL,
  debugTokenStatus
};
