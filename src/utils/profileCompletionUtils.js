/**
 * Utility functions for managing business profile completion status
 */

/**
 * Checks if the given user is a business user (dealer or mechanic)
 * Handles missing user data gracefully
 * @param {Object} user - User data object
 * @returns {boolean} True if user is a business user
 */
export const isBusinessUser = (user) => {
  try {
    // Handle missing user data gracefully
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid or missing user data for business user check');
      return false;
    }
    
    // Handle missing user_type gracefully - default to customer
    const userType = user.user_type || 'customer';
    return userType === 'dealer' || userType === 'mechanic';
  } catch (error) {
    console.error('❌ Error checking if user is business user:', error);
    return false;
  }
};

/**
 * Checks if the business profile is complete for the given user
 * Now based on email verification status instead of business_profile_completed field
 * @param {Object} user - User data object
 * @returns {boolean} True if profile is complete or user is not a business user
 */
export const isBusinessProfileComplete = (user) => {
  if (!user) return false;
  
  // Non-business users don't need business profile completion
  if (!isBusinessUser(user)) {
    return true;
  }
  
  // For business users, check email verification status (new logic)
  // Handle missing verification fields gracefully - default to false
  const emailVerified = user.email_verified === true;
  const isVerified = user.is_verified === true;
  
  return emailVerified || isVerified;
};

/**
 * Checks if the user needs to complete their business profile
 * Now based on email verification status instead of business_profile_completed field
 * @param {Object} user - User data object
 * @returns {boolean} True if user is a business user with incomplete profile
 */
export const needsBusinessProfileCompletion = (user) => {
  if (!user) return false;
  
  // Only business users need profile completion
  if (!isBusinessUser(user)) {
    return false;
  }
  
  // Check if email verification is incomplete (new logic)
  const emailVerified = user.email_verified === true;
  const isVerified = user.is_verified === true;
  
  return !(emailVerified || isVerified);
};

/**
 * Gets the business profile completion status for the given user
 * Handles missing user data gracefully
 * @param {Object} user - User data object
 * @returns {Object} Object containing completion status and user type
 */
export const getBusinessProfileCompletionStatus = (user) => {
  try {
    // Handle missing user data gracefully
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid or missing user data for completion status check');
      return {
        isBusinessUser: false,
        isComplete: false,
        needsCompletion: false,
        userType: null
      };
    }
    
    const isBusiness = isBusinessUser(user);
    const isComplete = isBusinessProfileComplete(user);
    
    // Handle missing user_type gracefully
    const userType = user.user_type || 'customer';
    
    return {
      isBusinessUser: isBusiness,
      isComplete,
      needsCompletion: isBusiness && !isComplete,
      userType
    };
  } catch (error) {
    console.error('❌ Error getting business profile completion status:', error);
    return {
      isBusinessUser: false,
      isComplete: false,
      needsCompletion: false,
      userType: null
    };
  }
};

/**
 * Updates the business profile completion status in localStorage
 * Handles missing user data gracefully
 * @param {boolean} isComplete - Whether the business profile is complete
 * @returns {Object} Updated user data or null if no user found
 */
export const updateBusinessProfileCompletionStatus = (isComplete) => {
  try {
    const userData = localStorage.getItem('veyu_user_data');
    if (!userData) {
      console.warn('⚠️ No user data found in localStorage for completion status update');
      return null;
    }
    
    const user = JSON.parse(userData);
    
    // Handle invalid user data gracefully
    if (!user || typeof user !== 'object') {
      console.error('❌ Invalid user data format in localStorage');
      return null;
    }
    
    const updatedUser = {
      ...user,
      business_profile_completed: isComplete
    };
    
    // Update both storage formats for compatibility
    localStorage.setItem('veyu_user_data', JSON.stringify(updatedUser));
    
    // Update the old format if it exists
    const oldAuthData = localStorage.getItem('veyu-auth-user');
    if (oldAuthData) {
      try {
        const authData = JSON.parse(oldAuthData);
        const updatedAuthData = {
          ...authData,
          user: updatedUser
        };
        localStorage.setItem('veyu-auth-user', JSON.stringify(updatedAuthData));
      } catch (e) {
        console.error('❌ Error updating veyu-auth-user:', e);
      }
    }
    
    console.log('✅ Updated business profile completion status:', isComplete);
    
    // Trigger UI updates automatically when status changes
    triggerEmailVerificationStatusUpdate(updatedUser);
    
    return updatedUser;
  } catch (e) {
    console.error('❌ Error updating business profile completion status:', e);
    return null;
  }
};

