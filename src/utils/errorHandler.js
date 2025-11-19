/**
 * Centralized error handling utilities for dashboard components
 */

// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Categorizes errors based on their properties
 * @param {Error} error - The error object
 * @returns {Object} - Error category and severity
 */
export const categorizeError = (error) => {
  if (!error) {
    return { type: ERROR_TYPES.UNKNOWN, severity: ERROR_SEVERITY.LOW };
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !error.response) {
    return { type: ERROR_TYPES.NETWORK, severity: ERROR_SEVERITY.HIGH };
  }

  // Authentication errors
  if (error.response?.status === 401 || error.response?.status === 403) {
    return { type: ERROR_TYPES.AUTH, severity: ERROR_SEVERITY.CRITICAL };
  }

  // Validation errors
  if (error.response?.status === 400 || error.response?.status === 422) {
    return { type: ERROR_TYPES.VALIDATION, severity: ERROR_SEVERITY.MEDIUM };
  }

  // Server errors
  if (error.response?.status >= 500) {
    return { type: ERROR_TYPES.SERVER, severity: ERROR_SEVERITY.HIGH };
  }

  return { type: ERROR_TYPES.UNKNOWN, severity: ERROR_SEVERITY.MEDIUM };
};

/**
 * Generates user-friendly error messages
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @returns {Object} - User-friendly error message and action
 */
export const getErrorMessage = (error, context = 'operation') => {
  const { type, severity } = categorizeError(error);
  
  const messages = {
    [ERROR_TYPES.NETWORK]: {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection and try again.',
      action: 'Retry',
      canRetry: true
    },
    [ERROR_TYPES.AUTH]: {
      title: 'Authentication Required',
      message: 'Your session has expired. Please sign in again to continue.',
      action: 'Sign In',
      canRetry: false,
      redirect: '/login'
    },
    [ERROR_TYPES.VALIDATION]: {
      title: 'Invalid Data',
      message: error.response?.data?.message || 'Please check your input and try again.',
      action: 'Fix & Retry',
      canRetry: true
    },
    [ERROR_TYPES.SERVER]: {
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again in a few moments.',
      action: 'Retry',
      canRetry: true
    },
    [ERROR_TYPES.UNKNOWN]: {
      title: 'Something went wrong',
      message: `An unexpected error occurred while ${context}. Please try again.`,
      action: 'Retry',
      canRetry: true
    }
  };

  return {
    ...messages[type],
    severity,
    originalError: error
  };
};

/**
 * Handles errors gracefully with appropriate user feedback
 * @param {Error} error - The error object
 * @param {Function} notify - Notification function
 * @param {string} context - Context where the error occurred
 * @param {Function} onRetry - Optional retry function
 * @param {Function} navigate - Navigation function for redirects
 */
export const handleError = (error, notify, context = 'operation', onRetry = null, navigate = null) => {
  console.error(`Error in ${context}:`, error);
  
  const errorInfo = getErrorMessage(error, context);
  
  // Log error details for debugging
  if (error.response) {
    console.error('Error response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
  }

  // Show user notification
  const notificationColor = {
    [ERROR_SEVERITY.LOW]: 'blue',
    [ERROR_SEVERITY.MEDIUM]: 'orange',
    [ERROR_SEVERITY.HIGH]: 'red',
    [ERROR_SEVERITY.CRITICAL]: 'red'
  }[errorInfo.severity];

  notify({
    title: errorInfo.title,
    body: errorInfo.message,
    color: notificationColor,
    duration: errorInfo.severity === ERROR_SEVERITY.CRITICAL ? 8000 : 5000
  });

  // Handle redirects for critical errors
  if (errorInfo.redirect && navigate) {
    setTimeout(() => {
      navigate(errorInfo.redirect);
    }, 2000);
  }

  return errorInfo;
};

/**
 * Creates a retry wrapper for async operations
 * @param {Function} operation - The async operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 */
export const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication or validation errors
      const { type } = categorizeError(error);
      if (type === ERROR_TYPES.AUTH || type === ERROR_TYPES.VALIDATION) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

/**
 * Creates an error boundary hook for functional components
 * @param {Function} onError - Error callback
 */
export const useErrorHandler = (onError = null) => {
  const handleAsyncError = (error, context, notify, navigate = null) => {
    const errorInfo = handleError(error, notify, context, null, navigate);
    
    if (onError) {
      onError(error, errorInfo);
    }
    
    return errorInfo;
  };

  return { handleAsyncError };
};

/**
 * Validates API response and throws appropriate errors
 * @param {Object} response - API response
 * @param {string} expectedDataKey - Expected data key in response
 */
export const validateApiResponse = (response, expectedDataKey = 'data') => {
  if (!response) {
    throw new Error('No response received from server');
  }

  if (response.status >= 400) {
    const error = new Error(response.data?.message || 'API request failed');
    error.response = response;
    throw error;
  }

  if (expectedDataKey && !response.data?.[expectedDataKey]) {
    console.warn(`Expected data key '${expectedDataKey}' not found in response`);
  }

  return response.data;
};