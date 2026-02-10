/**
 * Vehicle Management API Service
 * Handles all vehicle, trip, and challan related API calls
 */

import api from './client';

// =====================================================
// VEHICLE APIs
// =====================================================

/**
 * List all vehicles
 * GET: /vehicle-management/vehicles/
 */
export const listVehicles = async (params = {}) => {
  try {
    const response = await api.get('/vehicle-management/vehicles/', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing vehicles:', error);
    throw error;
  }
};

/**
 * Get vehicles dropdown data
 * GET: /vehicle-management/vehicles/dropdown/
 */
export const getVehiclesDropdown = async () => {
  try {
    const response = await api.get('/vehicle-management/vehicles/dropdown/');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles dropdown:', error);
    throw error;
  }
};

/**
 * Add/Create a new vehicle
 * POST: /vehicle-management/vehicles/
 * @param {Object} vehicleData - Vehicle details
 */
export const createVehicle = async (vehicleData) => {
  try {
    const response = await api.post('/vehicle-management/vehicles/', vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

/**
 * Get vehicle details
 * GET: /vehicle-management/vehicles/{id}/
 * @param {number} vehicleId - Vehicle ID
 */
export const getVehicleDetails = async (vehicleId) => {
  try {
    const response = await api.get(`/vehicle-management/vehicles/${vehicleId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId} details:`, error);
    throw error;
  }
};

/**
 * Update vehicle details
 * PATCH/PUT: /vehicle-management/vehicles/{id}/
 * @param {number} vehicleId - Vehicle ID
 * @param {Object} vehicleData - Updated vehicle details
 */
export const updateVehicle = async (vehicleId, vehicleData) => {
  try {
    const response = await api.patch(`/vehicle-management/vehicles/${vehicleId}/`, vehicleData);
    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle ${vehicleId}:`, error);
    throw error;
  }
};

/**
 * Delete vehicle
 * DELETE: /vehicle-management/vehicles/{id}/
 * @param {number} vehicleId - Vehicle ID
 */
export const deleteVehicle = async (vehicleId) => {
  try {
    const response = await api.delete(`/vehicle-management/vehicles/${vehicleId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting vehicle ${vehicleId}:`, error);
    throw error;
  }
};

// =====================================================
// TRIP APIs
// =====================================================

/**
 * List all trips with filters
 * GET: /vehicle-management/trips/
 */
export const listTrips = async (params = {}) => {
  try {
    const response = await api.get('/vehicle-management/trips/', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing trips:', error);
    throw error;
  }
};

/**
 * Get user's own trips
 * GET: /vehicle-management/trips/my-trips/
 */
export const getMyTrips = async (params = {}) => {
  try {
    const response = await api.get('/vehicle-management/trips/my-trips/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my trips:', error);
    throw error;
  }
};

/**
 * Start a new trip
 * POST: /vehicle-management/trips/start/
 * @param {Object} tripData - Trip details (vehicle, employee, date, start_time, etc.)
 */
export const startTrip = async (tripData) => {
  try {
    const response = await api.post('/vehicle-management/trips/start/', tripData);
    return response.data;
  } catch (error) {
    console.error('Error starting trip:', error);
    throw error;
  }
};

/**
 * Get trip details
 * GET: /vehicle-management/trips/{id}/
 * @param {number} tripId - Trip ID
 */
export const getTripDetails = async (tripId) => {
  try {
    const response = await api.get(`/vehicle-management/trips/${tripId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trip ${tripId} details:`, error);
    throw error;
  }
};

/**
 * End a trip
 * PATCH: /vehicle-management/trips/{id}/end/
 * @param {number} tripId - Trip ID
 * @param {Object} endData - Trip end details (odometer_end, end_time, etc.)
 */
export const endTrip = async (tripId, endData) => {
  try {
    const response = await api.patch(`/vehicle-management/trips/${tripId}/end/`, endData);
    return response.data;
  } catch (error) {
    console.error(`Error ending trip ${tripId}:`, error);
    throw error;
  }
};

/**
 * Update trip
 * PATCH: /vehicle-management/trips/{id}/
 * @param {number} tripId - Trip ID
 * @param {Object} tripData - Updated trip data
 */
export const updateTrip = async (tripId, tripData) => {
  try {
    const response = await api.patch(`/vehicle-management/trips/${tripId}/`, tripData);
    return response.data;
  } catch (error) {
    console.error(`Error updating trip ${tripId}:`, error);
    throw error;
  }
};

/**
 * Delete trip
 * DELETE: /vehicle-management/trips/{id}/
 * @param {number} tripId - Trip ID
 */
export const deleteTrip = async (tripId) => {
  try {
    const response = await api.delete(`/vehicle-management/trips/${tripId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting trip ${tripId}:`, error);
    throw error;
  }
};

// =====================================================
// CHALLAN APIs
// =====================================================

/**
 * List all challans with filters
 * GET: /vehicle-management/challans/
 */
export const listChallans = async (params = {}) => {
  try {
    const response = await api.get('/vehicle-management/challans/', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing challans:', error);
    throw error;
  }
};

/**
 * Get challan statistics
 * GET: /vehicle-management/challans/stats/
 */
export const getChallanStats = async () => {
  try {
    const response = await api.get('/vehicle-management/challans/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching challan stats:', error);
    throw error;
  }
};

/**
 * Create a new challan
 * POST: /vehicle-management/challans/
 * @param {Object} challanData - Challan details
 */
export const createChallan = async (challanData) => {
  try {
    const response = await api.post('/vehicle-management/challans/', challanData);
    return response.data;
  } catch (error) {
    console.error('Error creating challan:', error);
    throw error;
  }
};

/**
 * Get challan details
 * GET: /vehicle-management/challans/{id}/
 * @param {number} challanId - Challan ID
 */
export const getChallanDetails = async (challanId) => {
  try {
    const response = await api.get(`/vehicle-management/challans/${challanId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching challan ${challanId} details:`, error);
    throw error;
  }
};

/**
 * Update challan
 * PATCH: /vehicle-management/challans/{id}/
 * @param {number} challanId - Challan ID
 * @param {Object} challanData - Updated challan data
 */
export const updateChallan = async (challanId, challanData) => {
  try {
    const response = await api.patch(`/vehicle-management/challans/${challanId}/`, challanData);
    return response.data;
  } catch (error) {
    console.error(`Error updating challan ${challanId}:`, error);
    throw error;
  }
};

/**
 * Mark challan as paid
 * PATCH: /vehicle-management/challans/{id}/pay/
 * @param {number} challanId - Challan ID
 * @param {Object} paymentData - Payment details
 */
export const payChallan = async (challanId, paymentData = {}) => {
  try {
    const response = await api.patch(`/vehicle-management/challans/${challanId}/pay/`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`Error marking challan ${challanId} as paid:`, error);
    throw error;
  }
};

/**
 * Delete challan
 * DELETE: /vehicle-management/challans/{id}/
 * @param {number} challanId - Challan ID
 */
export const deleteChallan = async (challanId) => {
  try {
    const response = await api.delete(`/vehicle-management/challans/${challanId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting challan ${challanId}:`, error);
    throw error;
  }
};
