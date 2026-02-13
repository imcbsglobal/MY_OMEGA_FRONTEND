// src/components/TargetManagement/ComparativePerformance.jsx
// FIXES APPLIED:
//   F-07: Changed from POST body to GET query params (?employees=1,2,3)
//         The backend endpoint is GET /performance/comparative/?employees=1,2,3
//   Also: Added start_date / end_date filters and metric selector

import React, { useState } from 'react';
import api from '../../api/client';
import './targetManagement.css';

export default function ComparativePerformance() {
  const [employees, setEmployees] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [metric, setMetric] = useState('both'); // 'both' | 'route_targets' | 'call_targets'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FIX F-07: Use GET request with query params — NOT POST with body
  const handleFetch = async () => {
    if (!employees.trim()) {
      setError('Please enter at least one employee ID');
      return;
    }
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const res = await api.get('/target-management/performance/comparative/', {
        params: {
          employees: employees.trim(),
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          metric,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error('ComparativePerformance error:', err);
      setError(err?.response?.data?.error || 'Failed to fetch comparative performance');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v) => (v == null ? '-' : new Intl.NumberFormat().format(v));
  const pct = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '-' : `${n.toFixed(2)}%`;
  };
  const pctColor = (v) => {
    const n = parseFloat(v);
    if (n >= 80) return '#16a34a';
    if (n >= 50) return '#d97706';
    return '#dc2626';
  };

  const comparison = data?.comparison || [];

  return (
    <div className="container-fluid py-4">
      <div className="tm-card">
        {/* Header */}
        <div className="tm-header" style={{ marginBottom: 20 }}>
          <div>
            <h4 className="tm-title">Comparative Performance</h4>
            <p className="tm-sub">Compare performance across multiple employees side-by-side</p>
          </div>
        </div>

        {/* Filters */}
        <div className="tm-filters" style={{ marginBottom: 20 }}>
          <div className="tm-filter-col" style={{ flex: 2 }}>
            <label className="form-label">Employee IDs (comma-separated)</label>
            <input
              className="form-control"
              placeholder="e.g. 1,2,3"
              value={employees}
              onChange={e => setEmployees(e.target.value)}
            />
            <small className="text-muted">Enter the numeric IDs of employees to compare</small>
          </div>
          <div className="tm-filter-col">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="tm-filter-col">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="tm-filter-col">
            <label className="form-label">Metric</label>
            <select className="form-control" value={metric} onChange={e => setMetric(e.target.value)}>
              <option value="both">Both (Call + Route)</option>
              <option value="call_targets">Call Targets Only</option>
              <option value="route_targets">Route Targets Only</option>
            </select>
          </div>
          <div className="tm-filter-actions">
            <button
              className="btn btn-danger btn-sm"
              onClick={handleFetch}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-danger" role="status" />
            <p className="mt-2 text-muted">Fetching performance data...</p>
          </div>
        )}

        {/* Results */}
        {!loading && comparison.length > 0 && (
          <div>
            {/* Call Performance Table */}
            {(metric === 'both' || metric === 'call_targets') && (
              <div style={{ marginBottom: 32 }}>
                <h6 className="tm-title" style={{ fontSize: 15, marginBottom: 12 }}>Call Target Performance</h6>
                <div className="table-responsive">
                  <table className="table tm-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Designation</th>
                        <th className="text-center">Target Calls</th>
                        <th className="text-center">Achieved Calls</th>
                        <th className="text-center">Productive Calls</th>
                        <th className="text-center">Orders</th>
                        <th className="text-center">Order Amount</th>
                        <th className="text-center">Achievement %</th>
                        <th className="text-center">Productivity %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((emp, i) => {
                        const cp = emp.call_performance || {};
                        return (
                          <tr key={emp.employee_id || i}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{emp.name}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{emp.employee_code}</div>
                            </td>
                            <td style={{ fontSize: 13 }}>{emp.designation || '-'}</td>
                            <td className="text-center">{fmt(cp.target_calls)}</td>
                            <td className="text-center">{fmt(cp.achieved_calls)}</td>
                            <td className="text-center">{fmt(cp.productive_calls)}</td>
                            <td className="text-center">{fmt(cp.total_orders)}</td>
                            <td className="text-center">₹{fmt(cp.total_order_amount)}</td>
                            <td className="text-center">
                              <span style={{ color: pctColor(cp.achievement_percentage), fontWeight: 600 }}>
                                {pct(cp.achievement_percentage)}
                              </span>
                            </td>
                            <td className="text-center">
                              <span style={{ color: pctColor(cp.productivity_percentage), fontWeight: 600 }}>
                                {pct(cp.productivity_percentage)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Route Performance Table */}
            {(metric === 'both' || metric === 'route_targets') && (
              <div>
                <h6 className="tm-title" style={{ fontSize: 15, marginBottom: 12 }}>Route Target Performance</h6>
                <div className="table-responsive">
                  <table className="table tm-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Designation</th>
                        <th className="text-center">Target Boxes</th>
                        <th className="text-center">Achieved Boxes</th>
                        <th className="text-center">Boxes %</th>
                        <th className="text-center">Target Amount</th>
                        <th className="text-center">Achieved Amount</th>
                        <th className="text-center">Amount %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((emp, i) => {
                        const rp = emp.route_performance || {};
                        return (
                          <tr key={emp.employee_id || i}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{emp.name}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{emp.employee_code}</div>
                            </td>
                            <td style={{ fontSize: 13 }}>{emp.designation || '-'}</td>
                            <td className="text-center">{fmt(rp.target_boxes)}</td>
                            <td className="text-center">{fmt(rp.achieved_boxes)}</td>
                            <td className="text-center">
                              <span style={{ color: pctColor(rp.boxes_achievement_percentage), fontWeight: 600 }}>
                                {pct(rp.boxes_achievement_percentage)}
                              </span>
                            </td>
                            <td className="text-center">₹{fmt(rp.target_amount)}</td>
                            <td className="text-center">₹{fmt(rp.achieved_amount)}</td>
                            <td className="text-center">
                              <span style={{ color: pctColor(rp.amount_achievement_percentage), fontWeight: 600 }}>
                                {pct(rp.amount_achievement_percentage)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && data && comparison.length === 0 && (
          <div className="alert alert-info">No performance data found for the given employees and filters.</div>
        )}
      </div>
    </div>
  );
}