// src/components/TargetManagement/EmployeeTargetReport.jsx
import React, { useState, useEffect } from 'react';
import "./targetManagement.css";
import { toast } from 'react-toastify';
import api from "../../api/client";

const EmployeeTargetReport = ({ employeeId: propEmployeeId }) => {
  const [myTargets, setMyTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('call'); // 'call' | 'route' | 'both'

  const employeeId = propEmployeeId || localStorage.getItem('employee_id') || 1;

  useEffect(() => {
    fetchMyTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyTargets = async () => {
    setLoading(true);
    try {
      const endpoint = `/target-management/employee/my-targets/?employee_id=${employeeId}&status=active&type=both`;
      const response = await api.get(endpoint);
      const data = response.data.results || response.data;
      setMyTargets(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load your targets');
      console.error(error);
      setMyTargets([]);
    } finally {
      setLoading(false);
    }
  };

  const renderPeriod = (t) => {
    try {
      const s = t.start_date ? new Date(t.start_date).toLocaleDateString() : '';
      const e = t.end_date ? new Date(t.end_date).toLocaleDateString() : '';
      return s && e ? `${s} - ${e}` : t.period || '-';
    } catch (err) {
      return '-';
    }
  };

  const renderTargetValue = (t) => {
    if (t.target_type === 'route' || t.route_origin) {
      return t.target_boxes ?? '-';
    }
    return t.total_target_calls ?? '-';
  };

  const renderAchievedValue = (t) => {
    if (t.target_type === 'route' || t.route_origin) {
      return t.achieved_boxes ?? '-';
    }
    return t.total_achieved_calls ?? '-';
  };

  const displayedTargets = myTargets.filter(t => {
    if (filterType === 'both') return true;
    if (filterType === 'route') return (t.target_type === 'route' || t.route_origin || t.target_boxes);
    return (t.target_type === 'call' || t.total_target_calls || t.total_achieved_calls);
  });

  return (
    <div className="container-fluid py-4 tm-page">
      <div className="tm-card card">
        <div className="tm-header">
          <div>
            <h3 className="tm-title">My Targets</h3>
            <p className="tm-sub">Overview of your assigned targets</p>
          </div>
          <div>
            <button className="btn btn-danger assign-btn" onClick={fetchMyTargets}>
              Refresh
            </button>
          </div>
        </div>

        <div className="tm-filters">
          <div className="tm-filter-col">
            <div style={{display:'flex', gap:8}}>
              <button
                type="button"
                className={`pill ${filterType === 'call' ? 'active' : ''}`}
                onClick={() => setFilterType('call')}
              >
                Call Targets
              </button>
              <button
                type="button"
                className={`pill ${filterType === 'route' ? 'active' : ''}`}
                onClick={() => setFilterType('route')}
              >
                Route Targets
              </button>
            </div>
          </div>
        </div>

        <div className="tm-table-wrap">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : displayedTargets.length === 0 ? (
            <div className="text-center py-4">{filterType === 'route' ? 'No route targets assigned to you' : 'No call targets assigned to you'}</div>
          ) : (
            <table className="table tm-table compact-table">
              <thead>
                {filterType === 'route' ? (
                  <tr>
                    <th>Route</th>
                    <th>Period</th>
                    <th>Target Boxes</th>
                    <th>Achieved Boxes</th>
                    <th>Target Amount</th>
                    <th>Achievement %</th>
                    <th>Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Period</th>
                    <th>Target Calls</th>
                    <th>Achieved Calls</th>
                    <th>Achievement %</th>
                    <th>Status</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {displayedTargets.map((t) => (
                  <tr key={t.id || `${t.route_origin}-${t.route_destination}-${Math.random()}`}>
                    {filterType === 'route' ? (
                      <>
                        <td>
                          <div className="d-flex flex-column">
                            <h6>{t.route_origin} → {t.route_destination}</h6>
                          </div>
                        </td>
                        <td>{renderPeriod(t)}</td>
                        <td>{t.target_boxes ?? '-'}</td>
                        <td>{t.achieved_boxes ?? '-'}</td>
                        <td>{t.target_amount ? `₹${t.target_amount}` : '-'}</td>
                        <td>{(t.achievement_percentage_boxes ?? 0).toFixed ? (Number(t.achievement_percentage_boxes ?? 0)).toFixed(2) + '%' : '-'}</td>
                        <td style={{textTransform:'capitalize'}}>{t.status || t.state || 'active'}</td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="d-flex flex-column">
                            <h6>{renderPeriod(t)}</h6>
                          </div>
                        </td>
                        <td>{t.total_target_calls ?? '-'}</td>
                        <td>{t.total_achieved_calls ?? '-'}</td>
                        <td>{(t.achievement_percentage ?? 0).toFixed ? (Number(t.achievement_percentage ?? 0)).toFixed(2) + '%' : '-'}</td>
                        <td style={{textTransform:'capitalize'}}>{t.status || t.state || 'active'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTargetReport;