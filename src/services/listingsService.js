import { apiClient, handleApiResponse, handleApiError } from './api';

/**
 * Listings Service
 * Handles all vehicle listing operations according to newdoc.md Section 2
 */
class ListingsService {
  // ==================== 2.1 Browse Listings ====================

  /**
   * Get all listings with filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.type - buy|rent
   * @param {string} params.brand - Vehicle brand
   * @param {number} params.min_price - Minimum price
   * @param {number} params.max_price - Maximum price
   * @param {string} params.location - Location filter
   */
  async getAllListings(params = {}) {
    try {
      const response = await apiClient.get('/listings/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get featured listings
   */
  async getFeaturedListings() {
    try {
      const response = await apiClient.get('/listings/featured/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get buy listings
   * @param {Object} params - Query parameters
   */
  async getBuyListings(params = {}) {
    try {
      const response = await apiClient.get('/listings/buy/', { params });
      const payload = response?.data;

      const pagination = payload?.data?.pagination ?? payload?.pagination ?? null;

      const results =
        payload?.data?.results ??
        payload?.results ??
        (Array.isArray(payload) ? payload : []);

      return {
        results: Array.isArray(results) ? results : [],
        pagination,
      };
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('getBuyListings 401: Returning empty list.');
        return {
          results: [],
          pagination: null,
        };
      }
      handleApiError(error);
    }
  }

  /**
   * Get rental listings
   * @param {Object} params - Query parameters
   */
  async getRentalListings(params = {}) {
    try {
      const response = await apiClient.get('/listings/rentals/', { params });
      const payload = response?.data;

      const pagination = payload?.data?.pagination ?? payload?.pagination ?? null;

      const results =
        payload?.data?.results ??
        payload?.results ??
        (Array.isArray(payload) ? payload : []);

      return {
        results: Array.isArray(results) ? results : [],
        pagination,
      };
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('getRentalListings 401: Returning empty list.');
        return {
          results: [],
          pagination: null,
        };
      }
      handleApiError(error);
    }
  }

  /**
   * Search listings
   * @param {Object} params - Search parameters
   * @param {string} params.q - Search query
   * @param {string} params.brand - Vehicle brand
   * @param {string} params.model - Vehicle model
   * @param {number} params.year_min - Minimum year
   * @param {number} params.year_max - Maximum year
   * @param {number} params.price_min - Minimum price
   * @param {number} params.price_max - Maximum price
   * @param {string} params.condition - new|used|certified
   * @param {string} params.transmission - automatic|manual
   * @param {string} params.fuel_type - petrol|diesel|electric|hybrid
   */
  async searchListings(params = {}) {
    try {
      const response = await apiClient.get('/listings/find/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get vehicle type counts
   */
  async getVehicleCounts() {
    try {
      const response = await apiClient.get('/listings/counts/', { skipErrorLogging: true });
      return handleApiResponse(response);
    } catch (error) {
      // Endpoint might not exist yet, return null to fallback to client-side counting
      console.warn('Vehicle counts endpoint unavailable');
      return null;
    }
  }

  // ==================== 2.2 Listing Details ====================

  /**
   * Get buy listing detail
   * @param {string} uuid - Listing UUID
   */
  async getBuyListingDetail(uuid) {
    try {
      const response = await apiClient.get(`/listings/buy/${uuid}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get rental listing detail
   * @param {string} uuid - Listing UUID
   */
  async getRentalListingDetail(uuid) {
    try {
      const response = await apiClient.get(`/listings/rentals/${uuid}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get dealership info
   * @param {string} uuidOrSlug - Dealership UUID or slug
   */
  async getDealershipInfo(uuidOrSlug) {
    try {
      const response = await apiClient.get(`/listings/dealer/${uuidOrSlug}/`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 2.3 My Listings ====================

  /**
   * Get my listings (requires authentication)
   */
  async getMyListings() {
    try {
      const response = await apiClient.get('/listings/my-listings/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== 2.4 Checkout ====================

  /**
   * Checkout listing
   * @param {string} listingId - Listing ID
   * @param {Object} checkoutData - Checkout data
   * @param {string} checkoutData.payment_method - card|bank_transfer|wallet
   * @param {string} checkoutData.delivery_address - Delivery address
   * @param {string} checkoutData.rental_start_date - Rental start date (for rentals)
   * @param {string} checkoutData.rental_end_date - Rental end date (for rentals)
   */
  async checkoutListing(listingId, checkoutData) {
    try {
      const response = await apiClient.post(`/listings/checkout/${listingId}/`, checkoutData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Get checkout documents
   */
  async getCheckoutDocuments() {
    try {
      const response = await apiClient.get('/listings/checkout/documents/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Book inspection
   * @param {Object} inspectionData - Inspection booking data
   * @param {string} inspectionData.listing_id - Listing UUID
   * @param {string} inspectionData.preferred_date - Preferred date (YYYY-MM-DD)
   * @param {string} inspectionData.preferred_time - Preferred time (HH:MM)
   * @param {string} inspectionData.inspection_type - pre_purchase|pre_rental
   */
  async bookInspection(inspectionData) {
    try {
      const response = await apiClient.post('/listings/checkout/inspection/', inspectionData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Build search query parameters
   * @param {Object} filters - Filter object
   * @returns {Object} Query parameters
   */
  buildSearchParams(filters) {
    const params = {};
    
    // Add only defined parameters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params[key] = filters[key];
      }
    });

    return params;
  }

  /**
   * Format price for display
   * @param {number} price - Price in kobo/cents
   * @param {string} currency - Currency code (default: NGN)
   * @returns {string} Formatted price
   */
  formatPrice(price, currency = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }

  /**
   * Get listing type label
   * @param {string} type - Listing type
   * @returns {string} Human-readable label
   */
  getListingTypeLabel(type) {
    const labels = {
      buy: 'For Sale',
      rent: 'For Rent',
      lease: 'For Lease',
    };
    return labels[type] || type;
  }

  /**
   * Get condition label
   * @param {string} condition - Condition code
   * @returns {string} Human-readable label
   */
  getConditionLabel(condition) {
    const labels = {
      new: 'Brand New',
      used: 'Used',
      certified: 'Certified Pre-Owned',
      refurbished: 'Refurbished',
    };
    return labels[condition] || condition;
  }
}

export default new ListingsService();
