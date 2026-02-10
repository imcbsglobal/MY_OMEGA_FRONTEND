/**
 * HR Management API Service
 * Handles office locations, geofencing, and related HR APIs
 */

import api from './client';

// =====================================================
// OFFICE LOCATION APIs
// =====================================================

/**
 * List all office locations
 * GET: /hr/office-locations/
 */
export const listOfficeLocations = async (params = {}) => {
  try {
    const response = await api.get('/hr/office-locations/', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing office locations:', error);
    throw error;
  }
};

/**
 * Get specific office location details
 * GET: /hr/office-locations/{id}/
 * @param {number} officeId - Office location ID
 */
export const getOfficeLocation = async (officeId) => {
  try {
    const response = await api.get(`/hr/office-locations/${officeId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching office location ${officeId}:`, error);
    throw error;
  }
};

/**
 * Create a new office location
 * POST: /hr/office-locations/
 * @param {Object} locationData - Office location details
 */
export const createOfficeLocation = async (locationData) => {
  try {
    const response = await api.post('/hr/office-locations/', locationData);
    return response.data;
  } catch (error) {
    console.error('Error creating office location:', error);
    throw error;
  }
};

/**
 * Update office location
 * PATCH: /hr/office-locations/{id}/
 * @param {number} officeId - Office location ID
 * @param {Object} locationData - Updated office location data
 */
export const updateOfficeLocation = async (officeId, locationData) => {
  try {
    const response = await api.patch(`/hr/office-locations/${officeId}/`, locationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating office location ${officeId}:`, error);
    throw error;
  }
};

/**
 * Set office location as active
 * POST: /hr/office-locations/{id}/set-active/
 * @param {number} officeId - Office location ID
 */
export const setOfficeAsActive = async (officeId) => {
  try {
    const response = await api.post(`/hr/office-locations/${officeId}/set-active/`);
    return response.data;
  } catch (error) {
    console.error(`Error setting office ${officeId} as active:`, error);
    throw error;
  }
};

/**
 * Delete office location
 * DELETE: /hr/office-locations/{id}/
 * @param {number} officeId - Office location ID
 */
export const deleteOfficeLocation = async (officeId) => {
  try {
    const response = await api.delete(`/hr/office-locations/${officeId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting office location ${officeId}:`, error);
    throw error;
  }
};

// =====================================================
// GEOFENCE/LOCATION TESTING APIs
// =====================================================

/**
 * Test geofence location (Admin Debug)
 * POST: /hr/office-locations/{id}/test-location/
 * @param {number} officeId - Office location ID
 * @param {Object} locationData - Test location coordinates {latitude, longitude}
 */
export const testGeofenceLocation = async (officeId, locationData) => {
  try {
    const response = await api.post(`/hr/office-locations/${officeId}/test-location/`, locationData);
    return response.data;
  } catch (error) {
    console.error(`Error testing geofence location for office ${officeId}:`, error);
    throw error;
  }
};

/**
 * Reverse geocode location data (BigData)
 * POST/GET: /hr/reverse-geocode-bigdata/
 * @param {Object} locationData - Location coordinates and data
 */
export const reverseGeocodeLocation = async (locationData) => {
  try {
    const response = await api.post('/hr/reverse-geocode-bigdata/', locationData);
    return response.data;
  } catch (error) {
    console.error('Error reverse geocoding location:', error);
    throw error;
  }
};

export default {
  // Office Locations
  listOfficeLocations,
  getOfficeLocation,
  createOfficeLocation,
  updateOfficeLocation,
  setOfficeAsActive,
  deleteOfficeLocation,
  
  // Geofence
  testGeofenceLocation,
  reverseGeocodeLocation,
};
