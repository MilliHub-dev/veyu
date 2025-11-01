import { apiClient, handleApiResponse, handleApiError } from './api';

class FeedbackService {
  // Submit feedback/review
  async submitFeedback(bookingId, rating, comment, anonymous = false) {
    try {
      const response = await apiClient.post('/feedback/', {
        booking_id: bookingId,
        rating,
        comment,
        anonymous,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get feedback for a mechanic
  async getMechanicFeedback(mechanicId, params = {}) {
    try {
      const response = await apiClient.get(`/mechanics/${mechanicId}/feedback/`, { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get feedback statistics
  async getFeedbackStats(mechanicId) {
    try {
      const response = await apiClient.get(`/mechanics/${mechanicId}/feedback/stats/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Report inappropriate feedback
  async reportFeedback(feedbackId, reason) {
    try {
      const response = await apiClient.post(`/feedback/${feedbackId}/report/`, {
        reason,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
}

export default new FeedbackService();