import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getCallSummary } from "../../api/targetManagement";
import theme from "../../styles/targetTheme";
import "./targetManagement.css";

export default function CallSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getCallSummary();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = theme;

  const navigate = useNavigate();
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetFilters = () => {
    setEmployeeFilter('');
    setStartDate('');
    setEndDate('');
  };

  const fmtDMY = (dstr) => {
    if (!dstr) return '-';
    const d = new Date(dstr);
    if (isNaN(d)) return dstr;
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fmt = (v) => (v === null || v === undefined ? "-" : new Intl.NumberFormat().format(v));

  const rows = data
    ? [
        { label: "Total Call Targets", value: fmt(data.total_targets ?? data.total_call_targets ?? data.total_target_calls) },
        { label: "Total Target Calls", value: fmt(data.total_target_calls ?? data.total_calls) },
        { label: "Total Target Amount", value: data.total_target_amount ? `₹${fmt(data.total_target_amount)}` : "-" },
        { label: "Total Achieved Calls", value: fmt(data.total_achieved_calls ?? data.total_achieved) },
        { label: "Total Achieved Amount", value: data.total_achieved_amount ? `₹${fmt(data.total_achieved_amount)}` : "-" },
        { label: "Calls Achievement %", value: data.calls_achievement_percentage ?? data.achievement_percentage ?? "-" },
        { label: "Amount Achievement %", value: data.amount_achievement_percentage ?? "-" },
      ]
    : [];

  return (
    <div className="tm-page" style={styles.page}>
      <div className="tm-card" style={styles.card}>
        <div className="tm-header" style={styles.header}>
          <div>
            <h3 className="tm-title" style={styles.headerTitle}>Call Target List</h3>
          </div>
          <div>
            <button className="btn btn-danger btn-sm assign-btn" onClick={() => navigate('/target/call/assign')}>+ Assign New Target</button>
          </div>
        </div>

        <div className="tm-table-wrap" style={styles.tableWrap}>
          <div className="tm-filters" style={{marginBottom:12}}>
            <div className="tm-filter-col">
              <label className="form-label">Filter by Employee</label>
              <select className="form-control" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
                <option value="">All Employees</option>
                {/* populate employee options if API provides list; fallback minimal */}
              </select>
            </div>

            <div className="tm-filter-col">
              <label className="form-label">Start Date (From)</label>
              <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="tm-filter-col">
              <label className="form-label">End Date (To)</label>
              <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="tm-filter-actions">
              <button className="btn-reset btn-sm" onClick={resetFilters}>Reset Filters</button>
            </div>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : data ? (
            (() => {
              // If API returned an array/list of targets, render list table similar to screenshot
              const list = data.results || data.items || data.targets || data.list || [];
              if (Array.isArray(list) && list.length > 0) {
                return (
                  <div className="table-responsive">
                    <table className="table tm-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Period</th>
                          <th className="text-center">Target Calls</th>
                          <th className="text-center">Achieved Calls</th>
                          <th className="text-center">Achievement %</th>
                          <th className="text-center">Status</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((row, idx) => (
                          <tr key={row.id || idx}>
                            <td>
                              <div style={{display:'flex', alignItems:'center', gap:12}}>
                                <div style={{fontWeight:700}}>{row.employee_name || row.employee || '—'}</div>
                                  {row.employee_email && <div className="text-muted" style={{fontSize:13}}><a href={`mailto:${row.employee_email}`} style={{color:'#6b7280', textDecoration:'none'}}>{row.employee_email}</a></div>}
                              </div>
                            </td>
                            <td>
                              <div style={{fontSize:13}}>
                                {row.period_text || (row.start_date && row.end_date ? `${fmtDMY(row.start_date)} - ${fmtDMY(row.end_date)}` : '-')}
                              </div>
                              {row.days && <div className="text-muted" style={{fontSize:12}}>{row.days} days</div>}
                            </td>
                            <td className="text-center">{row.total_target_calls ?? row.target_calls ?? 0}</td>
                            <td className="text-center">{row.total_achieved_calls ?? row.achieved_calls ?? 0}</td>
                            <td className="text-center">{(row.achievement_percentage ?? row.calls_achievement_percentage ?? 0).toString().includes('%') ? (row.achievement_percentage ?? row.calls_achievement_percentage ?? '0%') : `${Number(row.achievement_percentage ?? row.calls_achievement_percentage ?? 0).toFixed(2)}%`}</td>
                            <td className="text-center">{row.is_active || row.status ? (row.is_active ? 'Active' : row.status) : '—'}</td>
                            <td className="text-center">
                              <button className="btn-outline-danger btn-sm">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // Fallback: show summary metrics table
              return (
                <table className="tm-table" style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Metric</th>
                      <th style={styles.th}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.label}>
                        <td style={styles.td}>{r.label}</td>
                        <td style={styles.td}>{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()
          ) : (
            <div className="alert alert-info">No data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
