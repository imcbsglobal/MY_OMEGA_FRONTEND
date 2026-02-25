// src/components/TargetManagement/Marketing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/client";

const Marketing = () => {
  const navigate = useNavigate();
  const [marketingData, setMarketingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: '',
    start_date: '',
    end_date: '',
    status: ''
  });

  const [employees, setEmployees] = useState([]);
  const [expandedMarketingId, setExpandedMarketingId] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const highlightTimerRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Listen for global changes (assignments) and refresh list
  useEffect(() => {
    const handler = async (e) => {
      try {
        const id = (e && e.detail && e.detail.id) || (typeof window !== 'undefined' && window.__lastMarketingTargetChanged) || null;
        if (id) {
          // fetch single updated target and merge into list
          try {
            const resp = await api.get(`/target-management/marketing-targets/${id}/`);
            const r = resp.data || resp.data?.results || resp.data?.data || resp;
            // normalize single record to match list shape
            const paramsArr = Array.isArray(r.target_parameters) ? r.target_parameters.map(p => ({
              id: p.id,
              parameter_type: p.parameter_type,
              parameter_label: p.parameter_label || p.parameter_type,
              target_value: Number(p.target_value) || 0,
              achieved_value: Number(p.achieved_value) || 0,
              incentive_value: Number(p.incentive_value) || 0,
              achievement_percentage: Number(p.achievement_percentage) || 0
            })) : [];

            const normalizedRecord = {
              id: r.id,
              employee_name: r.employee_name || (r.employee && (r.employee.full_name || r.employee.name)) || '',
              employee_email: r.employee_email || (r.employee && (r.employee.user_email || (r.employee.user && r.employee.user.email))) || '',
              employee_id_display: r.employee_id_display || (r.employee && (r.employee.employee_id || r.employee.id)) || '',
              start_date: r.start_date,
              end_date: r.end_date,
              is_active: typeof r.is_active === 'boolean' ? r.is_active : (r.is_active === 'true' || r.is_active === 1),
              target_parameters: paramsArr
            };

            setMarketingData(prev => {
              if (!Array.isArray(prev)) return [normalizedRecord];
              const found = prev.findIndex(x => x && x.id === normalizedRecord.id);
              if (found === -1) return [normalizedRecord, ...prev];
              const copy = [...prev];
              copy[found] = normalizedRecord;
              return copy;
            });
            // Highlight the updated row briefly
            try {
              setHighlightedId(id);
              if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
              highlightTimerRef.current = setTimeout(() => setHighlightedId(null), 1500);
            } catch (e) {
              /* ignore */
            }
            return;
          } catch (err) {
            console.warn('Failed to fetch single updated marketing target', err);
            // fallback to full refresh
            await fetchMarketingData();
            return;
          }
        }
      } catch (err) {
        console.warn('marketingTargetChanged handler error', err);
      }
      // no id provided - refresh full list
      fetchMarketingData();
    };

    window.addEventListener('marketingTargetChanged', handler);
    return () => window.removeEventListener('marketingTargetChanged', handler);
  }, []);

  useEffect(() => {
    fetchMarketingData();
  }, [filters]);

  // Auto-expand first item for easier verification in dev
  useEffect(() => {
    if (!loading && Array.isArray(marketingData) && marketingData.length > 0) {
      setExpandedMarketingId(prev => prev || marketingData[0].id);
    }
  }, [loading, marketingData]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employee-management/employees/');
      setEmployees(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    }
  };

  async function fetchMarketingData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      // If no employee filter is provided and user is not an admin, request only the current user's targets
      let queryString = params.toString();
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userLevel = storedUser?.user_level || 'User';
        const isAdminUser = !!(
          (userLevel === 'Admin' || userLevel === 'Super Admin') ||
          storedUser?.is_staff || storedUser?.is_superuser ||
          localStorage.getItem('is_admin') === 'true'
        );

        if (!isAdminUser && !filters.employee) {
          // request self targets
          if (queryString) queryString += '&self=1'; else queryString = 'self=1';
        }
      } catch (e) {
        // ignore parsing errors, fall back to default
        if (!queryString) queryString = '';
      }

      // Fetch real marketing target list from backend
      const requestPath = `/target-management/marketing-targets/${queryString ? ('?' + queryString) : ''}`;
      // Ensure isAdminUser is defined in this scope for debugging
      let isAdminUser = false;
      try {
        const storedForLog = JSON.parse(localStorage.getItem('user') || '{}');
        // replicate admin detection used above (if inner try failed this keeps a boolean)
        const userLevelLog = storedForLog?.user_level || 'User';
        isAdminUser = !!(
          (userLevelLog === 'Admin' || userLevelLog === 'Super Admin') ||
          storedForLog?.is_staff || storedForLog?.is_superuser ||
          localStorage.getItem('is_admin') === 'true'
        );
        console.log('[Marketing] Stored user parsed:', storedForLog);
      } catch (e) {
        console.warn('[Marketing] Failed to parse stored user for debug log', e);
      }
      console.log('[Marketing] isAdminUser:', isAdminUser, 'constructed queryString:', queryString);
      console.log('[Marketing] Requesting:', requestPath);
      let response = await api.get(requestPath);
      console.log('[API Response] /marketing-targets raw:', response.data);

      // If no results and self=1 was used, fallback to employee id from localStorage
      try {
        const respData = response.data && typeof response.data === 'object' && Array.isArray(response.data.results) ? response.data.results : response.data;
        const itemsCount = Array.isArray(respData) ? respData.length : (respData ? (respData.results ? respData.results.length : 0) : 0);
        if (itemsCount === 0 && queryString.includes('self=1')) {
          const empPk = localStorage.getItem('employee_pk');
          const empId = localStorage.getItem('employee_id');
          if (empPk) {
            const fallbackPath = `/target-management/marketing-targets/?employee=${empPk}`;
            console.log('[Marketing] No items for self=1, trying fallback (pk):', fallbackPath);
            response = await api.get(fallbackPath);
            console.log('[Marketing] Fallback (pk) response:', response.data);
          }
          if ((Array.isArray(response.data) ? response.data.length === 0 : (response.data && Array.isArray(response.data.results) ? response.data.results.length === 0 : true)) && empId) {
            const fallbackPath2 = `/target-management/marketing-targets/?employee=${empId}`;
            console.log('[Marketing] No items for self=1/fallback(pk), trying fallback (employee_id):', fallbackPath2);
            response = await api.get(fallbackPath2);
            console.log('[Marketing] Fallback (employee_id) response:', response.data);
          }
        }
      } catch (e) {
        console.warn('[Marketing] Failed to evaluate fallback condition', e);
      }
      // Debug: log raw target_parameters for each record to help diagnose missing params
      try {
        const respData = response.data && typeof response.data === 'object' && Array.isArray(response.data.results) ? response.data.results : response.data;
        if (Array.isArray(respData)) {
          respData.forEach(r => {
            console.log(`[RAW PARAMS] marketing id=${r && r.id}`, r && r.target_parameters);
          });
        }
      } catch (e) {
        console.warn('Failed to inspect raw params', e);
      }
      let data = response.data;
      // If paginated, use results
      if (data && typeof data === 'object' && Array.isArray(data.results)) {
        data = data.results;
      }
      if (!Array.isArray(data)) {
        data = [];
      }

      // Normalize records to expected frontend shape
      const normalized = data.map(r => {
        const paramsArr = Array.isArray(r.target_parameters) ? r.target_parameters.map(p => ({
          id: p.id,
          parameter_type: p.parameter_type,
          parameter_label: p.parameter_label || p.parameter_type,
          target_value: Number(p.target_value) || 0,
          achieved_value: Number(p.achieved_value) || 0,
          incentive_value: Number(p.incentive_value) || 0,
          achievement_percentage: Number(p.achievement_percentage) || 0
        })) : [];

        return {
          id: r.id,
          employee_name: r.employee_name || (r.employee && (r.employee.full_name || r.employee.name)) || '',
          employee_email: r.employee_email || (r.employee && (r.employee.user_email || (r.employee.user && r.employee.user.email))) || '',
          employee_id_display: r.employee_id_display || (r.employee && (r.employee.employee_id || r.employee.id)) || '',
          start_date: r.start_date,
          end_date: r.end_date,
          is_active: typeof r.is_active === 'boolean' ? r.is_active : (r.is_active === 'true' || r.is_active === 1),
          target_parameters: paramsArr
        };
      });
      // Apply client-side status filter if provided
      let finalList = normalized;
      if (filters.status) {
        finalList = normalized.filter(t => {
          // compute an overall percentage as average of parameter percentages
          const params = t.target_parameters || [];
          const avg = params.length > 0 ? (params.reduce((s, p) => s + (Number(p.achievement_percentage) || 0), 0) / params.length) : 0;
          if (filters.status === 'pending') return avg < 50;
          if (filters.status === 'in_progress') return avg >= 50 && avg < 80;
          if (filters.status === 'completed') return avg >= 80;
          return true;
        });
      }

      console.log('[API Normalized] marketing targets:', normalized);
      setMarketingData(finalList);
      console.log('[Marketing] setMarketingData length:', normalized.length);
    } catch (error) {
      console.error('Failed to load marketing targets:', error);
      toast.error('Failed to load marketing targets');
      setMarketingData([]);
    } finally {
      setLoading(false);
    }
  }

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
    if (!window.confirm('Are you sure you want to delete this marketing target?')) {
      return;
    }

    try {
      await api.delete(`/target-management/marketing-targets/${id}/`);
      toast.success('Marketing target deleted successfully');
      fetchMarketingData();
    } catch (error) {
      toast.error('Failed to delete marketing target');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getEmployeeDisplayName = (emp) => {
    return emp.full_name || emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown';
  };


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
              <h6 className="mb-3" style={{ fontSize: '1rem', fontWeight: 600, color: '#344054' }}>Marketing Target List</h6>
              
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
                        {getEmployeeDisplayName(emp)}
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

                {/* Status Filter */}
                <div style={{ flex: '0 0 auto', minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    name="status"
                    className="form-select"
                    value={filters.status}
                    onChange={handleFilterChange}
                    style={{ fontSize: '0.8rem', height: '32px', padding: '0.25rem 0.5rem' }}
                  >
                    <option value="">All</option>
                    <option value="pending">Needs Attention (&lt;50%)</option>
                    <option value="in_progress">On Track (50-79%)</option>
                    <option value="completed">Excellent (&gt;=80%)</option>
                  </select>
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
                    onClick={() => navigate('/target/call/marketing/assign')}
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
                <table className="table align-items-center mb-0" style={{ tableLayout: 'fixed', width: '95%', margin: '0 auto' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '35%', padding: '0.5rem 0.75rem' }}>
                        Employee
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '30%', padding: '0.5rem 0.75rem' }}>
                        Period
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '12%', padding: '0.5rem 0.75rem' }}>
                        Target
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '12%', padding: '0.5rem 0.25rem' }}>
                        Achieved
                      </th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '12%', padding: '0.5rem 0.25rem' }}>
                        Status
                      </th>
                      <th className="text-secondary opacity-7" style={{ width: '23%', padding: '0.5rem 0.75rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center" style={{ padding: '1rem' }}>
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : marketingData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted" style={{ padding: '1rem' }}>
                          <div style={{ marginBottom: '8px' }}>No marketing targets found.</div>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn btn-sm btn-outline-primary" onClick={fetchMarketingData} style={{ fontSize: '0.75rem' }}>Refresh</button>
                            <button className="btn btn-sm btn-danger" onClick={() => navigate('/target/call/marketing/assign')} style={{ fontSize: '0.75rem' }}>Assign New Target</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      marketingData.map(target => (
                        <React.Fragment key={target.id}>
                          <tr style={{ background: highlightedId === target.id ? '#fffbeb' : undefined, transition: 'background 0.25s ease' }}>
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
                                {formatDate(target.start_date)} - {formatDate(target.end_date)}
                              </p>
                              <p className="text-xs text-secondary mb-0">
                                {getDaysBetween(target.start_date, target.end_date)} days
                              </p>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                              <div style={{ fontWeight: 700 }}>{
                                (Array.isArray(target.target_parameters) ? target.target_parameters.reduce((s, p) => s + (Number(p.target_value) || 0), 0) : 0).toLocaleString(undefined, {maximumFractionDigits:2})
                              }</div>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                              <div style={{ fontWeight: 700 }}>
                                {(Array.isArray(target.target_parameters) ? target.target_parameters.reduce((s, p) => s + (Number(p.achieved_value) || 0), 0) : 0).toLocaleString(undefined, {maximumFractionDigits:2})}
                              </div>
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
                                onClick={() => setExpandedMarketingId(expandedMarketingId === target.id ? null : target.id)}
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                              >
                                {expandedMarketingId === target.id ? 'Hide Parameters' : 'View Parameters'}
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
                          
                          {expandedMarketingId === target.id && (
                            <tr>
                              <td colSpan="4" style={{ padding: 0, background: '#f8fafc' }}>
                                <div style={{ padding: '1rem', borderTop: '2px solid #e5e7eb' }}>
                                  <h6 className="mb-3" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                    Target Parameters
                                  </h6>
                                  <div className="table-responsive">
                                    <table className="table table-sm align-items-center mb-0" style={{ fontSize: '0.75rem' }}>
                                      <thead style={{ background: '#ffffff' }}>
                                        <tr>
                                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '30%' }}>
                                            Parameter Type
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '15%' }}>
                                            Target Value
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '12%' }}>
                                            Incentive Value (₹)
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '12%' }}>
                                            Achieved
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '15%' }}>
                                            Achieved Amount
                                          </th>
                                          <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ width: '20%' }}>
                                            Achievement %
                                          </th>
                                          
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {target.target_parameters && target.target_parameters.length > 0 ? (
                                          target.target_parameters.map((param) => {
                                            const achievementPct = param.achievement_percentage || 0;
                                            return (
                                              <tr key={param.id} style={{ background: '#ffffff' }}>
                                                <td style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs font-weight-bold">
                                                    {param.parameter_label || param.parameter_type}
                                                  </span>
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs text-secondary">
                                                    {Number(param.target_value || 0).toLocaleString()}
                                                  </span>
                                                </td>
                                                  <td className="text-center" style={{ padding: '0.5rem' }}>
                                                    <span className="text-xs text-secondary">₹ {Number(param.incentive_value || 0).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                                                  </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <span className="text-xs font-weight-bold">
                                                    {Number(param.achieved_value || 0).toLocaleString()}
                                                  </span>
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  {(() => {
                                                    const achieved = Number(param.achieved_value || 0);
                                                    const incentive = Number(param.incentive_value || 0);
                                                    const targetVal = Number(param.target_value || 0);
                                                    const achievementPct = Number(param.achievement_percentage || (param.target_value ? (Number(param.achieved_value || 0) / Number(param.target_value || 1)) * 100 : 0)) || 0;
                                                    let amount = 0;
                                                    if (incentive && incentive !== 0) {
                                                      amount = achieved * incentive;
                                                    } else if (achievementPct && targetVal && targetVal !== 0) {
                                                      amount = (achievementPct / 100) * targetVal;
                                                    } else {
                                                      amount = achieved * incentive;
                                                    }
                                                    return <span className="text-xs text-secondary">{amount.toLocaleString(undefined, {maximumFractionDigits:2})}</span>;
                                                  })()}
                                                </td>
                                                <td className="text-center" style={{ padding: '0.5rem' }}>
                                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                    <span 
                                                      className="text-xs font-weight-bold" 
                                                      style={{ color: pctColor(achievementPct) }}
                                                    >
                                                      {achievementPct.toFixed(2)}%
                                                    </span>
                                                    <div style={{ 
                                                      width: '80px', 
                                                      height: '4px', 
                                                      background: '#f1f5f9', 
                                                      borderRadius: '2px',
                                                      overflow: 'hidden'
                                                    }}>
                                                      <div style={{
                                                        width: `${Math.min(achievementPct, 100)}%`,
                                                        height: '100%',
                                                        background: pctColor(achievementPct),
                                                        transition: 'width 0.3s ease'
                                                      }}></div>
                                                    </div>
                                                  </div>
                                                </td>
                                                
                                              </tr>
                                            );
                                          })
                                        ) : (
                                          <tr>
                                            <td colSpan="6" className="text-center text-muted" style={{ padding: '1rem' }}>
                                              No parameters available
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

export default Marketing;
