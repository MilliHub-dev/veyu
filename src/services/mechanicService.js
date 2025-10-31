import { apiClient, handleApiResponse, handleApiError } from './api';

class MechanicService {
  // Get all mechanics (for public listing)
  async getAllMechanics(params = {}) {
    try {
      const response = await apiClient.get('/mechanics/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get specific mechanic details
  async getMechanicDetails(mechanicId) {
    try {
      const response = await apiClient.get(`/mechanics/${mechanicId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get mechanic dashboard data
  async getDashboardData() {
    try {
      const response = await apiClient.get('/admin/mechanics/dashboard/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get mechanic analytics
  async getAnalytics(params = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/analytics/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get mechanic profile/settings
  async getProfile() {
    try {
      const response = await apiClient.get('/admin/mechanics/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Update mechanic profile/settings
  async updateProfile(profileData) {
    try {
      const formData = new FormData();
      
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

      const response = await apiClient.post('/admin/mechanics/settings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get mechanic settings
  async getSettings() {
    try {
      const response = await apiClient.get('/admin/mechanics/settings/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Service offerings management
  async getServiceOfferings() {
    try {
      const response = await apiClient.get('/admin/mechanics/services/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async getAvailableServices() {
    try {
      const response = await apiClient.get('/admin/mechanics/services/add/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async createServiceOffering(serviceData) {
    try {
      const response = await apiClient.post('/admin/mechanics/services/add/', serviceData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async updateServiceOffering(serviceId, serviceData) {
    try {
      const response = await apiClient.put(`/admin/mechanics/services/${serviceId}/`, serviceData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async deleteServiceOffering(serviceId) {
    try {
      await apiClient.delete(`/admin/mechanics/services/${serviceId}/`);
      return true;
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

  // Bookings management
  async getBookings(params = {}) {
    try {
      const response = await apiClient.get('/admin/mechanics/bookings/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  async getBookingDetails(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

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