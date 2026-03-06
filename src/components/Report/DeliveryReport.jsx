import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import api from '../../api/client';

const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (n) => Number(n || 0).toLocaleString('en-IN');

const STATUS_LABELS = {
  scheduled:   'Scheduled',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

const STATUS_COLORS = {
  scheduled:   { bg: '#eff6ff', color: '#1d4ed8' },
  in_progress: { bg: '#fffbeb', color: '#b45309' },
  completed:   { bg: '#f0fdf4', color: '#15803d' },
  cancelled:   { bg: '#fff1f2', color: '#be123c' },
};

export default function DeliveryReport() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employee: '', status: '', start_date: '', end_date: '' });
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
      if (filters.employee)   params.employee   = filters.employee;
      if (filters.status)     params.status     = filters.status;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date)   params.end_date   = filters.end_date;

      const r = await api.get('/delivery-management/deliveries/', { params });
      const data = r.data.results || r.data || [];
      setRows(data);
      setGenerated(true);
      if (data.length === 0) toast.info('No deliveries found for the selected filters.');
    } catch (e) {
      toast.error('Failed to fetch delivery data.');
    } finally {
      setLoading(false);
    }
  };

  const totals = rows.reduce((acc, d) => {
    acc.loaded     += Number(d.total_loaded_boxes    || 0);
    acc.delivered  += Number(d.total_delivered_boxes || 0);
    acc.invoice    += parseFloat(d.total_amount      || 0);
    acc.collected  += parseFloat(d.collected_amount  || 0);
    return acc;
  }, { loaded: 0, delivered: 0, invoice: 0, collected: 0 });

  const handleExcel = () => {
    if (!rows.length) return;
    const headers = [
      '#', 'Delivery #', 'Status', 'Driver', 'Vehicle', 'Route',
      'Scheduled Date', 'Scheduled Time',
      'Boxes Loaded', 'Boxes Delivered', 'Balance Boxes',
      'Invoice (₹)', 'Collected (₹)',
    ];
    const data = rows.map((d, i) => [
      i + 1,
      d.delivery_number,
      STATUS_LABELS[d.status] || d.status || '-',
      d.employee_name || '-',
      d.vehicle_number || '-',
      d.route_name || '-',
      d.scheduled_date || '-',
      d.scheduled_time || '-',
      d.total_loaded_boxes || 0,
      d.total_delivered_boxes || 0,
      Math.max(0, (d.total_loaded_boxes || 0) - (d.total_delivered_boxes || 0)),
      parseFloat(d.total_amount || 0).toFixed(2),
      parseFloat(d.collected_amount || 0).toFixed(2),
    ]);

    const totalsRow = [
      'TOTAL', '', '', '', '', '', '', '',
      totals.loaded, totals.delivered,
      Math.max(0, totals.loaded - totals.delivered),
      totals.invoice.toFixed(2),
      totals.collected.toFixed(2),
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data, totalsRow]);
    ws['!cols'] = [4, 16, 12, 20, 14, 20, 14, 12, 10, 10, 10, 14, 14].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery Report');
    XLSX.writeFile(wb, 'DeliveryReport.xlsx');
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Delivery Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
        h2 { text-align: center; margin-bottom: 4px; font-size: 15px; }
        p.sub { text-align: center; color: #555; margin-bottom: 12px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0f172a; color: #fff; padding: 6px 8px; font-size: 10px; text-align: left; }
        td { border: 1px solid #ddd; padding: 5px 8px; font-size: 10px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .totals td { background: #0f172a !important; color: #fff; font-weight: 700; }
        .badge { padding: 2px 7px; border-radius: 10px; font-size: 9px; font-weight: 700; }
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
  const balance = Math.max(0, totals.loaded - totals.delivered);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <h6 style={{ fontSize: '1rem', fontWeight: 600, color: '#344054', marginBottom: '1rem' }}>
                Delivery Report
              </h6>

              {/* Filter bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: '1rem' }}>

                <div style={{ flex: '0 0 auto', minWidth: 180 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>Employee / Driver</label>
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

                <div style={{ flex: '0 0 auto', minWidth: 150 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.35rem' }}>Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                    style={{ fontSize: '0.8rem', height: 32, padding: '0.25rem 0.5rem' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                    onClick={() => { setFilters({ employee: '', status: '', start_date: '', end_date: '' }); setRows([]); setGenerated(false); }}
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
                      { label: 'Total Deliveries', value: rows.length,             color: '#0f172a' },
                      { label: 'Boxes Loaded',      value: fmtN(totals.loaded),    color: '#1d4ed8' },
                      { label: 'Boxes Delivered',   value: fmtN(totals.delivered), color: '#15803d' },
                      { label: 'Balance Boxes',     value: fmtN(balance),          color: '#b45309' },
                      { label: 'Total Invoice',     value: `₹${fmt(totals.invoice)}`,   color: '#7c3aed' },
                      { label: 'Total Collected',   value: `₹${fmt(totals.collected)}`, color: '#15803d' },
                    ].map(c => (
                      <div key={c.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem 1.25rem', minWidth: 140, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flex: '1 1 auto' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c.color }}>{c.value}</div>
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
                    <h2 style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Delivery Report</h2>
                    <p className="sub" style={{ textAlign: 'center', color: '#555', marginBottom: 12, fontSize: 12 }}>
                      {selectedEmp ? `Driver: ${getEmpName(selectedEmp)}` : 'All Employees'}
                      {filters.status ? ` | Status: ${STATUS_LABELS[filters.status]}` : ''}
                      {filters.start_date ? ` | From: ${filters.start_date}` : ''}
                      {filters.end_date ? ` | To: ${filters.end_date}` : ''}
                    </p>

                    <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}>
                      <table className="table align-items-center mb-0" style={{ fontSize: '0.78rem' }}>
                        <thead style={{ background: '#0f172a' }}>
                          <tr>
                            {['#', 'Delivery #', 'Status', 'Driver', 'Vehicle', 'Route', 'Date', 'Time', 'Loaded', 'Delivered', 'Balance', 'Invoice (₹)', 'Collected (₹)'].map(h => (
                              <th key={h} style={{ color: '#fff', background: '#0f172a', padding: '8px 10px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((d, i) => {
                            const sc = STATUS_COLORS[d.status] || { bg: '#f3f4f6', color: '#6b7280' };
                            const bal = Math.max(0, (d.total_loaded_boxes || 0) - (d.total_delivered_boxes || 0));
                            return (
                              <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>{i + 1}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>{d.delivery_number}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                                  <span className="badge" style={{ background: sc.bg, color: sc.color, padding: '2px 8px', borderRadius: 12, fontWeight: 600, fontSize: '0.7rem' }}>
                                    {STATUS_LABELS[d.status] || d.status}
                                  </span>
                                </td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{d.employee_name || '—'}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>{d.vehicle_number || '—'}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>{d.route_name || '—'}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem' }}>{d.scheduled_date || '—'}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#6b7280' }}>{d.scheduled_time || '—'}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontFamily: 'monospace' }}>{fmtN(d.total_loaded_boxes)}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontFamily: 'monospace', color: '#15803d', fontWeight: 700 }}>{fmtN(d.total_delivered_boxes)}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontFamily: 'monospace', color: bal > 0 ? '#b45309' : '#15803d', fontWeight: 600 }}>{fmtN(bal)}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontFamily: 'monospace' }}>₹{fmt(d.total_amount)}</td>
                                <td style={{ padding: '6px 10px', fontSize: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#15803d' }}>₹{fmt(d.collected_amount)}</td>
                              </tr>
                            );
                          })}
                          {/* Totals row */}
                          <tr className="totals">
                            <td colSpan={8} style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, background: '#0f172a', color: '#fff', textAlign: 'right' }}>
                              TOTAL ({rows.length} records)
                            </td>
                            <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', background: '#0f172a', color: '#fff', fontFamily: 'monospace' }}>{fmtN(totals.loaded)}</td>
                            <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', background: '#0f172a', color: '#fff', fontFamily: 'monospace' }}>{fmtN(totals.delivered)}</td>
                            <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', background: '#0f172a', color: '#fff', fontFamily: 'monospace' }}>{fmtN(balance)}</td>
                            <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', background: '#0f172a', color: '#fff', fontFamily: 'monospace' }}>₹{fmt(totals.invoice)}</td>
                            <td style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right', background: '#0f172a', color: '#fff', fontFamily: 'monospace' }}>₹{fmt(totals.collected)}</td>
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
                <div className="text-center text-muted py-4">No deliveries found for the selected filters.</div>
              )}

              {!generated && (
                <div className="text-center text-muted py-5" style={{ fontSize: '0.9rem' }}>
                  Select filters and click <strong>Generate Report</strong> to view delivery data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
