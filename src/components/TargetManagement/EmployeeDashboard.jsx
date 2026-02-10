import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import theme from '../../styles/targetTheme';
import { getEmployeeDashboard } from '../../api/targetManagement';
import './targetManagement.css';

export default function EmployeeDashboard() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const styles = theme;

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getEmployeeDashboard(id);
        setData(res);
      } catch (err) {
        console.error(err);
        setData({ error: 'Failed to fetch' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const renderDashboard = () => {
    if (loading) return <div>Loading...</div>;
    if (!data) return <div className="alert alert-info">No data available.</div>;

    // If object, show key/value; if array show table
    if (Array.isArray(data) && data.length > 0) {
      const cols = Object.keys(data[0]);
      return (
        <div className="table-responsive">
          <table className="table tm-table">
            <thead>
              <tr>{cols.map(c => <th key={c}>{c.replace(/_/g,' ')}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>{cols.map(c => <td key={c}>{row[c]}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <table className="table tm-table">
        <tbody>
          {Object.keys(data).map(k => (
            <tr key={k}>
              <td className="text-muted" style={{width:'50%'}}>{k.replace(/_/g,' ')}</td>
              <td>{String(data[k])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <div className="d-flex align-items-center justify-content-between">
                <h6>Employee Dashboard</h6>
                <small className="text-muted">Overview for employee {id}</small>
              </div>
            </div>

            <div className="card-body">
              <div className="tm-table-wrap" style={styles.tableWrap}>
                {renderDashboard()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
