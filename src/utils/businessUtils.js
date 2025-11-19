/**
 * Business Profile Utility Functions
 * 
 * This module provides utility functions for processing business profile data,
 * including logo URL resolution and API response mapping.
 */

/**
 * Resolves logo URL to handle both relative and absolute URLs
 * @param {string} url - The original URL (can be relative or absolute)
 * @param {string} baseUrl - Base URL for relative paths (defaults to dev.veyu.cc)
 * @returns {string|null} - Resolved URL or null if invalid
 */
export const resolveLogoUrl = (url, baseUrl = 'https://dev.veyu.cc') => {
  console.log('BusinessUtils: Resolving logo URL:', { url, baseUrl });
  
  if (!url || typeof url !== 'string') {
    console.warn('BusinessUtils: Invalid logo URL provided:', url);
    return null;
  }
  
  // If already absolute URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('BusinessUtils: Using absolute URL:', url);
    return url;
  }
  
  // If relative URL starting with slash, construct full URL
  if (url.startsWith('/')) {
    const resolvedUrl = `${baseUrl}${url}`;
    console.log('BusinessUtils: Resolved relative URL with slash:', resolvedUrl);
    return resolvedUrl;
  }
  
  // If no leading slash, add it
  const resolvedUrl = `${baseUrl}/${url}`;
  console.log('BusinessUtils: Resolved relative URL without slash:', resolvedUrl);
  return resolvedUrl;
};

/**
 * Debug utility for monitoring business profile fetch failures
 * @param {string} context - Context where the monitoring is called from
 * @param {Object} data - Data to monitor
 */
export const monitorBusinessProfile = (context, data) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    context,
    ...data
  };
  
  console.group(`🔍 Business Profile Monitor - ${context}`);
  console.log('Timestamp:', timestamp);
  console.log('Data:', data);
  
  // Check for common issues
  if (data.error) {
    console.error('❌ Error detected:', data.error);
  }
  
  if (data.logoUrl && !data.resolvedUrl) {
    console.warn('⚠️ Logo URL resolution failed:', data.logoUrl);
  }
  
  if (!data.businessName || data.businessName.trim() === '') {
    console.warn('⚠️ Missing or empty business name');
  }
  
  if (data.apiResponse && !data.apiResponse.logo && !data.apiResponse.avatar) {
    console.warn('⚠️ No logo field found in API response');
  }
  
  if (data.apiResponse) {
    console.log('🔍 Available logo fields in API response:', {
      'logo': data.apiResponse.logo,
      'avatar': data.apiResponse.avatar
    });
  }
  
  console.groupEnd();
  
  // Store in sessionStorage for debugging (limit to last 50 entries)
  try {
    const storageKey = 'veyu_business_profile_debug';
    const existing = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    existing.push(logData);
    
    // Keep only last 50 entries
    if (existing.length > 50) {
      existing.splice(0, existing.length - 50);
    }
    
    sessionStorage.setItem(storageKey, JSON.stringify(existing));
  } catch (e) {
    console.warn('Failed to store debug data in sessionStorage:', e);
  }
};

/**
 * Maps API response to consistent business profile structure
 * @param {Object} apiResponse - Raw API response object
 * @returns {Object} - Mapped business profile object
 */
export const mapBusinessProfileResponse = (apiResponse) => {
  console.log('BusinessUtils: Mapping API response:', apiResponse);
  
  if (!apiResponse || typeof apiResponse !== 'object') {
    console.warn('BusinessUtils: Invalid API response provided:', apiResponse);
    monitorBusinessProfile('mapBusinessProfileResponse', {
      error: 'Invalid API response',
      apiResponse
    });
    return null;
  }

  // Check for logo in the standard response fields
  const logoUrl = apiResponse.logo || apiResponse.avatar;
  console.log('BusinessUtils: Original logo URL from API:', logoUrl);
  console.log('BusinessUtils: Available logo fields:', {
    'logo': apiResponse.logo,
    'avatar': apiResponse.avatar
  });

  const mappedProfile = {
    ...apiResponse,
    // Normalize business name field
    business_name: apiResponse.name || apiResponse.business_name || '',
    // Resolve logo URL
    logo: resolveLogoUrl(logoUrl),
    // Normalize slug field
    slug: apiResponse.slug || apiResponse.username || '',
    // Ensure other common fields exist
    business_address: apiResponse.business_address || apiResponse.address || '',
    business_phone: apiResponse.business_phone || apiResponse.phone || '',
    verified_business: Boolean(apiResponse.verified_business || apiResponse.verified),
  };

  console.log('BusinessUtils: Mapped business profile:', mappedProfile);
  
  // Monitor the mapping process
  monitorBusinessProfile('mapBusinessProfileResponse', {
    apiResponse,
    logoUrl,
    resolvedUrl: mappedProfile.logo,
    businessName: mappedProfile.business_name,
    mappedProfile
  });
  
  return mappedProfile;
};

