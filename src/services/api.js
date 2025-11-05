// src/services/api.js
import axios from "axios";

/**
 * API configuration
 */
const HR_API_BASE = (import.meta.env?.VITE_API_URL || "http://localhost:8000/api/hr").replace(/\/$/, "");
const ROOT_API_BASE = (import.meta.env?.VITE_ROOT_API || "http://localhost:8000").replace(/\/$/, "");
const USERS_PREFIX = import.meta.env?.VITE_USERS_PREFIX || "/api/users/";
const REFRESH_URL = import.meta.env?.VITE_REFRESH_URL || "http://localhost:8000/api/token/refresh/";
const AUTH_SCHEME = import.meta.env?.VITE_AUTH_SCHEME || "Bearer";

const getAccessToken = () => localStorage.getItem("access_token") || localStorage.getItem("access") || "";
const getRefreshToken = () => localStorage.getItem("refresh_token") || localStorage.getItem("refresh") || "";

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

export const clearAuth = () => {
  ["access_token", "refresh_token", "access", "refresh", "user"].forEach((k) => localStorage.removeItem(k));
};
export const clearAuthData = clearAuth;

/**
 * Attach Authorization header
 */
const attachAuth = (config) => {
  const access = getAccessToken();
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `${AUTH_SCHEME} ${access}`;
  }
  return config;
};

/**
 * Refresh handling for 401
 */
let refreshingPromise = null;
const handle401WithRefresh = async (error, client) => {
  const { response, config } = error;
  if (!response) throw error; // network error
  if (response.status !== 401) throw error;
  if (config.__isRetry) throw error;

  const refresh = getRefreshToken();
  if (!refresh) {
    clearAuth();
    throw error;
  }

  if (!refreshingPromise) {
    refreshingPromise = axios
      .post(REFRESH_URL, { refresh })
      .then((r) => {
        const newAccess = r.data?.access;
        if (!newAccess) throw new Error("No access token returned by refresh endpoint");
        localStorage.setItem("access_token", newAccess);
        return newAccess;
      })
      .catch((e) => {
        clearAuth();
        throw e;
      })
      .finally(() => {
        refreshingPromise = null;
      });
  }

  const newAccess = await refreshingPromise;
  config.__isRetry = true;
  config.headers = config.headers || {};
  config.headers.Authorization = `${AUTH_SCHEME} ${newAccess}`;
  return client(config);
};

/**
 * Clients
 */
const hrApi = axios.create({ baseURL: HR_API_BASE });
hrApi.interceptors.request.use(attachAuth);
hrApi.interceptors.response.use((res) => res, (err) => handle401WithRefresh(err, hrApi));

const rootApi = axios.create({ baseURL: ROOT_API_BASE });
rootApi.interceptors.request.use(attachAuth);
rootApi.interceptors.response.use((res) => res, (err) => handle401WithRefresh(err, rootApi));

/**
 * Helper to return res.data and surface errors consistently
 */
const unwrap = (promise) =>
  promise.then((res) => res.data).catch((err) => {
    // Attach a clearer message if possible
    const msg = err?.response?.data?.detail || err?.message || "API request failed";
    const e = new Error(msg);
    e.original = err;
    throw e;
  });

/**
 * Attendance (HR) API
 */
export const getTodayStatus = () => unwrap(hrApi.get("/attendance/today_status/"));
export const punchIn = (payload) => {
  if (!payload) return Promise.reject(new Error("punchIn: payload required"));
  return unwrap(hrApi.post("/attendance/punch_in/", payload));
};
export const punchOut = (payload) => {
  if (!payload) return Promise.reject(new Error("punchOut: payload required"));
  return unwrap(hrApi.post("/attendance/punch_out/", payload));
};

/**
 * User (root) API
 * - fetchUsers -> returns array (res.data)
 * - getUserById -> returns single user object (res.data)
 */
export const fetchUsers = () => unwrap(rootApi.get(USERS_PREFIX));
export const getUserById = (id) => {
  if (id === null || id === undefined || id === "") {
    return Promise.reject(new Error("getUserById: id is null/undefined/empty"));
  }
  // if the caller passed an object with an id-ish field
  const safeId = typeof id === "object" ? id.id ?? id.pk ?? undefined : id;
  if (safeId === undefined) {
    return Promise.reject(new Error("getUserById: unable to derive id from object"));
  }
  return unwrap(rootApi.get(`${USERS_PREFIX}${safeId}/`));
};

// backward-compat aliases
export const getUser = getUserById;
export const getUserRaw = (id) => rootApi.get(`${USERS_PREFIX}${id}/`); // returns axios res if needed

export const updateUser = (id, payload) =>
  unwrap(rootApi.patch(`${USERS_PREFIX}${id}/`, payload, { headers: { "Content-Type": "application/json" } }));

export const updateUserFormData = (id, formData) => unwrap(rootApi.patch(`${USERS_PREFIX}${id}/`, formData));
export const createUser = (formData) => unwrap(rootApi.post(`${USERS_PREFIX}`, formData));
export const deleteUser = (id) => unwrap(rootApi.delete(`${USERS_PREFIX}${id}/`));

export default hrApi;
