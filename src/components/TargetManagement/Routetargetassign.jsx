// src/components/TargetManagement/RouteTargetAssign.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/client";

// Add spin animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('style[data-spin-animation]')) {
  styleSheet.setAttribute('data-spin-animation', 'true');
  document.head.appendChild(styleSheet);
}

const RouteTargetAssign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [showParametersModal, setShowParametersModal] = useState(false);
  
  // Parameters state
  const [parameters, setParameters] = useState({
    TPA: { target: '', incentive: '' },
    T_COLLECTION: { target: '', incentive: '' },
    POM: { target: '', incentive: '' },
    SALES_TARGET: { target: '', incentive: '' }
  });

  const [formData, setFormData] = useState({
    employee: '',
    start_date: '',
    end_date: '',
    route: '',
    is_active: true,
    target_parameters: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingData(true);
    setDataError(null);
    
    try {
      console.log('Starting to fetch data...');
      
      // Fetch employees
      const empRes = await api.get('/employee-management/employees/');
      console.log('Employee response:', empRes);
      console.log('Employee data:', empRes.data);
      
      // Handle different response formats
      let employeeData = [];
      if (empRes.data) {
        if (Array.isArray(empRes.data)) {
          employeeData = empRes.data;
        } else if (empRes.data.results && Array.isArray(empRes.data.results)) {
          employeeData = empRes.data.results;
        } else if (empRes.data.data && Array.isArray(empRes.data.data)) {
          employeeData = empRes.data.data;
        }
      }
      
      console.log('Processed employee data:', employeeData);
      setEmployees(employeeData);

      // Fetch routes
      const routeRes = await api.get('/target-management/routes/');
      console.log('Route response:', routeRes);
      
      let routeData = [];
      if (routeRes.data) {
        if (Array.isArray(routeRes.data)) {
          routeData = routeRes.data;
        } else if (routeRes.data.results && Array.isArray(routeRes.data.results)) {
          routeData = routeRes.data.results;
        } else if (routeRes.data.data && Array.isArray(routeRes.data.data)) {
          routeData = routeRes.data.data;
        }
      }
      
      console.log('Processed route data:', routeData);
      setRoutes(routeData);

      // Show notifications
      if (employeeData.length === 0) {
        toast.warning('No employees found. Please add employees in Employee Management first.');
      } else {
        console.log(`✓ Loaded ${employeeData.length} employees`);
      }
      
      if (routeData.length === 0) {
        toast.warning('No routes found. Please add routes in Route Master first.');
      } else {
        console.log(`✓ Loaded ${routeData.length} routes`);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', error.response);
      setDataError(error.message || 'Failed to load data');
      toast.error('Failed to load initial data. Please check console for details.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle parameter changes
  const handleParameterChange = (paramType, field, value) => {
    setParameters(prev => ({
      ...prev,
      [paramType]: {
        ...prev[paramType],
        [field]: value
      }
    }));
  };

  // Save parameters to form data
  const saveParameters = () => {
    const parameterArray = [];
    
    Object.keys(parameters).forEach(paramType => {
      const param = parameters[paramType];
      if (param.target > 0) {
        parameterArray.push({
          parameter_type: paramType,
          target_value: parseFloat(param.target) || 0,
          incentive_value: parseFloat(param.incentive) || 0
        });
      }
    });
    
    setFormData(prev => ({
      ...prev,
      target_parameters: parameterArray
    }));
    
    setShowParametersModal(false);
    toast.success(`${parameterArray.length} parameters configured successfully!`);
  };
    const targetParams = [];
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        toast.error('End date must be after start date');
        return;
      }
    }

    setLoading(true);

    try {
      console.log('Submitting form data:', formData);
      const response = await api.post('/target-management/route-targets/', formData);
      console.log('Submit response:', response);
      toast.success('Route target assigned successfully!');
      navigate('/target/route/list');
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message ||
                       error.response?.data?.error ||
                       'Failed to assign route target';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get Monday of current week
  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Helper function to get Sunday of current week
  const getSundayOfWeek = (date) => {
    const monday = getMondayOfWeek(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday;
  };

  // Preset month selection
  const selectCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFormData(prev => ({
      ...prev,
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    }));
  };

  const selectNextMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    setFormData(prev => ({
      ...prev,
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    }));
  };
  const selectCurrentWeek = () => {
    const monday = getMondayOfWeek(new Date());
    const sunday = getSundayOfWeek(new Date());
    
    setFormData(prev => ({
      ...prev,
      start_date: monday.toISOString().split('T')[0],
      end_date: sunday.toISOString().split('T')[0]
    }));
  };

  const selectNextWeek = () => {
    const nextMonday = getMondayOfWeek(new Date());
    nextMonday.setDate(nextMonday.getDate() + 7);
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    
    setFormData(prev => ({
      ...prev,
      start_date: nextMonday.toISOString().split('T')[0],
      end_date: nextSunday.toISOString().split('T')[0]
    }));
  };

  const selectCustomWeek = () => {
    setFormData(prev => ({
      ...prev,
      start_date: '',
      end_date: ''
    }));
  };

  // Get employee display name - handles multiple formats
  const getEmployeeDisplayName = (emp) => {
    if (!emp) return '';
    
    // Try to get employee ID
    const empId = emp.employee_id || emp.id || '';
    
    // Try to get full name from different possible fields
    const fullName = emp.full_name || 
                     emp.name || 
                     emp.user_name ||
                     (emp.job_info && emp.job_info.user_name) ||
                     emp.user_email ||
                     '';
    
    // Try to get designation
    const designation = emp.designation || 
                       (emp.job_info && emp.job_info.designation) || 
                       '';
    
    // Try to get department
    const department = emp.department || 
                      (emp.job_info && emp.job_info.department) || 
                      '';
    
    // Build display name
    let displayName = '';
    
    if (empId) {
      displayName = empId;
    }
    
    if (fullName) {
      displayName += (displayName ? ' - ' : '') + fullName;
    }
    
    if (designation || department) {
      displayName += ' (';
      if (designation) {
        displayName += designation;
        if (department) {
          displayName += ' - ' + department;
        }
      } else if (department) {
        displayName += department;
      }
      displayName += ')';
    }
    
    // Fallback if nothing is available
    if (!displayName && emp.id) {
      displayName = `Employee #${emp.id}`;
    }
    
    return displayName || 'Unknown Employee';
  };

  // Get route display name
  const getRouteDisplayName = (route) => {
    if (!route) return '';
    
    if (route.route_name) {
      return route.route_name;
    }
    if (route.origin && route.destination) {
      return `${route.origin} → ${route.destination}`;
    }
    if (route.route_code) {
      return route.route_code;
    }
    return route.id ? `Route #${route.id}` : 'Unknown Route';
  };

  if (loadingData) {
    return (
      <div style={{minHeight: '100vh', background: '#f8f9fa', padding: '24px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto', textAlign: 'center', paddingTop: '80px'}}>
          <div style={{
            width: '48px', 
            height: '48px', 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #dc2626', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <h5 style={{color: '#374151', marginBottom: '8px'}}>Loading Data...</h5>
          <p style={{color: '#6b7280', margin: 0}}>Fetching employees and routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', background: '#f8f9fa', padding: '24px'}}>
      <div style={{maxWidth: '900px', margin: '0 auto'}}>
        {/* Header Section */}
        <div style={{marginBottom: '32px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
            <div>
              <h1 style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', display: 'flex', alignItems: 'center'}}>
                <span style={{width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', marginRight: '12px'}}></span>
                Assign Route Target
              </h1>
              <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>
                Configure targets and incentives for your team
              </p>
            </div>
            <button
              onClick={() => navigate('/target/route/list')}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              ← Back to List
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {dataError && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h6 style={{color: '#991b1b', fontSize: '14px', fontWeight: '600', marginBottom: '8px'}}>
              Error Loading Data
            </h6>
            <p style={{color: '#dc2626', fontSize: '13px', margin: '0 0 12px 0'}}>{dataError}</p>
            <button 
              onClick={fetchInitialData}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {(employees.length === 0 || routes.length === 0) && !dataError && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h6 style={{color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '8px'}}>
              <i className="fas fa-exclamation-triangle" style={{marginRight: '8px'}}></i>
              Missing Data
            </h6>
            <ul style={{color: '#b45309', fontSize: '13px', margin: '0 0 12px 0', paddingLeft: '20px'}}>
              {employees.length === 0 && (
                <li>No employees found. Please add employees in Employee Management first.</li>
              )}
              {routes.length === 0 && (
                <li>No routes found. Please add routes in Route Master first.</li>
              )}
            </ul>
            <button 
              onClick={fetchInitialData}
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-sync" style={{marginRight: '6px'}}></i>
              Refresh Data
            </button>
          </div>
        )}

        {/* Form Card - Employee & Route */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6'
        }}>
          {/* Employee and Route Selection */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'}}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <i className="fas fa-user" style={{marginRight: '6px', color: '#6b7280'}}></i>
                Employee <span style={{color: '#dc2626'}}>*</span>
              </label>
              <select
                name="employee"
                value={formData.employee}
                onChange={handleInputChange}
                required
                disabled={employees.length === 0}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827',
                  background: employees.length === 0 ? '#f9fafb' : 'white',
                  cursor: employees.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Select Employee ({employees.length} available)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {getEmployeeDisplayName(emp)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <i className="fas fa-route" style={{marginRight: '6px', color: '#6b7280'}}></i>
                Route <span style={{color: '#dc2626'}}>*</span>
              </label>
              <select
                name="route"
                value={formData.route}
                onChange={handleInputChange}
                required
                disabled={routes.length === 0}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827',
                  background: routes.length === 0 ? '#f9fafb' : 'white',
                  cursor: routes.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Select Route ({routes.length} available)</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {getRouteDisplayName(route)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Period Selection */}
          <div style={{marginBottom: '24px'}}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              <i className="fas fa-calendar" style={{marginRight: '6px', color: '#6b7280'}}></i>
              Quick Period Selection
            </label>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              <button
                type="button"
                onClick={selectCurrentWeek}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)'
                }}
              >
                Current Week
              </button>
              <button
                type="button"
                onClick={selectNextWeek}
                style={{
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Next Week
              </button>
              <button
                type="button"
                onClick={selectCurrentMonth}
                style={{
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Current Month
              </button>
              <button
                type="button"
                onClick={selectNextMonth}
                style={{
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Next Month
              </button>
              <button
                type="button"
                onClick={selectCustomWeek}
                style={{
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Custom Period
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Start Date <span style={{color: '#dc2626'}}>*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                End Date <span style={{color: '#dc2626'}}>*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827'
                }}
              />
            </div>
          </div>
        </div>

        {/* Target Parameters Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
            <div>
              <h3 style={{fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0'}}>
                <i className="fas fa-chart-line" style={{marginRight: '8px', color: '#dc2626'}}></i>
                Target Parameters
              </h3>
              <p style={{fontSize: '13px', color: '#6b7280', margin: 0}}>
                Configure target parameters for Total Parties Attended, Target Collection, Product of the Month and Sales Target
              </p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  style={{width: '18px', height: '18px', cursor: 'pointer'}}
                />
                <span style={{fontSize: '13px', fontWeight: '500', color: '#374151'}}>
                  <span style={{color: '#10b981'}}>●</span> Active Target
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowParametersModal(true)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)'
                }}
              >
                Parameters
              </button>
            </div>
          </div>

          {/* Parameters Summary/Preview */}
          {formData.target_parameters.length > 0 && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '16px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <i className="fas fa-check-circle" style={{color: '#16a34a'}}></i>
                <span style={{fontSize: '13px', fontWeight: '500', color: '#166534'}}>
                  {formData.target_parameters.length} parameter(s) configured successfully
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <button
            type="button"
            onClick={() => navigate('/target/route/list')}
            style={{
              background: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || employees.length === 0 || routes.length === 0}
            style={{
              background: loading || employees.length === 0 || routes.length === 0 ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading || employees.length === 0 || routes.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: loading || employees.length === 0 || routes.length === 0 ? 'none' : '0 1px 2px rgba(220, 38, 38, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Assigning...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Assign Target
              </>
            )}
          </button>
        </div>

        {/* Parameters Modal */}
        {showParametersModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0'}}>
                  <i className="fas fa-sliders-h" style={{marginRight: '8px', color: '#dc2626'}}></i>
                  Target Parameters Configuration
                </h2>
                <p style={{fontSize: '13px', color: '#6b7280', margin: 0}}>
                  Set targets and incentives for each parameter
                </p>
              </div>
              <button
                onClick={() => setShowParametersModal(false)}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{padding: '24px'}}>
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr>
                      <th style={{
                        background: '#f8f9fa',
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '2px solid #e5e7eb',
                        width: '30%'
                      }}>
                        Parameter Type
                      </th>
                      <th style={{
                        background: '#f8f9fa',
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '2px solid #e5e7eb',
                        width: '35%'
                      }}>
                        Target Value
                      </th>
                      <th style={{
                        background: '#f8f9fa',
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '2px solid #e5e7eb',
                        width: '35%'
                      }}>
                        Incentive Value (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f3f4f6',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <i className="fas fa-users" style={{color: '#dc2626'}}></i>
                          Total Parties Attended
                        </div>
                      </td>
                      <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                        <input
                          type="number"
                          value={parameters.TPA.target}
                          onChange={(e) => handleParameterChange('TPA', 'target', e.target.value)}
                          placeholder="Enter target"
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#111827'
                          }}
                        />
                      </td>
                      <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                        <input
                          type="number"
                          value={parameters.TPA.incentive}
                          onChange={(e) => handleParameterChange('TPA', 'incentive', e.target.value)}
                          placeholder="Enter incentive"
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#111827'
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f3f4f6',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <i className="fas fa-rupee-sign" style={{color: '#dc2626'}}></i>
                          Target Collection
                        </div>
                      </td>
                      <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                        <input
                          type="number"
                          value={parameters.T_COLLECTION.target}
                          onChange={(e) => handleParameterChange('T_COLLECTION', 'target', e.target.value)}
                          placeholder="Enter target"
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#111827'
                          }}
                        />
                      </td>
                      <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                        <input
                          type="number"
                          value={parameters.T_COLLECTION.incentive}
                          onChange={(e) => handleParameterChange('T_COLLECTION', 'incentive', e.target.value)}
                          placeholder="Enter incentive"
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#111827'
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f3f4f6',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <i className="fas fa-star" style={{color: '#dc2626'}}></i>
                          Product of the Month
                        </div>
                      </td>
                      <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                        <input
                          type="number"
                          value={parameters.POM.target}
                          onChange={(e) => handleParameterChange('POM', 'target', e.target.value)}
                          placeholder="Enter target"
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#111827'
                          }}
                        />
                      </td>
                      <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                        <input
                          type="number"
                          value={parameters.POM.incentive}
                          onChange={(e) => handleParameterChange('POM', 'incentive', e.target.value)}
                          placeholder="Enter incentive"
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#111827'
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f3f4f6',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <i className="fas fa-chart-line" style={{color: '#dc2626'}}></i>
                          Sales Target
                        </div>
                      </td>
                      <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                        <input
                          type="number"
                          value={parameters.SALES_TARGET.target}
                          onChange={(e) => handleParameterChange('SALES_TARGET', 'target', e.target.value)}
                          placeholder="Enter target"
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#111827'
                          }}
                        />
                      </td>
                      <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                        <input
                          type="number"
                          value={parameters.SALES_TARGET.incentive}
                          onChange={(e) => handleParameterChange('SALES_TARGET', 'incentive', e.target.value)}
                          placeholder="Enter incentive"
                          step="0.01"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#111827'
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Cards */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '24px'}}>
                <div style={{
                  background: '#fef2f2',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>Total Targets</div>
                  <div style={{fontSize: '18px', fontWeight: '700', color: '#dc2626'}}>
                    ₹{(
                      (parseFloat(parameters.TPA.target) || 0) +
                      (parseFloat(parameters.T_COLLECTION.target) || 0) +
                      (parseFloat(parameters.POM.target) || 0) +
                      (parseFloat(parameters.SALES_TARGET.target) || 0)
                    ).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>Total Incentives</div>
                  <div style={{fontSize: '18px', fontWeight: '700', color: '#16a34a'}}>
                    ₹{(
                      (parseFloat(parameters.TPA.incentive) || 0) +
                      (parseFloat(parameters.T_COLLECTION.incentive) || 0) +
                      (parseFloat(parameters.POM.incentive) || 0) +
                      (parseFloat(parameters.SALES_TARGET.incentive) || 0)
                    ).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  background: '#eff6ff',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>Parameters Set</div>
                  <div style={{fontSize: '18px', fontWeight: '700', color: '#2563eb'}}>
                    {[
                      parameters.TPA.target > 0,
                      parameters.T_COLLECTION.target > 0,
                      parameters.POM.target > 0,
                      parameters.SALES_TARGET.target > 0
                    ].filter(Boolean).length} / 4
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setShowParametersModal(false)}
                style={{
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  onClick={() => {
                    setParameters({
                      TPA: { target: '', incentive: '' },
                      T_COLLECTION: { target: '', incentive: '' },
                      POM: { target: '', incentive: '' },
                      SALES_TARGET: { target: '', incentive: '' }
                    });
                  }}
                  style={{
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
                <button
                  onClick={saveParameters}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  Save Parameters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default RouteTargetAssign;