# Dashboard Error Handling System

This document describes the enhanced error handling system implemented for dashboard components.

## Overview

The error handling system provides graceful error management with user-friendly feedback, automatic retry capabilities, and comprehensive error categorization.

## Components

### 1. Error Handler Utility (`src/utils/errorHandler.js`)

**Key Features:**
- Error categorization (Network, Auth, Validation, Server, Unknown)
- Severity levels (Low, Medium, High, Critical)
- User-friendly error messages
- Retry logic with exponential backoff
- Response validation

**Usage:**
```javascript
import { handleError, withRetry } from '../utils/errorHandler';

// Handle a single error
const errorInfo = handleError(error, notify, 'loading dashboard data');

// Execute with retry
const result = await withRetry(apiCall, 3, 1000);
```

### 2. Error Display Components (`src/components/ErrorDisplay.jsx`)

**Components:**
- `InlineError`: For section-level errors
- `EmptyStateError`: For empty states with errors
- `FullPageError`: For critical page-level errors
- `ErrorToast`: For toast notifications

**Usage:**
```javascript
import { InlineError, EmptyStateError } from '../components/ErrorDisplay';

// Inline error with retry
<InlineError 
  error={error} 
  onRetry={retryFunction}
  onDismiss={clearError}
  showDetails={true}
/>

// Empty state with error
<EmptyStateError 
  error={error}
  onRetry={retryFunction}
  title="Unable to load data"
  description="Something went wrong while loading this section."
/>
```

### 3. Dashboard Error Hook (`src/hooks/useDashboardError.js`)

**Features:**
- Centralized error state management
- Automatic error handling with notifications
- Retry function generation
- Batch operation support
- Network error detection

**Usage:**
```javascript
import { useDashboardError } from '../hooks/useDashboardError';

const { 
  error, 
  clearError, 
  executeWithErrorHandling, 
  createRetryFunction 
} = useDashboardError('dashboard operation');

// Execute with error handling
await executeWithErrorHandling(
  async () => {
    const response = await api.getData();
    setData(response.data);
  },
  { 
    customContext: 'loading dashboard data',
    onSuccess: (result) => console.log('Success!'),
    onError: (error, errorInfo) => console.log('Failed!')
  }
);

// Create retry function
const retryFunction = createRetryFunction(loadData, { maxRetries: 3 });
```

## Error Types and Handling

### Network Errors
- **Trigger**: No internet connection, server unreachable
- **User Message**: "Unable to connect to our servers. Please check your internet connection."
- **Action**: Retry button, automatic retry with backoff

### Authentication Errors (401/403)
- **Trigger**: Invalid/expired tokens, insufficient permissions
- **User Message**: "Your session has expired. Please sign in again."
- **Action**: Redirect to login page

### Validation Errors (400/422)
- **Trigger**: Invalid input data, missing required fields
- **User Message**: Specific validation messages from server
- **Action**: Fix input and retry

### Server Errors (5xx)
- **Trigger**: Internal server errors, database issues
- **User Message**: "Our servers are experiencing issues. Please try again."
- **Action**: Retry with exponential backoff

## Implementation Examples

### Updated Dashboard Components

Both dealer and mechanic dashboards now include:

1. **Error State Management**
   ```javascript
   const { error, clearError, executeWithErrorHandling } = useDashboardError();
   ```

2. **Graceful API Calls**
   ```javascript
   await executeWithErrorHandling(
     async () => {
       const response = await api.getDashboardData();
       setDashboardData(response.data);
     },
     { customContext: 'loading dashboard data' }
   );
   ```

3. **Error Display**
   ```javascript
   {error && (
     <InlineError 
       error={error} 
       onRetry={retryFunction}
       onDismiss={clearError}
       showDetails={true}
     />
   )}
   ```

4. **Empty States with Errors**
   ```javascript
   {error && !loading ? (
     <EmptyStateError 
       error={error}
       onRetry={retryFunction}
       title="Unable to load data"
     />
   ) : (
     // Normal content
   )}
   ```

## Best Practices

1. **Always use executeWithErrorHandling** for API calls
2. **Provide context** for better error messages
3. **Show inline errors** for section-level failures
4. **Use empty state errors** when data fails to load
5. **Implement retry functions** for user convenience
6. **Clear errors** when operations succeed
7. **Handle batch operations** with partial success support

## Benefits

- **Better User Experience**: Clear, actionable error messages
- **Reduced Support Tickets**: Users can resolve issues themselves
- **Improved Reliability**: Automatic retry for transient failures
- **Developer Productivity**: Consistent error handling patterns
- **Debugging**: Detailed error logging and context

## Future Enhancements

- Offline support with queue management
- Error analytics and reporting
- Custom error recovery strategies
- Progressive error disclosure
- Error boundary integration