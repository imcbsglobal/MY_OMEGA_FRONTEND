// src/components/TargetManagement/EmployeeTargetReport.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from "../../api/client";

const EmployeeTargetReport = () => {
  const [activeTargets, setActiveTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [targetType, setTargetType] = useState('call'); // 'call' or 'route'
  const [reportData, setReportData] = useState({
    calls_made: 0,
    boxes_delivered: 0,
    amount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchActiveTargets();
  }, [targetType]);

  const fetchActiveTargets = async () => {
    setLoading(true);
    try {
      const endpoint = targetType === 'call' 
        ? '/target-management/my-call-targets/?is_active=true'
        : '/target-management/my-route-targets/?is_active=true';
      
      const response = await api.get(endpoint);
      setActiveTargets(response.data.results || response.data);
      
      if ((response.data.results || response.data).length > 0) {
        setSelectedTarget((response.data.results || response.data)[0].id);
      }
    } catch (error) {
      toast.error('Failed to load active targets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTarget) {
      toast.error('Please select a target');
      return;
    }

    try {
      const endpoint = targetType === 'call'
        ? `/target-management/call-targets/${selectedTarget}/update-progress/`
        : `/target-management/route-targets/${selectedTarget}/update-progress/`;

      const payload = targetType === 'call'
        ? { calls_made: parseInt(reportData.calls_made), notes: reportData.notes }
        : {
            boxes_delivered: parseFloat(reportData.boxes_delivered),
            amount: parseFloat(reportData.amount),
            notes: reportData.notes
          };

      await api.post(endpoint, payload);
      
      toast.success('Progress updated successfully');
      setReportData({
        calls_made: 0,
        boxes_delivered: 0,
        amount: 0,
        notes: ''
      });
      fetchActiveTargets();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message ||
                       'Failed to update progress';
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const getCurrentTarget = () => {
    return activeTargets.find(t => t.id === selectedTarget);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <h6>Update Target Progress</h6>
            </div>

            <div className="card-body">
              {/* Target Type Selection */}
              <div className="mb-4">
                <label className="form-label">Target Type</label>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${targetType === 'call' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTargetType('call')}
                  >
                    Call Targets
                  </button>
                  <button
                    type="button"
                    className={`btn ${targetType === 'route' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTargetType('route')}
                  >
                    Route Targets
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : activeTargets.length === 0 ? (
                <div className="alert alert-info">
                  No active {targetType} targets found. Please contact your manager.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Target Selection */}
                  <div className="mb-3">
                    <label className="form-label">Select Target *</label>
                    <select
                      className="form-select"
                      value={selectedTarget || ''}
                      onChange={(e) => setSelectedTarget(parseInt(e.target.value))}
                      required
                    >
                      {activeTargets.map(target => (
                        <option key={target.id} value={target.id}>
                          {targetType === 'call' 
                            ? `${new Date(target.start_date).toLocaleDateString()} - ${new Date(target.end_date).toLocaleDateString()} (${target.total_target_calls} calls)`
                            : `${target.route_origin} → ${target.route_destination} (${target.target_boxes} boxes)`
                          }
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Progress */}
                  {getCurrentTarget() && (
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Current Progress</h6>
                        {targetType === 'call' ? (
                          <div className="row">
                            <div className="col-md-6">
                              <p className="mb-1"><strong>Target Calls:</strong> {getCurrentTarget().total_target_calls}</p>
                              <p className="mb-1"><strong>Achieved:</strong> {getCurrentTarget().total_achieved_calls}</p>
                            </div>
                            <div className="col-md-6">
                              <p className="mb-1"><strong>Achievement:</strong> {getCurrentTarget().achievement_percentage?.toFixed(2)}%</p>
                            </div>
                          </div>
                        ) : (
                          <div className="row">
                            <div className="col-md-4">
                              <p className="mb-1"><strong>Target Boxes:</strong> {getCurrentTarget().target_boxes}</p>
                              <p className="mb-1"><strong>Achieved:</strong> {getCurrentTarget().achieved_boxes}</p>
                            </div>
                            <div className="col-md-4">
                              <p className="mb-1"><strong>Target Amount:</strong> ₹{getCurrentTarget().target_amount}</p>
                              <p className="mb-1"><strong>Achieved:</strong> ₹{getCurrentTarget().achieved_amount || 0}</p>
                            </div>
                            <div className="col-md-4">
                              <p className="mb-1"><strong>Achievement:</strong> {getCurrentTarget().achievement_percentage_boxes?.toFixed(2)}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Report Fields */}
                  {targetType === 'call' ? (
                    <div className="mb-3">
                      <label className="form-label">Calls Made Today *</label>
                      <input
                        type="number"
                        name="calls_made"
                        className="form-control"
                        value={reportData.calls_made}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Boxes Delivered *</label>
                          <input
                            type="number"
                            name="boxes_delivered"
                            className="form-control"
                            value={reportData.boxes_delivered}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Amount (₹) *</label>
                          <input
                            type="number"
                            name="amount"
                            className="form-control"
                            value={reportData.amount}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      className="form-control"
                      value={reportData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Add any notes or comments about today's work..."
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setReportData({
                          calls_made: 0,
                          boxes_delivered: 0,
                          amount: 0,
                          notes: ''
                        });
                      }}
                    >
                      Reset
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-check me-2"></i>
                      Submit Progress
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTargetReport;