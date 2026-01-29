import { apiClient, handleApiResponse, handleApiError } from './api';

/**
 * Round coordinate to 6 decimal places (fits within API's 10 digit limit)
 * e.g., -122.123456 = 10 characters
 */
const roundCoord = (val) => {
  if (val === null || val === undefined) return null;
  return Math.round(parseFloat(val) * 1000000) / 1000000;
};

/**
 * Location Service
 * Handles all location-related API calls
 */
class LocationService {
  /**
   * Get all locations for the current dealer
   * @returns {Promise<Array>} Array of location objects
   */
  async getLocations() {
    try {
      const response = await apiClient.get('/accounts/locations/');
      console.log("get locations response:", response.status);
      console.log("get locations response data:", response.data);
      const data = handleApiResponse(response);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.results)) return data.results;
      console.warn('Unexpected locations response shape:', data);
      return [];
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      // Return empty array instead of throwing - dealer might not have locations yet
      return [];
    }
  }

  /**
   * Create a new location
   * @param {Object} locationData - Location data
   * @param {string} locationData.country - Country code (e.g., "NG")
   * @param {string} locationData.state - State/Province
   * @param {string} locationData.city - City
   * @param {string} locationData.address - Street address
   * @param {string} locationData.zip_code - Postal/ZIP code
   * @param {number} locationData.lat - Latitude
   * @param {number} locationData.lng - Longitude
   * @param {string} locationData.google_place_id - Google Place ID
   * @returns {Promise<Object>} Created location object with ID
   */
  async createLocation(locationData) {
    try {
      const response = await apiClient.post('/accounts/locations/', {
        country: locationData.country,
        state: locationData.state,
        city: locationData.city,
        address: locationData.address || locationData.street_address || locationData.formatted_address,
        zip_code: locationData.zip_code || '',
        lat: roundCoord(locationData.lat),
        lng: roundCoord(locationData.lng),
        google_place_id: locationData.google_place_id || locationData.place_id || ''
      });

      console.log("location creation response:", response.status);
      console.log("location creation response data:", response);


      const data = handleApiResponse(response);
      console.log('✅ Created location:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to create location:', error);
      // Extract error message without throwing to prevent page crash
      const message = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || error.message
        || 'Failed to create location';
      throw new Error(message);
    }
  }

  /**
   * Get location by ID
   * @param {number} locationId - Location ID
   * @returns {Promise<Object>} Location object
   */
  async getLocation(locationId) {
    try {
      const response = await apiClient.get(`/accounts/locations/${locationId}/`);
      const data = handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch location:', error);
      const message = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || error.message
        || 'Failed to fetch location';
      throw new Error(message);
    }
  }

  /**
   * Update an existing location
   * @param {number} locationId - Location ID
   * @param {Object} locationData - Updated location data
   * @returns {Promise<Object>} Updated location object
   */
  async updateLocation(locationId, locationData) {
    try {
      console.log('📍 Updating location:', locationId, locationData);

      const response = await apiClient.put(`/accounts/locations/${locationId}/`, {
        country: locationData.country,
        state: locationData.state,
        city: locationData.city,
        address: locationData.address || locationData.street_address || locationData.formatted_address,
        zip_code: locationData.zip_code || '',
        lat: roundCoord(locationData.lat),
        lng: roundCoord(locationData.lng),
        google_place_id: locationData.google_place_id || locationData.place_id || ''
      });

      const data = handleApiResponse(response);
      console.log('✅ Location updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to update location:', error);
      const message = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || error.message
        || 'Failed to update location';
      throw new Error(message);
    }
  }

  /**
   * Delete a location
   * @param {number} locationId - Location ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteLocation(locationId) {
    try {
      await apiClient.delete(`/accounts/locations/${locationId}/`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete location:', error);
      const message = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || error.message
        || 'Failed to delete location';
      throw new Error(message);
    }
  }

  /**
   * Create or update location based on whether it exists
   * @param {Object} locationData - Location data
   * @param {number|null} existingLocationId - Existing location ID (if updating)
   * @returns {Promise<Object>} Location object with ID
   */
  async createOrUpdateLocation(locationData, existingLocationId = null) {
    try {
      if (existingLocationId) {
        // Update existing location
        return await this.updateLocation(existingLocationId, locationData);
      } else {
        // Create new location
        return await this.createLocation(locationData);
      }
    } catch (error) {
      console.error('❌ Failed to create/update location:', error);
      throw error;
    }
  }
}

export default new LocationService();
