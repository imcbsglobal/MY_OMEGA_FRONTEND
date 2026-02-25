// src/components/TargetManagement/MarketingView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/client';

const MarketingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [marketingData, setMarketingData] = useState({ employee_name: '', employee_email: '', start_date: null, end_date: null, is_active: false, target_parameters: [] });
  const [availableTargets, setAvailableTargets] = useState([]);
  const [showRowModal, setShowRowModal] = useState(false);
  const [rowModalValues, setRowModalValues] = useState({ achieved_value: 0, achieved_amount: 0 });
  const [rowEditingIndex, setRowEditingIndex] = useState(null);
  const [editedParams, setEditedParams] = useState([]);
  const [originalParams, setOriginalParams] = useState([]);
  const [editing, setEditing] = useState(false);
  const permissionToastId = 'marketing-target-permission';
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const showToastOnce = (toastId, showFn) => {
    if (typeof window === 'undefined') {
      showFn();
      return;
    }
    window.__shownToasts = window.__shownToasts || {};
    // debug: log attempts to show the toast
    console.debug('[showToastOnce] attempt', toastId, !!window.__shownToasts[toastId]);
    if (window.__shownToasts[toastId]) return;
    window.__shownToasts[toastId] = true;
    console.trace('[showToastOnce] showing toast', toastId);
    showFn();
  };

  const refreshCurrentTarget = async () => {
    if (!marketingData || !marketingData.id) return;
    try {
      await fetchMarketingTarget(marketingData.id);
      toast.info('Refreshed target from server');
    } catch (e) {
      console.warn('refreshCurrentTarget failed', e);
    }
  };

  const getCurrentUserInfo = () => {
    const info = { employeeId: null, userId: null, email: null };
    try {
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u) {
          if (u.employee_id) info.employeeId = Number(u.employee_id);
          else if (u.employee && (u.employee.id || u.employee.pk)) info.employeeId = Number(u.employee.id || u.employee.pk);
          if (u.email) info.email = u.email;
          if (u.id) info.userId = Number(u.id);
        }
      }
    } catch (e) {
      // ignore
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (!info.userId && (payload.user_id || payload.sub)) info.userId = Number(payload.user_id || payload.sub);
          if (!info.email && payload.email) info.email = payload.email;
          if (!info.employeeId && (payload.employee_id || payload.employee)) info.employeeId = Number(payload.employee_id || payload.employee);
        }
      }
    } catch (e) {
      // ignore token parse errors
    }

    return info;
  };

  useEffect(() => {
    if (!id || id === 'undefined') {
      fetchTargetsList();
      return;
    }
    fetchMarketingTarget(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysBetween = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const pctColor = (pct) => {
    if (pct >= 80) return '#16a34a';
    if (pct >= 50) return '#d97706';
    return '#dc2626';
  };

  const fetchTargetsList = async () => {
    try {
      const resp = await api.get('/target-management/marketing-targets/', { params: { page_size: 200 } });
      let data = resp.data.results || resp.data || [];

      // Determine current user/employee info
      const { employeeId, email, userId } = getCurrentUserInfo();

      // If we have an employee id or email, filter the returned targets to only that employee
      if (employeeId || email || userId) {
        data = (data || []).filter(t => {
          const tEmp = t.employee_id || (t.employee && (t.employee.id || t.employee.pk)) || t.employee;
          const tEmail = t.employee && (t.employee.email || t.employee_email) || t.employee_email || t.email;
          const tUser = t.user_id || t.assigned_to || t.assigned_by;
          if (employeeId && tEmp != null && Number(tEmp) === Number(employeeId)) return true;
          if (email && tEmail && String(tEmail).toLowerCase() === String(email).toLowerCase()) return true;
          if (userId && tUser != null && Number(tUser) === Number(userId)) return true;
          return false;
        });
      }

      setAvailableTargets(data);
      // Do NOT auto-open any target from the list. Require explicit user selection
      // to view details. This avoids unexpected navigation or detail fetches.
      if ((!id || id === 'undefined') && data && data.length > 0) {
        console.debug('fetchTargetsList loaded', { employeeId, resultsCount: data.length });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMarketingTarget = async (targetId) => {
    if (targetId === undefined || targetId === null || targetId === 'undefined' || targetId === '') {
      console.warn('fetchMarketingTarget called with invalid id:', targetId);
      return;
    }
    try {
      const resp = await api.get(`/target-management/marketing-targets/${targetId}/`);
      const data = resp.data || resp.data?.results || resp.data?.data || resp;
      setMarketingData(data || {});
      const snap = (data.target_parameters || []).map(p => ({ ...p }));
      setEditedParams(snap);
      setOriginalParams(snap);
      setLastFetchedAt(new Date().toISOString());
      return data || null;
    } catch (err) {
      console.error(err);
      // If the server returned 403 Forbidden, it's likely the API restricts access
      // to the detail endpoint for non-admin users. Fall back to loading the
      // user's own targets list (uses ?self=true filter) and pick the first one.
      const status = err?.response?.status;
      if (status === 403) {
        showToastOnce(permissionToastId, () => toast.error('You do not have permission to access this marketing target.', { toastId: permissionToastId }));
        try {
          const resp = await api.get('/target-management/marketing-targets/', { params: { page_size: 200, self: 'true' } });
          const list = resp.data.results || resp.data || [];
          setAvailableTargets(list);
          if (list && list.length > 0) {
            const first = list[0];
            setMarketingData(first || {});
            const snap = ((first || {}).target_parameters || []).map(p => ({ ...p }));
            setEditedParams(snap);
            setOriginalParams(snap);
            setLastFetchedAt(new Date().toISOString());
          } else {
            setMarketingData({ employee_name: '', employee_email: '', start_date: null, end_date: null, is_active: false, target_parameters: [] });
            setEditedParams([]);
          }
        } catch (e2) {
          console.error('Fallback list load failed', e2);
          showToastOnce('marketing-targets-load-failed', () => toast.error('Failed to load your targets', { toastId: 'marketing-targets-load-failed' }));
        }
        return null;
      }

      showToastOnce('marketing-target-load-failed', () => toast.error('Failed to load marketing target', { toastId: 'marketing-target-load-failed' }));
    }
    return null;
  };

  const handleParamChange = (idx, field, value) => {
    setEditedParams(prev => {
      const copy = prev ? [...prev] : [];
      copy[idx] = { ...(copy[idx] || {}), [field]: value };
      return copy;
    });
  };

  const saveEdits = async (overrideEditedParams) => {
    if (!marketingData) return;
    const marketingId = marketingData.id;
    const editedToUse = overrideEditedParams || editedParams || [];

    // Build simple per-parameter payloads. We intentionally send numeric fields
    // as numbers when provided. We avoid complicated diff logic to reduce bugs.
    const paramsWithId = (editedToUse || []).filter(p => p && p.id);
    const paramsWithoutId = (editedToUse || []).filter(p => p && !p.id);

    try {
      // Update existing parameters via per-parameter endpoint
      if (paramsWithId.length > 0) {
        await Promise.all(paramsWithId.map(async (p) => {
          const body = {};
          if (p.parameter_label !== undefined) body.parameter_label = p.parameter_label;
          if (p.target_value !== undefined) body.target_value = Number(p.target_value || 0);
          if (p.achieved_value !== undefined) body.achieved_value = Number(p.achieved_value || 0);
          if (p.incentive_value !== undefined) body.incentive_value = Number(p.incentive_value || 0);
          try {
            const r = await api.patch(`/target-management/employee/marketing-target-parameters/${p.id}/`, body);
            if (r && r.data) {
              // merge returned param into state
              setMarketingData(prev => {
                if (!prev) return prev;
                try {
                  const prevParams = Array.isArray(prev.target_parameters) ? [...prev.target_parameters] : [];
                  const idx = prevParams.findIndex(pp => pp && pp.id === r.data.id);
                  if (idx !== -1) prevParams[idx] = { ...(prevParams[idx] || {}), ...r.data };
                  else prevParams.push(r.data);
                  return { ...(prev || {}), target_parameters: prevParams };
                } catch (e) { return prev; }
              });

              setEditedParams(prev => {
                const copy = Array.isArray(prev) ? [...prev] : [];
                const i = copy.findIndex(x => x && x.id === r.data.id);
                if (i !== -1) copy[i] = { ...(copy[i] || {}), ...r.data };
                else copy.push(r.data);
                return copy;
              });

              setOriginalParams(prev => {
                const copy = Array.isArray(prev) ? [...prev] : [];
                const i = copy.findIndex(x => x && x.id === r.data.id);
                if (i !== -1) copy[i] = { ...(copy[i] || {}), ...r.data };
                else copy.push(r.data);
                return copy;
              });

              try { window.__lastMarketingTargetChanged = marketingId; } catch (e) { /* ignore */ }
            }
          } catch (e) {
            console.warn('Parameter update failed for id', p.id, e?.response?.data || e.message || e);
          }
        }));
      }

      // Create new parameters on the marketing target (bulk via target PATCH)
      if (paramsWithoutId.length > 0) {
        if (!marketingId) {
          toast.error('Cannot create parameters: missing target id');
        } else {
          try {
            const resp = await api.patch(`/target-management/marketing-targets/${marketingId}/`, { target_parameters: paramsWithoutId });
            if (resp && resp.data && resp.data.target_parameters) {
              const returned = resp.data.target_parameters || [];
              setMarketingData(prev => {
                const prevParams = (prev && prev.target_parameters) ? [...prev.target_parameters] : [];
                const merged = returned.reduce((acc, ret) => {
                  const fi = acc.findIndex(x => x && x.id === ret.id);
                  if (fi !== -1) acc[fi] = { ...(acc[fi] || {}), ...ret };
                  else acc.push(ret);
                  return acc;
                }, prevParams);
                return { ...(prev || {}), target_parameters: merged };
              });
              const snap = returned.map(p => ({ ...p }));
              setEditedParams(snap);
              setOriginalParams(snap);
              try { window.__lastMarketingTargetChanged = marketingId; } catch (e) { /* ignore */ }
            }
          } catch (e) {
            console.warn('Creating new parameters via marketing-target PATCH failed', e?.response?.data || e.message || e);
          }
        }
      }

      toast.success('Saved changes');
      try { window.dispatchEvent(new Event('marketingTargetChanged')); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Error saving edits', err);
      toast.error('Failed to save changes');
    }
  };

  const startRowEdit = (idx) => {
    setRowEditingIndex(idx);
    // Prefer merged displayParams so modal shows same computed amount as table
    const p = (displayParams && displayParams[idx]) || editedParams[idx] || marketingData.target_parameters[idx] || {};
    const achieved = Number(p.achieved_value || 0);
    const incentive = Number(p.incentive_value || 0);
    const targetVal = Number(p.target_value || 0);
    const achievementPct = Number(p.achievement_percentage || (p.target_value ? (Number(p.achieved_value || 0) / Number(p.target_value || 1)) * 100 : 0)) || 0;
    let achievedAmount = 0;
    if (incentive && incentive !== 0) {
      achievedAmount = achieved * incentive;
    } else if (achievementPct && targetVal && targetVal !== 0) {
      achievedAmount = (achievementPct / 100) * targetVal;
    } else {
      achievedAmount = achieved * incentive;
    }
    setRowModalValues({ achieved_value: achieved, achieved_amount: achievedAmount });
    setShowRowModal(true);
  };

  const saveRowEditFromModal = async () => {
    if (rowEditingIndex == null) return;
    // Convert the entered achieved amount back into an incentive rate expected by the API
    const achieved = Number(rowModalValues.achieved_value || 0);
    const achievedAmount = Number(rowModalValues.achieved_amount || 0);
    const rate = achieved > 0 ? (achievedAmount / achieved) : 0;
    // Prevent saving a no-op where both achieved and achieved amount are zero
    if (achieved === 0 && achievedAmount === 0) {
      toast.warn('Enter an achieved value or achieved amount before saving the row');
      return;
    }

    // If user entered an achieved amount but left achieved count as zero,
    // we cannot compute a per-unit rate. Require a non-zero achieved count.
    if (achieved === 0 && achievedAmount > 0) {
      toast.warn('Please enter the achieved count when providing an achieved amount');
      return;
    }

    // Build a new edited params snapshot synchronously and pass it to saveEdits
    const baseCopy = Array.isArray(editedParams) ? [...editedParams] : ((marketingData.target_parameters || []).map(p => ({ ...p })));
    baseCopy[rowEditingIndex] = { ...(baseCopy[rowEditingIndex] || {}), achieved_value: achieved, incentive_value: rate };
    console.debug('[saveRowEditFromModal] rowIndex=', rowEditingIndex, 'achieved=', achieved, 'achievedAmount=', achievedAmount, 'rate=', rate, 'payload=', baseCopy[rowEditingIndex]);
    setEditedParams(baseCopy);
    setShowRowModal(false);
    setRowEditingIndex(null);
    await saveEdits(baseCopy);
  };

  const saveRowEdit = async (idx) => {
    // Open the modal for the row so user can edit and save
    startRowEdit(idx);
  };

  const cancelRowEdit = (idx) => {
    setRowEditingIndex(null);
    setShowRowModal(false);
    // reset edits back to original
    setEditedParams((marketingData.target_parameters || []).map(p => ({ ...p })));
  };

  const renderStatusIcon = (pct) => {
    if (pct >= 80) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="#16a34a" />
          <path d="M7 12.5l2.5 2.5L17 8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (pct >= 50) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="#d97706" />
          <path d="M12 7v6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="16" r="1" fill="#fff" />
        </svg>
      );
    }
    // Hide red icon for low achievement; return null to show nothing
    return null;
  };

  // Prepare displayParams by merging any edits (prefer id -> parameter_type -> index)
  // Fallback to `editedParams` when server returned no parameters, and if both
  // are empty, fabricate canonical marketing rows so UI shows editable rows.
  const canonicalParamTypes = [
    { parameter_type: 'shops_visited', parameter_label: 'No. of Shops', target_value: 0, incentive_value: 0, achieved_value: 0, achievement_percentage: 0 },
    { parameter_type: 'total_boxes', parameter_label: 'Total Boxes', target_value: 0, incentive_value: 0, achieved_value: 0, achievement_percentage: 0 },
    { parameter_type: 'new_shops', parameter_label: 'New Shops', target_value: 0, incentive_value: 0, achieved_value: 0, achievement_percentage: 0 },
    { parameter_type: 'focus_category', parameter_label: 'Focus Category', target_value: 0, incentive_value: 0, achieved_value: 0, achievement_percentage: 0 },
  ];

  const baseParams = (marketingData && Array.isArray(marketingData.target_parameters) && marketingData.target_parameters.length > 0)
    ? marketingData.target_parameters
    : (Array.isArray(editedParams) && editedParams.length > 0) ? editedParams : canonicalParamTypes;

  const displayParams = baseParams.map((p, mapIdx) => {
    const byId = Array.isArray(editedParams) ? editedParams.find(ep => ep && ep.id && p.id && ep.id === p.id) : null;
    const byType = !byId && Array.isArray(editedParams) ? editedParams.find(ep => ep && ep.parameter_type && ep.parameter_type === p.parameter_type) : null;
    const byIndex = !byId && !byType && Array.isArray(editedParams) ? editedParams[mapIdx] : null;
    return { ...(p || {}), ...((byId || byType || byIndex) || {}) };
  });

  return (
    <div style={{ padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, margin: 0, fontWeight: 700, color: '#111827' }}>Marketing Target Details</h1>
            <p style={{ marginTop: 6, color: '#6b7280' }}>View target parameters and achievement status</p>

            {availableTargets && availableTargets.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <label htmlFor="select-target" style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Select Target</label>
                <select id="select-target" value={marketingData?.id || ''} onChange={(e) => { const sel = e.target.value; if (sel) fetchMarketingTarget(sel); }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 320 }}>
                  <option value="">-- Select a target --</option>
                  {availableTargets.map(t => (
                    <option key={t.id || t.pk} value={t.id || t.pk}>{(t.employee_name || (t.employee && (t.employee.full_name || t.employee.name)) || `#${t.employee_id || t.employee?.id || t.id}`) + ' — ' + (t.start_date ? `${t.start_date} to ${t.end_date}` : '')}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/target/call/marketing')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Back to List</button>
              {marketingData && marketingData.id && (
                <button onClick={refreshCurrentTarget} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Refresh</button>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 18, marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Employee</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{marketingData.employee_name}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{marketingData.employee_email}</div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Period</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{formatDate(marketingData.start_date)} - {formatDate(marketingData.end_date)}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{getDaysBetween(marketingData.start_date, marketingData.end_date)} days</div>
            </div>
          </div>

          <div>
            {marketingData.is_active ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: '#16a34a', display: 'inline-block' }}></span>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: '#ecfdf5', color: '#065f46', fontWeight: 700 }}>Active</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: '#6b7280', display: 'inline-block' }}></span>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: '#f3f4f6', color: '#374151', fontWeight: 700 }}>Inactive</span>
              </div>
            )}
          </div>
        </div>

        {/* Target Parameters Card */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 14, marginTop: 18, border: '1px solid #eef2ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h6 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#374151' }}>Target Parameters</h6>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditing(!editing); if (!editing) { const snap = (marketingData.target_parameters || []).map(p => ({ ...p })); setEditedParams(snap); setOriginalParams(snap); } }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: editing ? '#f3f4f6' : '#fff' }}>{editing ? 'Cancel Edit' : 'Edit'}</button>
              {editing && <button onClick={saveEdits} style={{ padding: '6px 10px', borderRadius: 8, background: '#1f2937', color: '#fff' }}>Save All</button>}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table table-sm align-items-center mb-0" style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%', textAlign: 'left', padding: 8 }}>Parameter Type</th>
                  <th style={{ width: '12%', textAlign: 'right', padding: 8 }}>Target Value</th>
                  <th style={{ width: '12%', textAlign: 'right', padding: 8 }}>Incentive Value (₹)</th>
                  <th style={{ width: '12%', textAlign: 'right', padding: 8 }}>Achieved</th>
                  <th style={{ width: '15%', textAlign: 'right', padding: 8 }}>Achieved Amount</th>
                  <th style={{ width: '16%', textAlign: 'left', padding: 8 }}>Achievement %</th>
                  <th style={{ width: '20%', textAlign: 'center', padding: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {((displayParams || [])).length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 12, color: '#9ca3af' }}>No parameters available</td>
                  </tr>
                ) : (
                  displayParams.map((param, idx) => {
                    const achievementPct = Number(param.achievement_percentage || (param.target_value ? (Number(param.achieved_value || 0) / Number(param.target_value || 1)) * 100 : 0)) || 0;
                    // Compute achieved amount:
                    // 1) preferred: achieved_value * incentive_value
                    // 2) fallback: if incentive_value is zero but achievement_percentage and target_value exist,
                    //    derive amount = achievement_percentage/100 * target_value
                    const achieved = Number(param.achieved_value || 0);
                    const incentive = Number(param.incentive_value || 0);
                    const targetVal = Number(param.target_value || 0);
                    let amount = 0;
                    if (incentive && incentive !== 0) {
                      amount = achieved * incentive;
                    } else if (achievementPct && targetVal && targetVal !== 0) {
                      amount = (achievementPct / 100) * targetVal;
                    } else {
                      amount = achieved * incentive;
                    }
                    return (
                      <tr key={param.id || idx} style={{ background: '#ffffff' }}>
                        <td style={{ padding: 8 }}>
                          {editing ? (
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>{param.parameter_label || param.parameter_type}</div>
                              <input type="text" className="form-control form-control-sm" value={editedParams[idx]?.parameter_label || ''} onChange={(e) => handleParamChange(idx, 'parameter_label', e.target.value)} />
                            </div>
                          ) : (
                            <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>{param.parameter_label || param.parameter_type}</a>
                          )}
                        </td>

                        <td style={{ textAlign: 'right', padding: 8 }}>
                          {editing ? (
                            <input type="number" className="form-control form-control-sm text-end" value={editedParams[idx]?.target_value || 0} onChange={(e) => handleParamChange(idx, 'target_value', e.target.value)} />
                          ) : (
                            <span style={{ display: 'inline-block', minWidth: 80 }}>{Number(param.target_value || 0).toLocaleString()}</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right', padding: 8 }}>
                          {editing ? (
                            <input type="number" className="form-control form-control-sm text-end" value={editedParams[idx]?.incentive_value || param.incentive_value || 0} onChange={(e) => handleParamChange(idx, 'incentive_value', e.target.value)} />
                          ) : (
                            <span style={{ display: 'inline-block', minWidth: 80 }}>₹ {Number(param.incentive_value || 0).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right', padding: 8 }}>
                          {editing ? (
                            <input type="number" className="form-control form-control-sm text-end" value={editedParams[idx]?.achieved_value || 0} onChange={(e) => handleParamChange(idx, 'achieved_value', e.target.value)} />
                          ) : (
                            <span style={{ display: 'inline-block', minWidth: 60, fontWeight: 700 }}>{Number(param.achieved_value || 0).toLocaleString()}</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right', padding: 8 }}>
                          <span style={{ display: 'inline-block', minWidth: 80 }}>{amount.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                        </td>

                        <td style={{ padding: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 700, color: (achievementPct < 50 ? '#ef4444' : pctColor(achievementPct)) }}>{achievementPct.toFixed(2)}%</span>
                              <div style={{ width: 120, height: 6, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', marginTop: 6 }}>
                                <div style={{ width: `${Math.min(achievementPct,100)}%`, height: '100%', background: (achievementPct < 50 ? '#ef4444' : pctColor(achievementPct)), transition: 'width 0.3s ease' }}></div>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: 'center', padding: 8 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            {renderStatusIcon(achievementPct)}

                            <div style={{ marginTop: 6 }}>
                              <button onClick={() => saveRowEdit(idx)} aria-label="Update" style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#374151" />
                                  <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#374151" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row Update Modal */}
        {showRowModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: 'white', borderRadius: 10, width: 520, maxWidth: '95%', padding: 20 }}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Update Achieved</h3>
              <p style={{ marginTop: 0, marginBottom: 12, color: '#6b7280' }}>Enter achieved target and achieved amount (rate).</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Achieved</label>
                  <input type="number" value={rowModalValues.achieved_value} onChange={(e) => setRowModalValues(prev => ({...prev, achieved_value: e.target.value}))} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Achieved Amount</label>
                  <input type="number" value={rowModalValues.achieved_amount} onChange={(e) => setRowModalValues(prev => ({...prev, achieved_amount: e.target.value}))} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => { cancelRowEdit(rowEditingIndex); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Cancel</button>
                <button onClick={saveRowEditFromModal} style={{ padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff' }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingView;

