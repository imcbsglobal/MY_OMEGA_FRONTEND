// src/components/TargetManagement/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/client";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    call_targets: {
      total: 0,
      active: 0,
      average_achievement: 0
    },
    route_targets: {
      total: 0,
      active: 0,
      average_achievement: 0
    },
    top_performers: [],
    recent_updates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch call targets
      const callResponse = await api.get('/target-management/call-targets/');
      const callTargets = callResponse.data.results || callResponse.data;

      // Fetch route targets
      const routeResponse = await api.get('/target-management/route-targets/');
      const routeTargets = routeResponse.data.results || routeResponse.data;

      // Calculate statistics
      const activeCallTargets = callTargets.filter(t => t.is_active);
      const activeRouteTargets = routeTargets.filter(t => t.is_active);

      const avgCallAchievement = activeCallTargets.length > 0
        ? activeCallTargets.reduce((sum, t) => sum + (t.achievement_percentage || 0), 0) / activeCallTargets.length
        : 0;

      const avgRouteAchievement = activeRouteTargets.length > 0
        ? activeRouteTargets.reduce((sum, t) => sum + (t.achievement_percentage_boxes || 0), 0) / activeRouteTargets.length
        : 0;

      // Get top performers (combining both call and route targets)
      const allPerformers = [
        ...callTargets.map(t => ({
          name: t.employee_name,
          type: 'Call',
          achievement: t.achievement_percentage || 0,
          target: t.total_target_calls,
          achieved: t.total_achieved_calls
        })),
        ...routeTargets.map(t => ({
          name: t.employee_name,
          type: 'Route',
          achievement: t.achievement_percentage_boxes || 0,
          target: t.target_boxes,
          achieved: t.achieved_boxes
        }))
      ].sort((a, b) => b.achievement - a.achievement).slice(0, 5);

      setDashboardData({
        call_targets: {
          total: callTargets.length,
          active: activeCallTargets.length,
          average_achievement: avgCallAchievement
        },
        route_targets: {
          total: routeTargets.length,
          active: activeRouteTargets.length,
          average_achievement: avgRouteAchievement
        },
        top_performers: allPerformers,
        recent_updates: [] // Can be populated if you have an activity log
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className="card">
      <div className="card-body p-3">
        <div className="row">
          <div className="col-8">
            <div className="numbers">
              <p className="text-sm mb-0 text-capitalize font-weight-bold">{title}</p>
              <h5 className="font-weight-bolder mb-0">
                {value}
                {subtitle && <span className="text-sm font-weight-normal text-secondary"> {subtitle}</span>}
              </h5>
            </div>
          </div>
          <div className="col-4 text-end">
            <div className={`icon icon-shape ${color} shadow text-center border-radius-md`}>
              <i className={`${icon} text-lg opacity-10`} aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
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
          <h4 className="mb-0">Target Management Dashboard</h4>
          <p className="text-sm text-secondary">Overview of team performance and targets</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <StatCard
            title="Total Call Targets"
            value={dashboardData.call_targets.total}
            subtitle={`${dashboardData.call_targets.active} active`}
            icon="fas fa-phone"
            color="bg-gradient-primary"
          />
        </div>
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <StatCard
            title="Avg Call Achievement"
            value={`${dashboardData.call_targets.average_achievement.toFixed(1)}%`}
            icon="fas fa-chart-line"
            color="bg-gradient-success"
          />
        </div>
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <StatCard
            title="Total Route Targets"
            value={dashboardData.route_targets.total}
            subtitle={`${dashboardData.route_targets.active} active`}
            icon="fas fa-route"
            color="bg-gradient-info"
          />
        </div>
        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
          <StatCard
            title="Avg Route Achievement"
            value={`${dashboardData.route_targets.average_achievement.toFixed(1)}%`}
            icon="fas fa-chart-bar"
            color="bg-gradient-warning"
          />
        </div>
      </div>

      <div className="row">
        {/* Top Performers */}
        <div className="col-lg-7 mb-4">
          <div className="card h-100">
            <div className="card-header pb-0">
              <h6>Top Performers</h6>
            </div>
            <div className="card-body p-3">
              {dashboardData.top_performers.length === 0 ? (
                <p className="text-center text-muted">No performance data available</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-items-center mb-0">
                    <thead>
                      <tr>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Employee
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Type
                        </th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Achievement
                        </th>
                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Progress
                        </th>
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
                                ></div>
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
          <div className="card h-100">
            <div className="card-header pb-0">
              <h6>Quick Actions</h6>
            </div>
            <div className="card-body p-3">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/target/call/assign')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Assign Call Target
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => navigate('/target/route/assign')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Assign Route Target
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/target/call/list')}
                >
                  <i className="fas fa-list me-2"></i>
                  View Call Targets
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/target/route/list')}
                >
                  <i className="fas fa-list me-2"></i>
                  View Route Targets
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/target/master/routes')}
                >
                  <i className="fas fa-route me-2"></i>
                  Manage Routes
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/target/master/products')}
                >
                  <i className="fas fa-box me-2"></i>
                  Manage Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="row mt-4">
        <div className="col-12 text-end">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchDashboardData}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;