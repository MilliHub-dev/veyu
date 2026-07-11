import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://dev.veyu.autos/api/v1';

// ─── Custom error class (must be declared before any function that uses it) ───
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Token management ─────────────────────────────────────────────────────────
const TokenManager = {
  getAccessToken: () => {
    let token = localStorage.getItem('veyu_access_token');
    if (!token) {
      try {
        const oldAuthUser = localStorage.getItem('veyu-auth-user');
        if (oldAuthUser) {
          const authData = JSON.parse(oldAuthUser);
          if (authData.token) {
            token = authData.token;
            localStorage.setItem('veyu_access_token', token);
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return token;
  },
  getRefreshToken: () => localStorage.getItem('veyu_refresh_token'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('veyu_access_token', accessToken);
    if (refreshToken) localStorage.setItem('veyu_refresh_token', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('veyu_access_token');
    localStorage.removeItem('veyu_refresh_token');
    localStorage.removeItem('veyu_user_data');
    localStorage.removeItem('veyu-auth-user');
  },
  isAuthenticated: () => {
    return !!(TokenManager.getAccessToken() || TokenManager.getRefreshToken());
  },
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (e) {
      return true;
    }
  },
  isAccessTokenExpired: () => TokenManager.isTokenExpired(TokenManager.getAccessToken()),
};

// ─── Axios client ─────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: false,
  headers: { Accept: 'application/json' },
});

// ─── Refresh mutex ────────────────────────────────────────────────────────────
let _refreshPromise = null;

async function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken || TokenManager.isTokenExpired(refreshToken)) {
      throw new Error('Refresh token missing or expired');
    }

    const response = await axios.post(
      `${API_BASE_URL}/token/refresh/`,
      { refresh: refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const tokenData = response.data.data || response.data;
    const { access, refresh } = tokenData;
    if (!access) throw new Error('No access token in refresh response');

    TokenManager.setTokens(access, refresh || refreshToken);
    return access;
  })().finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
}

// ─── Request interceptor ──────────────────────────────────────────────────────
const PUBLIC_ENDPOINTS = [
  '/accounts/login/',
  '/accounts/signup/',
  '/accounts/password/reset/',
  '/accounts/password/reset/validate/',
  '/accounts/password/reset/confirm/',
  '/accounts/verify-email-unauthenticated/',
  '/token/',
  '/token/refresh/',
  '/token/verify/',
];

apiClient.interceptors.request.use(
  async (config) => {
    if (!config.headers) config.headers = {};

    if (config.data instanceof FormData) {
      if (!config._isRetry) delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }

    const isPublic = PUBLIC_ENDPOINTS.some((ep) => config.url?.includes(ep));

    if (!isPublic) {
      let token = TokenManager.getAccessToken();
      if (!config._isRetry && token && TokenManager.isTokenExpired(token)) {
        try {
          token = await refreshAccessToken();
        } catch (e) {
          // fall through — response interceptor handles 401
        }
      }
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────
const AUTH_ENDPOINTS = [
  '/accounts/login/', '/accounts/signup/', '/accounts/logout/',
  '/token/', '/token/refresh/', '/token/verify/',
];
const isAuthEndpoint = (url) => AUTH_ENDPOINTS.some((e) => url?.includes(e));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._isRetry = true;

      try {
        const newToken = await refreshAccessToken();
        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return await apiClient(originalRequest);
      } catch (refreshError) {
        const status = refreshError.response?.status;
        if ((status === 401 || status === 400) && isAuthEndpoint(originalRequest.url)) {
          TokenManager.clearTokens();
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              title: 'Session Expired',
              body: 'Your session has expired. Please log in again.',
              color: 'orange',
            });
          }
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/signup') &&
            !window.location.pathname.includes('/forgot-password')
          ) {
            setTimeout(() => { window.location.href = '/login?session_expired=true'; }, 1000);
          }
        }
        return Promise.reject(refreshError);
      }
    }

    if (import.meta.env.DEV) {
      const skip = error.config?.skipErrorLogging || error.response?.config?.skipErrorLogging;
      if (!skip) {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
    }

    return Promise.reject(error);
  },
);

// ─── Response / error helpers ─────────────────────────────────────────────────
const handleApiResponse = (response) => {
  const data = response.data;
  if (data.error === true) {
    throw new ApiError(data.message || 'API Error', response.status, data);
  }
  return data.data || data;
};

const handleApiError = (error) => {
  if (error instanceof ApiError) throw error;

  if (error.response) {
    const { status, data } = error.response;
    let message = 'An error occurred';

    if (typeof data === 'string') {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.error) {
      message = data.error;
    } else if (data?.non_field_errors) {
      message = Array.isArray(data.non_field_errors)
        ? data.non_field_errors.join(' ')
        : data.non_field_errors;
    } else if (status === 400 && data && typeof data === 'object') {
      const fieldErrors = [];
      Object.entries(data).forEach(([field, errors]) => {
        if (Array.isArray(errors)) fieldErrors.push(`${field}: ${errors.join(', ')}`);
        else if (typeof errors === 'string') fieldErrors.push(`${field}: ${errors}`);
      });
      message = fieldErrors.length > 0
        ? fieldErrors.join('; ')
        : 'Invalid input - please check your information and try again';
    } else if (status === 401) {
      message = 'Authentication required - please log in again';
    } else if (status === 403) {
      message = "Access denied - you don't have permission to perform this action";
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
    } else if (status === 502) {
      message = 'Server temporarily unavailable - please try again in a few minutes';
    } else if (status === 503) {
      message = 'Service temporarily unavailable - please try again later';
    } else if (status === 504) {
      message = 'Server timeout - please try again';
    } else if (status >= 500) {
      message = 'Server error - please try again later';
    }

    throw new ApiError(message, status, data);
  } else if (error.request) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new ApiError('Connection timeout - please check your internet connection and try again.', 0, null);
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED') {
      throw new ApiError('Network error - please check your internet connection and try again', 0, null);
    } else {
      throw new ApiError('Network error - unable to reach the server. Please check your connection and try again.', 0, null);
    }
  } else {
    throw new ApiError(error.message || 'An unexpected error occurred - please try again', 0, null);
  }
};

// ─── FormData helper ──────────────────────────────────────────────────────────
const createFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) formData.append(key, value);
      else if (Array.isArray(value) || typeof value === 'object') formData.append(key, JSON.stringify(value));
      else formData.append(key, value.toString());
    }
  });
  return formData;
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export {
  apiClient,
  handleApiResponse,
  handleApiError,
  TokenManager,
  ApiError,
  createFormData,
  API_BASE_URL,
};
