import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import api from '../../api/client';

const formatDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
};

const pctColor = (v) => {
  const n = parseFloat(v);
  if (n >= 80) return '#16a34a';
  if (n >= 50) return '#d97706';
  return '#dc2626';
};

export default function CallTargetReport() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employee: '', start_date: '', end_date: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    api.get('/employee-management/employees/?page_size=500')
      .then(r => setEmployees(r.data.results || r.data || []))
      .catch(() => setEmployees([]));
  }, []);

  const getEmpName = (emp) =>
    emp.full_name || emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.employee_id || String(emp.id);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = { page_size: 1000 };
      if (filters.employee) params.employee = filters.employee;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const r = await api.get('/target-management/call-targets/', { params });
      const data = r.data.results || r.data || [];

      const flat = data.map(target => {
        const targetCalls = target.total_target_calls || 0;
        const achieved = target.total_achieved_calls || 0;
        const pct = targetCalls > 0 ? ((achieved / targetCalls) * 100).toFixed(2) : '0.00';
        return {
          employee: target.employee_name || 'N/A',
          employee_id: target.employee_id_display || '',
          period: `${formatDate(target.start_date)} - ${formatDate(target.end_date)}`,
          target_calls: targetCalls,
          achieved_calls: achieved,
          achievement_pct: `${pct}%`,
          pct_num: parseFloat(pct),
          status: target.is_active ? 'Active' : 'Inactive',
        };
      });

      setRows(flat);
      setGenerated(true);
      if (flat.length === 0) toast.info('No call targets found for the selected filters.');
    } catch (e) {
      toast.error('Failed to fetch call target data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcel = () => {
    if (!rows.length) return;
    const headers = ['#', 'Employee', 'Employee ID', 'Period', 'Target Calls', 'Achieved Calls', 'Achievement %', 'Status'];
    const data = rows.map((r, i) => [
      i + 1, r.employee, r.employee_id, r.period, r.target_calls, r.achieved_calls, r.achievement_pct, r.status,
    ]);

    const totals = ['TOTAL', '', '', '',
      rows.reduce((s, r) => s + r.target_calls, 0),
      rows.reduce((s, r) => s + r.achieved_calls, 0),
      '',
      '',
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data, totals]);
    ws['!cols'] = [4, 22, 14, 24, 14, 14, 14, 10].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Call Target Report');
    XLSX.writeFile(wb, 'CallTargetReport.xlsx');
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Call Target Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
        h2 { text-align: center; margin-bottom: 4px; font-size: 15px; }
        p.sub { text-align: center; color: #555; margin-bottom: 12px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a5f; color: #fff; padding: 6px 8px; font-size: 10px; text-align: left; }
        td { border: 1px solid #ddd; padding: 5px 8px; font-size: 10px; }
        tr:nth-child(even) td { background: #f5f8ff; }
        .totals td { background: #1e3a5f !important; color: #fff; font-weight: 700; }
        @media print { @page { size: A4 landscape; margin: 10mm; } }
      </style></head><body>
      ${content}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const selectedEmp = employees.find(e => String(e.id) === String(filters.employee));
  const totalTargetCalls = rows.reduce((s, r) => s + r.target_calls, 0);
  const totalAchieved = rows.reduce((s, r) => s + r.achieved_calls, 0);
  const overallPct = totalTargetCalls > 0 ? ((totalAchieved / totalTargetCalls) * 100).toFixed(2) : '0.00';

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <h6 style={{ fontSize: '1rem', fontWeight: 600, color: '#344054', marginBottom: '1rem' }}>
                Call Target Report
              </h6>

              {/* Filter bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                <div style={{ flex: '0 0 auto', minWidth: 180 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>Employee</label>
                  <select
                    className="form-select"
                    value={filters.employee}
                    onChange={e => setFilters(f => ({ ...f, employee: e.target.value }))}
                    style={{ fontSize: '0.8rem', height: 32, padding: '0.25rem 0.5rem' }}
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employee_id} - {getEmpName(emp)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '0 0 auto', minWidth: 140 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.start_date}
                    onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))}
                    style={{ fontSize: '0.8rem', height: 32, padding: '0.25rem 0.5rem' }}
                  />
                </div>

                <div style={{ flex: '0 0 auto', minWidth: 140 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.end_date}
                    onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))}
                    style={{ fontSize: '0.8rem', height: 32, padding: '0.25rem 0.5rem' }}
                  />
                </div>

                <div style={{ flex: '0 0 auto' }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => { setFilters({ employee: '', start_date: '', end_date: '' }); setRows([]); setGenerated(false); }}
                    style={{ fontSize: '0.75rem', height: 32, padding: '0.25rem 0.75rem' }}
                  >
                    Reset
                  </button>
                </div>

                <div style={{ flex: '1 1 auto' }} />

                <div style={{ flex: '0 0 auto' }}>
                  <button
                    className="btn btn-danger"
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{ fontSize: '0.75rem', height: 32, padding: '0.25rem 1rem', fontWeight: 600 }}
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body" style={{ paddingTop: '0.5rem' }}>
              {generated && rows.length > 0 && (
                <>
                  {/* Summary cards */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Total Records', value: rows.length, color: '#3b82f6' },
                      { label: 'Total Target Calls', value: totalTargetCalls, color: '#f59e0b' },
                      { label: 'Total Achieved', value: totalAchieved, color: '#10b981' },
                      { label: 'Overall Achievement', value: `${overallPct}%`, color: pctColor(overallPct) },
                    ].map(c => (
                      <div key={c.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem 1.25rem', minWidth: 150, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: c.color }}>{c.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-success btn-sm" onClick={handleExcel} style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Export Excel
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handlePrint} style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      Print
                    </button>
                  </div>

                  {/* Printable content */}
                  <div ref={printRef}>
                    <h2 style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Call Target Report</h2>
                    <p className="sub" style={{ textAlign: 'center', color: '#555', marginBottom: 12, fontSize: 12 }}>
                      {selectedEmp ? `Employee: ${getEmpName(selectedEmp)}` : 'All Employees'}
                      {filters.start_date ? ` | From: ${formatDate(filters.start_date)}` : ''}
                      {filters.end_date ? ` | To: ${formatDate(filters.end_date)}` : ''}
                    </p>

                    <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}>
                      <table className="table align-items-center mb-0" style={{ fontSize: '0.78rem' }}>
                        <thead style={{ background: '#1e3a5f' }}>
                          <tr>
                            {['#', 'Employee', 'Emp ID', 'Period', 'Target Calls', 'Achieved Calls', 'Achievement %', 'Status'].map(h => (
                              <th key={h} style={{ color: '#fff', background: '#1e3a5f', padding: '8px 10px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f8ff' }}>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>{i + 1}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{r.employee}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#6b7280' }}>{r.employee_id}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>{r.period}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{r.target_calls}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{r.achieved_calls}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontWeight: 700, color: pctColor(r.pct_num) }}>
                                {r.achievement_pct}
                              </td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                                <span style={{ background: r.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: r.status === 'Active' ? '#16a34a' : '#6b7280', padding: '2px 8px', borderRadius: 12, fontWeight: 600, fontSize: '0.7rem' }}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          <tr className="totals">
                            <td colSpan={4} style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, background: '#1e3a5f', color: '#fff', textAlign: 'right' }}>TOTAL</td>
                            <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', background: '#1e3a5f', color: '#fff' }}>{totalTargetCalls}</td>
                            <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', background: '#1e3a5f', color: '#fff' }}>{totalAchieved}</td>
                            <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', background: '#1e3a5f', color: '#fff' }}>{overallPct}%</td>
                            <td style={{ padding: '6px 10px', background: '#1e3a5f' }} />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p style={{ marginTop: 8, fontSize: 11, color: '#6b7280', textAlign: 'right' }}>
                      Total Records: {rows.length} | Generated: {new Date().toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              {generated && rows.length === 0 && !loading && (
                <div className="text-center text-muted py-4">No call targets found for the selected filters.</div>
              )}

              {!generated && (
                <div className="text-center text-muted py-5" style={{ fontSize: '0.9rem' }}>
                  Select filters and click <strong>Generate Report</strong> to view call target data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
