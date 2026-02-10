import api from './client';

const extractData = (res) => {
  if (!res) return null;
  return res.data?.data ?? res.data ?? null;
};

export const getRoutes = () => api.get('target-management/routes/').then(extractData);
export const createRoute = (payload) => api.post('target-management/routes/', payload).then(extractData);
export const getRoute = (id) => api.get(`target-management/routes/${id}/`).then(extractData);
export const updateRoute = (id, payload) => api.put(`target-management/routes/${id}/`, payload).then(extractData);

export const getProducts = () => api.get('target-management/products/').then(extractData);
export const getProduct = (id) => api.get(`target-management/products/${id}/`).then(extractData);
export const createProduct = (payload) => api.post('target-management/products/', payload).then(extractData);
export const updateProduct = (id, payload) => api.put(`target-management/products/${id}/`, payload).then(extractData);

export const createRouteTarget = (payload) => api.post('target-management/route-targets/', payload).then(extractData);
export const createCallTarget = (payload) => api.post('target-management/call-targets/', payload).then(extractData);
export const updateCallTarget = (id, payload) => api.patch(`target-management/call-daily-targets/${id}/`, payload).then(extractData);
export const getCallDailyTargets = (params) => api.get('target-management/call-daily-targets/', { params }).then(extractData);

export const getRouteSummary = (params) => api.get('target-management/reports/route-summary/', { params }).then(extractData);
export const getCallSummary = (params) => api.get('target-management/reports/call-summary/', { params }).then(extractData);
export const getEmployeeDashboard = (id) => api.get(`target-management/reports/employee/${id}/dashboard/`).then(extractData);
export const getEmployeeDetailedReport = (id) => api.get(`target-management/performance/employee/${id}/detailed-report/`).then(extractData);
export const getComparativePerformance = (params) => api.get('target-management/performance/comparative/', { params }).then(extractData);
 

export default {
  getRoutes,
  createRoute,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  createRouteTarget,
  createCallTarget,
  updateCallTarget,
  getRouteSummary,
  getCallSummary,
};
