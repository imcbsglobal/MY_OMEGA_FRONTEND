// src/components/TargetManagement/RouteTargetList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/client";

const RouteTargetList = () => {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <div className="d-flex align-items-center justify-content-between">
                <h6>Route Target List</h6>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/target/route/assign')}
                >
                  + Assign New Target
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4 mb-2">
                  <label className="form-label text-xs">Filter by Employee</label>
                  <select
                    name="employee"
                    className="form-select form-select-sm"
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

                <div className="col-md-3 mb-2">
                  <label className="form-label text-xs">Start Date (From)</label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-control form-control-sm"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="col-md-3 mb-2">
                  <label className="form-label text-xs">End Date (To)</label>
                  <input
                    type="date"
                    name="end_date"
                    className="form-control form-control-sm"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="col-md-2 mb-2">
                  <label className="form-label text-xs">&nbsp;</label>
                  <button
                    className="btn btn-outline-secondary btn-sm w-100"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 mb-2">
                  <label className="form-label text-xs">Filter by Route</label>
                  <select
                    name="route"
                    className="form-select form-select-sm"
                    value={filters.route}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Routes</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.origin} → {route.destination}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Employee
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Route
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                        Period
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Target Boxes
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Achieved Boxes
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Target Amount
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Achievement %
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Status
                      </th>
                      <th className="text-secondary opacity-7">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="text-center">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : targets.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center text-muted">
                          No route targets found
                        </td>
                      </tr>
                    ) : (
                      targets.map(target => (
                        <tr key={target.id}>
                          <td>
                            <div className="d-flex px-2 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">{target.employee_name || 'N/A'}</h6>
                                <p className="text-xs text-secondary mb-0">{target.employee_id_display || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="text-xs font-weight-bold mb-0">
                              {target.route_origin} → {target.route_destination}
                            </p>
                            <p className="text-xs text-secondary mb-0">{target.route_code || 'N/A'}</p>
                          </td>
                          <td>
                            <p className="text-xs font-weight-bold mb-0">
                              {formatDate(target.start_date)} - {formatDate(target.end_date)}
                            </p>
                            <p className="text-xs text-secondary mb-0">
                              {getDaysBetween(target.start_date, target.end_date)} days
                            </p>
                          </td>
                          <td className="align-middle text-center text-sm">
                            <span className="text-secondary text-xs font-weight-bold">
                              {Number(target.target_boxes || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <span className="text-secondary text-xs font-weight-bold">
                              {Number(target.achieved_boxes || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <span className="text-secondary text-xs font-weight-bold">
                              ₹{Number(target.target_amount || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <div className="progress-wrapper w-75 mx-auto">
                              <div className="progress-info">
                                <div className="progress-percentage">
                                  <span className="text-xs font-weight-bold">
                                    {(target.achievement_percentage_boxes || 0).toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                              <div className="progress">
                                <div
                                  className={`progress-bar ${
                                    (target.achievement_percentage_boxes || 0) >= 80 ? 'bg-gradient-success' :
                                    (target.achievement_percentage_boxes || 0) >= 50 ? 'bg-gradient-warning' :
                                    'bg-gradient-danger'
                                  }`}
                                  role="progressbar"
                                  style={{ width: `${Math.min(target.achievement_percentage_boxes || 0, 100)}%` }}
                                  aria-valuenow={target.achievement_percentage_boxes || 0}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="align-middle text-center">
                            <span className={`badge badge-sm ${target.is_active ? 'bg-gradient-success' : 'bg-gradient-secondary'}`}>
                              {target.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="align-middle">
                            <button
                              className="btn btn-link text-danger text-gradient px-3 mb-0"
                              onClick={() => handleDelete(target.id)}
                            >
                              <i className="far fa-trash-alt me-2"></i>
                              Delete
                            </button>
                          </td>
                        </tr>
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