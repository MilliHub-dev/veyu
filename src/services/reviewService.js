import { apiClient, handleApiResponse, handleApiError } from './api';

class ReviewService {
  /**
   * Create a new review
   * @param {Object} reviewData
   * @param {string} reviewData.object_type - 'dealer' | 'mechanic' | 'vehicle' | 'support_ticket' | 'purchase' | 'service'
   * @param {string} reviewData.related_object - UUID of the entity being reviewed
   * @param {string} [reviewData.related_order] - UUID of the booking/order (optional)
   * @param {string} [reviewData.comment] - Review text
   * @param {Object} reviewData.ratings - Dictionary of ratings (1-5)
   * @returns {Promise<Object>}
   */
  async createReview(reviewData) {
    try {
      const response = await apiClient.post('/support/reviews/', reviewData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get list of reviews
   * @param {Object} params
   * @param {string} [params.related_object] - UUID of the entity
   * @param {string} [params.object_type] - Type filter
   * @returns {Promise<Object>}
   */
  async getReviews(params = {}) {
    try {
      const response = await apiClient.get('/support/reviews/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
}

export default new ReviewService();
