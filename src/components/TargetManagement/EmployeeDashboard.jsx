// src/components/TargetManagement/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import "./targetManagement.css";
import { toast } from 'react-toastify';
import api from "../../api/client";

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    employee: null,
    achievement_logs: [],
    total_logs: 0,
    route_targets: [],
    call_targets: [],
    summary: {
      total_targets: 0,
      active_targets: 0,
      completed_targets: 0,
      average_achievement: 0,
      route_summary: {},
      calls_summary: {}
    }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    log_type: 'both', // both, call, route, summary
    limit: 20,
    start_date: '',
    end_date: '',
    page: 1
  });

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Add custom CSS styles for the red and white theme
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root { --mild-red: #f87171; --mild-red-dark: #ef4444; --mild-accent: #fecaca; }
      .employee-dashboard-nav .nav-link { transition: all 0.3s ease !important; }
      .employee-dashboard-nav .nav-link:not(.active):hover {
        background: linear-gradient(135deg, var(--mild-accent) 0%, #fef2f2 100%) !important;
        color: var(--mild-red-dark) !important;
        border-color: var(--mild-red) !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(248, 113, 113, 0.18) !important;xxxxxxx
      }
      .employee-dashboard-nav .nav-link.active {
        background: linear-gradient(135deg, var(--mild-red) 0%, var(--mild-red-dark) 100%) !important;
        border-color: var(--mild-red) !important;
      }
      .employee-dashboard-summary-card { transition: all 0.3s ease !important; }
      .employee-dashboard-summary-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 8px 25px rgba(248, 113, 113, 0.12) !important;
        border-color: var(--mild-red) !important;
      }
      .employee-dashboard-table tbody tr:hover {
        background: linear-gradient(135deg, #fef2f2 0%, var(--mild-accent) 50%, #fef2f2 100%) !important;
        transform: scale(1.01) !important;
        box-shadow: 0 4px 12px rgba(248, 113, 113, 0.08) !important;
      }
      .employee-dashboard-filter-btn:hover {
        background: linear-gradient(135deg, var(--mild-accent) 0%, #fef2f2 100%) !important;
        color: var(--mild-red-dark) !important;
        border-color: var(--mild-red) !important;
        transform: scale(1.05) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch employees list from backend to match frontend display (used for admin views)
  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const res = await api.get('employee-management/employees/');
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : (payload.results || payload.data || []);
      setEmployees(list || []);
      console.log('🔎 Fetched employees:', list.length);
    } catch (err) {
      console.warn('⚠️ Could not fetch employees list:', err.message || err);
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  React.useEffect(() => { fetchEmployees(); }, []);

  // Get logged-in employee ID with enhanced security
  const getLoggedInEmployeeId = () => {
    try {
      // Try multiple sources for employee ID with priority order
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // Check if user is actually logged in
      if (!token) {
        console.error('❌ No authentication token found');
        toast.error('Please log in to access your dashboard.');
        return null;
      }
      
      // CRITICAL: Use employee_id from localStorage (set during login)
      // This is the Employee model ID, NOT the AppUser ID
      // If the current user is an admin, allow overriding the employee via URL param
      const employeeIdFromStorage = localStorage.getItem('employee_id');
      const isAdminUser = !!(user && (user.is_staff || user.is_superuser || localStorage.getItem('is_admin') === 'true'));
      const urlParams = new URLSearchParams(window.location.search);
      const employeeIdFromUrl = urlParams.get('employee_id') || urlParams.get('view_employee');

      const employeeId = (isAdminUser && employeeIdFromUrl) ? String(employeeIdFromUrl).trim() : employeeIdFromStorage;
      
      console.log('🔍 Employee ID retrieval:', {
        employeeId_from_storage: employeeId,
        hasToken: !!token,
        user_id: user?.id,
        localStorage_keys: Object.keys(localStorage)
      });
      
      if (!employeeId) {
        console.error('❌ No employee ID found! This user may not have an employee profile.');
        toast.error('No employee profile found. Please contact your administrator.');
        return null;
      }
      
      // Ensure it's a valid number/string
      if (employeeId && (typeof employeeId === 'string' || typeof employeeId === 'number')) {
        const finalId = String(employeeId).trim();
        console.log('✅ Using employee ID:', finalId);
        return finalId;
      }
      
      throw new Error('Invalid employee ID format');
      
    } catch (error) {
      console.error('❌ Error retrieving employee ID:', error);
      toast.error('Session data corrupted. Please log in again.');
      return null;
    }
  };

  useEffect(() => {
    fetchEmployeeDashboard();
  }, [filter]);

  const fetchEmployeeDashboard = async () => {
    setLoading(true);
    try {
      const employeeId = getLoggedInEmployeeId();
      
      if (!employeeId) {
        setLoading(false);
        return;
      }
      
      console.log('📊 Fetching dashboard data for employee ID:', employeeId);

      // Try to match a prefetched employee from the employees endpoint (helps admin views)
      const prefetchedEmployee = (employees || []).find(e => String(e.id) === String(employeeId) || String(e.employee_id) === String(employeeId));
      if (prefetchedEmployee) console.log('🔁 Found prefetched employee for ID:', employeeId, prefetchedEmployee);
      
      // Build strict API parameters to ensure data filtering
      const params = new URLSearchParams({
        employee_id: employeeId,
        limit: filter.limit,
        page: filter.page || 1
      });
      
      // Add log_type filter (but not for summary calls)
      if (filter.log_type !== 'summary') {
        params.append('log_type', filter.log_type === 'both' ? 'both' : filter.log_type);
      }
      
      // Add date filters if specified
      if (filter.start_date) params.append('start_date', filter.start_date);
      if (filter.end_date) params.append('end_date', filter.end_date);

      console.log('🔗 API Call params:', params.toString());
      console.log('🔒 Security check - Employee ID being sent:', employeeId);

      // Primary API call to get achievement history with strict employee filtering
      const achievementResponse = await api.get(`/target-management/employee/achievement-history/?${params}`);
      const apiData = achievementResponse.data;

      // If achievement endpoint didn't include employee payload, fall back to prefetched employee
      if (!apiData.employee && prefetchedEmployee) {
        console.warn('⚠️ Achievement API did not return employee; using prefetched employee data');
        apiData.employee = prefetchedEmployee;
      }
      
      console.log('🎯 API Response received:', apiData);
      console.log('📋 Achievement logs:', apiData.logs);
      console.log('📊 Total logs:', apiData.total_logs);
      console.log('📊 Sample log structure:', apiData.logs?.[0]);
      
      // Log all fields from the sample log for verification
      if (apiData.logs && apiData.logs.length > 0) {
        console.log('✅ Achievement log fields:', Object.keys(apiData.logs[0]));
        console.log('📌 Sample values:', {
          id: apiData.logs[0].id,
          log_type: apiData.logs[0].log_type,
          employee: apiData.logs[0].employee,
          employee_name: apiData.logs[0].employee_name,
          employee_id_display: apiData.logs[0].employee_id_display,
          route_target: apiData.logs[0].route_target,
          call_daily_target: apiData.logs[0].call_daily_target,
          achievement_date: apiData.logs[0].achievement_date,
          achievement_value: apiData.logs[0].achievement_value,
          remarks: apiData.logs[0].remarks,
          recorded_by: apiData.logs[0].recorded_by,
          recorded_by_name: apiData.logs[0].recorded_by_name,
          created_at: apiData.logs[0].created_at,
        });
      }
      
      // CRITICAL SECURITY CHECK: Verify response is for the correct employee
      if (!apiData.employee) {
        throw new Error('Invalid API response: employee data missing');
      }
      
      // Use apiData.employee.id (this is the Employee model primary key)
      const returnedEmployeeId = apiData.employee.id;
      
      // Strict employee ID validation
      if (!returnedEmployeeId) {
        throw new Error('API returned employee data without ID');
      }
      
      // Convert both IDs to strings for comparison to avoid type issues
      const expectedId = String(employeeId).trim();
      const actualId = String(returnedEmployeeId).trim();
      
      if (expectedId !== actualId) {
        console.error('🚨 SECURITY ALERT: Employee ID mismatch!', {
          expected: expectedId,
          actual: actualId,
          expectedType: typeof expectedId,
          actualType: typeof actualId
        });
        
        toast.error('Security Error: Received data for wrong employee. Please log out and log back in.');
        
        // Clear potentially compromised session
        localStorage.clear();
        sessionStorage.clear();
        
        setDashboardData({
          employee: null,
          achievement_logs: [],
          total_logs: 0,
          route_targets: [],
          call_targets: [],
          summary: {
            total_targets: 0,
            active_targets: 0,
            completed_targets: 0,
            average_achievement: 0,
            route_summary: {},
            calls_summary: {}
          }
        });
        
        setLoading(false);
        return;
      }
      
      console.log('✅ Employee ID validation passed:', {
        requested: expectedId,
        received: actualId
      });

      // Fetch additional dashboard data for summary statistics (optional)
      let routeTargets = [];
      let callTargets = [];
      let dashboardSummary = {};
      
      try {
        // Try to get dashboard summary data with employee filtering
        const dashboardResponse = await api.get(`/target-management/reports/employee/${employeeId}/dashboard/`);
        const dashboardData = dashboardResponse.data;
        
        // Additional security check for dashboard data
        if (dashboardData.employee_id && String(dashboardData.employee_id) !== expectedId) {
          console.warn('⚠️ Dashboard summary employee ID mismatch, skipping summary data');
        } else {
          routeTargets = dashboardData.route_targets || [];
          callTargets = dashboardData.call_targets || [];
          dashboardSummary = dashboardData.summary || {};
          console.log('📈 Dashboard summary loaded');
        }
      } catch (dashboardError) {
        console.warn('⚠️ Dashboard summary not available:', dashboardError.message);
        // Fallback: try to get targets from my-targets endpoint
        try {
          const targetsResponse = await api.get(`/target-management/employee/my-targets/?employee_id=${employeeId}&status=all&type=both`);
          const targetsData = targetsResponse.data;
          
          // Security check for targets data
          if (targetsData.employee_id && String(targetsData.employee_id) !== expectedId) {
            console.warn('⚠️ Targets data employee ID mismatch, skipping targets');
          } else {
            routeTargets = targetsData.route_targets || [];
            callTargets = targetsData.call_targets || [];
          }
        } catch (targetsError) {
          console.warn('⚠️ Could not load target data:', targetsError.message);
        }
      }

      // Calculate summary statistics
      const allTargets = [...routeTargets, ...callTargets];
      const activeTargets = allTargets.filter(t => t.is_active);
      const completedTargets = allTargets.filter(t => !t.is_active);
      
      // Calculate achievement percentages
      let totalAchievement = 0;
      let targetCount = 0;
      
      // Route targets achievement
      routeTargets.forEach(target => {
        if (target.target_boxes > 0) {
          totalAchievement += ((target.achieved_boxes || 0) / target.target_boxes) * 100;
          targetCount++;
        }
      });
      
      // Call targets achievement  
      callTargets.forEach(target => {
        const dailyTargets = target.daily_targets || [];
        dailyTargets.forEach(daily => {
          if (daily.target_calls > 0) {
            totalAchievement += ((daily.achieved_calls || 0) / daily.target_calls) * 100;
            targetCount++;
          }
        });
      });
      
      const avgAchievement = targetCount > 0 ? totalAchievement / targetCount : 0;

      // Merge logs when loading additional pages (append older logs)
      const fetchedLogs = apiData.logs || [];
      const newAchievementLogs = (filter.page && filter.page > 1) ?
        [...(dashboardData.achievement_logs || []), ...fetchedLogs] : fetchedLogs;

      // Structure final data with additional security validation
      const finalDashboardData = {
        employee: apiData.employee, // Use employee data from achievement history API
        route_targets: routeTargets,
        call_targets: callTargets,
        achievement_logs: newAchievementLogs, // Use merged or fresh logs
        total_logs: apiData.total_logs || 0, // Use total_logs from API response
        summary: {
          total_targets: allTargets.length,
          active_targets: activeTargets.length,
          completed_targets: completedTargets.length,
          average_achievement: avgAchievement,
          route_summary: dashboardSummary.route || {},
          calls_summary: dashboardSummary.calls || {}
        }
      };
      
      // Final security check before setting state
      const finalEmployeeId = finalDashboardData.employee?.id || finalDashboardData.employee?.employee_id;
      if (finalEmployeeId && String(finalEmployeeId) !== expectedId) {
        console.error('🚨 FINAL SECURITY CHECK FAILED:', {
          expected: expectedId,
          final: String(finalEmployeeId)
        });
        throw new Error('Final employee ID validation failed');
      }
      
      console.log('✅ Final dashboard data validated for employee:', expectedId);
      console.log('📊 Dashboard data:', finalDashboardData);
      
      setDashboardData(finalDashboardData);

    } catch (error) {
      console.error('❌ Error fetching employee dashboard:', error);
      console.error('❌ Full error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.message.includes('employee ID')) {
        toast.error('Security Error: ' + error.message);
        // Clear session on security errors
        localStorage.clear();
        sessionStorage.clear();
      } else {
        toast.error('Failed to load dashboard data. Please try again.');
      }
      
      // Reset to empty state on any error
      setDashboardData({
        employee: null,
        achievement_logs: [],
        total_logs: 0,
        route_targets: [],
        call_targets: [],
        summary: {
          total_targets: 0,
          active_targets: 0,
          completed_targets: 0,
          average_achievement: 0,
          route_summary: {},
          calls_summary: {}
        }
      });
    } finally {
      setLoading(false);
      console.log('✅ Rendering with loading=false');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilter({
      log_type: 'both',
      limit: 20,
      start_date: '',
      end_date: '',
      page: 1
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString();
  };

  const getLogTypeIcon = (logType) => {
    switch(logType) {
      case 'route': return <i className="fas fa-route text-info"></i>;
      case 'call': return <i className="fas fa-phone text-success"></i>;
      default: return <i className="fas fa-chart-line text-primary"></i>;
    }
  };

  const getLogTypeBadge = (logType) => {
    const badges = {
      route: 'badge bg-info text-white',
      call: 'badge bg-success text-white',
      both: 'badge bg-primary text-white'
    };
    return badges[logType] || 'badge bg-secondary text-white';
  };

  const isAdminView = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const isAdminUser = !!(user && (user.is_staff || user.is_superuser || localStorage.getItem('is_admin') === 'true'));
      const urlParams = new URLSearchParams(window.location.search);
      const employeeIdFromUrl = urlParams.get('employee_id') || urlParams.get('view_employee');
      return isAdminUser && !!employeeIdFromUrl;
    } catch (e) {
      return false;
    }
  };

  console.log('Component Render Cycle:', {
    loading: loading,
    employeeId: getLoggedInEmployeeId(),
    hasEmployeeData: !!dashboardData.employee,
    logCount: dashboardData.achievement_logs.length
  });

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading your dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      );
  }

  // Enhanced security validation for current user
  const currentEmployeeId = getLoggedInEmployeeId();
  if (!currentEmployeeId) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card" style={{border: '2px solid var(--mild-red)'}}>
              <div className="card-body text-center py-5" style={{background: '#fef2f2'}}>
                <div className="alert alert-danger" style={{border: '2px solid var(--mild-red)'}}>
                  <i className="fas fa-exclamation-triangle me-2" style={{fontSize: '24px'}}></i>
                  <h4 style={{color: 'var(--mild-red)', fontWeight: '700'}}>Authentication Required</h4>
                  <p className="mb-0 mt-2" style={{fontSize: '16px'}}>
                    Unable to identify your employee credentials. Please log in again to access your personal dashboard.
                  </p>
                  <button 
                    className="btn mt-3"
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = '/login';
                    }}
                    style={{
                      background: 'var(--mild-red)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '25px',
                      fontWeight: '600'
                    }}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced security check: Verify dashboard data is for current user with strict comparison
  if (dashboardData.employee && dashboardData.employee.id) {
    const dataEmployeeId = String(dashboardData.employee.id).trim();
    const currentId = String(currentEmployeeId).trim();
    
    if (dataEmployeeId !== currentId) {
      return (
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card" style={{border: '2px solid var(--mild-red)'}}>
                <div className="card-body text-center py-5" style={{background: '#fef2f2'}}>
                  <div className="alert alert-danger" style={{border: '2px solid var(--mild-red)'}}>
                    <i className="fas fa-shield-alt me-2" style={{fontSize: '24px'}}></i>
                    <h4 style={{color: 'var(--mild-red)', fontWeight: '700'}}>Security Alert</h4>
                    <p className="mb-3 mt-2" style={{fontSize: '16px'}}>
                      Data access violation detected. The dashboard attempted to display data for employee ID: <strong>{dataEmployeeId}</strong>, 
                      but you are logged in as employee ID: <strong>{currentId}</strong>
                    </p>
                    <p className="mb-3 text-muted">
                      This could indicate a session issue or potential security breach. Your session will be cleared for security.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <button 
                        className="btn"
                        onClick={() => {
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.reload();
                        }}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '25px',
                          fontWeight: '600'
                        }}
                      >
                        Clear Session & Reload
                      </button>
                      <button 
                        className="btn"
                        onClick={fetchEmployeeDashboard}
                        style={{
                          background: 'var(--mild-red)',
                          color: '#dc2626',
                          border: '2px solid #dc2626',
                          padding: '12px 24px',
                          borderRadius: '25px',
                          fontWeight: '600'
                        }}
                      >
                        Retry Load
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container-fluid py-4" style={{backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
      {/* Header - Red and White Theme */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg" style={{border: '2px solid var(--mild-red)', borderRadius: '12px'}}>
            <div className="card-header" style={{
              background: 'linear-gradient(135deg, var(--mild-red) 0%, var(--mild-red-dark) 100%)', 
              color: 'white',
              borderRadius: '10px 10px 0 0',
              padding: '20px'
            }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 style={{color: 'white', fontWeight: '800', fontSize: '24px', margin: 0, textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>
                    <i className="fas fa-bullseye me-3"></i>Employee Dashboard
                  </h3>
                  <p className="mb-0 mt-2" style={{color: '#fecaca', fontSize: '14px'}}>
                    Personal Performance Overview & Achievement History
                  </p>
                </div>
                <div className="d-flex align-items-center gap-3" style={{background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '25px', backdropFilter: 'blur(10px)'}}>
                  <div className="text-center">
                    <div style={{color: '#fecaca', fontSize: '12px', fontWeight: '500'}}>Employee</div>
                    <div style={{color: 'white', fontWeight: '700', fontSize: '16px'}}>
                      {dashboardData.employee?.name || 'Unknown'}
                      {isAdminView() && (
                        <span style={{marginLeft: '8px', background: 'white', color: 'var(--mild-red)', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700'}}>
                          Admin view
                        </span>
                      )}
                    </div>
                  </div>
                  {dashboardData.employee?.employee_id && (
                    <div className="text-center">
                      <div style={{color: '#fecaca', fontSize: '12px', fontWeight: '500'}}>ID</div>
                      <div style={{
                        background: 'white', 
                        color: 'var(--mild-red)', 
                        padding: '4px 12px', 
                        borderRadius: '15px', 
                        fontSize: '12px', 
                        fontWeight: '700'
                      }}>
                        {dashboardData.employee.employee_id}
                      </div>
                    </div>
                  )}
                  {dashboardData.employee?.id && (
                    <div className="text-center">
                      <div style={{color: '#fecaca', fontSize: '12px', fontWeight: '500'}}>System ID</div>
                      <div style={{color: 'white', fontWeight: '700', fontSize: '14px'}}>
                        #{dashboardData.employee.id}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards - Red and White Theme */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 col-12 mb-3">
          <div className="card shadow employee-dashboard-summary-card" style={{border: '1px solid #fecaca', borderRadius: '12px', transition: 'all 0.3s ease'}}>
            <div className="card-body" style={{padding: '24px'}}>
              <div className="d-flex align-items-center">
                <div style={{
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '16px',
                  boxShadow: '0 4px 8px rgba(220, 38, 38, 0.2)'
                }}>
                  <i className="fas fa-bullseye" style={{fontSize: '24px', color: 'white'}}></i>
                </div>
                <div>
                  <h6 style={{color: '#6b7280', margin: 0, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Targets</h6>
                  <h3 style={{color: '#dc2626', fontWeight: '800', fontSize: '32px', margin: '4px 0 0 0'}}>{dashboardData.summary.total_targets}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb-3">
          <div className="card shadow employee-dashboard-summary-card" style={{border: '1px solid #fecaca', borderRadius: '12px', transition: 'all 0.3s ease'}}>
            <div className="card-body" style={{padding: '24px'}}>
              <div className="d-flex align-items-center">
                <div style={{
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '16px',
                  boxShadow: '0 4px 8px rgba(16, 185, 129, 0.2)'
                }}>
                  <i className="fas fa-play-circle" style={{fontSize: '24px', color: 'white'}}></i>
                </div>
                <div>
                  <h6 style={{color: '#6b7280', margin: 0, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Active Targets</h6>
                  <h3 style={{color: '#dc2626', fontWeight: '800', fontSize: '32px', margin: '4px 0 0 0'}}>{dashboardData.summary.active_targets}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb-3">
          <div className="card shadow employee-dashboard-summary-card" style={{border: '1px solid #fecaca', borderRadius: '12px', transition: 'all 0.3s ease'}}>
            <div className="card-body" style={{padding: '24px'}}>
              <div className="d-flex align-items-center">
                <div style={{
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '16px',
                  boxShadow: '0 4px 8px rgba(59, 130, 246, 0.2)'
                }}>
                  <i className="fas fa-check-circle" style={{fontSize: '24px', color: 'white'}}></i>
                </div>
                <div>
                  <h6 style={{color: '#6b7280', margin: 0, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Completed</h6>
                  <h3 style={{color: '#dc2626', fontWeight: '800', fontSize: '32px', margin: '4px 0 0 0'}}>{dashboardData.summary.completed_targets}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-12 mb-3">
          <div className="card shadow employee-dashboard-summary-card" style={{border: '1px solid #fecaca', borderRadius: '12px', transition: 'all 0.3s ease'}}>
            <div className="card-body" style={{padding: '24px'}}>
              <div className="d-flex align-items-center">
                <div style={{
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '16px',
                  boxShadow: '0 4px 8px rgba(245, 158, 11, 0.2)'
                }}>
                  <i className="fas fa-percentage" style={{fontSize: '24px', color: 'white'}}></i>
                </div>
                <div>
                  <h6 style={{color: '#6b7280', margin: 0, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Achievement Rate</h6>
                  <h3 style={{color: '#dc2626', fontWeight: '800', fontSize: '32px', margin: '4px 0 0 0'}}>{dashboardData.summary.average_achievement?.toFixed(1)}%</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Details Tabs - Red and White Theme */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg" style={{border: '1px solid #fecaca', borderRadius: '12px'}}>
            <div className="card-header" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)', 
              borderBottom: '2px solid #fecaca',
              borderRadius: '11px 11px 0 0',
              padding: '20px'
            }}>
              <ul className="nav nav-pills employee-dashboard-nav" role="tablist" style={{gap: '10px'}}>
                <li className="nav-item">
                  <a className="nav-link active" data-bs-toggle="pill" href="#route-targets" role="tab" style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 20px',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                  }}>
                    <i className="fas fa-route me-2"></i>Route Targets
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" data-bs-toggle="pill" href="#call-targets" role="tab" style={{
                    background: 'white',
                    color: '#dc2626',
                    border: '2px solid #fecaca',
                    borderRadius: '25px',
                    padding: '12px 20px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="fas fa-phone me-2"></i>Call Targets
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" data-bs-toggle="pill" href="#summary-stats" role="tab" style={{
                    background: 'white',
                    color: '#dc2626',
                    border: '2px solid #fecaca',
                    borderRadius: '25px',
                    padding: '12px 20px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="fas fa-chart-pie me-2"></i>Summary
                  </a>
                </li>
              </ul>
            </div>
            <div className="card-body" style={{padding: '30px'}}>
              <div className="tab-content">
                {/* Route Targets Tab */}
                <div className="tab-pane fade show active" id="route-targets" role="tabpanel">
                  <div className="table-responsive">
                    <table className="table align-items-center mb-0">
                      <thead>
                        <tr>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Route</th>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Period</th>
                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Target</th>
                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Achieved</th>
                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardData.route_targets || []).map((target, index) => (
                          <tr key={target.id || index}>
                            <td>
                              <div className="d-flex px-2 py-1">
                                <div className="d-flex flex-column justify-content-center">
                                  <h6 className="mb-0 text-sm">{target.route_name || target.route || 'N/A'}</h6>
                                  <p className="text-xs text-secondary mb-0">{target.product_details?.length || 0} products</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <p className="text-xs font-weight-bold mb-0">
                                {formatDate(target.start_date)} - {formatDate(target.end_date)}
                              </p>
                            </td>
                            <td className="align-middle text-center text-sm">
                              <span className="text-secondary text-xs font-weight-bold">
                                {target.target_boxes} boxes
                              </span>
                            </td>
                            <td className="align-middle text-center">
                              <span className="text-secondary text-xs font-weight-bold">
                                {target.achieved_boxes || 0} boxes
                              </span>
                            </td>
                            <td className="align-middle text-center">
                              {(() => {
                                const percentage = target.target_boxes > 0 ? 
                                  ((target.achieved_boxes || 0) / target.target_boxes * 100) : 0;
                                const badgeClass = percentage >= 100 ? 'bg-success' : 
                                                 percentage >= 75 ? 'bg-warning' : 'bg-danger';
                                return (
                                  <span className={`badge ${badgeClass}`}>
                                    {percentage.toFixed(1)}%
                                  </span>
                                );
                              })()
                              }
                            </td>
                          </tr>
                        ))}
                        {(dashboardData.route_targets || []).length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">No route targets assigned</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {dashboardData.achievement_logs.length < dashboardData.total_logs && (
                    <div className="d-flex justify-content-center my-3" style={{padding: '16px', borderTop: '1px solid #fecaca', background: '#fff'}}>
                      <button
                        className="btn"
                        onClick={() => setFilter(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                        style={{background: '#dc2626', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '700'}}
                      >
                        Load Previous
                      </button>
                    </div>
                  )}
                </div>

                {/* Call Targets Tab */}
                <div className="tab-pane fade" id="call-targets" role="tabpanel">
                  <div className="table-responsive">
                    <table className="table align-items-center mb-0">
                      <thead>
                        <tr>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Period</th>
                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Daily Average</th>
                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total Target</th>
                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Achieved</th>
                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardData.call_targets || []).map((target, index) => {
                          const totalTarget = (target.daily_targets || []).reduce((sum, daily) => sum + (daily.target_calls || 0), 0);
                          const totalAchieved = (target.daily_targets || []).reduce((sum, daily) => sum + (daily.achieved_calls || 0), 0);
                          return (
                            <tr key={target.id || index}>
                              <td>
                                <p className="text-xs font-weight-bold mb-0">
                                  {formatDate(target.start_date)} - {formatDate(target.end_date)}
                                </p>
                                <p className="text-xs text-secondary mb-0">
                                  {target.daily_targets?.length || 0} days
                                </p>
                              </td>
                              <td className="align-middle text-center text-sm">
                                <span className="text-secondary text-xs font-weight-bold">
                                  {target.daily_targets?.length > 0 ? 
                                    Math.round(totalTarget / target.daily_targets.length) : 0
                                  } calls/day
                                </span>
                              </td>
                              <td className="align-middle text-center text-sm">
                                <span className="text-secondary text-xs font-weight-bold">
                                  {totalTarget} calls
                                </span>
                              </td>
                              <td className="align-middle text-center">
                                <span className="text-secondary text-xs font-weight-bold">
                                  {totalAchieved} calls
                                </span>
                              </td>
                              <td className="align-middle text-center">
                                {(() => {
                                  const percentage = totalTarget > 0 ? (totalAchieved / totalTarget * 100) : 0;
                                  const badgeClass = percentage >= 100 ? 'bg-success' : 
                                                   percentage >= 75 ? 'bg-warning' : 'bg-danger';
                                  return (
                                    <span className={`badge ${badgeClass}`}>
                                      {percentage.toFixed(1)}%
                                    </span>
                                  );
                                })()
                                }
                              </td>
                            </tr>
                          );
                        })}
                        {(dashboardData.call_targets || []).length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">No call targets assigned</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Stats Tab */}
                <div className="tab-pane fade" id="summary-stats" role="tabpanel">
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Route Performance</h6>
                          <div className="row">
                            <div className="col-6">
                              <div className="text-center">
                                <span className="text-lg font-weight-bold">
                                  {dashboardData.summary.route_summary?.total_target_boxes || 0}
                                </span>
                                <p className="text-xs text-muted mb-0">Total Target Boxes</p>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="text-center">
                                <span className="text-lg font-weight-bold text-success">
                                  {dashboardData.summary.route_summary?.total_achieved_boxes || 0}
                                </span>
                                <p className="text-xs text-muted mb-0">Achieved Boxes</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Call Performance</h6>
                          <div className="row">
                            <div className="col-6">
                              <div className="text-center">
                                <span className="text-lg font-weight-bold">
                                  {dashboardData.summary.calls_summary?.total_target_calls || 0}
                                </span>
                                <p className="text-xs text-muted mb-0">Total Target Calls</p>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="text-center">
                                <span className="text-lg font-weight-bold text-success">
                                  {dashboardData.summary.calls_summary?.total_achieved_calls || 0}
                                </span>
                                <p className="text-xs text-muted mb-0">Achieved Calls</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement History Section - Red and White Theme */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg" style={{border: '2px solid #dc2626', borderRadius: '12px'}}>
            <div className="card-header" style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              borderRadius: '10px 10px 0 0',
              padding: '25px'
            }}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-chart-line" style={{fontSize: '20px', color: 'white'}}></i>
                  </div>
                  <div>
                    <h4 style={{color: 'white', fontWeight: '800', fontSize: '22px', margin: 0}}>
                      Achievement History
                    </h4>
                    <p className="mb-0" style={{color: '#fecaca', fontSize: '14px'}}>
                      Employee Performance Tracking & Logs
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {dashboardData.total_logs > 0 && (
                    <div style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <span style={{color: 'white', fontSize: '14px', fontWeight: '600'}}>
                        {dashboardData.total_logs} Total Logs
                      </span>
                    </div>
                  )}
                  {dashboardData.achievement_logs.length > 0 && dashboardData.achievement_logs.length !== dashboardData.total_logs && (
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '8px 16px',
                      borderRadius: '20px'
                    }}>
                      <span style={{color: 'white', fontSize: '14px', fontWeight: '600'}}>
                        Showing {dashboardData.achievement_logs.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* API Connection Status Indicator */}
              {dashboardData.achievement_logs.length > 0 && (
                <div className="mt-2" style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#059669',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  <i className="fas fa-check-circle me-2"></i>
                  API Connected: /target-management/employee/achievement-history/?employee_id={getLoggedInEmployeeId()}&limit={filter.limit}
                </div>
              )}
              
              {/* Enhanced Filters */}
              <div className="row g-3 mt-3" style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="col-md-3">
                  <label className="form-label" style={{color: '#fecaca', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Log Type</label>
                  <select 
                    name="log_type" 
                    className="form-select"
                    value={filter.log_type}
                    onChange={handleFilterChange}
                    style={{
                      background: 'white',
                      border: '2px solid #fecaca',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontWeight: '500'
                    }}
                  >
                    <option value="both">Both Call & Route</option>
                    <option value="call">Call Targets Only</option>
                    <option value="route">Route Targets Only</option>
                    <option value="summary">Summary Only</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label" style={{color: '#fecaca', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Limit</label>
                  <select 
                    name="limit" 
                    className="form-select"
                    value={filter.limit}
                    onChange={handleFilterChange}
                    style={{
                      background: 'white',
                      border: '2px solid #fecaca',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontWeight: '500'
                    }}
                  >
                    <option value="10">10 records</option>
                    <option value="20">20 records</option>
                    <option value="50">50 records</option>
                    <option value="100">100 records</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label" style={{color: '#fecaca', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Start Date</label>
                  <input 
                    type="date" 
                    name="start_date"
                    className="form-control"
                    value={filter.start_date}
                    onChange={handleFilterChange}
                    style={{
                      background: 'white',
                      border: '2px solid #fecaca',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label" style={{color: '#fecaca', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>End Date</label>
                  <input 
                    type="date" 
                    name="end_date"
                    className="form-control"
                    value={filter.end_date}
                    onChange={handleFilterChange}
                    style={{
                      background: 'white',
                      border: '2px solid #fecaca',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div className="col-md-1">
                  <label className="form-label" style={{color: 'transparent', fontSize: '12px'}}>Reset</label>
                  <button 
                    className="btn w-100 employee-dashboard-filter-btn"
                    onClick={resetFilters}
                    title="Reset Filters"
                    style={{
                      background: 'white',
                      color: '#dc2626',
                      border: '2px solid #fecaca',
                      borderRadius: '8px',
                      fontWeight: '600',
                      padding: '8px'
                    }}
                  >
                    <i className="fas fa-undo"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card-body" style={{padding: '30px', background: '#fefefe'}}>
              {filter.log_type === 'summary' ? (
                <div className="text-center py-5" style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                  borderRadius: '12px',
                  border: '2px dashed #fecaca',
                  padding: '60px 40px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 8px 16px rgba(220, 38, 38, 0.2)'
                  }}>
                    <i className="fas fa-chart-pie" style={{fontSize: '32px', color: 'white'}}></i>
                  </div>
                  <h4 style={{color: '#dc2626', fontWeight: '700', margin: '0 0 12px 0'}}>Dashboard Summary View</h4>
                  <p style={{color: '#6b7280', margin: 0, fontSize: '16px'}}>Use the tabs above to view detailed target information.</p>
                </div>
              ) : dashboardData.achievement_logs.length === 0 ? (
                <div className="text-center py-5" style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                  borderRadius: '12px',
                  border: '2px dashed #fecaca',
                  padding: '60px 40px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 8px 16px rgba(156, 163, 175, 0.2)'
                  }}>
                    <i className="fas fa-chart-line" style={{fontSize: '32px', color: 'white'}}></i>
                  </div>
                  <h4 style={{color: '#6b7280', fontWeight: '700', margin: '0 0 12px 0'}}>No Achievement Logs Found</h4>
                  <p style={{color: '#9ca3af', margin: '0 0 12px 0', fontSize: '16px'}}>
                    {dashboardData.total_logs === 0 ? 
                      "No achievement history available yet. Start logging your achievements!" :
                      "No records match your current filters. Try adjusting the filter settings."
                    }
                  </p>
                  {dashboardData.total_logs > 0 && (
                    <div style={{
                      background: '#dc2626',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      display: 'inline-block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}>
                      <i className="fas fa-info-circle me-2"></i>
                      Total logs available: {dashboardData.total_logs}
                    </div>
                  )}
                  
                  {/* API Connection Info */}
                  <div className="mt-3 p-3" style={{
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: '#4b5563'
                  }}>
                    <div style={{fontWeight: '600', marginBottom: '8px', color: '#374151'}}>
                      <i className="fas fa-plug me-2"></i>API Connection Details:
                    </div>
                    <div><strong>Endpoint:</strong> /target-management/employee/achievement-history/</div>
                    <div><strong>Employee ID:</strong> {getLoggedInEmployeeId()}</div>
                    <div><strong>Log Type Filter:</strong> {filter.log_type}</div>
                    <div><strong>Result Limit:</strong> {filter.limit}</div>
                    {filter.start_date && <div><strong>Start Date:</strong> {filter.start_date}</div>}
                    {filter.end_date && <div><strong>End Date:</strong> {filter.end_date}</div>}
                  </div>
                  
                  {/* Display exact API response structure for debugging */}
                  <div className="mt-4 p-3" style={{
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    textAlign: 'left'
                  }}>
                    <h6 style={{color: '#374151', fontWeight: '600', marginBottom: '12px'}}>
                      <i className="fas fa-code me-2"></i>API Response Structure:
                    </h6>
                    <pre style={{
                      color: '#4b5563',
                      fontSize: '12px',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                    }}>
{JSON.stringify({
  employee: dashboardData.employee,
  total_logs: dashboardData.total_logs,
  logs: dashboardData.achievement_logs
}, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #fecaca',
                  overflow: 'hidden'
                }}>
                  <div className="table-responsive">
                    <table className="table mb-0 employee-dashboard-table" style={{borderCollapse: 'separate', borderSpacing: '0'}}>
                      <thead style={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        color: 'white'
                      }}>
                        <tr>
                          <th style={{
                            padding: '20px 24px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            border: 'none',
                            color: 'white'
                          }}>
                            <i className="fas fa-calendar-alt me-2"></i>Date & Type
                          </th>
                          <th style={{
                            padding: '20px 24px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            border: 'none',
                            color: 'white'
                          }}>
                            <i className="fas fa-info-circle me-2"></i>Achievement Details
                          </th>
                          <th style={{
                            padding: '20px 24px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            textAlign: 'center',
                            border: 'none',
                            color: 'white'
                          }}>
                            <i className="fas fa-trophy me-2"></i>Achievement Value
                          </th>
                          <th style={{
                            padding: '20px 24px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            textAlign: 'center',
                            border: 'none',
                            color: 'white'
                          }}>
                            <i className="fas fa-check-circle me-2"></i>Status
                          </th>
                          <th style={{
                            padding: '20px 24px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            textAlign: 'center',
                            border: 'none',
                            color: 'white'
                          }}>
                            <i className="fas fa-user me-2"></i>Recorded By
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.achievement_logs.map((log, index) => (
                          <tr key={`${log.id || index}-${log.achievement_date}`} style={{
                            background: index % 2 === 0 ? '#fefefe' : '#fef2f2',
                            borderBottom: '1px solid #fecaca',
                            transition: 'all 0.3s ease'
                          }}>
                            <td style={{padding: '20px 24px', border: 'none'}}>
                              <div className="d-flex align-items-center">
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  background: log.log_type === 'route' ? 
                                    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
                                    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '12px'
                                }}>
                                  {getLogTypeIcon(log.log_type)}
                                </div>
                                <div>
                                  <h6 style={{color: '#1f2937', fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0'}}>
                                    {formatDate(log.achievement_date)}
                                  </h6>
                                  <div className="d-flex align-items-center gap-2">
                                    <span style={{
                                      background: log.log_type === 'route' ? '#dbeafe' : '#d1fae5',
                                      color: log.log_type === 'route' ? '#1e40af' : '#065f46',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontSize: '10px',
                                      fontWeight: '600',
                                      textTransform: 'uppercase'
                                    }}>
                                      {log.log_type}
                                    </span>
                                    <span style={{color: '#6b7280', fontSize: '12px'}}>
                                      {formatDateTime(log.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{padding: '20px 24px', border: 'none'}}>
                              <h6 style={{color: '#1f2937', fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0'}}>
                                {log.log_type === 'route' ? (
                                  <>Route Target #{log.route_target || 'N/A'}</>
                                ) : (
                                  <>Call Target #{log.call_daily_target || 'N/A'}</>
                                )}
                              </h6>
                              <p style={{color: '#6b7280', fontSize: '12px', margin: 0}}>
                                {log.remarks || 'No additional notes'}
                              </p>
                            </td>
                            <td style={{padding: '20px 24px', textAlign: 'center', border: 'none'}}>
                              <div style={{
                                background: '#fef2f2',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #fecaca'
                              }}>
                                <div style={{color: '#dc2626', fontSize: '20px', fontWeight: '700', marginBottom: '4px'}}>
                                  {log.achievement_value || 0}
                                </div>
                                <div style={{color: '#10b981', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'}}>
                                  {log.log_type === 'route' ? 'Boxes' : 'Calls'} Achieved
                                </div>
                              </div>
                            </td>
                            <td style={{padding: '20px 24px', textAlign: 'center', border: 'none'}}>
                              <div style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: '700',
                                display: 'inline-block',
                                minWidth: '100px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                <i className="fas fa-check-circle me-2"></i>
                                Logged
                              </div>
                            </td>
                            <td style={{padding: '20px 24px', textAlign: 'center', border: 'none'}}>
                              <div style={{
                                background: 'white',
                                padding: '8px 12px',
                                borderRadius: '20px',
                                border: '2px solid #fecaca',
                                display: 'inline-block'
                              }}>
                                <span style={{color: '#dc2626', fontSize: '12px', fontWeight: '600'}}>
                                  {log.recorded_by_name || 'System'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;