// src/services/api.js

// ====== BASE CONFIG ======
export const API_ORIGIN = "http://127.0.0.1:8000";
export const API_BASE = `${API_ORIGIN}/api`;

// Auth endpoints (adjust if yours differ)
const AUTH_TOKEN_URL = `${API_BASE}/users/token/`;          // login
const AUTH_REFRESH_URL = `${API_BASE}/users/token/refresh/`; // refresh
const AUTH_ME_URL = `${API_BASE}/users/me/`;                 // current user

// ====== STORAGE KEYS ======
const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const USER_KEY = "user";

// ====== AUTH STATE HELPERS ======
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY) || null;
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY) || null;
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
};
export const setAuthData = ({ access, refresh, user }) => {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const clearAuthData = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};
export const isAuthenticated = () => Boolean(getAccessToken());

// ====== CORE REQUEST WRAPPER (handles 401 -> refresh) ======
export async function apiRequest(pathOrUrl, opts = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_ORIGIN}${pathOrUrl.startsWith("/api") ? "" : ""}${pathOrUrl}`;
  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");

  // Attach access token if available
  const access = getAccessToken();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const doFetch = () => fetch(url, { ...opts, headers });

  let res = await doFetch();

  // Try refresh on 401
  if (res.status === 401) {
    const refresh = getRefreshToken();
    if (!refresh) return res;

    // Attempt refresh
    const r = await fetch(AUTH_REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (r.ok) {
      const data = await r.json();
      const newAccess = data.access;
      if (newAccess) {
        localStorage.setItem(ACCESS_KEY, newAccess);
        // retry original request with new token
        const retryHeaders = new Headers(headers);
        retryHeaders.set("Authorization", `Bearer ${newAccess}`);
        res = await fetch(url, { ...opts, headers: retryHeaders });
      }
    } else {
      // refresh failed -> clear and bubble up 401
      clearAuthData();
    }
  }

  return res;
}

// ====== AUTH FLOWS ======
export async function login(username, password) {
  // 1) get tokens
  const r = await fetch(AUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  const tokens = await r.json();

  // 2) get profile (/me)
  const m = await fetch(AUTH_ME_URL, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  const me = m.ok ? await m.json() : null;

  setAuthData({ access: tokens.access, refresh: tokens.refresh, user: me });
  return { tokens, me };
}

// ====== GENERIC USER CRUD (adjust endpoints to your backend if needed) ======
const USERS_BASE = `${API_BASE}/users/`; // Example collection URL

export async function fetchUsers() {
  const res = await apiRequest(`${USERS_BASE}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function getUserDetail(userId) {
  const res = await apiRequest(`${USERS_BASE}${userId}/`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch user detail");
  return res.json();
}

export async function createUser(payload) {
  const res = await apiRequest(`${USERS_BASE}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function updateUser(userId, payload, method = "PUT") {
  const res = await apiRequest(`${USERS_BASE}${userId}/`, {
    method,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function deleteUser(userId) {
  const res = await apiRequest(`${USERS_BASE}${userId}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user");
  return true;
}

// ====== USER CONTROL (Super Admin only) ======
const USER_CONTROL_BASE = `${API_BASE}/user-controll`;

export const ucListUsers = async () => {
  const res = await apiRequest(`${USER_CONTROL_BASE}/admin/users/`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
};

export const ucMenuTree = async () => {
  const res = await apiRequest(`${USER_CONTROL_BASE}/admin/menu-tree/`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load menu tree");
  return res.json();
};

export const ucGetUserMenus = async (userId) => {
  const res = await apiRequest(`${USER_CONTROL_BASE}/admin/user/${userId}/menus/`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load user menu access");
  return res.json(); // { menu_ids: [...] }
};

export const ucSetUserMenus = async (userId, menuIds) => {
  const res = await apiRequest(`${USER_CONTROL_BASE}/admin/user/${userId}/menus/`, {
    method: "POST",
    body: JSON.stringify({ menu_ids: menuIds }),
  });
  if (!res.ok) throw new Error("Failed to save user menu access");
  return res.json(); // { ok: true, menu_ids: [...] }
};

export const ucMyMenu = async () => {
  const res = await apiRequest(`${USER_CONTROL_BASE}/my-menu/`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load my menu");
  return res.json(); // { menu: [...] }
};

// ====== DEFAULT EXPORT (handy bundle) ======
export default {
  API_BASE,
  // auth & helpers
  login,
  getAccessToken,
  getRefreshToken,
  getUser,
  setAuthData,
  clearAuthData,
  isAuthenticated,
  apiRequest,
  // users (example CRUD)
  fetchUsers,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  // user control
  ucListUsers,
  ucMenuTree,
  ucGetUserMenus,
  ucSetUserMenus,
  ucMyMenu,
};
