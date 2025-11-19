/**
 * Enhanced error handling utilities for consistent error management across the application
 * Provides user-friendly error messages, detailed logging, and retry mechanisms
 */

/**
 * Formats error messages for user display
 * @param {Error|Object} error - The error object
 * @param {string} context - Context where the error occurred (e.g., 'login', 'profile-setup')
 * @returns {Object} Formatted error with title, message, and retry info
 */
export const formatErrorForUser = (error, context = 'general') => {
  // Log detailed error information for debugging
  console.error(`🚨 Error in ${context}:`, {
    error: error,
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    context: context,
    timestamp: new Date().toISOString(),
    stack: error.stack
  });

  let errorTitle = 'Error';
  let errorMessage = 'Something went wrong. Please try again.';
  let isRetryable = true;
  let retryDelay = 0; // seconds to wait before retry

  // Handle API response errors
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorTitle = 'Invalid Information';
        if (data?.email) {
          errorMessage = Array.isArray(data.email) 
            ? `Email error: ${data.email.join(', ')}`
            : `Email error: ${data.email}`;
        } else if (data?.password) {
          errorMessage = Array.isArray(data.password)
            ? `Password error: ${data.password.join(', ')}`
            : `Password error: ${data.password}`;
        } else if (data?.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors)
            ? data.non_field_errors.join(' ')
            : data.non_field_errors;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.detail) {
          errorMessage = data.detail;
        } else {
          errorMessage = 'Please check your information and try again.';
        }
        isRetryable = true;
        break;

      case 401:
        errorTitle = 'Authentication Failed';
        if (context === 'login') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else {
          errorMessage = 'Your session has expired. Please log in again.';
        }
        isRetryable = context === 'login';
        break;

      case 403:
        errorTitle = 'Access Denied';
        errorMessage = 'You don\'t have permission to perform this action.';
        isRetryable = false;
        break;

      case 404:
        errorTitle = 'Not Found';
        errorMessage = 'The requested resource was not found.';
        isRetryable = false;
        break;

      case 409:
        errorTitle = 'Conflict';
        errorMessage = 'This information already exists or is currently in use.';
        isRetryable = true;
        break;

      case 413:
        errorTitle = 'File Too Large';
        errorMessage = 'The file you\'re trying to upload is too large. Please choose a smaller file.';
        isRetryable = true;
        break;

      case 422:
        errorTitle = 'Invalid Data';
        errorMessage = 'Some of your information is invalid. Please review and correct it.';
        isRetryable = true;
        break;

      case 429:
        errorTitle = 'Too Many Requests';
        errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        isRetryable = true;
        retryDelay = 60; // 1 minute
        break;

      case 500:
        errorTitle = 'Server Error';
        errorMessage = 'Our servers are experiencing issues. Please try again in a few minutes.';
        isRetryable = true;
        retryDelay = 30; // 30 seconds
        break;

      case 502:
        errorTitle = 'Service Unavailable';
        errorMessage = 'Our service is temporarily unavailable. Please try again in a few minutes.';
        isRetryable = true;
        retryDelay = 60; // 1 minute
        break;

      case 503:
        errorTitle = 'Service Unavailable';
        errorMessage = 'Our service is temporarily down for maintenance. Please try again later.';
        isRetryable = true;
        retryDelay = 300; // 5 minutes
        break;

      case 504:
        errorTitle = 'Request Timeout';
        errorMessage = 'The server took too long to respond. Please try again.';
        isRetryable = true;
        retryDelay = 10; // 10 seconds
        break;

      default:
        if (data?.message) {
          errorMessage = data.message;
        } else if (data?.detail) {
          errorMessage = data.detail;
        }
        break;
    }
  } 
  // Handle network errors
  else if (error.request) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorTitle = 'Connection Timeout';
      errorMessage = 'The request took too long to complete. Please check your internet connection and try again.';
      isRetryable = true;
      retryDelay = 5;
    } else if (error.code === 'ERR_NETWORK') {
      errorTitle = 'Network Error';
      errorMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
      isRetryable = true;
      retryDelay = 5;
    } else if (error.code === 'ERR_INTERNET_DISCONNECTED') {
      errorTitle = 'No Internet Connection';
      errorMessage = 'Please check your internet connection and try again.';
      isRetryable = true;
      retryDelay = 10;
    } else {
      errorTitle = 'Connection Error';
      errorMessage = 'Unable to reach our servers. Please check your connection and try again.';
      isRetryable = true;
      retryDelay = 5;
    }
  }
  // Handle other errors
  else {
    if (error.message.includes('timeout')) {
      errorTitle = 'Timeout Error';
      errorMessage = 'The operation took too long to complete. Please try again.';
      isRetryable = true;
      retryDelay = 5;
    } else if (error.message.includes('Network Error')) {
      errorTitle = 'Network Error';
      errorMessage = 'Please check your internet connection and try again.';
      isRetryable = true;
      retryDelay = 5;
    } else if (error.message) {
      errorMessage = error.message;
    }
  }

  return {
    title: errorTitle,
    message: errorMessage,
    isRetryable,
    retryDelay,
    originalError: error
  };
};

