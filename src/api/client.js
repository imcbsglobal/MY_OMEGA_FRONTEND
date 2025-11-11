// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/", // ✅ fixed
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});

export default api;
