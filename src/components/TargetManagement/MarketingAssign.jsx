// src/components/TargetManagement/MarketingAssign.jsx
import React, { useState, useEffect, useRef } from 'react';
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

const MarketingAssign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);

  const pickerRef = useRef(null);
  const triggerRef = useRef(null);

  const [formData, setFormData] = useState({
    employee: [],
    start_date: '',
    end_date: '',
    is_active: true,
    target_parameters: []
  });

  const [parameters, setParameters] = useState({
    shops_visited: { target: '', incentive: '' },
    total_boxes: { target: '', incentive: '' },
    new_shops: { target: '', incentive: '' },
    focus_category: { target: '', incentive: '' }
  });

  // Fetch employees on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Close picker when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutside = (e) => {
      if (!showEmployeePicker) return;
      const pickerEl = pickerRef.current;
      const triggerEl = triggerRef.current;
      if (pickerEl && pickerEl.contains(e.target)) return;
      if (triggerEl && triggerEl.contains(e.target)) return;
      setShowEmployeePicker(false);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') setShowEmployeePicker(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showEmployeePicker]);

  const fetchInitialData = async () => {
    setLoadingData(true);
    setDataError('');
    
    try {
      // Fetch employees
      const empResponse = await api.get('/employee-management/employees/');
      let empData = empResponse.data;
      // If empData is an object with a results property (DRF pagination)
      if (empData && typeof empData === 'object' && Array.isArray(empData.results)) {
        empData = empData.results;
      }
      // If empData is not an array, fallback to empty array
      if (!Array.isArray(empData)) {
        empData = [];
      }
      setEmployees(empData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDataError(error.response?.data?.message || 'Failed to load initial data. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const getEmployeeDisplayName = (employee) => {
    if (!employee) return '';
    const name = employee.full_name || ([employee.first_name, employee.last_name].filter(Boolean).join(' ')) || employee.employee_name || employee.name || employee.email || (employee.user && employee.user.email);
    if (name) return name;
    const id = employee.employee_id || employee.id || (employee.user && employee.user.id);
    if (id) return `Employee #${id}`;
    return 'Unknown Employee';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleParameterChange = (paramType, field, value) => {
    setParameters(prev => ({
      ...prev,
      [paramType]: {
        ...prev[paramType],
        [field]: value
      }
    }));
  };

  const saveParameters = () => {
    const paramTypes = [
      { type: 'shops_visited', label: 'No. of Shops' },
      { type: 'total_boxes', label: 'Total Boxes' },
      { type: 'new_shops', label: 'New Shops' },
      { type: 'focus_category', label: 'Focus Category' }
    ];

    const params = paramTypes.map(({ type, label }) => ({
      parameter_type: type,
      parameter_label: label,
      target_value: parseFloat(parameters[type].target) || 0,
      achieved_value: 0,
      incentive_value: parseFloat(parameters[type].incentive) || 0
    }));

    setFormData(prev => ({
      ...prev,
      target_parameters: params
    }));

    setShowParametersModal(false);
    toast.success('Parameters saved successfully');
  };

  const selectCurrentWeek = () => {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    setFormData(prev => ({
      ...prev,
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    }));
  };

  const selectNextWeek = () => {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 13));
    
    setFormData(prev => ({
      ...prev,
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    }));
  };

  const selectCurrentMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setFormData(prev => ({
      ...prev,
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    }));
  };

  const selectNextMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    
    setFormData(prev => ({
      ...prev,
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    }));
  };

  const selectCustomWeek = () => {
    const today = new Date();
    setFormData(prev => ({
      ...prev,
      start_date: today.toISOString().split('T')[0],
      end_date: ''
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.employee) {
      toast.error('Please select an employee');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Please select start and end dates');
      return;
    }

    if (formData.target_parameters.length === 0) {
      toast.error('Please set at least one target parameter');
      return;
    }

    setLoading(true);

    try {
      // Support assigning to multiple employees by creating a period per selected employee
      const employeeList = Array.isArray(formData.employee) ? formData.employee : (formData.employee ? [formData.employee] : []);
      if (employeeList.length === 0) {
        toast.error('Please select at least one employee');
        setLoading(false);
        return;
      }

      const promises = employeeList.map(empId => {
        const payload = {
          ...formData,
          employee: empId
        };
        return api.post('/target-management/marketing-targets/', payload);
      });

      await Promise.all(promises);
      toast.success('Marketing target(s) assigned successfully');
      navigate('/target/call/marketing');
      try { setTimeout(() => window.dispatchEvent(new Event('marketingTargetChanged')), 120); } catch(e) { /* ignore */ }
    } catch (error) {
      console.error('Error assigning target:', error);
      toast.error(error.response?.data?.message || 'Failed to assign target');
    } finally {
      setLoading(false);
    }
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
          <p style={{color: '#6b7280', margin: 0}}>Fetching employees...</p>
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
                Assign Marketing Target
              </h1>
              <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>
                Configure marketing targets and incentives for your team
              </p>
            </div>
            <button
              onClick={() => navigate('/target/call/marketing')}
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

        {employees.length === 0 && !dataError && (
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
            <p style={{color: '#b45309', fontSize: '13px', margin: '0 0 12px 0'}}>
              No employees found. Please add employees in Employee Management first.
            </p>
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

        {/* Form Card - Employee */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6'
        }}>
          {/* Employee Selection */}
          <div style={{marginBottom: '24px'}}>
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

            {/* Collapsed bar + dropdown container (dropdown overlays like native select) */}
            <div style={{ position: 'relative' }}>
              <div
                role="button"
                tabIndex={0}
                ref={triggerRef}
                onClick={() => { if (employees.length > 0) setShowEmployeePicker(prev => !prev); }}
                onKeyDown={(e) => { if (e.key === 'Enter') setShowEmployeePicker(prev => !prev); }}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827',
                  background: employees.length === 0 ? '#f9fafb' : 'white',
                  cursor: employees.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {Array.isArray(formData.employee) && formData.employee.length > 0 ? (
                    formData.employee.map(id => {
                      const emp = employees.find(e => String(e.id) === String(id));
                      return emp ? getEmployeeDisplayName(emp) : `#${id}`;
                    }).join(', ')
                  ) : (
                    <span style={{color: '#6b7280'}}>Select employee(s)...</span>
                  )}
                </div>
                <div style={{color: '#6b7280'}}>{showEmployeePicker ? '▴' : '▾'}</div>
              </div>

              {showEmployeePicker && (
                <div ref={pickerRef} style={{
                  marginTop: 6,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  maxHeight: 180,
                  overflowY: 'auto',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.06)'
                }}>
                  {employees.map(emp => {
                    const selected = Array.isArray(formData.employee) && (formData.employee.includes(String(emp.id)) || formData.employee.includes(emp.id));
                    return (
                      <div
                        key={emp.id}
                        onClick={() => {
                          const prev = Array.isArray(formData.employee) ? [...formData.employee] : [];
                          const idStr = String(emp.id);
                          const has = prev.includes(idStr) || prev.includes(emp.id);
                          if (has) {
                            const idx1 = prev.indexOf(idStr);
                            if (idx1 > -1) prev.splice(idx1, 1);
                            const idx2 = prev.indexOf(emp.id);
                            if (idx2 > -1) prev.splice(idx2, 1);
                          } else {
                            prev.push(idStr);
                          }
                          setFormData(prevState => ({...prevState, employee: prev}));
                          // Close picker after selection
                          setShowEmployeePicker(false);
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                          background: selected ? '#1e40af' : 'white',
                          color: selected ? 'white' : '#111827'
                        }}
                      >
                        <div style={{fontWeight: 600}}>{getEmployeeDisplayName(emp)}</div>
                        <div style={{fontSize: 12, color: selected ? 'rgba(255,255,255,0.85)' : '#6b7280'}}>{emp.employee_id ? `ID: ${emp.employee_id}` : `PK: ${emp.id}`}</div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                Configure targets for shop visits, boxes, new shops and focus category
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
            onClick={() => navigate('/target/call/marketing')}
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
            disabled={loading || employees.length === 0}
            style={{
              background: loading || employees.length === 0 ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading || employees.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: loading || employees.length === 0 ? 'none' : '0 1px 2px rgba(220, 38, 38, 0.2)',
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
                    Marketing Parameters Configuration
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
                            <i className="fas fa-store" style={{color: '#dc2626'}}></i>
                            No. of Shop Visited
                          </div>
                        </td>
                        <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                          <input
                            type="number"
                            value={parameters.shops_visited.target}
                            onChange={(e) => handleParameterChange('shops_visited', 'target', e.target.value)}
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
                            value={parameters.shops_visited.incentive}
                            onChange={(e) => handleParameterChange('shops_visited', 'incentive', e.target.value)}
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
                            <i className="fas fa-box" style={{color: '#dc2626'}}></i>
                            Total Boxes
                          </div>
                        </td>
                        <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                          <input
                            type="number"
                            value={parameters.total_boxes.target}
                            onChange={(e) => handleParameterChange('total_boxes', 'target', e.target.value)}
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
                            value={parameters.total_boxes.incentive}
                            onChange={(e) => handleParameterChange('total_boxes', 'incentive', e.target.value)}
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
                            <i className="fas fa-plus-circle" style={{color: '#dc2626'}}></i>
                            New Shop
                          </div>
                        </td>
                        <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                          <input
                            type="number"
                            value={parameters.new_shops.target}
                            onChange={(e) => handleParameterChange('new_shops', 'target', e.target.value)}
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
                            value={parameters.new_shops.incentive}
                            onChange={(e) => handleParameterChange('new_shops', 'incentive', e.target.value)}
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
                            Focus Category
                          </div>
                        </td>
                        <td style={{padding: '12px', borderBottom: '1px solid #f3f4f6'}}>
                          <input
                            type="number"
                            value={parameters.focus_category.target}
                            onChange={(e) => handleParameterChange('focus_category', 'target', e.target.value)}
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
                            value={parameters.focus_category.incentive}
                            onChange={(e) => handleParameterChange('focus_category', 'incentive', e.target.value)}
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
                      {(
                        (parseFloat(parameters.shops_visited.target) || 0) +
                        (parseFloat(parameters.total_boxes.target) || 0) +
                        (parseFloat(parameters.new_shops.target) || 0) +
                        (parseFloat(parameters.focus_category.target) || 0)
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
                        (parseFloat(parameters.shops_visited.incentive) || 0) +
                        (parseFloat(parameters.total_boxes.incentive) || 0) +
                        (parseFloat(parameters.new_shops.incentive) || 0) +
                        (parseFloat(parameters.focus_category.incentive) || 0)
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
                        parameters.shops_visited.target > 0,
                        parameters.total_boxes.target > 0,
                        parameters.new_shops.target > 0,
                        parameters.focus_category.target > 0,
                      ].filter(Boolean).length} / 4
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        shops_visited: { target: '', incentive: '' },
                        total_boxes: { target: '', incentive: '' },
                        new_shops: { target: '', incentive: '' },
                        focus_category: { target: '', incentive: '' }
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

export default MarketingAssign;
