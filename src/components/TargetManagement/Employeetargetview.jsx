// src/components/TargetManagement/EmployeeTargetView.jsx
// FEATURE: Weekly Day-Picker for daily call target updates
// - Click "Update" on any call target period
// - A modal opens showing every day in that week as selectable day cards
// - Pick any day → fill in that day's achieved calls, productive calls, orders, amount
// - Saves to the correct CallDailyTarget record for that specific date

import React, { useState, useEffect } from 'react';
import './targetManagement.css';
import { toast } from 'react-toastify';
import api from '../../api/client';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmtShort = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
};

const fmtFull = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isoDate = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dayLabel  = (s) => s ? new Date(s).toLocaleDateString('en-IN', { weekday: 'short' }) : '';
const dayNum    = (s) => s ? new Date(s).getDate() : '';
const monthLbl  = (s) => s ? new Date(s).toLocaleDateString('en-IN', { month: 'short' }) : '';

const pct = (val) => { const n = parseFloat(val); return isNaN(n) ? '0.00%' : `${n.toFixed(2)}%`; };
const pctColor = (val) => { const n = parseFloat(val); return n >= 80 ? '#16a34a' : n >= 50 ? '#d97706' : '#dc2626'; };

const getDaysInRange = (startStr, endStr) => {
  const days = []; const start = new Date(startStr); const end = new Date(endStr);
  const cur = new Date(start);
  while (cur <= end) { days.push(isoDate(cur)); cur.setDate(cur.getDate() + 1); }
  return days;
};

const today = isoDate(new Date());

/**
 * Returns the best default day to pre-select when the modal opens:
 *  1. today, if today falls within [startStr, endStr]
 *  2. the most recent past day in the range (period already started but today > endDate)
 *  3. null if the entire period is in the future (user must pick manually)
 */
const bestDefaultDay = (startStr, endStr) => {
  if (!startStr || !endStr) return null;
  if (today >= startStr && today <= endStr) return today;
  const days = getDaysInRange(startStr, endStr);
  // Most recent past day in the period (period has ended)
  const pastDays = days.filter(d => d <= today);
  if (pastDays.length > 0) return pastDays[pastDays.length - 1];
  // Entire period is in the future — don't pre-select anything
  return null;
};