/**
 * Gets the current user data from localStorage with graceful error handling
 * @returns {Object|null} User data or null if not found
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('veyu_user_data');
    if (!userData) {
      console.warn('⚠️ No user data found in localStorage');
      return null;
    }
    
    const parsedUser = JSON.parse(userData);
    
    // Provide sensible defaults for missing user data fields
    if (parsedUser && typeof parsedUser === 'object') {
      return {
        id: parsedUser.id || null,
        email: parsedUser.email || '',
        first_name: parsedUser.first_name || '',
        last_name: parsedUser.last_name || '',
        user_type: parsedUser.user_type || 'customer',
        phone_number: parsedUser.phone_number || '',
        business_name: parsedUser.business_name || '',
        email_verified: parsedUser.email_verified || false,
        is_verified: parsedUser.is_verified || false,
        business_profile_completed: parsedUser.business_profile_completed || false,
        ...parsedUser // Preserve any additional fields
      };
    }
    
    console.warn('⚠️ Invalid user data format in localStorage');
    return null;
  } catch (e) {
    console.error('❌ Error parsing user data from localStorage:', e);
    return null;
  }
};

/**
 * Synchronizes user data between localStorage and API, focusing on email verification status
 * This function should be called after successful API operations
 * @param {Object} apiUserData - User data from API response
 * @returns {Object} Synchronized user data
 */
export const syncProfileCompletionStatus = (apiUserData) => {
  if (!apiUserData) return null;
  
  // Ensure the API data has the completion status field and email verification status
  const enhancedApiData = enhanceUserWithCompletionStatus(apiUserData);
  
  // Update localStorage with the complete user data including email verification status
  localStorage.setItem('veyu_user_data', JSON.stringify(enhancedApiData));
  
  // Update the old format if it exists for backward compatibility
  const oldAuthData = localStorage.getItem('veyu-auth-user');
  if (oldAuthData) {
    try {
      const authData = JSON.parse(oldAuthData);
      const updatedAuthData = {
        ...authData,
        user: enhancedApiData
      };
      localStorage.setItem('veyu-auth-user', JSON.stringify(updatedAuthData));
    } catch (e) {
      console.error('Error updating veyu-auth-user during sync:', e);
    }
  }
  
  console.log('✅ Synchronized user data with API response', {
    userId: enhancedApiData.id,
    userType: enhancedApiData.user_type,
    emailVerified: enhancedApiData.email_verified || enhancedApiData.is_verified,
    businessProfileCompleted: enhancedApiData.business_profile_completed
  });
  
  return enhancedApiData;
};

/**
 * Enhances user data with business_profile_completed field and ensures email verification status is preserved
 * @param {Object} user - User data object
 * @returns {Object} Enhanced user data with completion status and email verification
 */
export const enhanceUserWithCompletionStatus = (user) => {
  if (!user) return user;
  
  const enhancedUser = { ...user };
  
  // Ensure email verification status is preserved from API response
  // Handle both possible field names: email_verified and is_verified
  if (!enhancedUser.hasOwnProperty('email_verified') && !enhancedUser.hasOwnProperty('is_verified')) {
    // If neither field exists, default to false for business users, true for customers
    const isBusinessUser = user.user_type === 'dealer' || user.user_type === 'mechanic';
    enhancedUser.email_verified = !isBusinessUser;
  }
  
  // If business_profile_completed is already explicitly set, trust that value
  if (user.hasOwnProperty('business_profile_completed')) {
    console.log('✅ User already has business_profile_completed:', user.business_profile_completed);
    return enhancedUser;
  }
  
  // Set default completion status based on user type
  if (user.user_type === 'dealer' || user.user_type === 'mechanic') {
    // For business users, check if they have comprehensive business profile data
    // A complete profile should have business_name AND at least one contact method
    const hasBusinessName = user.business_name && user.business_name.trim() !== '';
    const hasContactInfo = (user.business_address && user.business_address.trim() !== '') || 
                          (user.business_phone && user.business_phone.trim() !== '') ||
                          (user.business_email && user.business_email.trim() !== '');
    
    const isComplete = hasBusinessName && hasContactInfo;
    
    console.log('🔍 Business profile check:', {
      user_type: user.user_type,
      hasBusinessName,
      hasContactInfo,
      isComplete,
      business_name: user.business_name,
      business_address: user.business_address,
      business_phone: user.business_phone,
      email_verified: enhancedUser.email_verified || enhancedUser.is_verified
    });
    
    enhancedUser.business_profile_completed = isComplete;
  } else {
    // For customer users, always true (no business profile needed)
    enhancedUser.business_profile_completed = true;
  }
  
  return enhancedUser;
};

/**
 * Validates if the user should be redirected to business profile setup
 * @param {Object} user - User data object
 * @returns {boolean} True if user should be redirected to business profile setup
 */
export const shouldRedirectToBusinessProfile = (user) => {
  if (!user) return false;
  
  // Only redirect business users with incomplete profiles
  return isBusinessUser(user) && !isBusinessProfileComplete(user);
};

/**
 * Gets the appropriate redirect URL based on user profile completion status
 * Handles missing user data gracefully
 * @param {Object} user - User data object
 * @param {string} defaultUrl - Default URL to redirect to (usually '/dashboard')
 * @returns {string} URL to redirect to
 */
export const getRedirectUrl = (user, defaultUrl = '/dashboard') => {
  try {
    // Handle missing user data gracefully
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid or missing user data for redirect URL determination');
      return defaultUrl;
    }
    
    if (shouldRedirectToBusinessProfile(user)) {
      return '/business-profile';
    }
    return defaultUrl;
  } catch (error) {
    console.error('❌ Error determining redirect URL:', error);
    return defaultUrl;
  }
};

/**
 * Triggers UI updates when email verification status changes
 * This function dispatches custom events that components can listen to
 * @param {Object} updatedUser - Updated user data
 */
export const triggerEmailVerificationStatusUpdate = (updatedUser) => {
  try {
    // Handle missing user data gracefully
    if (!updatedUser || typeof updatedUser !== 'object') {
      console.warn('⚠️ Invalid user data for email verification status update');
      return;
    }
    
    // Dispatch custom event for email verification status change
    const event = new CustomEvent('emailVerificationStatusChanged', {
      detail: {
        user: updatedUser,
        emailVerified: updatedUser.email_verified || updatedUser.is_verified || false,
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
    console.log('✅ Email verification status update event dispatched');
  } catch (error) {
    console.error('❌ Error triggering email verification status update:', error);
  }
};

/**
 * Updates email verification status and triggers UI updates
 * @param {boolean} isVerified - Whether the email is verified
 * @returns {Object} Updated user data or null if update failed
 */
export const updateEmailVerificationStatus = (isVerified) => {
  try {
    const userData = localStorage.getItem('veyu_user_data');
    if (!userData) {
      console.warn('⚠️ No user data found for email verification status update');
      return null;
    }
    
    const user = JSON.parse(userData);
    
    // Handle invalid user data gracefully
    if (!user || typeof user !== 'object') {
      console.error('❌ Invalid user data format in localStorage');
      return null;
    }
    
    const updatedUser = {
      ...user,
      email_verified: isVerified,
      is_verified: isVerified // Update both fields for compatibility
    };
    
    // Update both storage formats for compatibility
    localStorage.setItem('veyu_user_data', JSON.stringify(updatedUser));
    
    // Update the old format if it exists
    const oldAuthData = localStorage.getItem('veyu-auth-user');
    if (oldAuthData) {
      try {
        const authData = JSON.parse(oldAuthData);
        const updatedAuthData = {
          ...authData,
          user: updatedUser
        };
        localStorage.setItem('veyu-auth-user', JSON.stringify(updatedAuthData));
      } catch (e) {
        console.error('❌ Error updating veyu-auth-user:', e);
      }
    }
    
    console.log('✅ Updated email verification status:', isVerified);
    
    // Trigger UI updates automatically when status changes
    triggerEmailVerificationStatusUpdate(updatedUser);
    
    return updatedUser;
  } catch (error) {
    console.error('❌ Error updating email verification status:', error);
    return null;
  }
};