/**
 * Utility functions for handling user data gracefully across components
 */

/**
 * Safely gets user display name with graceful handling of missing data
 * @param {Object} user - User data object
 * @returns {string} User display name or fallback
 */
export const getUserDisplayName = (user) => {
  try {
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid user data for display name');
      return 'User';
    }

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    if (fullName) {
      return fullName;
    }

    // Fallback to email if no name available
    if (user.email) {
      const emailName = user.email.split('@')[0].split('.')[0]; // Take only first part before dot
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    // Final fallback
    return 'User';
  } catch (error) {
    console.error('❌ Error getting user display name:', error);
    return 'User';
  }
};

/**
 * Safely gets business name with graceful handling of missing data
 * @param {Object} user - User data object
 * @returns {string} Business name or fallback
 */
export const getBusinessDisplayName = (user) => {
  try {
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid user data for business name');
      return 'Business Name Required';
    }

    // Try business_name first - this should be the primary source
    if (user.business_name && user.business_name.trim()) {
      console.debug('✅ Business name found:', user.business_name.trim());
      return user.business_name.trim();
    }

    // If no business name, indicate setup is required instead of generating fallback
    const userType = user.user_type || 'business';
    console.warn('⚠️ Business name missing for user type:', userType);
    
    if (userType === 'mechanic') {
      return 'Auto Shop Name Required';
    } else if (userType === 'dealer') {
      return 'Business Name Required';
    }
    
    return 'Business Name Required';
  } catch (error) {
    console.error('❌ Error getting business display name:', error);
    return 'Business Name Required';
  }
};

/**
 * Safely gets user email with graceful handling of missing data
 * @param {Object} user - User data object
 * @returns {string} User email or fallback
 */
export const getUserEmail = (user) => {
  try {
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid user data for email');
      return 'No email';
    }

    return user.email || 'No email';
  } catch (error) {
    console.error('❌ Error getting user email:', error);
    return 'No email';
  }
};

/**
 * Safely gets user type with graceful handling of missing data
 * @param {Object} user - User data object
 * @returns {string} User type or fallback
 */
export const getUserType = (user) => {
  try {
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid user data for user type');
      return 'customer';
    }

    return user.user_type || 'customer';
  } catch (error) {
    console.error('❌ Error getting user type:', error);
    return 'customer';
  }
};

/**
 * Safely checks if user is a business user with graceful handling
 * @param {Object} user - User data object
 * @returns {boolean} True if user is a business user
 */
export const isBusinessUser = (user) => {
  try {
    const userType = getUserType(user);
    return userType === 'dealer' || userType === 'mechanic';
  } catch (error) {
    console.error('❌ Error checking if user is business user:', error);
    return false;
  }
};

/**
 * Safely gets user phone number with graceful handling of missing data
 * @param {Object} user - User data object
 * @returns {string} User phone number or fallback
 */
export const getUserPhone = (user) => {
  try {
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid user data for phone number');
      return '';
    }

    return user.phone_number || user.phone || '';
  } catch (error) {
    console.error('❌ Error getting user phone number:', error);
    return '';
  }
};

/**
 * Safely gets user ID with graceful handling of missing data
 * @param {Object} user - User data object
 * @returns {string|number|null} User ID or null
 */
export const getUserId = (user) => {
  try {
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid user data for user ID');
      return null;
    }

    return user.id || user.user_id || null;
  } catch (error) {
    console.error('❌ Error getting user ID:', error);
    return null;
  }
};

/**
 * Validates user data structure and provides sensible defaults
 * @param {Object} user - User data object
 * @returns {Object} Validated user data with defaults
 */
export const validateUserData = (user) => {
  try {
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Invalid user data provided for validation');
      return {
        id: null,
        email: '',
        first_name: '',
        last_name: '',
        user_type: 'customer',
        phone_number: '',
        business_name: '',
        email_verified: false,
        is_verified: false,
        business_profile_completed: false
      };
    }

    return {
      id: user.id || user.user_id || null,
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      user_type: user.user_type || 'customer',
      phone_number: user.phone_number || user.phone || '',
      business_name: user.business_name || '',
      email_verified: user.email_verified || false,
      is_verified: user.is_verified || false,
      business_profile_completed: user.business_profile_completed || false,
      ...user // Preserve any additional fields
    };
  } catch (error) {
    console.error('❌ Error validating user data:', error);
    return {
      id: null,
      email: '',
      first_name: '',
      last_name: '',
      user_type: 'customer',
      phone_number: '',
      business_name: '',
      email_verified: false,
      is_verified: false,
      business_profile_completed: false
    };
  }
};

/**
 * Safely handles user data operations with error boundaries
 * @param {Function} operation - Operation to perform on user data
 * @param {Object} user - User data object
 * @param {*} fallback - Fallback value if operation fails
 * @returns {*} Result of operation or fallback
 */
export const safeUserDataOperation = (operation, user, fallback = null) => {
  try {
    if (typeof operation !== 'function') {
      console.warn('⚠️ Invalid operation provided to safeUserDataOperation');
      return fallback;
    }

    const validatedUser = validateUserData(user);
    const result = operation(validatedUser);
    return result !== undefined ? result : fallback;
  } catch (error) {
    console.error('❌ Error in safe user data operation:', error);
    return fallback;
  }
};

export default {
  getUserDisplayName,
  getBusinessDisplayName,
  getUserEmail,
  getUserType,
  isBusinessUser,
  getUserPhone,
  getUserId,
  validateUserData,
  safeUserDataOperation
};