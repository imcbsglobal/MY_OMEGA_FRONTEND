// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Always send the correct token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // <-- Your login saves this

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠ No auth token found in localStorage");
  }

  return config;
});

// Error logger
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;