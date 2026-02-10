import React, { useState } from 'react';
import theme from '../../styles/targetTheme';
import { getComparativePerformance } from '../../api/targetManagement';
import './targetManagement.css';

export default function ComparativePerformance() {
  const [employees, setEmployees] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const styles = theme;

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!employees) return;
    setLoading(true);
    try {
      const res = await getComparativePerformance({ employees });
      setData(res);
    } catch (err) {
      console.error(err);
      setData({ error: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <div className="d-flex align-items-center justify-content-between">
                <h6>Comparative Performance</h6>
                <small className="text-muted">Compare performance between multiple employees</small>
              </div>
            </div>

            <div className="card-body">
              <div className="tm-filters" style={styles.form}>
                <div className="tm-filter-col">
                  <label className="form-label">Employees (comma-separated IDs)</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 1,2,3"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                  />
                </div>
                <div className="tm-filter-actions">
                  <button className="btn btn-apply" onClick={handleFetch}>Fetch</button>
                </div>
              </div>

              <div className="tm-table-wrap" style={styles.tableWrap}>
                {loading ? (
                  <div>Loading...</div>
                ) : !data ? (
                  <div className="alert alert-info">No data yet.</div>
                ) : Array.isArray(data) && data.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table tm-table">
                      <thead>
                        <tr>
                          {Object.keys(data[0]).map((k) => (
                            <th key={k}>{k.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, i) => (
                          <tr key={i}>
                            {Object.keys(row).map((k) => (
                              <td key={k}>{typeof row[k] === 'number' ? new Intl.NumberFormat().format(row[k]) : String(row[k])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
