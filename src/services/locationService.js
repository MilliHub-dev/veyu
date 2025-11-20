import { apiClient, handleApiResponse, handleApiError } from './api';

/**
 * Location Service
 * Handles all location-related API calls
 */
class LocationService {
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
      console.log('📍 Creating location:', locationData);
      
      const response = await apiClient.post('/locations/', {
        country: locationData.country,
        state: locationData.state,
        city: locationData.city,
        address: locationData.address || locationData.street_address || locationData.formatted_address,
        zip_code: locationData.zip_code || '',
        lat: locationData.lat,
        lng: locationData.lng,
        google_place_id: locationData.google_place_id || locationData.place_id || ''
      });

      const data = handleApiResponse(response);
      console.log('✅ Location created:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to create location:', error);
      handleApiError(error);
    }
  }

  /**
   * Get location by ID
   * @param {number} locationId - Location ID
   * @returns {Promise<Object>} Location object
   */
  async getLocation(locationId) {
    try {
      console.log('📍 Fetching location:', locationId);
      
      const response = await apiClient.get(`/locations/${locationId}/`);
      const data = handleApiResponse(response);
      
      console.log('✅ Location fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch location:', error);
      handleApiError(error);
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
      
      const response = await apiClient.put(`/locations/${locationId}/`, {
        country: locationData.country,
        state: locationData.state,
        city: locationData.city,
        address: locationData.address || locationData.street_address || locationData.formatted_address,
        zip_code: locationData.zip_code || '',
        lat: locationData.lat,
        lng: locationData.lng,
        google_place_id: locationData.google_place_id || locationData.place_id || ''
      });

      const data = handleApiResponse(response);
      console.log('✅ Location updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to update location:', error);
      handleApiError(error);
    }
  }

  /**
   * Delete a location
   * @param {number} locationId - Location ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteLocation(locationId) {
    try {
      console.log('📍 Deleting location:', locationId);
      
      await apiClient.delete(`/locations/${locationId}/`);
      
      console.log('✅ Location deleted');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete location:', error);
      handleApiError(error);
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
