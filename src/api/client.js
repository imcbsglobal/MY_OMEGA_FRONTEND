// src/api/client.js
import axios from "axios";
import { notifyError, notifySuccess } from "../utils/notification";

// Use centralized API endpoint from environment variables
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Set to true if your backend requires credentials
  timeout: 10000, // 10 second timeout
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => { 
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ Token found (${token.substring(0, 20)}...) for ${config.method.toUpperCase()} ${config.url}`);
      console.log(`✅ Authorization header set:`, config.headers.Authorization.substring(0, 30) + "...");
    } else {
      console.warn(`❌ NO TOKEN FOUND in localStorage for ${config.method.toUpperCase()} ${config.url}`);
      console.warn(`Available localStorage keys:`, Object.keys(localStorage));
    }

    // Log request for debugging
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data);

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);

    // ✅ Handle your custom response format: {success: true, message: '...'}
    if (
      response.config.method !== "get" &&
      response.data &&
      typeof response.data === "object"
    ) {
      // Your backend returns {success: true, message: '...'}
      if (response.data.success && response.data.message) {
        notifySuccess(response.data.message);
      }
      // Fallback for standard message field
      else if (response.data.message) {
        notifySuccess(response.data.message);
      }
    }

    return response;
  },
  (error) => {
    // Don't log errors for endpoints that have fallback handling
    const silentEndpoints = [
      'hr/attendance/my_summary',
      'hr/leave/my_requests',
      'hr/reverse-geocode-bigdata'
    ];
    const shouldSilence = silentEndpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );
    
    // If endpoint should be silent, return error without notifying
    if (shouldSilence) {
      return Promise.reject(error);
    }
    
    if (!shouldSilence) {
      // Log error details
      console.error('[API Response Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    const status = error.response?.status;
    const data = error.response?.data;

    /* 🔐 HANDLE TOKEN EXPIRY ONLY */
    if (
      status === 401 &&
      (data?.code === "token_not_valid" ||
        data?.detail === "Token is invalid or expired" ||
        data?.detail?.includes("Authentication credentials"))
    ) {
      notifyError("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    /* 🧠 CLEAN ERROR MESSAGE EXTRACTION */
    let message = "Something went wrong. Please try again.";

    // Handle 404 errors specifically
    if (status === 404) {
      message = "API endpoint not found. Please check your backend configuration.";
    }
    // Handle network errors
    else if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        message = "Request timeout. Please check your connection.";
      } else if (error.message === 'Network Error') {
        message = "Network error. Please check if the backend server is running.";
      } else {
        message = error.message || "Network error occurred.";
      }
    }
    // Handle your custom error format: {success: false, errors: {...}}
    else if (data && typeof data === "object" && !Array.isArray(data)) {
      // Your backend error format
      if (data.errors && typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        message = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      // Check for common error fields
      else if (data.detail) {
        message = data.detail;
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      } else {
        const firstKey = Object.keys(data)[0];
        const value = data[firstKey];

        if (Array.isArray(value)) {
          message = value[0];
        } else if (typeof value === "string") {
          message = value;
        }
      }
    }
    // Plain text error (NOT HTML)
    else if (typeof data === "string") {
      if (!data.startsWith("<!DOCTYPE") && !data.startsWith("<html")) {
        message = data;
      }
    }

    notifyError(message);
    return Promise.reject(error);
  }
);

export default api;