// authHelper.js - JWT Token Management Utility
// Place this in: src/utils/authHelper.js

/**
 * Get the stored access token from localStorage
 */
export const getAccessToken = () => {
  return localStorage.getItem('access') || 
         localStorage.getItem('accessToken') || 
         localStorage.getItem('access_token') ||
         null;
};

/**
 * Get the stored refresh token from localStorage
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refresh') || 
         localStorage.getItem('refreshToken') || 
         localStorage.getItem('refresh_token') ||
         null;
};

/**
 * Get the stored user data from localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

/**
 * Check if user is logged in
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  const user = getUser();
  return user && (user.user_level === 'Super Admin' || user.user_level === 'Admin');
};

/**
 * Logout user - clear all tokens and user data
 */
export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('refresh_token');
  console.log('✅ User logged out');
};

/**
 * Make authenticated API request with automatic token injection
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, body, headers, etc.)
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAccessToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // If 401 Unauthorized, token might be expired
    if (response.status === 401) {
      console.warn('⚠️ Token expired or invalid. Consider refreshing token or logging out.');
      // You can implement auto-refresh here
      // await refreshAccessToken();
    }
    
    return response;
  } catch (error) {
    console.error('❌ Authenticated fetch error:', error);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await fetch('http://localhost:8000/api/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    
    // Store new tokens
    if (data.access) {
      localStorage.setItem('access', data.access);
    }
    if (data.refresh) {
      localStorage.setItem('refresh', data.refresh);
    }
    
    console.log('✅ Token refreshed successfully');
    return data.access;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    // If refresh fails, logout user
    logout();
    throw error;
  }
};

/**
 * Decode JWT token to get payload (without verification)
 * Note: This is for reading data only, not for security validation
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Example usage in your components:
// 
// import { authenticatedFetch, getUser, isAdmin, logout } from './utils/authHelper';
//
// // Get current user
// const user = getUser();
// console.log('Current user:', user);
//
// // Check if admin
// if (isAdmin()) {
//   console.log('User is admin!');
// }
//
// // Make authenticated request
// const response = await authenticatedFetch('http://localhost:8000/api/users/', {
//   method: 'GET'
// });
//
// // Logout
// logout();
// navigate('/login');