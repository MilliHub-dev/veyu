# Token Authentication Fix - 401 Unauthorized Error

## Problem
The application was experiencing 401 Unauthorized errors when making API requests to `/wallet/balance/` and other authenticated endpoints, even though bearer tokens were being attached to requests.

## Root Cause
The issue was caused by:
1. **Expired access tokens** - The access token had expired but wasn't being refreshed proactively
2. **Failed token refresh** - The token refresh mechanism wasn't working properly when 401 errors occurred
3. **Poor error handling** - The app wasn't properly handling cases where both access and refresh tokens were invalid

## Solution Implemented

### 1. Proactive Token Refresh (Request Interceptor)
- Added logic to check if the access token is expired **before** making a request
- If expired, automatically refreshes the token using the refresh token
- Prevents 401 errors by ensuring valid tokens are always used

### 2. Improved Token Refresh on 401 (Response Interceptor)
- Enhanced error handling when 401 errors occur
- Better logging to track token refresh attempts
- Proper cleanup and redirect to login when refresh fails
- Uses a separate axios instance to avoid interceptor loops

### 3. Better Error Messages
- Clear console logs showing token status
- User-friendly notifications when session expires
- Automatic redirect to login page when tokens are invalid

### 4. Debug Utility
Added a global debug function to check token status:

```javascript
// In browser console, run:
window.debugTokenStatus()
```

This will show:
- Whether access and refresh tokens exist
- Whether they are expired
- Token previews (first 20 characters)
- localStorage status

## How to Test

1. **Clear your browser's localStorage** to simulate a fresh login:
   ```javascript
   localStorage.clear()
   ```

2. **Log in again** to get fresh tokens

3. **Check token status** in console:
   ```javascript
   window.debugTokenStatus()
   ```

4. **Navigate to dashboard** - The wallet balance and other API calls should now work

## If Issues Persist

### Check 1: Verify tokens are being stored
```javascript
console.log('Access Token:', localStorage.getItem('veyu_access_token'))
console.log('Refresh Token:', localStorage.getItem('veyu_refresh_token'))
```

### Check 2: Verify token format
Tokens should be JWT format (three parts separated by dots):
```
eyJhbGciOiJIUzI1NiIs...eyJzdWIiOiIxMjM0NTY3ODkw...SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Check 3: Check backend logs
The backend might be rejecting tokens for other reasons:
- Token signature verification failed
- User account is disabled
- Token was revoked

### Check 4: Verify API endpoint
Make sure the backend `/token/refresh/` endpoint is working:
```bash
curl -X POST https://dev.veyu.cc/api/v1/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "YOUR_REFRESH_TOKEN"}'
```

## Changes Made

### Files Modified:
1. **src/services/api.js**
   - Enhanced request interceptor with proactive token refresh
   - Improved response interceptor with better 401 handling
   - Added `debugTokenStatus()` utility function
   - Better error logging and user notifications

## Prevention

To prevent this issue in the future:
1. Always check token expiration before making requests
2. Implement proper token refresh logic
3. Handle edge cases (missing tokens, expired refresh tokens)
4. Provide clear error messages to users
5. Log token status for debugging

## Additional Notes

- Tokens are stored in localStorage with keys:
  - `veyu_access_token` - Short-lived access token
  - `veyu_refresh_token` - Long-lived refresh token
  - `veyu_user_data` - User profile data

- The app automatically redirects to `/login?session_expired=true` when:
  - No refresh token is available
  - Refresh token is expired or invalid
  - Token refresh fails

- Public endpoints (login, signup, password reset) don't require tokens
