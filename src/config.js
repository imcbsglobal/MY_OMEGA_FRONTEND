// src/config.js
const getApiBaseUrl = () => {
  // For Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  }
  
  // For Create React App
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  }
  
  // Fallback
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints - based on your Django urls.py structure
export const API_ENDPOINTS = {
  // HR Module (from urls.py: path('hr/', include('HR.urls')))
  attendance: {
    list: '/hr/attendance/',
    punchIn: '/hr/attendance/punch_in/',
    punchOut: '/hr/attendance/punch_out/',
    todayStatus: '/hr/attendance/today_status/',
    verify: (id) => `/hr/attendance/${id}/verify/`,
    updateStatus: (id) => `/hr/attendance/${id}/update_status/`,
    summary: '/hr/attendance/summary/',
    monthlyGrid: '/hr/attendance/monthly_grid/',
  },
  holidays: {
    list: '/hr/holidays/',
    detail: (id) => `/hr/holidays/${id}/`,
  },
  leaveRequests: {
    list: '/hr/leave-requests/',
    detail: (id) => `/hr/leave-requests/${id}/`,
    review: (id) => `/hr/leave-requests/${id}/review/`,
  },
  // Users endpoint (adjust based on your User app urls)
  users: {
    briefList: '/users/brief_list/',
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};