import { apiClient, handleApiResponse, handleApiError } from './api';

/**
 * Boost Service
 * Handles all listing boost operations
 */
class BoostService {
  /**
   * Get boost pricing options
   * @returns {Promise} Pricing data
   */
  async getPricing() {
    try {
      const response = await apiClient.get('/admin/dealership/boost/pricing/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get boost status for a listing
   * @param {string} listingUuid - Listing UUID
   * @returns {Promise} Boost status data
   */
  async getBoostStatus(listingUuid) {
    try {
      const response = await apiClient.get(`/admin/dealership/listings/${listingUuid}/boost/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Create a boost for a listing
   * @param {string} listingUuid - Listing UUID
   * @param {Object} boostData - Boost configuration
   * @param {string} boostData.duration_type - daily|weekly|monthly
   * @param {number} boostData.duration_count - Number of duration units (1-12)
   * @returns {Promise} Created boost data
   */
  async createBoost(listingUuid, boostData) {
    try {
      const response = await apiClient.post(
        `/admin/dealership/listings/${listingUuid}/boost/`,
        boostData
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Confirm boost payment
   * @param {number} boostId - Boost ID
   * @param {string} paymentReference - Payment gateway reference
   * @returns {Promise} Confirmed boost data
   */
  async confirmPayment(boostId, paymentReference) {
    try {
      const response = await apiClient.post('/admin/dealership/boost/confirm-payment/', {
        boost_id: boostId,
        payment_reference: paymentReference,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Cancel/delete a boost
   * @param {string} listingUuid - Listing UUID
   * @returns {Promise} Success message
   */
  async cancelBoost(listingUuid) {
    try {
      const response = await apiClient.delete(`/admin/dealership/listings/${listingUuid}/boost/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get all boosts for the authenticated dealer
   * @returns {Promise} List of active and inactive boosts
   */
  async getMyBoosts() {
    try {
      const response = await apiClient.get('/admin/dealership/boost/my-boosts/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
}

export default new BoostService();
