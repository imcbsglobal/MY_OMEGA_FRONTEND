// src/components/TargetManagement/CallTargetList.jsx
import React, { useState, useEffect } from 'react';
import "./targetManagement.css";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/client";

const CallTargetList = () => {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: '', // Changed from employee_id to match backend expectation
    start_date: '',
    end_date: ''
  });

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employee-management/employees/');
      setEmployees(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/target-management/call-targets/?${params}`);
      setTargets(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load call targets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      employee: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this call target?')) {
      return;
    }

    try {
      await api.delete(`/target-management/call-targets/${id}/`);
      toast.success('Call target deleted successfully');
      fetchTargets();
    } catch (error) {
      toast.error('Failed to delete call target');
      console.error(error);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to calculate days between dates
  const getDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Helper function to get employee display name
  const getEmployeeDisplayName = (emp) => {
    return emp.full_name || emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown';
  };

  return (
    <div className="container-fluid py-4">
      {/* Header matching Route Target List */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{color: '#7f1d1d', fontWeight: '700', fontSize: '18px', margin: 0}}>
          Call Target List
        </h1>
        <button 
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/target/call/assign')}
        >
          <i className="fas fa-plus me-2"></i>
          Assign New Target
        </button>
      </div>

      {/* Filters Section - Vertical Layout like Route Target List */}
      <div style={{marginBottom: '24px'}}>
        <div style={{marginBottom: '16px'}}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#374151',
            fontWeight: '600',
            fontSize: '14px'
          }}>Filter by Employee</label>
          <select 
            style={{
              width: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white'
            }}
            name="employee"
            value={filters.employee}
            onChange={handleFilterChange}
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_id} - {getEmployeeDisplayName(emp)}
              </option>
            ))}
          </select>
        </div>

        <div style={{marginBottom: '16px'}}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#374151',
            fontWeight: '600',
            fontSize: '14px'
          }}>Start Date (From)</label>
          <input 
            type="date" 
            style={{
              width: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white'
            }}
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
          />
        </div>

        <div style={{marginBottom: '16px'}}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#374151',
            fontWeight: '600',
            fontSize: '14px'
          }}>End Date (To)</label>
          <input 
            type="date" 
            style={{
              width: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white'
            }}
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
          />
        </div>

        <button 
          style={{
            background: '#7f1d1d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
          onClick={resetFilters}
        >
          Reset Filters
        </button>

        <div style={{marginBottom: '16px'}}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#374151',
            fontWeight: '600',
            fontSize: '14px'
          }}>Filter by Call Status</label>
          <select 
            style={{
              width: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white'
            }}
            value=""
            onChange={() => {}}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table matching Route Target List style */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '40px 20px', color: '#6b7280'}}>
          <div style={{margin: '0 auto 12px', width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTop: '3px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
          <p>Loading call targets...</p>
        </div>
      ) : targets.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px 20px', color: '#6b7280'}}>
          <i className="fas fa-phone" style={{fontSize: '48px', marginBottom: '16px', color: '#d1d5db'}}></i>
          <h3 style={{color: '#374151', marginBottom: '8px'}}>No Call Targets Found</h3>
          <p style={{marginBottom: '20px'}}>No call targets match your current filters.</p>
          <button 
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/target/call/assign')}
          >
            Create New Target
          </button>
        </div>
      ) : (
        <div className="table-responsive" style={{background: 'white', borderRadius: '8px', overflow: 'hidden'}}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: 0
          }}>
            <thead>
              <tr style={{background: '#f8fafc'}}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e5e7eb'
                }}>Employee</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e5e7eb'
                }}>Period</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e5e7eb'
                }}>Target Calls</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e5e7eb'
                }}>Achieved Calls</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e5e7eb'
                }}>Target Amount</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e5e7eb'
                }}>Achievement %</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e5e7eb'
                }}>Status</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '1px solid #e5e7eb'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.map(target => {
                const targetCalls = target.total_target_calls || 0;
                const achievedCalls = target.total_achieved_calls || 0;
                const achievement = targetCalls > 0 
                  ? ((achievedCalls / targetCalls) * 100).toFixed(1)
                  : '0.0';
                const targetAmount = targetCalls * 100; // Assuming 100 per call
                
                return (
                  <tr key={target.id} style={{'&:hover': {background: '#fafafa'}}}>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      minWidth: '200px'
                    }}>
                      <div style={{color: '#1f2937', fontWeight: '600', fontSize: '15px', marginBottom: '4px', lineHeight: '1.2'}}>
                        {target.employee_name || 'Unknown'}
                      </div>
                      <div style={{margin: 0, fontSize: '13px'}}>
                        <a 
                          href={`mailto:${target.employee_email}`} 
                          style={{color: '#6b7280', textDecoration: 'none'}}
                          onMouseOver={(e) => e.target.style.color = '#dc2626'}
                          onMouseOut={(e) => e.target.style.color = '#6b7280'}
                        >
                          {target.employee_email || target.employee_id_display || 'No email'}
                        </a>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      minWidth: '140px'
                    }}>
                      <div style={{color: '#374151', fontWeight: '600', fontSize: '14px', marginBottom: '4px'}}>
                        {formatDate(target.start_date)} - {formatDate(target.end_date)}
                      </div>
                      <div style={{color: '#6b7280', fontSize: '13px', margin: 0}}>
                        {getDaysBetween(target.start_date, target.end_date)} days
                      </div>
                    </td>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      textAlign: 'center'
                    }}>
                      <span style={{color: '#1f2937', fontWeight: '700', fontSize: '16px'}}>
                        {targetCalls}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      textAlign: 'center'
                    }}>
                      <span style={{color: '#1f2937', fontWeight: '700', fontSize: '16px'}}>
                        {achievedCalls}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      textAlign: 'center'
                    }}>
                      <span style={{color: '#1f2937', fontWeight: '700', fontSize: '16px'}}>
                        ₹{targetAmount.toFixed(2)}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      textAlign: 'center'
                    }}>
                      <span style={{color: '#374151', fontWeight: '600', fontSize: '14px'}}>
                        {achievement}%
                      </span>
                    </td>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      textAlign: 'center'
                    }}>
                      <i 
                        className={`fas fa-check-circle`}
                        style={{
                          fontSize: '20px',
                          color: target.is_active ? '#10b981' : '#6b7280'
                        }}
                      ></i>
                    </td>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      textAlign: 'center'
                    }}>
                      <button 
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                        onMouseOut={(e) => e.target.style.background = '#dc2626'}
                        onClick={() => handleDelete(target.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CallTargetList;