/**
 * Creates a standardized error notification configuration
 * @param {Object} errorInfo - Formatted error information from formatErrorForUser
 * @param {Function} retryCallback - Function to call when retry is clicked
 * @param {Object} options - Additional options for the notification
 * @returns {Object} Notification configuration object
 */
export const createErrorNotification = (errorInfo, retryCallback = null, options = {}) => {
  const {
    title,
    message,
    isRetryable,
    retryDelay
  } = errorInfo;

  const notificationConfig = {
    title,
    description: message,
    status: 'error',
    duration: isRetryable ? 8000 : 6000,
    isClosable: true,
    position: 'top',
    ...options
  };

  // Add retry action for retryable errors
  if (isRetryable && retryCallback) {
    const retryLabel = retryDelay > 0 ? `Try Again (${retryDelay}s)` : 'Try Again';
    
    notificationConfig.action = {
      label: retryLabel,
      onClick: () => {
        if (retryDelay > 0) {
          // Show countdown and delay retry
          setTimeout(() => {
            retryCallback();
          }, retryDelay * 1000);
        } else {
          retryCallback();
        }
      }
    };
  }

  return notificationConfig;
};

/**
 * Handles form validation errors and focuses on the first error field
 * @param {Array} validationErrors - Array of validation error messages
 * @param {Object} fieldMappings - Mapping of error keywords to field selectors
 * @returns {Object} Error notification configuration
 */
export const handleValidationErrors = (validationErrors, fieldMappings = {}) => {
  console.error('🚨 Validation Errors:', {
    errors: validationErrors,
    timestamp: new Date().toISOString()
  });

  const errorMessage = validationErrors.length === 1 
    ? validationErrors[0]
    : `Please fix the following issues:\n• ${validationErrors.join('\n• ')}`;

  // Default field mappings
  const defaultMappings = {
    'phone': 'input[type="tel"]',
    'email': 'input[type="email"]',
    'password': 'input[type="password"]',
    'service': '[data-testid="services-section"]',
    'location': '[placeholder*="address"]',
    'business name': 'input[placeholder*="business"]',
    ...fieldMappings
  };

  // Focus on the first field with an error
  const focusOnErrorField = () => {
    for (const [keyword, selector] of Object.entries(defaultMappings)) {
      if (validationErrors.some(error => error.toLowerCase().includes(keyword))) {
        const element = document.querySelector(selector);
        if (element) {
          if (element.scrollIntoView) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          if (element.focus) {
            setTimeout(() => element.focus(), 500);
          }
          break;
        }
      }
    }
  };

  return {
    title: 'Please Complete Required Fields',
    description: errorMessage,
    status: 'error',
    duration: 7000,
    isClosable: true,
    position: 'top',
    action: {
      label: 'Fix Issues',
      onClick: focusOnErrorField
    }
  };
};

/**
 * Logs error information for debugging purposes
 * @param {Error|Object} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Object} additionalInfo - Additional information to log
 */
export const logError = (error, context, additionalInfo = {}) => {
  console.error(`🚨 ${context} Error:`, {
    error: error,
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    context: context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    stack: error.stack,
    ...additionalInfo
  });
};

/**
 * Creates a retry function with exponential backoff
 * @param {Function} operation - The operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Function} Retry function
 */
export const createRetryFunction = (operation, maxRetries = 3, baseDelay = 1000) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation(...args);
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff: delay = baseDelay * 2^attempt
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries + 1} in ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
};

export default {
  formatErrorForUser,
  createErrorNotification,
  handleValidationErrors,
  logError,
  createRetryFunction
};