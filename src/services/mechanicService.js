import { apiClient, handleApiResponse, handleApiError } from './api';

class MechanicService {
  // ==================== 4.1 Mechanic Profile (Public) ====================

  /**
   * List all available mechanics (public)
   * @param {Object} params - Query parameters
   */
  async getMechanics(params = {}) {
    try {
      const response = await apiClient.get('/mechanics/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Search mechanics (public)
   * @param {string} query - Search query (name or service)
   */
  async searchMechanics(query) {
    try {
      const response = await apiClient.get('/mechanics/find/', { 
        params: { find: query } 
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get specific mechanic profile (public)
   * @param {string} mechId - Mechanic ID
   */
  async getMechanicPublicProfile(mechId) {
    try {
      const response = await apiClient.get(`/mechanics/${mechId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * View mechanic's past jobs/reviews (public)
   * @param {string} mechId - Mechanic ID
   */
  async getMechanicHistory(mechId) {
    try {
      const response = await apiClient.get(`/mechanics/${mechId}/history/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 4.2 Dashboard (Authenticated) ====================

  /**
   * Get mechanic profile summary (Overview)
   */
  async getMechanicOverview() {
    try {
      const response = await apiClient.get('/admin/mechanics/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get mechanic dashboard stats
   * @param {Object} config - Axios config options
   */
  async getMechanicDashboard(config = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/dashboard/', config);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get analytics
   * @param {Object} params - Query parameters
   * @param {string} params.period - day|week|month|year
   * @param {string} params.start_date - Start date
   * @param {string} params.end_date - End date
   * @param {Object} extraConfig - Additional Axios config
   */
  async getAnalytics(params = {}, extraConfig = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/analytics/', { params, ...extraConfig });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 4.3 Bookings ====================

  // ==================== 4.5 Settings ====================

  /**
   * Get mechanic settings
   * @param {Object} config - Axios config options
   */
  async getSettings(config = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/settings/', config);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update mechanic settings
   * @param {Object} settings - Settings data
   */
  async updateSettings(settings) {
    try {
      const response = await apiClient.post('/admin/mechanics/settings/', settings);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Legacy method for backward compatibility
  async updateProfile(profileData) {
    try {
      let formData;
      
      if (profileData instanceof FormData) {
        formData = profileData;
      } else {
        formData = new FormData();
        
        // Handle file uploads (logo)
        Object.keys(profileData).forEach(key => {
          if (key === 'logo' && profileData[key]?.file) {
            formData.append('new-logo', profileData[key].file, profileData[key].file.name);
          } else if (Array.isArray(profileData[key])) {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        });
      }

      const response = await apiClient.put('/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== Additional Features ====================

  // ==================== 4.4 Services ====================

  /**
   * Get services
   * @param {Object} config - Axios config options
   */
  async getServices(config = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/services/', config);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Create service offering (newdoc.md format)
   * @param {Object} serviceData - Service data
   * @param {string} serviceData.service_name - Service name
   * @param {string} serviceData.description - Description
   * @param {number} serviceData.price - Price
   * @param {number} serviceData.duration_minutes - Duration in minutes
   * @param {string} serviceData.category - maintenance|repair|inspection
   */
  async createServiceOffering(serviceData) {
    try {
      const response = await apiClient.post('/admin/mechanics/services/add/', serviceData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update service offering
   * @param {string} serviceId - Service ID
   * @param {Object} serviceData - Updated service data
   */
  async updateServiceOffering(serviceId, serviceData) {
    try {
      const response = await apiClient.put(`/admin/mechanics/services/${serviceId}/`, serviceData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Delete service offering
   * @param {string} serviceId - Service ID
   */
  async deleteServiceOffering(serviceId) {
    try {
      await apiClient.delete(`/admin/mechanics/services/${serviceId}/`);
      return { success: true };
    } catch (error) {
      handleApiError(error);
    }
  }

  // Legacy method for backward compatibility
  async getAvailableServices() {
    try {
      const response = await apiClient.get('/admin/mechanics/services/add/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async toggleServiceStatus(serviceId, isActive) {
    try {
      const response = await apiClient.patch(`/admin/mechanics/services/${serviceId}/`, {
        is_active: isActive,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get bookings
   * @param {Object} params - Query parameters
   * @param {string} params.status - pending|confirmed|in_progress|completed|cancelled
   * @param {string} params.date_from - Start date
   * @param {string} params.date_to - End date
   * @param {Object} extraConfig - Additional Axios config
   */
  async getBookings(params = {}, extraConfig = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/bookings/', { params, ...extraConfig });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get booking details
   * @param {string} bookingId - Booking ID
   */
  async getBookingDetails(bookingId) {
    try {
      const response = await apiClient.get(`/admin/mechanics/bookings/${bookingId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update booking (newdoc.md format)
   * @param {string} bookingId - Booking ID
   * @param {Object} data - Update data
   * @param {string} data.status - confirmed|in_progress|completed|cancelled
   * @param {string} data.notes - Additional notes
   * @param {string} data.estimated_completion - Estimated completion time
   */
  async updateBooking(bookingId, data) {
    try {
      const response = await apiClient.put(`/admin/mechanics/bookings/${bookingId}/`, data);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Legacy method for backward compatibility
  async updateBookingStatus(bookingId, action, metadata = {}) {
    try {
      const response = await apiClient.post(`/admin/mechanics/bookings/${bookingId}/`, {
        action,
        ...metadata,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Booking actions
  async acceptBooking(bookingId) {
    return this.updateBookingStatus(bookingId, 'accept');
  }

  async declineBooking(bookingId, reason = '') {
    return this.updateBookingStatus(bookingId, 'decline', { reason });
  }

  async startJob(bookingId) {
    return this.updateBookingStatus(bookingId, 'start-job');
  }

  async completeJob(bookingId, completionData = {}) {
    return this.updateBookingStatus(bookingId, 'complete-job', completionData);
  }

  async cancelJob(bookingId, reason = '') {
    return this.updateBookingStatus(bookingId, 'cancel-job', { reason });
  }

  // Reviews and ratings
  async getReviews(params = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/reviews/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async respondToReview(reviewId, response) {
    try {
      const apiResponse = await apiClient.post(`/admin/mechanics/reviews/${reviewId}/respond/`, {
        response,
      });
      return handleApiResponse(apiResponse);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Earnings and payments
  async getEarnings(params = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/earnings/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async requestPayout(amount, paymentMethod = 'bank_transfer') {
    try {
      const response = await apiClient.post('/admin/mechanics/payout/', {
        amount,
        payment_method: paymentMethod,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Availability management
  async getAvailability() {
    try {
      const response = await apiClient.get('/admin/mechanics/availability/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async updateAvailability(availabilityData) {
    try {
      const response = await apiClient.post('/admin/mechanics/availability/', availabilityData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Profile boost/promotion
  async getBoostOptions() {
    try {
      const response = await apiClient.get('/admin/mechanics/boost/options/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async createBoostCampaign(campaignData) {
    try {
      const response = await apiClient.post('/admin/mechanics/boost/', campaignData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async getActiveCampaigns() {
    try {
      const response = await apiClient.get('/admin/mechanics/boost/active/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async getCampaignHistory() {
    try {
      const response = await apiClient.get('/admin/mechanics/boost/history/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Notifications
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/notifications/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.patch(`/admin/mechanics/notifications/${notificationId}/`, {
        is_read: true,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const response = await apiClient.post('/admin/mechanics/notifications/mark-all-read/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
}

export default new MechanicService();