/**
 * WhatsApp Service API
 * Handles location capture (Punch In/Out), WhatsApp configurations, and request generation
 */

import api from './client';

// =====================================================
// LOCATION CAPTURE APIs (Punch In/Out)
// =====================================================

/**
 * Location Capture API - Punch In
 * POST: /whatsapp/punchin/
 * @param {Object} locationData - Location data with coordinates
 */
export const punchIn = async (locationData) => {
  try {
    const response = await api.post('/whatsapp/punchin/', locationData);
    return response.data;
  } catch (error) {
    console.error('Error punch in:', error);
    throw error;
  }
};

/**
 * Location Capture API - Punch Out
 * POST: /whatsapp/punchout/
 * @param {Object} locationData - Location data with coordinates
 */
export const punchOut = async (locationData) => {
  try {
    const response = await api.post('/whatsapp/punchout/', locationData);
    return response.data;
  } catch (error) {
    console.error('Error punch out:', error);
    throw error;
  }
};

// =====================================================
// WHATSAPP CONFIGURATION APIs
// =====================================================

/**
 * List all WhatsApp configurations
 * GET: /whatsapp/admin/configurations/
 */
export const listWhatsAppConfigurations = async (params = {}) => {
  try {
    const response = await api.get('/whatsapp/admin/configurations/', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing WhatsApp configurations:', error);
    throw error;
  }
};

/**
 * Get specific WhatsApp configuration
 * GET: /whatsapp/admin/configurations/{id}/
 * @param {number} configId - Configuration ID
 */
export const getWhatsAppConfiguration = async (configId) => {
  try {
    const response = await api.get(`/whatsapp/admin/configurations/${configId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching WhatsApp configuration ${configId}:`, error);
    throw error;
  }
};

/**
 * Create WhatsApp configuration
 * POST: /whatsapp/admin/configurations/
 * @param {Object} configData - Configuration details
 */
export const createWhatsAppConfiguration = async (configData) => {
  try {
    const response = await api.post('/whatsapp/admin/configurations/', configData);
    return response.data;
  } catch (error) {
    console.error('Error creating WhatsApp configuration:', error);
    throw error;
  }
};

/**
 * Update WhatsApp configuration
 * PATCH: /whatsapp/admin/configurations/{id}/
 * @param {number} configId - Configuration ID
 * @param {Object} configData - Updated configuration data
 */
export const updateWhatsAppConfiguration = async (configId, configData) => {
  try {
    const response = await api.patch(`/whatsapp/admin/configurations/${configId}/`, configData);
    return response.data;
  } catch (error) {
    console.error(`Error updating WhatsApp configuration ${configId}:`, error);
    throw error;
  }
};

/**
 * Activate WhatsApp configuration
 * POST: /whatsapp/admin/configurations/{id}/activate/
 * @param {number} configId - Configuration ID
 */
export const activateWhatsAppConfiguration = async (configId) => {
  try {
    const response = await api.post(`/whatsapp/admin/configurations/${configId}/activate/`);
    return response.data;
  } catch (error) {
    console.error(`Error activating WhatsApp configuration ${configId}:`, error);
    throw error;
  }
};

/**
 * Deactivate WhatsApp configuration
 * POST: /whatsapp/admin/configurations/{id}/deactivate/
 * @param {number} configId - Configuration ID
 */
export const deactivateWhatsAppConfiguration = async (configId) => {
  try {
    const response = await api.post(`/whatsapp/admin/configurations/${configId}/deactivate/`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating WhatsApp configuration ${configId}:`, error);
    throw error;
  }
};

/**
 * Delete WhatsApp configuration
 * DELETE: /whatsapp/admin/configurations/{id}/
 * @param {number} configId - Configuration ID
 */
export const deleteWhatsAppConfiguration = async (configId) => {
  try {
    const response = await api.delete(`/whatsapp/admin/configurations/${configId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting WhatsApp configuration ${configId}:`, error);
    throw error;
  }
};

// =====================================================
// WHATSAPP REQUEST APIs
// =====================================================

/**
 * Generate WhatsApp request
 * POST: /whatsapp/request/
 * @param {Object} requestData - Request details
 */
export const generateWhatsAppRequest = async (requestData) => {
  try {
    const response = await api.post('/whatsapp/request/', requestData);
    return response.data;
  } catch (error) {
    console.error('Error generating WhatsApp request:', error);
    throw error;
  }
};

/**
 * List WhatsApp requests
 * GET: /whatsapp/request/
 */
export const listWhatsAppRequests = async (params = {}) => {
  try {
    const response = await api.get('/whatsapp/request/', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing WhatsApp requests:', error);
    throw error;
  }
};

/**
 * Get specific WhatsApp request
 * GET: /whatsapp/request/{id}/
 * @param {number} requestId - Request ID
 */
export const getWhatsAppRequest = async (requestId) => {
  try {
    const response = await api.get(`/whatsapp/request/${requestId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching WhatsApp request ${requestId}:`, error);
    throw error;
  }
};

export default {
  // Location Capture
  punchIn,
  punchOut,
  
  // WhatsApp Configurations
  listWhatsAppConfigurations,
  getWhatsAppConfiguration,
  createWhatsAppConfiguration,
  updateWhatsAppConfiguration,
  activateWhatsAppConfiguration,
  deactivateWhatsAppConfiguration,
  deleteWhatsAppConfiguration,
  
  // WhatsApp Requests
  generateWhatsAppRequest,
  listWhatsAppRequests,
  getWhatsAppRequest,
};
