// src/components/TargetManagement/RouteTargetList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/client";

const RouteTargetList = () => {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRouteId, setExpandedRouteId] = useState(null);
  const [filters, setFilters] = useState({
    employee: '', // FIXED: Changed from employee_id to employee
    start_date: '',
    end_date: '',
    route: '' // FIXED: Changed from route_id to route
  });

  const [employees, setEmployees] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      // FIXED: Removed /api prefix since it's already in the baseURL
      const [empRes, routeRes] = await Promise.all([
        api.get('/employee-management/employees/'),
        api.get('/target-management/routes/')
      ]);

      setEmployees(empRes.data.results || empRes.data);
      setRoutes(routeRes.data.results || routeRes.data);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load initial data');
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

      // FIXED: Removed /api prefix since it's already in the baseURL
      const response = await api.get(`/target-management/route-targets/?${params}`);
      setTargets(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load route targets');
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
      end_date: '',
      route: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route target?')) {
      return;
    }

    try {
      // FIXED: Removed /api prefix since it's already in the baseURL
      await api.delete(`/target-management/route-targets/${id}/`);
      toast.success('Route target deleted successfully');
      fetchTargets();
    } catch (error) {
      toast.error('Failed to delete route target');
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

  // FIXED: Helper function to get employee display name
  const getEmployeeDisplayName = (emp) => {
    return emp.full_name || emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown';
  };

  // Helper for percentage color
  const pctColor = (val) => { 
    const n = parseFloat(val); 
    return n >= 80 ? '#16a34a' : n >= 50 ? '#d97706' : '#dc2626'; 
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <h6 className="mb-3" style={{ fontSize: '1rem', fontWeight: 600, color: '#344054' }}>Route Target List</h6>
              
              {/* Compact Filter Bar */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.75rem', 
                alignItems: 'flex-end', 
                padding: '0.75rem 1rem', 
                background: '#f8fafc', 
                borderRadius: 8, 
                border: '1px solid #e5e7eb',
                marginBottom: '1rem'
              }}>
                {/* Employee Filter */}
                <div style={{ flex: '0 0 auto', minWidth: '180px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>
                    Employee
                  </label>
                  <select
                    name="employee"
                    className="form-select"
                    value={filters.employee}
                    onChange={handleFilterChange}
                    style={{ fontSize: '0.8rem', height: '32px', padding: '0.25rem 0.5rem' }}
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employee_id} - {getEmployeeDisplayName(emp)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Route Filter */}
                <div style={{ flex: '0 0 auto', minWidth: '160px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>
                    Route
                  </label>
                  <select
                    name="route"
                    className="form-select"
                    value={filters.route}
                    onChange={handleFilterChange}
                    style={{ fontSize: '0.8rem', height: '32px', padding: '0.25rem 0.5rem' }}
                  >
                    <option value="">All Routes</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.origin} → {route.destination}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div style={{ flex: '0 0 auto', minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-control"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    style={{ fontSize: '0.8rem', height: '32px', padding: '0.25rem 0.5rem' }}
                  />
                </div>

                {/* End Date */}
                <div style={{ flex: '0 0 auto', minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    className="form-control"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    style={{ fontSize: '0.8rem', height: '32px', padding: '0.25rem 0.5rem' }}
                  />
                </div>

                {/* Reset Button */}
                <div style={{ flex: '0 0 auto' }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={resetFilters}
                    style={{ fontSize: '0.75rem', height: '32px', padding: '0.25rem 0.75rem', fontWeight: 500 }}
                  >
                    Reset
                  </button>
                </div>

                {/* Spacer */}
                <div style={{ flex: '1 1 auto' }}></div>

                {/* Assign New Button */}
                <div style={{ flex: '0 0 auto' }}>
                  <button
                    className="btn btn-danger"
                    onClick={() => navigate('/target/route/assign')}
                    style={{ fontSize: '0.75rem', height: '32px', padding: '0.25rem 1rem', fontWeight: 600 }}
                  >
                    + Assign New Target
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="card-body" style={{ paddingTop: '0.5rem' }}>
              <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <table className="table align-items-center mb-0 tm-table" style={{ tableLayout: 'fixed', width: '95%', margin: '0 auto' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '26%', padding: '0.5rem 0.75rem' }}>
                        Employee
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '24%', padding: '0.5rem 0.75rem' }}>
                        Route
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '20%', padding: '0.5rem 0.75rem' }}>
                        Period
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '8%', padding: '0.5rem 0.25rem' }}>
                        Status
                      </th>
                      <th className="text-secondary opacity-7" style={{ width: '22%', padding: '0.5rem 0.75rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center" style={{ padding: '1rem' }}>
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : targets.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted" style={{ padding: '1rem' }}>
                          No route targets found
                        </td>
                      </tr>
                    ) : (
                      targets.map(target => (
                        <React.Fragment key={target.id}>
                          <tr>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <div className="d-flex">
                                <div className="d-flex flex-column justify-content-center">
                                  <h6 className="mb-0 text-sm">{target.employee_name || 'N/A'}</h6>
                                  <p className="text-xs text-secondary mb-0">
                                    {target.employee_email ? (
                                      <a href={`mailto:${target.employee_email}`} style={{color:'#6b7280', textDecoration:'none'}}>{target.employee_email}</a>
                                    ) : (target.employee_id_display || 'N/A')}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <p className="text-xs font-weight-bold mb-0">
                                {target.route_origin} → {target.route_destination}
                              </p>
                              <p className="text-xs text-secondary mb-0">{target.route_code || 'N/A'}</p>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <p className="text-xs font-weight-bold mb-0">
                                {formatDate(target.start_date)} - {formatDate(target.end_date)}
                              </p>
                              <p className="text-xs text-secondary mb-0">
                                {getDaysBetween(target.start_date, target.end_date)} days
                              </p>
                            </td>
                            <td className="align-middle text-center" style={{ padding: '0.5rem 0.25rem' }}>
                              <div className={`status-icon ${target.is_active ? 'status-active' : 'status-inactive'}`} style={{ display: 'inline-block' }}>
                                {target.is_active ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#10b981"/>
                                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#6b7280"/>
                                    <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </td>
                            <td className="align-middle text-end" style={{ padding: '0.5rem 0.75rem' }}>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => setExpandedRouteId(expandedRouteId === target.id ? null : target.id)}
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                              >
                                {expandedRouteId === target.id ? 'Hide Parameters' : 'View Parameters'}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(target.id)}
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          
                          {expandedRouteId === target.id && (
                            <tr>
                              <td colSpan="5" style={{ padding: 0, background: '#f8fafc' }}>
                                <div style={{ padding: '1rem', borderTop: '2px solid #e5e7eb' }}>
                                  <h6 className="mb-3" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                    Target Parameters
                                  </h6>
                                  <div className="table-responsive">
                                    <table className="table table-sm align-items-center mb-0" style={{ fontSize: '0.75rem' }}>
                                      <thead style={{ background: '#ffffff' }}>
                                        <tr>
                                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '15%' }}>
                                            Parameter Type
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '12%' }}>
                                            Target Value
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '12%' }}>
                                            Achieved Target
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '12%' }}>
                                            Achievement %
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '15%' }}>
                                            Target ₹
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '15%' }}>
                                            Achieved ₹
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '15%' }}>
                                            Incentive (₹)
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {target.target_parameters && target.target_parameters.length > 0 ? (
                                          target.target_parameters.map((param) => {
                                            const paramTypeLabels = {
                                              'TPA': 'Total Parties Attended',
                                              'T_COLLECTION': 'Target Collection',
                                              'POM': 'Product of the Month',
                                              'SALES_TARGET': 'Sales Target'
                                            };
                                            const achievementPct = param.achievement_percentage || 0;
                                            return (
                                              <tr key={param.id} style={{ background: '#ffffff' }}>
                                                <td style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs font-weight-bold">
                                                    {paramTypeLabels[param.parameter_type] || param.parameter_type}
                                                  </span>
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs text-secondary">
                                                    {Number(param.target_value || 0).toFixed(2)}
                                                  </span>
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs font-weight-bold">
                                                    {Number(param.achieved_value || 0).toFixed(2)}
                                                  </span>
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <span 
                                                    className="text-xs font-weight-bold" 
                                                    style={{ color: pctColor(achievementPct) }}
                                                  >
                                                    {achievementPct.toFixed(2)}%
                                                  </span>
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs text-secondary">
                                                    ₹{Number(param.target_value || 0).toFixed(2)}
                                                  </span>
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs font-weight-bold">
                                                    ₹{Number(param.achieved_value || 0).toFixed(2)}
                                                  </span>
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs text-secondary">
                                                    ₹{Number(param.incentive_value || 0).toFixed(2)}
                                                  </span>
                                                </td>
                                              </tr>
                                            );
                                          })
                                        ) : (
                                          <tr>
                                            <td colSpan="7" className="text-center text-muted" style={{ padding: '1rem' }}>
                                              No parameters assigned
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteTargetList;