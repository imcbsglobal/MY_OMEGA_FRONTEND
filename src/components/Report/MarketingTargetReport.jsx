import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import api from '../../api/client';

const PARAM_TYPE_LABELS = {
  'TPA': 'Total Parties Attended',
  'T_COLLECTION': 'Target Collection',
  'POM': 'Product of the Month',
  'SALES_TARGET': 'Sales Target',
};

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

export default function MarketingTargetReport() {
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

      const r = await api.get('/target-management/marketing-targets/', { params });
      const data = r.data.results || r.data || [];

      // Filter by date range client-side if provided
      const filtered = data.filter(target => {
        if (filters.start_date && target.end_date && target.end_date < filters.start_date) return false;
        if (filters.end_date && target.start_date && target.start_date > filters.end_date) return false;
        return true;
      });

      // Flatten: one row per parameter (or one row per target if no params)
      const flat = [];
      filtered.forEach(target => {
        const base = {
          employee: target.employee_name || 'N/A',
          employee_id: target.employee_id_display || '',
          period: `${formatDate(target.start_date)} - ${formatDate(target.end_date)}`,
          status: target.is_active ? 'Active' : 'Inactive',
        };
        const paramList = target.target_parameters || [];
        if (paramList.length === 0) {
          flat.push({ ...base, param_type: '-', target_value: '-', achieved_value: '-', achievement_pct: '-', incentive: '-' });
        } else {
          paramList.forEach(p => {
            flat.push({
              ...base,
              param_type: PARAM_TYPE_LABELS[p.parameter_type] || p.parameter_type || '-',
              target_value: Number(p.target_value || 0).toFixed(2),
              achieved_value: Number(p.achieved_value || 0).toFixed(2),
              achievement_pct: `${Number(p.achievement_percentage || 0).toFixed(2)}%`,
              pct_num: Number(p.achievement_percentage || 0),
              incentive: `₹${Number(p.incentive_value || 0).toFixed(2)}`,
            });
          });
        }
      });

      setRows(flat);
      setGenerated(true);
      if (flat.length === 0) toast.info('No marketing targets found for the selected filters.');
    } catch (e) {
      toast.error('Failed to fetch marketing target data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcel = () => {
    if (!rows.length) return;
    const headers = ['#', 'Employee', 'Employee ID', 'Period', 'Status', 'Parameter Type', 'Target Value', 'Achieved Value', 'Achievement %', 'Incentive (₹)'];
    const data = rows.map((r, i) => [
      i + 1, r.employee, r.employee_id, r.period, r.status,
      r.param_type, r.target_value, r.achieved_value, r.achievement_pct, r.incentive,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = [4, 22, 14, 24, 10, 24, 14, 14, 12, 12].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marketing Target Report');
    XLSX.writeFile(wb, 'MarketingTargetReport.xlsx');
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Marketing Target Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
        h2 { text-align: center; margin-bottom: 4px; font-size: 15px; }
        p.sub { text-align: center; color: #555; margin-bottom: 12px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a5f; color: #fff; padding: 6px 8px; font-size: 10px; text-align: left; }
        td { border: 1px solid #ddd; padding: 5px 8px; font-size: 10px; }
        tr:nth-child(even) td { background: #f5f8ff; }
        @media print { @page { size: A3 landscape; margin: 10mm; } }
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

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <h6 style={{ fontSize: '1rem', fontWeight: 600, color: '#344054', marginBottom: '1rem' }}>
                Marketing Target Report
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
                    <h2 style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Marketing Target Report</h2>
                    <p className="sub" style={{ textAlign: 'center', color: '#555', marginBottom: 12, fontSize: 12 }}>
                      {selectedEmp ? `Employee: ${getEmpName(selectedEmp)}` : 'All Employees'}
                      {filters.start_date ? ` | From: ${formatDate(filters.start_date)}` : ''}
                      {filters.end_date ? ` | To: ${formatDate(filters.end_date)}` : ''}
                    </p>

                    <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}>
                      <table className="table align-items-center mb-0" style={{ fontSize: '0.78rem' }}>
                        <thead style={{ background: '#1e3a5f' }}>
                          <tr>
                            {['#', 'Employee', 'Emp ID', 'Period', 'Status', 'Parameter Type', 'Target', 'Achieved', 'Ach %', 'Incentive'].map(h => (
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
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                                <span style={{ background: r.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: r.status === 'Active' ? '#16a34a' : '#6b7280', padding: '2px 8px', borderRadius: 12, fontWeight: 600, fontSize: '0.7rem' }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>{r.param_type}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right' }}>{r.target_value}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right' }}>{r.achieved_value}</td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontWeight: 700, color: r.achievement_pct !== '-' ? pctColor(r.pct_num || 0) : '#6b7280' }}>
                                {r.achievement_pct}
                              </td>
                              <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right' }}>{r.incentive}</td>
                            </tr>
                          ))}
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
                <div className="text-center text-muted py-4">No marketing targets found for the selected filters.</div>
              )}

              {!generated && (
                <div className="text-center text-muted py-5" style={{ fontSize: '0.9rem' }}>
                  Select filters and click <strong>Generate Report</strong> to view marketing target data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
