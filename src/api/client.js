// src/api/client.js
import axios from "axios";
import { notifyError, notifySuccess } from "../utils/notification";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => {
    // ✅ AUTO SUCCESS NOTIFICATION (except GET)
    if (
      response.config.method !== "get" &&
      response.data &&
      typeof response.data === "object" &&
      response.data.message
    ) {
      notifySuccess(response.data.message);
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    /* 🔐 HANDLE TOKEN EXPIRY ONLY */
    if (
      status === 401 &&
      (data?.code === "token_not_valid" ||
        data?.detail === "Token is invalid or expired")
    ) {
      notifyError("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    /* 🧠 CLEAN ERROR MESSAGE EXTRACTION */
    let message = "Something went wrong. Please try again.";

    // Django / DRF validation errors
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const firstKey = Object.keys(data)[0];
      const value = data[firstKey];

      if (Array.isArray(value)) {
        message = value[0];
      } else if (typeof value === "string") {
        message = value;
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
