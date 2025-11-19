import { apiClient, handleApiResponse, handleApiError } from './api';

/**
 * Dealership Service
 * Handles all dealership admin operations according to newdoc.md Section 3
 */
class DealershipService {
  // ==================== 3.1 Dashboard ====================

  /**
   * Get dealership information
   */
  async getDealershipInfo() {
    try {
      const response = await apiClient.get('/admin/dealership/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/admin/dealership/dashboard/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get analytics data
   * @param {Object} params - Query parameters
   * @param {string} params.period - day|week|month|year
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   */
  async getAnalytics(params = {}) {
    try {
      const response = await apiClient.get('/admin/dealership/analytics/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 3.2 Listing Management ====================

  /**
   * Get dealership listings
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - active|sold|pending
   * @param {string} params.type - buy|rent
   */
  async getListings(params = {}) {
    try {
      const response = await apiClient.get('/admin/dealership/listings/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Create new listing
   * @param {FormData} listingData - Listing data (multipart/form-data)
   * Required fields:
   * - name: Vehicle name
   * - brand: Vehicle brand
   * - model: Vehicle model
   * - year: Model year
   * - price: Price
   * - listing_type: buy|rent
   * - condition: new|used|certified
   * - images: Array of image files
   */
  async createListing(listingData) {
    try {
      const response = await apiClient.post('/admin/dealership/listings/create/', listingData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get listing detail
   * @param {string} listingId - Listing ID
   */
  async getListingDetail(listingId) {
    try {
      const response = await apiClient.get(`/admin/dealership/listings/${listingId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update listing
   * @param {string} listingId - Listing ID
   * @param {Object|FormData} listingData - Updated listing data
   */
  async updateListing(listingId, listingData) {
    try {
      const config = listingData instanceof FormData ? {
        headers: { 'Content-Type': 'multipart/form-data' },
      } : {};

      const response = await apiClient.put(`/admin/dealership/listings/${listingId}/`, listingData, config);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Delete listing
   * @param {string} listingId - Listing ID
   */
  async deleteListing(listingId) {
    try {
      const response = await apiClient.delete(`/admin/dealership/listings/${listingId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 3.3 Orders ====================

  /**
   * Get orders
   * @param {Object} params - Query parameters
   * @param {string} params.status - pending|confirmed|completed|cancelled
   * @param {string} params.date_from - Start date (YYYY-MM-DD)
   * @param {string} params.date_to - End date (YYYY-MM-DD)
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  async getOrders(params = {}) {
    try {
      const response = await apiClient.get('/admin/dealership/orders/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get order detail
   * @param {string} orderId - Order ID
   */
  async getOrderDetail(orderId) {
    try {
      const response = await apiClient.get(`/admin/dealership/orders/${orderId}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {Object} data - Update data
   * @param {string} data.status - New status
   * @param {string} data.notes - Optional notes
   */
  async updateOrderStatus(orderId, data) {
    try {
      const response = await apiClient.patch(`/admin/dealership/orders/${orderId}/`, data);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 3.4 Settings ====================

  /**
   * Get dealership settings
   */
  async getSettings() {
    try {
      const response = await apiClient.get('/admin/dealership/settings/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Update dealership settings
   * @param {Object} settings - Settings data
   */
  async updateSettings(settings) {
    try {
      const response = await apiClient.put('/admin/dealership/settings/', settings);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Prepare listing form data
   * @param {Object} listingData - Listing data object
   * @returns {FormData} FormData object
   */
  prepareListingFormData(listingData) {
    const formData = new FormData();

    // Add text fields
    const textFields = [
      'name', 'brand', 'model', 'year', 'price', 'listing_type',
      'condition', 'mileage', 'transmission', 'fuel_type', 'color', 'description'
    ];

    textFields.forEach(field => {
      if (listingData[field] !== undefined && listingData[field] !== null) {
        formData.append(field, listingData[field]);
      }
    });

    // Add features array
    if (listingData.features && Array.isArray(listingData.features)) {
      formData.append('features', JSON.stringify(listingData.features));
    }

    // Add images
    if (listingData.images && Array.isArray(listingData.images)) {
      listingData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    return formData;
  }

  /**
   * Get order status label
   * @param {string} status - Order status
   * @returns {string} Human-readable label
   */
  getOrderStatusLabel(status) {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  }

  /**
   * Get order status color
   * @param {string} status - Order status
   * @returns {string} Color code for UI
   */
  getOrderStatusColor(status) {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      processing: 'purple',
      completed: 'green',
      cancelled: 'red',
      refunded: 'gray',
    };
    return colors[status] || 'gray';
  }
}

export default new DealershipService();
