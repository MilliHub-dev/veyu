import { apiClient, handleApiResponse, handleApiError } from './api';

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
      
      // Store tokens
      if (data.token) {
        localStorage.setItem('access_token', data.token.access);
        localStorage.setItem('refresh_token', data.token.refresh);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/accounts/register/', userData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Register business account (mechanic/dealer)
  async registerBusiness(businessData) {
    try {
      const response = await apiClient.post('/accounts/register/', {
        action: 'create-business-account',
        ...businessData,
      });
      return handleApiResponse(response);
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
        localStorage.setItem('access_token', data.token.access);
        localStorage.setItem('refresh_token', data.token.refresh);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await apiClient.get('/accounts/profile/');
      const data = handleApiResponse(response);
      localStorage.setItem('user_data', JSON.stringify(data));
      return data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/accounts/profile/', profileData);
      const data = handleApiResponse(response);
      localStorage.setItem('user_data', JSON.stringify(data));
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
        action: 'verify-code',
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
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/token/refresh/', {
        refresh: refreshToken,
      });

      const data = handleApiResponse(response);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  // Get current user data
  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem('access_token');
  }
}

export default new AuthService();