// src/components/TargetManagement/CallTargetList.jsx
import React, { useState, useEffect } from 'react';
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

  // Helper function to get employee display name
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
                <h6>Call Target List</h6>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/target/call/assign')}
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

              {/* Table */}
              <div className="table-responsive">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Employee
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                        Period
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Target Calls
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Achieved Calls
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
                        <td colSpan="7" className="text-center">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : targets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          No call targets found
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
                              {formatDate(target.start_date)} - {formatDate(target.end_date)}
                            </p>
                            <p className="text-xs text-secondary mb-0">
                              {getDaysBetween(target.start_date, target.end_date)} days
                            </p>
                          </td>
                          <td className="align-middle text-center text-sm">
                            <span className="text-secondary text-xs font-weight-bold">
                              {target.total_target_calls || 0}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <span className="text-secondary text-xs font-weight-bold">
                              {target.total_achieved_calls || 0}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <div className="progress-wrapper w-75 mx-auto">
                              <div className="progress-info">
                                <div className="progress-percentage">
                                  <span className="text-xs font-weight-bold">
                                    {target.achievement_percentage?.toFixed(2) || 0}%
                                  </span>
                                </div>
                              </div>
                              <div className="progress">
                                <div
                                  className={`progress-bar ${
                                    (target.achievement_percentage || 0) >= 80 ? 'bg-gradient-success' :
                                    (target.achievement_percentage || 0) >= 50 ? 'bg-gradient-warning' :
                                    'bg-gradient-danger'
                                  }`}
                                  role="progressbar"
                                  style={{ width: `${Math.min(target.achievement_percentage || 0, 100)}%` }}
                                  aria-valuenow={target.achievement_percentage || 0}
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

export default CallTargetList;