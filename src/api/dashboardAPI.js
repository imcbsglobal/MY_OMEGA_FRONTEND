/**
 * Dashboard API Service
 * Centralized data fetching for dashboard statistics and charts
 * Ensures consistent data handling across all dashboard components
 */

import api from './client';

/**
 * Helper function to normalize response data
 * Handles different API response formats (array, {results: []}, {data: []})
 * @param {*} data - Raw API response data
 * @returns {Array} Normalized array of items
 */
const normalizeResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data?.results && Array.isArray(data.results)) {
    return data.results;
  }
  if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
};

/**
 * Fetch all users from the system
 * GET: /user-controll/admin/users/
 * @returns {Promise<Array>} Array of user objects
 */
export const fetchAllUsers = async () => {
  try {
    const response = await api.get('/user-controll/admin/users/');
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch all employees
 * GET: /employee-management/employees/
 * @returns {Promise<Array>} Array of employee objects
 */
export const fetchAllEmployees = async () => {
  try {
    const response = await api.get('/employee-management/employees/');
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    throw error;
  }
};

/**
 * Fetch attendance summary for all employees for today
 * GET: /hr/attendance/summary-all/
 * @returns {Promise<Array|Object>} Attendance summary data
 */
export const fetchAttendanceSummary = async () => {
  try {
    const response = await api.get('/hr/attendance/summary-all/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching attendance summary:', error);
    throw error;
  }
};

/**
 * Fetch pending leave requests
 * GET: /hr/leave/?status=pending
 * @returns {Promise<Array>} Array of pending leave requests
 */
export const fetchPendingLeaves = async () => {
  try {
    const response = await api.get('/hr/leave/', {
      params: { status: 'pending' }
    });
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching pending leaves:', error);
    throw error;
  }
};

/**
 * Fetch all attendance records for a specific month/year
 * GET: /hr/attendance/
 * @param {Object} params - Query parameters {month, year, user_id?}
 * @returns {Promise<Array>} Array of attendance records
 */
export const fetchAttendanceRecords = async (params = {}) => {
  try {
    const response = await api.get('/hr/attendance/', { params });
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching attendance records:', error);
    throw error;
  }
};

/**
 * Process attendance summary to extract count by status
 * @param {*} attendanceSummary - Raw attendance summary from API
 * @returns {Object} Processed summary with present, leave, absent counts
 */
export const processAttendanceSummary = (attendanceSummary) => {
  let presentToday = 0;
  let onLeaveToday = 0;
  let absentToday = 0;

  if (attendanceSummary && Array.isArray(attendanceSummary)) {
    // Handle array format with status and count
    attendanceSummary.forEach((summary) => {
      const status = (summary.status || '').toLowerCase();
      const count = summary.count || 0;

      if (status === 'present' || status === 'half_day' || status === 'full') {
        presentToday += count;
      } else if (
        status.includes('leave') ||
        status === 'on_leave' ||
        status === 'casual_leave' ||
        status === 'earned_leave' ||
        status === 'sick_leave'
      ) {
        onLeaveToday += count;
      } else if (status === 'absent') {
        absentToday += count;
      }
    });
  } else if (attendanceSummary && typeof attendanceSummary === 'object') {
    // Handle object format with direct counts
    presentToday = 
      attendanceSummary.present ||
      attendanceSummary.present_count ||
      attendanceSummary.present_today ||
      0;
    onLeaveToday =
      attendanceSummary.on_leave ||
      attendanceSummary.leave_count ||
      attendanceSummary.leave_today ||
      0;
    absentToday =
      attendanceSummary.absent ||
      attendanceSummary.absent_count ||
      attendanceSummary.absent_today ||
      0;
  }

  return { presentToday, onLeaveToday, absentToday };
};

/**
 * Build monthly hiring trend data from employees
 * Groups employees by joining month for the last 12 months
 * @param {Array} employees - Array of employee objects
 * @returns {Array} Monthly data formatted for charts
 */
export const buildMonthlyHiringTrend = (employees) => {
  const counts = {};

  employees.forEach((emp) => {
    // Try multiple field paths for joining date
    const doj =
      emp.date_of_joining ||
      emp.joining_date ||
      (emp.job_info && emp.job_info.date_of_joining);

    if (!doj) return;

    const d = new Date(doj);
    if (isNaN(d.getTime())) return;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  // Generate last 12 months
  const now = new Date();
  const months = [];
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      month: monthLabels[d.getMonth()],
      value: counts[key] || 0
    });
  }

  return months;
};

/**
 * Fetch all dashboard statistics in a single optimized call
 * Combines multiple API calls and returns formatted data
 * @returns {Promise<Object>} Dashboard statistics
 */
export const fetchDashboardStats = async () => {
  try {
    console.log('🚀 Starting dashboard data fetch...');

    // Fetch all data in parallel
    const [usersData, employeesData, attendanceSummary, leaveData] = await Promise.all([
      fetchAllUsers().catch(err => {
        console.error('Error fetching users:', err);
        return [];
      }),
      fetchAllEmployees().catch(err => {
        console.error('Error fetching employees:', err);
        return [];
      }),
      fetchAttendanceSummary().catch(err => {
        console.error('Error fetching attendance summary:', err);
        return [];
      }),
      fetchPendingLeaves().catch(err => {
        console.error('Error fetching pending leaves:', err);
        return [];
      })
    ]);

    // Process data
    const totalUsers = usersData.length;
    const totalEmployees = employeesData.length;

    // Process attendance
    const { presentToday, onLeaveToday, absentToday } =
      processAttendanceSummary(attendanceSummary);

    // Build chart data
    const chartData = buildMonthlyHiringTrend(employeesData);

    // Count pending leaves
    const pendingLeaves = leaveData.length;

    console.log('✅ Dashboard data loaded successfully!', {
      totalUsers,
      totalEmployees,
      presentToday,
      onLeaveToday,
      absentToday,
      pendingLeaves
    });

    return {
      stats: {
        totalUsers,
        totalEmployees,
        presentToday,
        onLeaveToday,
        absentToday,
        pendingLeaves
      },
      chartData,
      rawData: {
        users: usersData,
        employees: employeesData,
        attendanceSummary,
        leaves: leaveData
      }
    };
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    throw error;
  }
};

export default {
  fetchAllUsers,
  fetchAllEmployees,
  fetchAttendanceSummary,
  fetchPendingLeaves,
  fetchAttendanceRecords,
  processAttendanceSummary,
  buildMonthlyHiringTrend,
  fetchDashboardStats,
  normalizeResponse
};