/**
 * Validates business profile data
 * @param {Object} businessProfile - Business profile object to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export const validateBusinessProfile = (businessProfile) => {
  const errors = [];
  
  if (!businessProfile) {
    errors.push('Business profile is required');
    return { isValid: false, errors };
  }
  
  if (!businessProfile.business_name || businessProfile.business_name.trim() === '') {
    errors.push('Business name is required');
  }
  
  if (businessProfile.business_name && businessProfile.business_name.length < 2) {
    errors.push('Business name must be at least 2 characters long');
  }
  
  if (businessProfile.business_phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(businessProfile.business_phone)) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Handles API errors and provides user-friendly error messages
 * @param {Error} error - The error object from API call
 * @returns {Object} - Error information with user-friendly message
 */
export const handleApiError = (error) => {
  const defaultMessage = 'An unexpected error occurred. Please try again.';
  
  console.error('BusinessUtils: API Error occurred:', error);
  
  if (!error) {
    console.warn('BusinessUtils: No error object provided to handleApiError');
    return { message: defaultMessage, code: 'UNKNOWN_ERROR' };
  }
  
  // Handle network errors
  if (!error.response) {
    console.error('BusinessUtils: Network error - no response received:', error.message);
    return {
      message: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR'
    };
  }
  
  const { status, data } = error.response;
  console.error('BusinessUtils: API Error details:', { status, data, url: error.config?.url });
  
  switch (status) {
    case 400:
      return {
        message: data?.message || 'Invalid request. Please check your input.',
        code: 'BAD_REQUEST'
      };
    case 401:
      return {
        message: 'Authentication required. Please log in again.',
        code: 'UNAUTHORIZED'
      };
    case 403:
      return {
        message: 'Access denied. You do not have permission to perform this action.',
        code: 'FORBIDDEN'
      };
    case 404:
      return {
        message: 'Business profile not found.',
        code: 'NOT_FOUND'
      };
    case 422:
      return {
        message: data?.message || 'Validation error. Please check your input.',
        code: 'VALIDATION_ERROR'
      };
    case 500:
      return {
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR'
      };
    default:
      return {
        message: data?.message || defaultMessage,
        code: 'API_ERROR'
      };
  }
};

/**
 * Generates initials from business name for fallback display
 * @param {string} businessName - The business name
 * @returns {string} - Generated initials (max 2 characters)
 */
export const generateBusinessInitials = (businessName) => {
  if (!businessName || typeof businessName !== 'string') return '?';
  
  const words = businessName.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};

/**
 * Checks if a URL is a valid image URL based on file extension
 * @param {string} url - The URL to check
 * @returns {boolean} - True if URL appears to be an image
 */
export const isImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const urlLower = url.toLowerCase();
  
  return imageExtensions.some(ext => urlLower.includes(ext));
};

/**
 * Get debug logs from sessionStorage
 * @returns {Array} - Array of debug log entries
 */
export const getBusinessProfileDebugLogs = () => {
  try {
    return JSON.parse(sessionStorage.getItem('veyu_business_profile_debug') || '[]');
  } catch (e) {
    console.warn('Failed to retrieve debug logs:', e);
    return [];
  }
};

/**
 * Clear debug logs from sessionStorage
 */
export const clearBusinessProfileDebugLogs = () => {
  try {
    sessionStorage.removeItem('veyu_business_profile_debug');
    console.log('Business profile debug logs cleared');
  } catch (e) {
    console.warn('Failed to clear debug logs:', e);
  }
};

export default {
  resolveLogoUrl,
  mapBusinessProfileResponse,
  validateBusinessProfile,
  handleApiError,
  generateBusinessInitials,
  isImageUrl,
  monitorBusinessProfile,
  getBusinessProfileDebugLogs,
  clearBusinessProfileDebugLogs
};