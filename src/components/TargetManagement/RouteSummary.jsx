import React, { useEffect, useState } from 'react';
import './targetManagement.css';
import { getRouteSummary } from '../../api/targetManagement';

export default function RouteSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRouteSummary();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Failed to load route summary');
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (label, value) => (
    <div className="summary-card">
      <div className="summary-value">{value}</div>
      <div className="summary-label">{label}</div>
    </div>
  );

  if (loading) return <div className="container-fluid py-4">Loading route summary...</div>;
  if (error) return <div className="container-fluid py-4"><div className="alert alert-danger">{error}</div></div>;

  const d = data || {};

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="summary-header tm-card">
            <div>
              <h4 className="tm-title">Route Summary</h4>
              <p className="tm-sub">Aggregate route target statistics</p>
            </div>
            <div>
              <button className="btn btn-outline-secondary btn-sm" onClick={fetchData}>
                <i className="fas fa-sync-alt me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-cards mb-4">
        {renderCard('Total Targets', d.total_targets ?? 0)}
        {renderCard('Target Boxes', new Intl.NumberFormat().format(d.total_target_boxes ?? 0))}
        {renderCard('Target Amount', d.total_target_amount ? `₹${new Intl.NumberFormat().format(d.total_target_amount)}` : '₹0')}
        {renderCard('Achieved Boxes', new Intl.NumberFormat().format(d.total_achieved_boxes ?? 0))}
      </div>

      <div className="summary-cards">
        {renderCard('Achieved Amount', d.total_achieved_amount ? `₹${new Intl.NumberFormat().format(d.total_achieved_amount)}` : '₹0')}
        {renderCard('Boxes %', `${(Number(d.boxes_achievement_percentage ?? 0)).toFixed(2)}%`)}
        {renderCard('Amount %', `${(Number(d.amount_achievement_percentage ?? 0)).toFixed(2)}%`)}
      </div>
    </div>
  );
}
