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
   * @param {number} params.per_page - Items per page (default 25)
   * @param {number} params.offset - Pagination offset
   * @param {string} params.brands - Comma-separated brands, e.g. "Toyota,Honda"
   * @param {string} params.vehicle_type - Comma-separated types: car,boat,plane,bike,uav
   * @param {string} params.body_type - Comma-separated body types, e.g. "suv,sedan"
   * @param {string} params.transmission - Comma-separated: auto,manual
   * @param {string} params.fuel_system - Comma-separated: petrol,diesel,electric,hybrid
   * @param {string} params.price - Range in min-max format, e.g. "1000000-5000000"
   * @param {string} params.location - Dealer state or city, e.g. "Lagos,Abuja"
   * @param {string} params.ordering - Sort field, e.g. "-date_created", "price", "-price"
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
   * Get buy listings — GET /listings/buy/
   * @param {Object} params - Query parameters (same filters as getAllListings)
   * @param {number} params.per_page - Items per page
   * @param {number} params.offset - Pagination offset
   * @param {string} params.brands - Comma-separated brands
   * @param {string} params.price - Range in min-max format, e.g. "1000000-5000000"
   * @param {string} params.vehicle_type - car|boat|plane|bike|uav
   * @param {string} params.transmission - auto|manual
   * @param {string} params.fuel_system - petrol|diesel|electric|hybrid
   * @param {string} params.location - City or state
   * @param {string} params.ordering - e.g. "price", "-price", "-date_created"
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
   * Get rental listings — GET /listings/rentals/
   * @param {Object} params - Query parameters (same filters as getBuyListings)
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
   * Search listings — GET /listings/find/
   * @param {Object} params - Search parameters
   * @param {string} params.find - Text search on vehicle name/brand, e.g. "camry"
   * @param {string} params.brands - Comma-separated brands, e.g. "Toyota,Honda"
   * @param {string} params.vehicle_type - Comma-separated: car,boat,plane,bike,uav
   * @param {string} params.transmission - Comma-separated: auto,manual
   * @param {string} params.fuel_system - Comma-separated: petrol,diesel,electric,hybrid
   * @param {string} params.price - Range in min-max format, e.g. "1000000-5000000"
   * @param {string} params.location - Dealer state or city, e.g. "Lagos"
   * @param {number} params.per_page - Items per page
   * @param {number} params.offset - Pagination offset
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
