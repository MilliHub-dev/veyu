import { apiClient, handleApiResponse, handleApiError } from './api';

class BookingService {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const response = await apiClient.post('/bookings/', bookingData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get all bookings for the current user
  async getBookings(params = {}) {
    try {
      const response = await apiClient.get('/bookings/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get specific booking details
  async getBookingDetails(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status, notes = '', metadata = {}) {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/status/`, {
        status,
        notes,
        metadata,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Cancel booking
  async cancelBooking(bookingId, reason = '', feedback = '') {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/cancel/`, {
        reason,
        feedback,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Rate and review booking
  async rateBooking(bookingId, ratingData) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/rate/`, ratingData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Reschedule booking
  async rescheduleBooking(bookingId, newDateTime, reason = '') {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/reschedule/`, {
        new_date_time: newDateTime,
        reason,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get booking history
  async getBookingHistory(params = {}) {
    try {
      const response = await apiClient.get('/bookings/', {
        params: {
          ...params,
          type: 'past',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get upcoming bookings
  async getUpcomingBookings(params = {}) {
    try {
      const response = await apiClient.get('/bookings/', {
        params: {
          ...params,
          type: 'upcoming',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get cancelled bookings
  async getCancelledBookings(params = {}) {
    try {
      const response = await apiClient.get('/bookings/', {
        params: {
          ...params,
          type: 'cancelled',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Search bookings
  async searchBookings(query, params = {}) {
    try {
      const response = await apiClient.get('/bookings/', {
        params: {
          ...params,
          search: query,
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get booking statistics
  async getBookingStatistics(timeframe = 'month') {
    try {
      const response = await apiClient.get('/bookings/statistics/', {
        params: { timeframe },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Upload booking-related files (images, documents)
  async uploadBookingFile(bookingId, file, fileType = 'image', description = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', fileType);
      formData.append('description', description);

      const response = await apiClient.post(`/bookings/${bookingId}/files/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get booking files
  async getBookingFiles(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/files/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Add diagnosis to booking
  async addDiagnosis(bookingId, diagnosisData) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/diagnosis/`, diagnosisData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Update diagnosis
  async updateDiagnosis(bookingId, diagnosisData) {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}/diagnosis/`, diagnosisData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get available time slots for booking
  async getAvailableTimeSlots(mechanicId, date) {
    try {
      const response = await apiClient.get(`/mechanics/${mechanicId}/availability/`, {
        params: { date },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Estimate booking cost
  async estimateBookingCost(bookingData) {
    try {
      const response = await apiClient.post('/bookings/estimate/', bookingData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get booking invoice
  async getBookingInvoice(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/invoice/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Download booking invoice PDF
  async downloadInvoicePDF(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/invoice/pdf/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get booking payment status
  async getPaymentStatus(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/payment/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Process booking payment
  async processPayment(bookingId, paymentData) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/payment/`, paymentData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get booking notifications
  async getBookingNotifications(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/notifications/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Send booking notification
  async sendBookingNotification(bookingId, notificationData) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/notifications/`, notificationData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
}

export default new BookingService();