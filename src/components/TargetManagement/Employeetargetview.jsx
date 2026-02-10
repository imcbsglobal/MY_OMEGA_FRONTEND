// src/components/TargetManagement/EmployeeTargetView.jsx
import React, { useState, useEffect } from 'react';
import "./targetManagement.css";
import { toast } from 'react-toastify';
import api from "../../api/client";

const EmployeeTargetView = () => {
  const [callTargets, setCallTargets] = useState([]);
  const [routeTargets, setRouteTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('call'); // 'call' or 'route'

  useEffect(() => {
    fetchMyTargets();
  }, []);

  // Summary calculations
  const totalTargetCalls = callTargets.reduce((s, t) => s + (Number(t.total_target_calls) || 0), 0);
  const totalAchievedCalls = callTargets.reduce((s, t) => s + (Number(t.total_achieved_calls) || 0), 0);
  const achievementRate = totalTargetCalls > 0 ? (totalAchievedCalls / totalTargetCalls) * 100 : 0;

  const fetchMyTargets = async () => {
    setLoading(true);
    try {
      const [callRes, routeRes] = await Promise.all([
        api.get('/target-management/my-call-targets/'),
        api.get('/target-management/my-route-targets/')
      ]);

      setCallTargets(callRes.data.results || callRes.data);
      setRouteTargets(routeRes.data.results || routeRes.data);
    } catch (error) {
      toast.error('Failed to load your targets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-gradient-success';
    if (percentage >= 50) return 'bg-gradient-warning';
    return 'bg-gradient-danger';
  };

  const getStatus = (percentage) => {
    const p = Number(percentage) || 0;
    if (p >= 100) return { label: 'Achieved', className: 'bg-gradient-success' };
    if (p >= 80) return { label: 'On Track', className: 'bg-gradient-warning' };
    return { label: 'Behind', className: 'bg-gradient-danger' };
  };

  const renderCallTargets = () => (
    <div className="table-responsive">
      <table className="table align-items-center mb-0">
        <thead>
          <tr>
            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
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
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
          ) : callTargets.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No call targets assigned to you
              </td>
            </tr>
          ) : (
            callTargets.map(target => (
              <tr key={target.id}>
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
                          {Number(target.achievement_percentage || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="progress">
                      <div
                        className={`progress-bar ${getProgressColor(target.achievement_percentage || 0)}`}
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
                  {(() => {
                    const s = getStatus(target.achievement_percentage);
                    return (
                      <span className={`badge badge-sm ${s.className}`}>
                        {s.label}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderRouteTargets = () => (
    <div className="table-responsive">
      <table className="table align-items-center mb-0">
        <thead>
          <tr>
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
          ) : routeTargets.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No route targets assigned to you
              </td>
            </tr>
          ) : (
            routeTargets.map(target => (
              <tr key={target.id}>
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
                          {Number(target.achievement_percentage_boxes || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="progress">
                      <div
                        className={`progress-bar ${getProgressColor(target.achievement_percentage_boxes || 0)}`}
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
                  {(() => {
                    const s = getStatus(target.achievement_percentage_boxes);
                    return (
                      <span className={`badge badge-sm ${s.className}`}>
                        {s.label}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* (Top summary removed — page uses header-internal summaries now) */}
      <div className="row">
        <div className="col-12">
          <div className="card tm-card">
            <div className="card-header pb-0 tm-header">
              <div className="d-flex align-items-center">
                <div className="stat-icon red" style={{ width: 40, height: 40, borderRadius: 8 }}>
                  <i className="fas fa-bullseye"></i>
                </div>
                <div style={{ marginLeft: 12 }}>
                  <h6 className="tm-title">My Targets</h6>
                  <p className="tm-sub">Track your call and route performance</p>
                </div>
              </div>

              <div>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={fetchMyTargets}
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh
                </button>
              </div>
            </div>

            <div className="card-body">
                {/* Summary cards inside card to match screenshot */}
                <div className="summary-cards mb-3">
                  <div className="summary-card">
                    <div className="summary-label">Total Target</div>
                    <div className="summary-value">{totalTargetCalls}</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Achieved</div>
                    <div className="summary-value">{totalAchievedCalls}</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Achievement Rate</div>
                    <div className="summary-value">{achievementRate.toFixed(0)}%</div>
                  </div>
                </div>

              {/* Performance panel */}
              <div className="summary-header">
                <div className="performance-inner">
                  <div className="performance-left">
                    <strong>Performance</strong>
                    <div className="pills" style={{ marginTop: 12 }}>
                      <button className={`pill ${activeTab === 'call' ? 'active' : ''}`} onClick={() => setActiveTab('call')}>
                        <i className="fas fa-phone me-1"></i> Call Targets
                      </button>
                      <button className={`pill ${activeTab === 'route' ? 'active' : ''}`} onClick={() => setActiveTab('route')}>
                        <i className="fas fa-map-marker-alt me-1"></i> Route Targets
                      </button>
                    </div>
                  </div>
                  <div className="performance-right">
                    <div className="tm-table-wrap">
                      {activeTab === 'call' ? renderCallTargets() : renderRouteTargets()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTargetView;