import { apiClient, handleApiResponse, handleApiError, TokenManager } from './api';

class AuthService {
  // Login with email and password
  async login(email, password, deviceInfo = {}) {
    try {
      const response = await apiClient.post('/accounts/login/', {
        email,
        password,
        device: {
          id: deviceInfo.id || 'web-client',
          name: deviceInfo.name || 'Web Browser',
          model: deviceInfo.model || navigator.userAgent,
          os: deviceInfo.os || navigator.platform,
          push_token: deviceInfo.push_token || null,
        },
      });

      const data = handleApiResponse(response);
      console.log('🔐 Login Response:', data);

      // Store tokens using TokenManager - handle different formats
      let accessToken = null;
      let refreshToken = null;

      if (data.token) {
        if (typeof data.token === 'string') {
          console.log('🔐 Storing token as string');
          accessToken = data.token;
        } else if (data.token.access) {
          console.log('🔐 Storing tokens from data.token object');
          accessToken = data.token.access;
          refreshToken = data.token.refresh;
        }
      } else if (data.access_token) {
        console.log('🔐 Storing tokens from data.access_token');
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
      } else if (data.api_token) {
        console.log('🔐 Storing token from data.api_token');
        accessToken = data.api_token;
      }

      if (accessToken) {
        TokenManager.setTokens(accessToken, refreshToken);
        localStorage.setItem('veyu_user_data', JSON.stringify(data.user || data));
      } else {
        console.log('🔐 No tokens found in login response');
      }

      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Register new user
  async register(userData) {
    try {
      // Ensure required fields are present according to API documentation
      const payload = {
        action: 'create-account',
        provider: 'veyu',
        ...userData,
      };

      // Log the payload for debugging
      console.log('AuthService register payload:', JSON.stringify(payload, null, 2));

      // Use the correct endpoint from documentation
      const response = await apiClient.post('/accounts/signup/', payload);
      const data = handleApiResponse(response);

      // Store tokens if provided - handle different response formats
      if (data.token) {
        if (typeof data.token === 'string') {
          TokenManager.setTokens(data.token);
        } else if (data.token.access) {
          TokenManager.setTokens(data.token.access, data.token.refresh);
        }
        localStorage.setItem('veyu_user_data', JSON.stringify(data.user || data));
      }

      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Register business account (mechanic/dealer)
  async registerBusiness(businessData) {
    try {
      const payload = {
        action: 'create-business-account',
        ...businessData,
      };

      const response = await apiClient.post('/accounts/register/', payload);
      const data = handleApiResponse(response);

      // Store tokens if provided
      if (data.token) {
        TokenManager.setTokens(data.token.access, data.token.refresh);
        localStorage.setItem('veyu_user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Social login
  async socialLogin(provider, accessToken, deviceInfo = {}) {
    try {
      const response = await apiClient.post('/accounts/social-login/', {
        provider,
        access_token: accessToken,
        device: deviceInfo,
      });

      const data = handleApiResponse(response);

      if (data.token) {
        TokenManager.setTokens(data.token.access, data.token.refresh);
        localStorage.setItem('veyu_user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get user profile
  async getProfile() {
    try {
      // Use the correct endpoint from API documentation
      const response = await apiClient.get('/accounts/profile/');
      const data = handleApiResponse(response);
      localStorage.setItem('veyu_user_data', JSON.stringify(data));
      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      // Try PUT method first, then POST if that fails
      let response;
      try {
        response = await apiClient.put('/accounts/update-profile/', profileData);
      } catch (putError) {
        if (putError.response?.status === 405) {
          // If PUT is not allowed, try PATCH
          response = await apiClient.patch('/accounts/update-profile/', profileData);
        } else {
          throw putError;
        }
      }

      const data = handleApiResponse(response);
      localStorage.setItem('veyu_user_data', JSON.stringify(data));
      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Upload profile photo
  async uploadProfilePhoto(file) {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await apiClient.post('/accounts/profile/photo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await apiClient.post('/accounts/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Email verification
  async requestEmailVerification() {
    try {
      const response = await apiClient.post('/accounts/verify-email/', {
        action: 'request-code',
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async verifyEmail(code) {
    try {
      const response = await apiClient.post('/accounts/verify-email/', {
        action: 'confirm-code',
        code,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Phone verification
  async requestPhoneVerification(phoneNumber) {
    try {
      const response = await apiClient.post('/accounts/verify-phone/', {
        phone_number: phoneNumber,
        action: 'request-code',
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async verifyPhone(phoneNumber, code) {
    try {
      const response = await apiClient.post('/accounts/verify-phone/', {
        phone_number: phoneNumber,
        action: 'verify-code',
        code,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Business verification
  async submitBusinessVerification(verificationData) {
    try {
      const response = await apiClient.post('/accounts/verify-business/', verificationData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async getVerificationStatus() {
    try {
      const response = await apiClient.get('/accounts/verification-status/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Password reset
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/accounts/password/reset/', { email });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async verifyResetToken(token, email) {
    try {
      const response = await apiClient.get('/accounts/password/reset/verify/', {
        params: { token, email },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async confirmPasswordReset(token, email, newPassword, confirmPassword) {
    try {
      const response = await apiClient.post('/accounts/password/reset/confirm/', {
        token,
        email,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Session management
  async getActiveSessions() {
    try {
      const response = await apiClient.get('/accounts/sessions/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async revokeSession(sessionId) {
    try {
      await apiClient.delete(`/accounts/sessions/${sessionId}/`);
      return true;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Token management
  async refreshToken() {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/token/refresh/', {
        refresh: refreshToken,
      });

      const data = handleApiResponse(response);
      TokenManager.setTokens(data.access, data.refresh);

      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async verifyToken(token) {
    try {
      const response = await apiClient.post('/token/verify/', { token });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Logout
  logout() {
    TokenManager.clearTokens();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return TokenManager.isAuthenticated();
  }

  // Get current user data
  getCurrentUser() {
    const userData = localStorage.getItem('veyu_user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Get access token
  getAccessToken() {
    return TokenManager.getAccessToken();
  }
}

export default new AuthService();