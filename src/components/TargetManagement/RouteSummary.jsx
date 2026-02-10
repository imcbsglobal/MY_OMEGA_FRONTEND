import React, { useEffect, useState } from "react";
import "./targetManagement.css";
import { getRouteSummary } from "../../api/targetManagement";
import theme from "../../styles/targetTheme";

export default function RouteSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getRouteSummary();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = theme;

  const fmt = (v) => (v === null || v === undefined ? "-" : new Intl.NumberFormat().format(v));

  const rows = data
    ? [
        { label: "Total Targets", value: fmt(data.total_targets) },
        { label: "Total Target Boxes", value: fmt(data.total_target_boxes) },
        { label: "Total Target Amount", value: data.total_target_amount ? `₹${fmt(data.total_target_amount)}` : "-" },
        { label: "Total Achieved Boxes", value: fmt(data.total_achieved_boxes) },
        { label: "Total Achieved Amount", value: data.total_achieved_amount ? `₹${fmt(data.total_achieved_amount)}` : "-" },
        { label: "Boxes Achievement %", value: data.boxes_achievement_percentage ?? "-" },
        { label: "Amount Achievement %", value: data.amount_achievement_percentage ?? "-" },
      ]
    : [];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <div className="d-flex align-items-center justify-content-between">
                <h6>Route Summary</h6>
              </div>
            </div>

            <div className="card-body">
              {/* Top stat cards - compact layout to match design */}
              <div className="tm-top-stats mb-4">
                <div className="stat-card">
                  <p className="stat-label">Total Targets</p>
                  <h5 className="stat-value">{data ? (data.total_targets ?? '-') : '-'}</h5>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Total Target Boxes</p>
                  <h5 className="stat-value">{data ? (data.total_target_boxes ?? '-') : '-'}</h5>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Total Target Amount</p>
                  <h5 className="stat-value">{data && data.total_target_amount ? `₹${new Intl.NumberFormat().format(data.total_target_amount)}` : '-'}</h5>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Boxes Achievement</p>
                  <h5 className="stat-value">{data ? ((data.boxes_achievement_percentage ?? data.amount_achievement_percentage ?? 0) + '%') : '-'}</h5>
                </div>
              </div>

              <div className="tm-table-wrap">
                {loading ? (
                  <div>Loading...</div>
                ) : data ? (
                  <div className="table-responsive">
                    <table className="table align-items-center mb-0">
                      <thead>
                        <tr>
                          <th style={styles.th}>Metric</th>
                          <th style={styles.th} className="text-end">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.label}>
                            <td style={styles.td}>{r.label}</td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">No data available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
