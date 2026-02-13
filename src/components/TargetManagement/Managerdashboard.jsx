// src/components/TargetManagement/ManagerDashboard.jsx
// FIXES APPLIED:
//   F-06: Fixed paginated/non-paginated response handling
//         Old: data.results || data — if results exists but is [], data never tried
//         New: check if results key exists, use it; else treat raw as array

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/client";
import "./targetManagement.css";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    call_targets: { total: 0, active: 0, average_achievement: 0 },
    route_targets: { total: 0, active: 0, average_achievement: 0 },
    top_performers: [],
    recent_updates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // FIX F-06: Robust helper to extract list from paginated OR plain array response
  const extractList = (responseData) => {
    if (!responseData) return [];
    // DRF pagination: { count, results: [...] }
    if (responseData.results !== undefined) return Array.isArray(responseData.results) ? responseData.results : [];
    // Plain array
    if (Array.isArray(responseData)) return responseData;
    // Fallback: try common wrapper keys
    if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
    return [];
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [callResponse, routeResponse] = await Promise.all([
        api.get('/target-management/call-targets/'),
        api.get('/target-management/route-targets/'),
      ]);

      // FIX F-06: Use extractList helper instead of naive `data.results || data`
      const callTargets = extractList(callResponse.data);
      const routeTargets = extractList(routeResponse.data);

      // Calculate statistics
      const activeCallTargets = callTargets.filter(t => t.is_active);
      const activeRouteTargets = routeTargets.filter(t => t.is_active);

      const avgCallAchievement = activeCallTargets.length > 0
        ? activeCallTargets.reduce((sum, t) => sum + (parseFloat(t.achievement_percentage) || 0), 0) / activeCallTargets.length
        : 0;

      const avgRouteAchievement = activeRouteTargets.length > 0
        ? activeRouteTargets.reduce((sum, t) => sum + (parseFloat(t.achievement_percentage_boxes) || 0), 0) / activeRouteTargets.length
        : 0;

      // Top performers from both call and route targets, sorted by achievement
      const allPerformers = [
        ...callTargets.map(t => ({
          name: t.employee_name || `Employee ${t.employee}`,
          type: 'Call',
          achievement: parseFloat(t.achievement_percentage) || 0,
          target: t.total_target_calls,
          achieved: t.total_achieved_calls,
        })),
        ...routeTargets.map(t => ({
          name: t.employee_name || `Employee ${t.employee}`,
          type: 'Route',
          achievement: parseFloat(t.achievement_percentage_boxes) || 0,
          target: t.target_boxes,
          achieved: t.achieved_boxes,
        })),
      ]
        .sort((a, b) => b.achievement - a.achievement)
        .slice(0, 5);

      setDashboardData({
        call_targets: {
          total: callTargets.length,
          active: activeCallTargets.length,
          average_achievement: avgCallAchievement,
        },
        route_targets: {
          total: routeTargets.length,
          active: activeRouteTargets.length,
          average_achievement: avgRouteAchievement,
        },
        top_performers: allPerformers,
        recent_updates: [],
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle }) => (
    <div className="stat-card tm-card">
      <div className="card-body p-3">
        <p className="stat-label">{title}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="stat-value">{value}</div>
          {subtitle && <div style={{ fontSize: 12, color: '#6b7280' }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="tm-header tm-card" style={{ padding: 12 }}>
            <div>
              <h4 className="tm-title">Target Management Dashboard</h4>
              <p className="tm-sub">Overview of team performance and targets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="tm-top-stats">
            <StatCard
              title="Total Call Targets"
              value={dashboardData.call_targets.total}
              subtitle={`${dashboardData.call_targets.active} active`}
            />
            <StatCard
              title="Avg Call Achievement"
              value={`${dashboardData.call_targets.average_achievement.toFixed(1)}%`}
            />
            <StatCard
              title="Total Route Targets"
              value={dashboardData.route_targets.total}
              subtitle={`${dashboardData.route_targets.active} active`}
            />
            <StatCard
              title="Avg Route Achievement"
              value={`${dashboardData.route_targets.average_achievement.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      <div className="row">
        {/* Top Performers */}
        <div className="col-lg-7 mb-4">
          <div className="tm-card h-100">
            <div className="tm-header" style={{ padding: 12 }}>
              <h6 className="tm-title" style={{ margin: 0, fontSize: 16 }}>Top Performers</h6>
            </div>
            <div className="card-body p-3">
              {dashboardData.top_performers.length === 0 ? (
                <p className="text-center text-muted">No performance data available</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-items-center mb-0">
                    <thead>
                      <tr>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Employee</th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Type</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Achievement</th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.top_performers.map((performer, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex px-2 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">{performer.name}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-sm ${performer.type === 'Call' ? 'bg-gradient-primary' : 'bg-gradient-info'}`}>
                              {performer.type}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <span className="text-xs font-weight-bold">
                              {performer.achievement.toFixed(2)}%
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <div className="progress-wrapper w-75 mx-auto">
                              <div className="progress">
                                <div
                                  className={`progress-bar ${
                                    performer.achievement >= 80 ? 'bg-gradient-success' :
                                    performer.achievement >= 50 ? 'bg-gradient-warning' :
                                    'bg-gradient-danger'
                                  }`}
                                  role="progressbar"
                                  style={{ width: `${Math.min(performer.achievement, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-5 mb-4">
          <div className="tm-card h-100">
            <div className="tm-header" style={{ padding: 12 }}>
              <h6 className="tm-title" style={{ margin: 0, fontSize: 16 }}>Quick Actions</h6>
            </div>
            <div className="card-body p-3">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button className="pill danger" onClick={() => navigate('/target/call/assign')}>Assign Call Target</button>
                <button className="pill" onClick={() => navigate('/target/route/assign')}>Assign Route Target</button>
                <button className="pill" onClick={() => navigate('/target/call/list')}>View Call Targets</button>
                <button className="pill" onClick={() => navigate('/target/route/list')}>View Route Targets</button>
                <button className="pill" onClick={() => navigate('/target/master/routes')}>Manage Routes</button>
                <button className="pill" onClick={() => navigate('/target/master/products')}>Manage Products</button>
                <button className="pill" onClick={() => navigate('/target/performance/comparative')}>Compare Performance</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="row mt-4">
        <div className="col-12 text-end">
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchDashboardData}>
            <i className="fas fa-sync-alt me-2"></i>Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;