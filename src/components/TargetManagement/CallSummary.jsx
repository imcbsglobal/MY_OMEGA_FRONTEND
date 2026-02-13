// src/components/TargetManagement/CallSummary.jsx
// FIXES APPLIED:
//   F-04: Split into two separate API calls:
//         - /call-targets/ for the paginated list table
//         - /reports/call-summary/ for the aggregate summary cards
//   Also: Fixed employee dropdown to use actual employee names from list data
//   Also: Fixed ₹ symbol encoding (was corrupted as â‚¹)

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../../api/client";
import "./targetManagement.css";

export default function CallSummary() {
  const navigate = useNavigate();

  // Separate state for list vs summary
  const [listData, setListData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetFilters = () => {
    setEmployeeFilter('');
    setStartDate('');
    setEndDate('');
  };

  // FIX F-04: Fetch list and summary from their correct separate endpoints
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (employeeFilter) params.employee = employeeFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [listRes, summaryRes] = await Promise.all([
        api.get('/target-management/call-targets/', { params }),
        api.get('/target-management/reports/call-summary/', { params }),
      ]);

      const list = listRes.data.results ?? (Array.isArray(listRes.data) ? listRes.data : []);
      setListData(list);
      setSummaryData(summaryRes.data);

      // Build employee filter dropdown from the list
      const uniqueEmployees = [];
      const seen = new Set();
      list.forEach(row => {
        const key = row.employee;
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueEmployees.push({ id: key, name: row.employee_name || `Employee ${key}` });
        }
      });
      setEmployeeOptions(uniqueEmployees);
    } catch (err) {
      console.error('CallSummary fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeFilter, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmtDMY = (dstr) => {
    if (!dstr) return '-';
    const d = new Date(dstr);
    if (isNaN(d)) return dstr;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const fmt = (v) => (v == null ? '-' : new Intl.NumberFormat().format(v));

  const pct = (v) => {
    if (v == null) return '-';
    const n = parseFloat(v);
    return isNaN(n) ? '-' : `${n.toFixed(2)}%`;
  };

  const pctColor = (v) => {
    const n = parseFloat(v);
    if (n >= 80) return '#16a34a';
    if (n >= 50) return '#d97706';
    return '#dc2626';
  };

  // Summary card metrics mapped from backend response
  const summaryCards = summaryData
    ? [
        { label: 'Total Periods', value: fmt(summaryData.total_periods ?? summaryData.total_targets ?? 0) },
        { label: 'Total Target Calls', value: fmt(summaryData.total_target_calls ?? 0) },
        { label: 'Total Achieved Calls', value: fmt(summaryData.total_achieved_calls ?? 0) },
        { label: 'Call Achievement %', value: pct(summaryData.call_achievement_percentage ?? summaryData.calls_achievement_percentage ?? 0) },
        { label: 'Productive Calls', value: fmt(summaryData.total_productive_calls ?? 0) },
        { label: 'Productivity %', value: pct(summaryData.productivity_percentage ?? 0) },
        { label: 'Total Orders', value: fmt(summaryData.total_orders ?? summaryData.total_order_received ?? 0) },
        { label: 'Total Order Amount', value: summaryData.total_order_amount != null ? `₹${fmt(summaryData.total_order_amount)}` : '-' },
      ]
    : [];

  return (
    <div className="tm-page">
      {/* Page Header */}
      <div className="tm-card" style={{ marginBottom: 16 }}>
        <div className="tm-header">
          <div>
            <h3 className="tm-title">Call Target List</h3>
            <p className="tm-sub">View and manage all assigned call targets</p>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => navigate('/target/call/assign')}
          >
            + Assign New Target
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="tm-top-stats" style={{ marginBottom: 16 }}>
          {summaryCards.map(card => (
            <div key={card.label} className="stat-card tm-card">
              <p className="stat-label">{card.label}</p>
              <div className="stat-value">{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + Table */}
      <div className="tm-card">
        <div className="tm-filters" style={{ marginBottom: 16 }}>
          <div className="tm-filter-col">
            <label className="form-label">Filter by Employee</label>
            <select
              className="form-control"
              value={employeeFilter}
              onChange={e => setEmployeeFilter(e.target.value)}
            >
              <option value="">All Employees</option>
              {employeeOptions.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="tm-filter-col">
            <label className="form-label">Start Date</label>
            <input
              type="date" className="form-control"
              value={startDate} onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="tm-filter-col">
            <label className="form-label">End Date</label>
            <input
              type="date" className="form-control"
              value={endDate} onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <div className="tm-filter-actions">
            <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>
              Reset
            </button>
            <button className="btn btn-sm btn-danger ms-2" onClick={fetchData}>
              Apply
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-danger" role="status" />
          </div>
        ) : listData.length === 0 ? (
          <div className="alert alert-info">No call targets found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table tm-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th className="text-center">Target Calls</th>
                  <th className="text-center">Achieved Calls</th>
                  <th className="text-center">Achievement %</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listData.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{row.employee_name || `Employee ${row.employee}`}</div>
                      {row.employee_email && (
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          <a href={`mailto:${row.employee_email}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
                            {row.employee_email}
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {row.period_display || `${fmtDMY(row.start_date)} – ${fmtDMY(row.end_date)}`}
                      </div>
                      {row.duration_days && (
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{row.duration_days} days</div>
                      )}
                    </td>
                    <td className="text-center">{row.total_target_calls ?? 0}</td>
                    <td className="text-center">{row.total_achieved_calls ?? 0}</td>
                    <td className="text-center">
                      <span style={{ color: pctColor(row.achievement_percentage), fontWeight: 600 }}>
                        {pct(row.achievement_percentage)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${row.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          if (window.confirm(`Delete call target for ${row.employee_name}?`)) {
                            api.delete(`/target-management/call-targets/${row.id}/`)
                              .then(() => fetchData())
                              .catch(err => console.error(err));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}