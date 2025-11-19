import { useState, useEffect, useContext } from 'react';
import { GlobalStore } from '../App';
import authService from '../services/authService';

/**
 * Custom hook to handle email verification status with graceful error handling
 * Automatically updates when email verification status changes
 * @returns {Object} Email verification status and helper functions
 */
export const useEmailVerificationStatus = () => {
  const { authUser, onAuthenticated } = useContext(GlobalStore);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update email verification status with graceful handling
  const updateEmailVerificationStatus = (verified) => {
    try {
      setIsEmailVerified(verified);
      
      // Update stored user data
      if (authUser) {
        const updatedUser = {
          ...authUser,
          user: {
            ...authUser.user,
            email_verified: verified,
            is_verified: verified
          }
        };
        
        // Update localStorage
        localStorage.setItem('veyu_user_data', JSON.stringify(updatedUser.user));
        localStorage.setItem('veyu-auth-user', JSON.stringify(updatedUser));
        
        // Update global state
        onAuthenticated(updatedUser);
        
        console.log('✅ Email verification status updated:', verified);
      }
    } catch (error) {
      console.error('❌ Error updating email verification status:', error);
      setError(error.message);
    }
  };

  // Check current email verification status with graceful handling
  const checkEmailVerificationStatus = () => {
    try {
      setLoading(true);
      setError(null);
      
      const verified = authService.isEmailVerified();
      setIsEmailVerified(verified);
      
      return verified;
    } catch (error) {
      console.error('❌ Error checking email verification status:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Listen for email verification status changes
  useEffect(() => {
    const handleEmailVerificationChange = (event) => {
      try {
        const { emailVerified } = event.detail;
        setIsEmailVerified(emailVerified);
        console.log('📧 Email verification status changed:', emailVerified);
      } catch (error) {
        console.error('❌ Error handling email verification change:', error);
      }
    };

    // Add event listener for email verification status changes
    window.addEventListener('emailVerificationStatusChanged', handleEmailVerificationChange);

    // Initial check
    checkEmailVerificationStatus();

    // Cleanup
    return () => {
      window.removeEventListener('emailVerificationStatusChanged', handleEmailVerificationChange);
    };
  }, [authUser]);

  return {
    isEmailVerified,
    loading,
    error,
    updateEmailVerificationStatus,
    checkEmailVerificationStatus
  };
};

export default useEmailVerificationStatus;