import { useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStore } from '../App';
import { handleError, withRetry, ERROR_TYPES } from '../utils/errorHandler';

/**
 * Custom hook for handling dashboard errors gracefully
 */
export const useDashboardError = (context = 'dashboard operation') => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { notify } = useContext(GlobalStore);
  const navigate = useNavigate();

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle an error with appropriate user feedback
   */
  const handleAsyncError = useCallback((error, customContext = null) => {
    const errorInfo = handleError(
      error, 
      notify, 
      customContext || context, 
      null, 
      navigate
    );
    
    setError(errorInfo);
    return errorInfo;
  }, [notify, navigate, context]);

  /**
   * Execute an async operation with error handling
   */
  const executeWithErrorHandling = useCallback(async (
    operation, 
    options = {}
  ) => {
    const {
      onSuccess,
      onError,
      customContext,
      showNotification = true,
      clearPreviousError = true
    } = options;

    if (clearPreviousError) {
      clearError();
    }

    try {
      const result = await operation();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      let errorInfo;
      if (showNotification) {
        errorInfo = handleAsyncError(error, customContext);
      } else {
        // Just set the error without showing notification
        errorInfo = handleError(error, () => {}, customContext || context);
        setError(errorInfo);
      }
      
      if (onError) {
        onError(error, errorInfo);
      }
      
      throw error; // Re-throw so calling code can handle it if needed
    }
  }, [handleAsyncError, clearError, context]);

  /**
   * Execute an operation with retry capability
   */
  const executeWithRetry = useCallback(async (
    operation,
    options = {}
  ) => {
    const {
      maxRetries = 3,
      delay = 1000,
      onRetryAttempt,
      ...executeOptions
    } = options;

    setIsRetrying(true);
    
    try {
      const result = await executeWithErrorHandling(
        () => withRetry(operation, maxRetries, delay),
        {
          ...executeOptions,
          onError: (error, errorInfo) => {
            setIsRetrying(false);
            if (executeOptions.onError) {
              executeOptions.onError(error, errorInfo);
            }
          }
        }
      );
      
      setIsRetrying(false);
      return result;
    } catch (error) {
      setIsRetrying(false);
      throw error;
    }
  }, [executeWithErrorHandling]);

  /**
   * Create a retry function for the current error
   */
  const createRetryFunction = useCallback((operation, options = {}) => {
    return async () => {
      if (isRetrying) return;
      
      try {
        await executeWithRetry(operation, options);
        clearError(); // Clear error on successful retry
      } catch (error) {
        // Error is already handled by executeWithRetry
      }
    };
  }, [executeWithRetry, clearError, isRetrying]);

  /**
   * Handle network-specific errors (useful for offline scenarios)
   */
  const handleNetworkError = useCallback((error) => {
    if (!navigator.onLine) {
      const offlineError = {
        type: ERROR_TYPES.NETWORK,
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        canRetry: true,
        severity: 'high'
      };
      setError(offlineError);
      return offlineError;
    }
    
    return handleAsyncError(error, 'network operation');
  }, [handleAsyncError]);

  /**
   * Batch error handling for multiple operations
   */
  const executeBatch = useCallback(async (operations, options = {}) => {
    const {
      continueOnError = false,
      onPartialSuccess,
      onComplete,
      customContext = 'batch operation'
    } = options;

    const results = [];
    const errors = [];

    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await executeWithErrorHandling(
          operations[i],
          { 
            customContext: `${customContext} (${i + 1}/${operations.length})`,
            showNotification: false // Handle notifications at batch level
          }
        );
        results.push({ success: true, data: result, index: i });
      } catch (error) {
        errors.push({ error, index: i });
        results.push({ success: false, error, index: i });
        
        if (!continueOnError) {
          break;
        }
      }
    }

    // Handle batch results
    if (errors.length > 0) {
      if (errors.length === operations.length) {
        // All operations failed
        handleAsyncError(errors[0].error, `${customContext} - all operations failed`);
      } else if (onPartialSuccess) {
        // Some operations succeeded
        onPartialSuccess(results, errors);
        notify({
          title: 'Partial Success',
          body: `${results.filter(r => r.success).length}/${operations.length} operations completed successfully.`,
          color: 'orange',
          duration: 4000
        });
      }
    }

    if (onComplete) {
      onComplete(results, errors);
    }

    return results;
  }, [executeWithErrorHandling, handleAsyncError, notify]);

  return {
    error,
    isRetrying,
    clearError,
    handleAsyncError,
    executeWithErrorHandling,
    executeWithRetry,
    createRetryFunction,
    handleNetworkError,
    executeBatch
  };
};

export default useDashboardError;