// ─── component ──────────────────────────────────────────────────────────────
const EmployeeTargetView = () => {
  const [callTargets, setCallTargets]   = useState([]);
  const [routeTargets, setRouteTargets] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('call');
  const [modal, setModal]               = useState(null);
  const [selectedDay, setSelectedDay]   = useState(null);
  const [saving, setSaving]             = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // day-report modal
  const [form, setForm] = useState({
    achieved_calls: '', productive_calls: '', order_received: '',
    order_amount: '', remarks: '', achieved_boxes: '', achieved_amount: '',
  });

  useEffect(() => { fetchMyTargets(); }, []);

  const totalTargetCalls   = callTargets.reduce((s, t) => s + (Number(t.total_target_calls) || 0), 0);
  const totalAchievedCalls = callTargets.reduce((s, t) => s + (Number(t.total_achieved_calls) || 0), 0);
  const overallPct         = totalTargetCalls > 0 ? (totalAchievedCalls / totalTargetCalls) * 100 : 0;

  const fetchMyTargets = async () => {
    setLoading(true);
    try {
      const [cRes, rRes] = await Promise.all([
        api.get('/target-management/my-call-targets/'),
        api.get('/target-management/my-route-targets/'),
      ]);
      setCallTargets(cRes.data.results ?? (Array.isArray(cRes.data) ? cRes.data : []));
      setRouteTargets(rRes.data.results ?? (Array.isArray(rRes.data) ? rRes.data : []));
    } catch (err) { toast.error('Failed to load your targets'); console.error(err); }
    finally { setLoading(false); }
  };

  const openModal = (target, type) => {
    setModal({ target, type });

    // BUG FIX: Default to the best day WITHIN the target period, not blindly to
    // today. If today is outside the period (e.g. target is a future week) this
    // previously pre-set selectedDay to today, causing "No target record for <today>"
    // even though the user was looking at a completely different week.
    const defaultDay = type === 'call'
      ? bestDefaultDay(target.start_date, target.end_date)
      : null;
    setSelectedDay(defaultDay);

    const emptyForm = { achieved_calls: '', productive_calls: '', order_received: '', order_amount: '', remarks: '', achieved_boxes: '', achieved_amount: '' };
    // Pre-fill with existing data for the default day (if any)
    if (type === 'call' && defaultDay) {
      const existing = (target.daily_targets || []).find(dt => dt.target_date === defaultDay);
      if (existing) {
        setForm({
          achieved_calls:   existing.achieved_calls   ?? '',
          productive_calls: existing.productive_calls ?? '',
          order_received:   existing.order_received   ?? '',
          order_amount:     existing.order_amount     ?? '',
          remarks:          existing.remarks          ?? '',
          achieved_boxes:   '',
          achieved_amount:  '',
        });
        return;
      }
    }
    setForm(emptyForm);
  };

  const closeModal = () => { setModal(null); setSelectedDay(null); setSaving(false); };

  const handleDaySelect = (dateStr) => {
    setSelectedDay(dateStr);
    if (!modal) return;
    const existing = (modal.target.daily_targets || []).find(dt => dt.target_date === dateStr);
    if (existing) {
      setForm({ achieved_calls: existing.achieved_calls ?? '', productive_calls: existing.productive_calls ?? '', order_received: existing.order_received ?? '', order_amount: existing.order_amount ?? '', remarks: existing.remarks ?? '', achieved_boxes: '', achieved_amount: '' });
    } else {
      setForm({ achieved_calls: '', productive_calls: '', order_received: '', order_amount: '', remarks: '', achieved_boxes: '', achieved_amount: '' });
    }
  };

  const handleSave = async () => {
    if (!modal) return;
    if (modal.type === 'call') {
      if (!selectedDay) { toast.error('Please select a day first'); return; }
      const dt = (modal.target.daily_targets || []).find(d => d.target_date === selectedDay);
      if (!dt) {
        toast.error(
          `No daily target record for ${fmtFull(selectedDay)}. ` +
          `Ask your manager to set daily targets for this period.`
        );
        return;
      }
      const payload = {};
      if (form.achieved_calls !== '')   payload.achieved_calls   = parseInt(form.achieved_calls, 10);
      if (form.productive_calls !== '') payload.productive_calls = parseInt(form.productive_calls, 10);
      if (form.order_received !== '')   payload.order_received   = parseInt(form.order_received, 10);
      if (form.order_amount !== '')     payload.order_amount     = parseFloat(form.order_amount);
      if (form.remarks !== '')          payload.remarks          = form.remarks;
      setSaving(true);
      try {
        await api.post(`/target-management/employee/call-daily-targets/${dt.id}/update-achievement/`, payload);
        toast.success(`✓ Saved: ${dayLabel(selectedDay)} ${dayNum(selectedDay)} ${monthLbl(selectedDay)}`);
        closeModal(); fetchMyTargets();
      } catch (err) { toast.error(err?.response?.data?.detail || 'Update failed'); }
      finally { setSaving(false); }
    } else {
      const payload = {};
      if (form.achieved_boxes !== '')  payload.achieved_boxes  = parseFloat(form.achieved_boxes);
      if (form.achieved_amount !== '') payload.achieved_amount = parseFloat(form.achieved_amount);
      if (form.remarks !== '')         payload.remarks         = form.remarks;
      setSaving(true);
      try {
        await api.post(`/target-management/employee/route-targets/${modal.target.id}/update-achievement/`, payload);
        toast.success('Route achievement updated!'); closeModal(); fetchMyTargets();
      } catch (err) { toast.error(err?.response?.data?.detail || 'Update failed'); }
      finally { setSaving(false); }
    }
  };

  const getDT = (target, dateStr) => (target.daily_targets || []).find(d => d.target_date === dateStr);

  // ── styles ──────────────────────────────────────────────────────────────
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 };

  if (loading) return (
    <div className="tm-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner-border text-danger" />
        <p style={{ marginTop: 12, color: '#9ca3af', fontSize: 14 }}>Loading your targets…</p>
      </div>
    </div>
  );

  return (
    <div className="tm-page">

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Call Targets', value: callTargets.length },
          { label: 'Target Calls',       value: totalTargetCalls },
          { label: 'Achieved Calls',     value: totalAchievedCalls },
          { label: 'Achievement Rate',   value: pct(overallPct), color: pctColor(overallPct) },
          { label: 'Route Targets',      value: routeTargets.length },
        ].map(c => (
          <div key={c.label} className="tm-card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color || '#111' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── Main card ── */}
      <div className="tm-card">

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f3f4f6', marginBottom: 16 }}>
          <div style={{ display: 'flex' }}>
            {[{ key: 'call', label: `Call Targets (${callTargets.length})` }, { key: 'route', label: `Route Targets (${routeTargets.length})` }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 700 : 500, fontSize: 14,
                color: activeTab === tab.key ? '#dc2626' : '#6b7280',
                borderBottom: activeTab === tab.key ? '2px solid #dc2626' : '2px solid transparent',
                marginBottom: -2, transition: 'all .15s',
              }}>{tab.label}</button>
            ))}
          </div>
          <button onClick={fetchMyTargets} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
            ↻ Refresh
          </button>
        </div>

        {/* Call targets */}
        {activeTab === 'call' && (
          callTargets.length === 0
            ? <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af' }}>No call targets assigned to you yet.</div>
            : (
              <div className="table-responsive">
                <table className="table tm-table" style={{ minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th className="text-center">Target Calls</th>
                      <th className="text-center">Achieved Calls</th>
                      <th className="text-center">Achievement %</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callTargets.map(target => (
                      <tr key={target.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtShort(target.start_date)} – {fmtShort(target.end_date)}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{target.duration_days ?? getDaysInRange(target.start_date, target.end_date).length} days</div>
                        </td>
                        <td className="text-center" style={{ fontWeight: 600 }}>{target.total_target_calls ?? 0}</td>
                        <td className="text-center" style={{ fontWeight: 600 }}>{target.total_achieved_calls ?? 0}</td>
                        <td className="text-center"><span style={{ color: pctColor(target.achievement_percentage), fontWeight: 700 }}>{pct(target.achievement_percentage)}</span></td>
                        <td className="text-center">
                          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: target.is_active ? '#dcfce7' : '#f3f4f6', color: target.is_active ? '#15803d' : '#6b7280' }}>
                            {target.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                          <button onClick={() => openModal(target, 'call')} disabled={!target.is_active} style={{
                            background: target.is_active ? '#dc2626' : '#e5e7eb', color: target.is_active ? '#fff' : '#9ca3af',
                            border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, fontSize: 13,
                            cursor: target.is_active ? 'pointer' : 'default', marginRight: 6,
                          }}>
                            Update
                          </button>
                          <button onClick={() => setReportTarget(target)} style={{
                            background: '#fff', color: '#374151',
                            border: '1.5px solid #e5e7eb', borderRadius: 6, padding: '6px 14px',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer',
                          }}>
                            📊 Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}

        {/* Route targets */}
        {activeTab === 'route' && (
          routeTargets.length === 0
            ? <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af' }}>No route targets assigned to you yet.</div>
            : (
              <div className="table-responsive">
                <table className="table tm-table" style={{ minWidth: 800 }}>
                  <thead>
                    <tr>
                      <th>Route</th><th>Period</th>
                      <th className="text-center">Target Boxes</th><th className="text-center">Achieved Boxes</th>
                      <th className="text-center">Boxes %</th><th className="text-center">Target ₹</th>
                      <th className="text-center">Achieved ₹</th><th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeTargets.map(target => (
                      <tr key={target.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{target.route_name || `${target.route_origin} → ${target.route_destination}`}</div>
                          {target.route_code && <div style={{ fontSize: 12, color: '#9ca3af' }}>{target.route_code}</div>}
                        </td>
                        <td><div style={{ fontSize: 13 }}>{fmtShort(target.start_date)} – {fmtShort(target.end_date)}</div><div style={{ fontSize: 12, color: '#9ca3af' }}>{target.duration_days} days</div></td>
                        <td className="text-center">{Number(target.target_boxes ?? 0).toFixed(2)}</td>
                        <td className="text-center">{Number(target.achieved_boxes ?? 0).toFixed(2)}</td>
                        <td className="text-center"><span style={{ color: pctColor(target.achievement_percentage_boxes), fontWeight: 700 }}>{pct(target.achievement_percentage_boxes)}</span></td>
                        <td className="text-center">₹{Number(target.target_amount ?? 0).toLocaleString('en-IN')}</td>
                        <td className="text-center">₹{Number(target.achieved_amount ?? 0).toLocaleString('en-IN')}</td>
                        <td className="text-center">
                          <button onClick={() => openModal(target, 'route')} disabled={!target.is_active} style={{ background: target.is_active ? '#dc2626' : '#e5e7eb', color: target.is_active ? '#fff' : '#9ca3af', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, fontSize: 13, cursor: target.is_active ? 'pointer' : 'default' }}>Update</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}
      </div>

      {/* ══════════════════════════════════════════════
          DAY REPORT MODAL
      ══════════════════════════════════════════════ */}
      {reportTarget && (() => {
        const dt = [...(reportTarget.daily_targets || [])].sort((a, b) => a.target_date > b.target_date ? 1 : -1);
        const totalTarget   = dt.reduce((s, d) => s + (Number(d.target_calls)    || 0), 0);
        const totalAchieved = dt.reduce((s, d) => s + (Number(d.achieved_calls)  || 0), 0);
        const totalProd     = dt.reduce((s, d) => s + (Number(d.productive_calls)|| 0), 0);
        const totalOrders   = dt.reduce((s, d) => s + (Number(d.order_received)  || 0), 0);
        const totalAmount   = dt.reduce((s, d) => s + (Number(d.order_amount)    || 0), 0);
        const overallAch    = totalTarget  > 0 ? (totalAchieved / totalTarget)  * 100 : 0;
        const overallProd   = totalAchieved > 0 ? (totalProd / totalAchieved) * 100 : 0;

        const MiniBar = ({ val }) => {
          const w = Math.min(Number(val) || 0, 100);
          const color = w >= 80 ? '#16a34a' : w >= 50 ? '#d97706' : '#dc2626';
          return (
            <div style={{ background: '#f3f4f6', borderRadius: 4, height: 5, width: '100%', overflow: 'hidden', marginTop: 3 }}>
              <div style={{ width: `${w}%`, height: '100%', background: color, borderRadius: 4 }} />
            </div>
          );
        };

        return (
          <div onClick={() => setReportTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060, padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 820, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>

              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)', borderRadius: '14px 14px 0 0', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>📊 Daily Call Report</div>
                  <div style={{ color: '#bfdbfe', fontSize: 13, marginTop: 2 }}>
                    {fmtFull(reportTarget.start_date)} – {fmtFull(reportTarget.end_date)}
                    {reportTarget.duration_days ? ` · ${reportTarget.duration_days} days` : ''}
                  </div>
                </div>
                <button onClick={() => setReportTarget(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, width: 32, height: 32, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>

              <div style={{ padding: '20px 24px' }}>

                {/* Period summary strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 24 }}>
                  {[
                    { label: 'Target Calls',  value: totalTarget,    color: '#374151' },
                    { label: 'Achieved',      value: totalAchieved,  color: pctColor(overallAch) },
                    { label: 'Achievement',   value: pct(overallAch),color: pctColor(overallAch) },
                    { label: 'Productive',    value: totalProd,      color: '#2563eb' },
                    { label: 'Productivity',  value: pct(overallProd),color: pctColor(overallProd) },
                    { label: 'Orders',        value: totalOrders,    color: '#374151' },
                    { label: 'Order Amount',  value: `₹${Number(totalAmount).toLocaleString('en-IN')}`, color: '#374151' },
                  ].map(c => (
                    <div key={c.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', textAlign: 'center', border: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{c.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: c.color }}>{c.value ?? '-'}</div>
                    </div>
                  ))}
                </div>

                {/* Day-by-day table */}
                {dt.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', background: '#f9fafb', borderRadius: 10 }}>
                    No daily records found for this period.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                          {[
                            { label: 'Day',         align: 'left'   },
                            { label: 'Date',        align: 'left'   },
                            { label: 'Target',      align: 'center' },
                            { label: 'Achieved',    align: 'center' },
                            { label: 'Achievement', align: 'center' },
                            { label: 'Productive',  align: 'center' },
                            { label: 'Productivity',align: 'center' },
                            { label: 'Orders',      align: 'center' },
                            { label: 'Amount (₹)',  align: 'center' },
                            { label: 'Remarks',     align: 'left'   },
                          ].map(h => (
                            <th key={h.label} style={{ padding: '8px 10px', textAlign: h.align, color: '#6b7280', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>
                              {h.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dt.map((d, i) => {
                          const achPct  = Number(d.achievement_percentage  || 0);
                          const prodPct = Number(d.productivity_percentage || 0);
                          const isToday   = d.target_date === today;
                          const hasFilled = (Number(d.achieved_calls) || 0) > 0;
                          return (
                            <tr key={d.id || i} style={{ background: isToday ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '10px 10px', fontWeight: 700, color: isToday ? '#2563eb' : '#374151', whiteSpace: 'nowrap' }}>
                                {d.day_name || dayLabel(d.target_date)}
                                {isToday && <span style={{ marginLeft: 4, fontSize: 9, background: '#2563eb', color: '#fff', borderRadius: 3, padding: '1px 4px', fontWeight: 700, verticalAlign: 'middle' }}>TODAY</span>}
                              </td>
                              <td style={{ padding: '10px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{fmtFull(d.target_date)}</td>
                              <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>{d.target_calls ?? 0}</td>
                              <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: hasFilled ? pctColor(achPct) : '#d1d5db' }}>
                                {hasFilled ? d.achieved_calls : '—'}
                              </td>
                              <td style={{ padding: '10px 10px', minWidth: 90 }}>
                                <div style={{ textAlign: 'center', fontWeight: 700, color: hasFilled ? pctColor(achPct) : '#d1d5db', fontSize: 12 }}>
                                  {hasFilled ? pct(achPct) : '—'}
                                </div>
                                {hasFilled && <MiniBar val={achPct} />}
                              </td>
                              <td style={{ padding: '10px 10px', textAlign: 'center', color: hasFilled ? '#374151' : '#d1d5db' }}>
                                {hasFilled ? (d.productive_calls ?? 0) : '—'}
                              </td>
                              <td style={{ padding: '10px 10px', minWidth: 90 }}>
                                <div style={{ textAlign: 'center', fontWeight: 600, color: hasFilled ? pctColor(prodPct) : '#d1d5db', fontSize: 12 }}>
                                  {hasFilled ? pct(prodPct) : '—'}
                                </div>
                                {hasFilled && <MiniBar val={prodPct} />}
                              </td>
                              <td style={{ padding: '10px 10px', textAlign: 'center', color: hasFilled ? '#374151' : '#d1d5db' }}>
                                {hasFilled ? (d.order_received ?? 0) : '—'}
                              </td>
                              <td style={{ padding: '10px 10px', textAlign: 'center', color: hasFilled ? '#374151' : '#d1d5db' }}>
                                {hasFilled ? `₹${Number(d.order_amount || 0).toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td style={{ padding: '10px 10px', color: '#6b7280', maxWidth: 140, fontSize: 12 }}>
                                {d.remarks || <span style={{ color: '#e5e7eb' }}>—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                          <td colSpan={2} style={{ padding: '10px 10px', fontWeight: 700, fontSize: 13, color: '#374151' }}>Total / Overall</td>
                          <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800 }}>{totalTarget}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, color: pctColor(overallAch) }}>{totalAchieved}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, color: pctColor(overallAch) }}>{pct(overallAch)}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>{totalProd}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: pctColor(overallProd) }}>{pct(overallProd)}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>{totalOrders}</td>
                          <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>₹{Number(totalAmount).toLocaleString('en-IN')}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setReportTarget(null)} style={{ padding: '8px 24px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════
          UPDATE MODAL
      ══════════════════════════════════════════════ */}
      {modal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: modal.type === 'call' ? 640 : 460, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#dc2626 0%,#991b1b 100%)', borderRadius: '14px 14px 0 0', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>
                  {modal.type === 'call' ? 'Update Daily Call Achievement' : 'Update Route Achievement'}
                </div>
                <div style={{ color: '#fecaca', fontSize: 13, marginTop: 2 }}>
                  {fmtFull(modal.target.start_date)} – {fmtFull(modal.target.end_date)}
                </div>
              </div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, width: 32, height: 32, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '20px 24px' }}>

              {/* ── CALL: Day picker ── */}
              {modal.type === 'call' && (() => {
                const days = getDaysInRange(modal.target.start_date, modal.target.end_date);
                const cols = Math.min(days.length, 7);
                return (
                  <>
                    {/* Step 1 label */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                      Step 1 — Select a Day
                    </div>

                    {/* Day grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, marginBottom: 6 }}>
                      {days.map(dateStr => {
                        const dt          = getDT(modal.target, dateStr);
                        const isSelected  = dateStr === selectedDay;
                        // A day is disabled only when the manager hasn't created a
                        // daily target record for it — not because it's "in the future".
                        // Managers often pre-create records for the whole week, so
                        // employees must be able to select any day that has a record.
                        const isDisabled  = !dt;
                        const hasFilled   = dt && (dt.achieved_calls > 0);
                        const achieved    = dt?.achieved_calls ?? null;
                        const tgt         = dt?.target_calls ?? null;

                        return (
                          <button
                            key={dateStr}
                            onClick={() => !isDisabled && handleDaySelect(dateStr)}
                            title={isDisabled ? 'No target record for this day — ask your manager' : ''}
                            style={{
                              border: `2px solid ${isSelected ? '#dc2626' : hasFilled ? '#16a34a' : '#e5e7eb'}`,
                              borderRadius: 10, padding: '10px 4px',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              background: isSelected ? '#fef2f2' : hasFilled ? '#f0fdf4' : isDisabled ? '#f9fafb' : '#fff',
                              textAlign: 'center', transition: 'all .15s',
                              opacity: isDisabled ? 0.45 : 1,
                              outline: 'none',
                            }}
                          >
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: isSelected ? '#dc2626' : hasFilled ? '#16a34a' : '#9ca3af' }}>
                              {dayLabel(dateStr)}
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, color: isSelected ? '#dc2626' : '#111' }}>
                              {dayNum(dateStr)}
                            </div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{monthLbl(dateStr)}</div>
                            {dateStr === today && (
                              <div style={{ marginTop: 3, fontSize: 9, fontWeight: 700, background: '#dc2626', color: '#fff', borderRadius: 3, padding: '1px 3px', display: 'inline-block' }}>TODAY</div>
                            )}
                            {hasFilled && (
                              <div style={{ marginTop: 3, fontSize: 10, color: '#16a34a', fontWeight: 600 }}>
                                ✓ {achieved}{tgt ? `/${tgt}` : ''}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20, fontSize: 11, color: '#6b7280', flexWrap: 'wrap' }}>
                      {[
                        { bg: '#fef2f2', border: '#dc2626', label: 'Selected' },
                        { bg: '#f0fdf4', border: '#16a34a', label: 'Updated' },
                        { bg: '#fff',    border: '#e5e7eb', label: 'Pending' },
                      ].map(l => (
                        <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: l.bg, border: `2px solid ${l.border}` }} />
                          {l.label}
                        </span>
                      ))}
                    </div>

                    {/* Step 2 + fields */}
                    {selectedDay && (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                          Step 2 — Enter Achievement for {dayLabel(selectedDay)} {dayNum(selectedDay)} {monthLbl(selectedDay)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          {[
                            { key: 'achieved_calls',   label: 'Achieved Calls',   step: '1' },
                            { key: 'productive_calls', label: 'Productive Calls',  step: '1' },
                            { key: 'order_received',   label: 'Orders Received',   step: '1' },
                            { key: 'order_amount',     label: 'Order Amount (₹)',  step: '0.01' },
                          ].map(f => (
                            <div key={f.key}>
                              <label style={labelStyle}>{f.label}</label>
                              <input type="number" min="0" step={f.step} placeholder="0" value={form[f.key]}
                                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = '#dc2626')}
                                onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                            </div>
                          ))}
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Remarks <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                            <textarea rows={2} placeholder="Any notes for this day…" value={form.remarks}
                              onChange={e => setForm(prev => ({ ...prev, remarks: e.target.value }))}
                              style={{ ...inputStyle, resize: 'vertical' }}
                              onFocus={e => (e.target.style.borderColor = '#dc2626')}
                              onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                          </div>
                        </div>
                      </>
                    )}

                    {!selectedDay && (
                      <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, padding: '20px 0', background: '#f9fafb', borderRadius: 8 }}>
                        ↑ Pick a day above to enter its achievement
                      </div>
                    )}
                  </>
                );
              })()}

              {/* ── ROUTE: Simple fields ── */}
              {modal.type === 'route' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    { key: 'achieved_boxes',  label: 'Achieved Boxes',       step: '0.01' },
                    { key: 'achieved_amount', label: 'Achieved Amount (₹)',   step: '0.01' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type="number" min="0" step={f.step} placeholder="0.00" value={form[f.key]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = '#dc2626')}
                        onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Remarks</label>
                    <textarea rows={2} placeholder="Optional notes…" value={form.remarks}
                      onChange={e => setForm(prev => ({ ...prev, remarks: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => (e.target.style.borderColor = '#dc2626')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeModal} style={{ padding: '8px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || (modal.type === 'call' && !selectedDay)} style={{
                padding: '8px 24px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: (saving || (modal.type === 'call' && !selectedDay)) ? '#fca5a5' : '#dc2626', color: '#fff', transition: 'background .15s',
              }}>
                {saving ? 'Saving…' : 'Save Achievement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTargetView;