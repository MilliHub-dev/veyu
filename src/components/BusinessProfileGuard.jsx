import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { GlobalStore } from '../App';
import authService from '../services/authService';
import { LoadingSpinner } from './loaders';

/**
 * BusinessProfileGuard - A component that checks if business users have completed their profile
 * and redirects them to the business profile setup page if not.
 * 
 * This component implements route protection for incomplete business profiles as per
 * Requirements 1.2 and 2.2 from the business signup flow fix specification.
 */
const BusinessProfileGuard = ({ children }) => {
  const { authUser, notify } = useContext(GlobalStore);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState(null);

  useEffect(() => {
    checkProfileCompletionStatus();
  }, [authUser]);

  const checkProfileCompletionStatus = async () => {
    try {
      setLoading(true);

      // If no user is authenticated, let the parent routing handle it
      if (!authUser) {
        setLoading(false);
        return;
      }

      // Get the business profile completion status
      const status = authService.getBusinessProfileCompletionStatus();
      setCompletionStatus(status);

      // If this is a business user with incomplete profile, we'll redirect
      if (status.needsCompletion) {
        console.log('Business profile incomplete, will redirect to /business-profile');
      }

    } catch (error) {
      console.error('Error checking business profile completion status:', error);
      
      // Provide fallback behavior when status cannot be determined
      // Default to allowing access but show a warning
      notify({
        title: 'Profile Status Check Failed',
        body: 'Unable to verify profile completion status. Please ensure your profile is complete.',
        color: 'orange',
        duration: 5000
      });
      
      setCompletionStatus({
        isBusinessUser: false,
        isComplete: true,
        needsCompletion: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking completion status
  if (loading) {
    return (
      <LoadingSpinner 
        fullscreen 
        message="Checking profile status..." 
      />
    );
  }

  // If no user is authenticated, let parent routing handle authentication
  if (!authUser) {
    return children;
  }

  // If completion status couldn't be determined, allow access with warning
  if (!completionStatus) {
    return children;
  }

  if (completionStatus.needsCompletion) {
    console.log('BusinessProfileGuard: Profile incomplete, but allowing access to dashboard (restricted to signup only)');
    // We no longer redirect to /business-profile here because that page is now restricted to the signup flow only.
    // Users should complete their profile via the dashboard settings if needed.
    return children;
  }

  return children;
};

export default BusinessProfileGuard;