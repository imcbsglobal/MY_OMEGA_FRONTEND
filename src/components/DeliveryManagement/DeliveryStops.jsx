/**
 * DeliveryStops.jsx
 *
 * Three modes:
 *  1. wizardMode=true  → stop row editor (add/remove/reorder stops before creation)
 *  2. deliveryId + status="scheduled"   → read-only list (cannot add/edit/delete stops)
 *  3. deliveryId + status="in_progress" → can add stops + expandable stop-completion form
 *  4. deliveryId + status="completed"   → read-only summary per stop
 */
import React, { useEffect, useState } from "react";
import api from "../../api/client";

const STOP_STATUS_META = {
  pending:   { bg: "#f1f5f9", color: "#475569", label: "Pending" },
  delivered: { bg: "#dcfce7", color: "#15803d", label: "Delivered" },
  partial:   { bg: "#fef9c3", color: "#a16207", label: "Partial" },
  failed:    { bg: "#fee2e2", color: "#b91c1c", label: "Failed" },
  skipped:   { bg: "#f3e8ff", color: "#7e22ce", label: "Skipped" },
};

const fmt = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DeliveryStops({
  // ── View/active mode ──
  deliveryId,
  deliveryStatus,
  onStopsUpdated,          // callback to refresh parent (e.g. live totals)

  // ── Wizard mode ──
  wizardMode = false,
  stopRows,
  onStopRowsChange,
}) {
  // ── View/active state ──
  const [stops, setStops]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [expandedStop, setExpanded] = useState(null);
  const [stopForms, setStopForms]   = useState({});   // { [stopId]: { delivered_boxes, collected_amount, ... } }

  // ── In-progress mode create/edit ──
  const [showForm, setShowForm]     = useState(false);
  const [editingStop, setEditing]   = useState(null);

  const isScheduled = deliveryStatus === "scheduled";
  const isActive    = deliveryStatus === "in_progress";
  const isCompleted = deliveryStatus === "completed";

  // ── Fetch stops ──
  const fetchStops = async () => {
    if (!deliveryId || wizardMode) return;
    try {
      const res = await api.get(`/delivery-management/deliveries/${deliveryId}/stops/`);
      const data = res.data?.results || res.data || [];
      setStops(data);
      // Seed stop forms
      const forms = {};
      data.forEach(s => {
        forms[s.id] = {
          delivered_boxes: s.delivered_boxes || "",
          collected_amount: s.collected_amount || "",
          status: s.status || "delivered",
          notes: s.notes || "",
          failure_reason: s.failure_reason || "",
        };
      });
      setStopForms(forms);
    } catch { setStops([]); }
  };

  useEffect(() => { fetchStops(); }, [deliveryId, wizardMode]);

  // ── Wizard mode helpers ──
  const wizardAddRow = () => onStopRowsChange([...stopRows, {
    stop_sequence: stopRows.length + 1,
    customer_name: "", customer_address: "", customer_phone: "",
    planned_boxes: "", planned_amount: "", estimated_arrival: "", notes: ""
  }]);
  const wizardRemoveRow = (i) => onStopRowsChange(
    stopRows.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stop_sequence: idx + 1 }))
  );
  const wizardUpdateRow = (i, field, val) =>
    onStopRowsChange(stopRows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  // ── In-progress mode: create/edit stop ──
  const handleStopFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    setLoading(true);
    try {
      if (editingStop) {
        await api.patch(`/delivery-management/delivery-stops/${editingStop.id}/`, data);
      } else {
        await api.post(`/delivery-management/deliveries/${deliveryId}/stops/`, data);
      }
      setShowForm(false);
      setEditing(null);
      fetchStops();
    } catch (err) { 
      const errorMsg = err.response?.data?.error || `Failed to ${editingStop ? "update" : "create"} stop.`;
      alert(errorMsg);
    }
    finally { setLoading(false); }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm("Delete this stop?")) return;
    try {
      await api.delete(`/delivery-management/delivery-stops/${stopId}/`);
      fetchStops();
    } catch (err) { 
      const errorMsg = err.response?.data?.error || "Failed to delete stop.";
      alert(errorMsg);
    }
  };

  // ── Active mode: complete a stop ──
  const handleCompleteStop = async (stopId) => {
    setLoading(true);
    const sf = stopForms[stopId] || {};
    try {
      await api.post(`/delivery-management/delivery-stops/${stopId}/complete/`, {
        delivered_boxes:  parseFloat(sf.delivered_boxes  || 0),
        collected_amount: parseFloat(sf.collected_amount || 0),
        status:           sf.status || "delivered",
        notes:            sf.notes  || "",
        failure_reason:   sf.failure_reason || "",
        actual_arrival:   new Date().toISOString(),
        departure_time:   new Date().toISOString(),
      });
      setExpanded(null);
      fetchStops();
      if (onStopsUpdated) onStopsUpdated();
    } catch { alert("Failed to complete stop."); }
    finally { setLoading(false); }
  };

  const updateStopForm = (stopId, field, val) =>
    setStopForms(f => ({ ...f, [stopId]: { ...(f[stopId] || {}), [field]: val } }));

  // ─── WIZARD MODE ──────────────────────────────────────────────────────────────
  if (wizardMode) {
    return (
      <div>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
          Add each customer stop in the order the van will visit. Sequence is auto-numbered.
        </p>
        {stopRows.map((row, i) => (
          <div key={i} style={stopCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                <span style={seqBadge}>{row.stop_sequence}</span> Stop #{row.stop_sequence}
              </span>
              {stopRows.length > 1 && (
                <button onClick={() => wizardRemoveRow(i)} style={redBtn}>Remove</button>
              )}
            </div>
            <div style={grid3}>
              <div>
                <label style={labelStyle}>Customer Name *</label>
                <input value={row.customer_name}
                  onChange={e => wizardUpdateRow(i, "customer_name", e.target.value)}
                  placeholder="ABC Store" style={cellInput} />
              </div>
              <div>
                <label style={labelStyle}>Customer Address *</label>
                <input value={row.customer_address}
                  onChange={e => wizardUpdateRow(i, "customer_address", e.target.value)}
                  placeholder="123 Main St" style={cellInput} />
              </div>
              <div>
                <label style={labelStyle}>Customer Phone</label>
                <input value={row.customer_phone}
                  onChange={e => wizardUpdateRow(i, "customer_phone", e.target.value)}
                  placeholder="+91 98765 43210" style={cellInput} />
              </div>
              <div>
                <label style={labelStyle}>Planned Boxes</label>
                <input type="number" min="0" value={row.planned_boxes}
                  onChange={e => wizardUpdateRow(i, "planned_boxes", e.target.value)}
                  placeholder="0" style={cellInput} />
              </div>
              <div>
                <label style={labelStyle}>Planned Amount (₹)</label>
                <input type="number" min="0" step="0.01" value={row.planned_amount}
                  onChange={e => wizardUpdateRow(i, "planned_amount", e.target.value)}
                  placeholder="0.00" style={cellInput} />
              </div>
              <div>
                <label style={labelStyle}>Estimated Arrival</label>
                <input type="time" value={row.estimated_arrival}
                  onChange={e => wizardUpdateRow(i, "estimated_arrival", e.target.value)}
                  style={cellInput} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Notes</label>
                <input value={row.notes}
                  onChange={e => wizardUpdateRow(i, "notes", e.target.value)}
                  placeholder="Optional" style={cellInput} />
              </div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 10 }}>
          <button onClick={wizardAddRow} style={ghostBtn}>+ Add Stop</button>
        </div>
      </div>
    );
  }

  // ─── VIEW/ACTIVE MODE ─────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ color: "#1e293b", margin: 0, fontSize: 15, fontWeight: 700 }}>Delivery Stops</h3>
        
        {/* ✅ CHANGED: Only show "Add Stop" button when delivery is in_progress */}
        {isActive && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} style={primaryBtn}>
            + Add Stop
          </button>
        )}
        
        {/* ✅ NEW: Show info message when scheduled */}
        {isScheduled && (
          <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
            Stops can only be added after starting the delivery
          </div>
        )}
      </div>

      {/* ✅ CHANGED: Only show create/edit form when in_progress */}
      {showForm && isActive && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {editingStop ? "Edit Stop" : "Add New Stop"}
          </h4>
          <form onSubmit={handleStopFormSubmit}>
            <div style={grid3}>
              <div>
                <label style={labelStyle}>Customer Name *</label>
                <input name="customer_name" defaultValue={editingStop?.customer_name || ""} required style={cellInput} placeholder="ABC Store" />
              </div>
              <div>
                <label style={labelStyle}>Customer Address *</label>
                <input name="customer_address" defaultValue={editingStop?.customer_address || ""} required style={cellInput} placeholder="123 Main St" />
              </div>
              <div>
                <label style={labelStyle}>Customer Phone</label>
                <input name="customer_phone" defaultValue={editingStop?.customer_phone || ""} style={cellInput} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={labelStyle}>Planned Boxes</label>
                <input type="number" min="0" name="planned_boxes" defaultValue={editingStop?.planned_boxes || ""} style={cellInput} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Planned Amount (₹)</label>
                <input type="number" min="0" step="0.01" name="planned_amount" defaultValue={editingStop?.planned_amount || ""} style={cellInput} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>Estimated Arrival</label>
                <input type="time" name="estimated_arrival" defaultValue={editingStop?.estimated_arrival || ""} style={cellInput} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Notes</label>
                <input name="notes" defaultValue={editingStop?.notes || ""} style={cellInput} placeholder="Optional" />
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? "Saving…" : editingStop ? "Update Stop" : "Add Stop"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stops list */}
      {stops.length === 0 ? (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13, background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          {isActive ? "No stops added yet. Click 'Add Stop' to begin." : "No stops configured for this delivery."}
        </div>
      ) : (
        stops.map((stop) => {
          const sc = STOP_STATUS_META[stop.status] || STOP_STATUS_META.pending;
          const isPending   = stop.status === "pending";
          const isExpanded  = expandedStop === stop.id;
          const isCurrent   = isActive && isPending && stops.filter(s => s.status === "pending")[0]?.id === stop.id;
          const sf          = stopForms[stop.id] || {};

          return (
            <div key={stop.id} style={{
              background: "#fff",
              border: isCurrent ? "2px solid #f59e0b" : "1px solid #e2e8f0",
              borderRadius: 10,
              marginBottom: 12,
              overflow: "hidden",
            }}>
              {/* Stop header row */}
              <div
                onClick={() => isActive && isPending && setExpanded(isExpanded ? null : stop.id)}
                style={{
                  padding: "13px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: isActive && isPending ? "pointer" : "default",
                  background: isCurrent ? "#fffbeb" : "#fff",
                }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: sc.bg, color: sc.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13, flexShrink: 0
                  }}>
                    {stop.stop_sequence}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{stop.customer_name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{stop.customer_address}</div>
                    {stop.customer_phone && (
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>📞 {stop.customer_phone}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {/* Completed stop summary pills */}
                  {!isPending && (
                    <div style={{ textAlign: "right", fontSize: 12 }}>
                      <div style={{ color: "#15803d", fontWeight: 700 }}>{stop.delivered_boxes} boxes</div>
                      <div style={{ color: "#0f172a" }}>₹{fmt(stop.collected_amount)}</div>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <span style={{ background: sc.bg, color: sc.color, padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                      {sc.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      Plan: {stop.planned_boxes} boxes · ₹{fmt(stop.planned_amount)}
                    </span>
                  </div>

                  {/* ✅ CHANGED: Only show edit/delete buttons when in_progress */}
                  {isActive && isPending && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditing(stop); setShowForm(true); }} style={iconBtn}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteStop(stop.id); }} style={{ ...iconBtn, color: "#ef4444" }}>Del</button>
                    </div>
                  )}

                  {/* Active mode chevron */}
                  {isActive && isPending && (
                    <span style={{ fontSize: 16, color: "#94a3b8", transform: isExpanded ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform .2s" }}>⌄</span>
                  )}
                </div>
              </div>

              {/* Active mode: expandable completion form */}
              {isExpanded && isActive && isPending && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 16px", background: "#fafafa" }}>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                    Enter actual delivery for this stop:
                  </p>
                  <div style={grid2}>
                    <div>
                      <label style={labelStyle}>Boxes Delivered *</label>
                      <input type="number" min="0" value={sf.delivered_boxes || ""}
                        onChange={e => updateStopForm(stop.id, "delivered_boxes", e.target.value)}
                        placeholder="0" style={cellInput} />
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Planned: {stop.planned_boxes}</span>
                    </div>
                    <div>
                      <label style={labelStyle}>Cash Collected (₹) *</label>
                      <input type="number" min="0" step="0.01" value={sf.collected_amount || ""}
                        onChange={e => updateStopForm(stop.id, "collected_amount", e.target.value)}
                        placeholder="0.00" style={cellInput} />
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Planned: ₹{fmt(stop.planned_amount)}</span>
                    </div>
                    <div>
                      <label style={labelStyle}>Stop Status</label>
                      <select value={sf.status || "delivered"}
                        onChange={e => updateStopForm(stop.id, "status", e.target.value)} style={cellInput}>
                        <option value="delivered">Delivered ✓</option>
                        <option value="partial">Partial</option>
                        <option value="failed">Failed</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Notes</label>
                      <input value={sf.notes || ""}
                        onChange={e => updateStopForm(stop.id, "notes", e.target.value)}
                        placeholder="Optional" style={cellInput} />
                    </div>
                    {(sf.status === "failed" || sf.status === "skipped") && (
                      <div style={{ gridColumn: "1/-1" }}>
                        <label style={labelStyle}>Failure Reason</label>
                        <input value={sf.failure_reason || ""}
                          onChange={e => updateStopForm(stop.id, "failure_reason", e.target.value)}
                          placeholder="Reason for failure or skip" style={cellInput} />
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => setExpanded(null)} style={ghostBtn}>Cancel</button>
                    <button onClick={() => handleCompleteStop(stop.id)} disabled={loading} style={greenBtn}>
                      {loading ? "Saving…" : "✓ Complete Stop"}
                    </button>
                  </div>
                </div>
              )}

              {/* Completed stop detail row */}
              {!isPending && (
                <div style={{
                  borderTop: "1px solid #f1f5f9", padding: "9px 16px",
                  background: "#f8fffe",
                  display: "flex", gap: 24, flexWrap: "wrap"
                }}>
                  <Pill label="Delivered"  value={`${stop.delivered_boxes} boxes`} />
                  <Pill label="Collected"  value={`₹${fmt(stop.collected_amount)}`} />
                  {stop.notes          && <Pill label="Note"    value={stop.notes} />}
                  {stop.actual_arrival && <Pill label="Arrived" value={new Date(stop.actual_arrival).toLocaleTimeString()} />}
                  {stop.stop_duration  && <Pill label="Duration" value={`${stop.stop_duration} min`} />}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const Pill = ({ label, value }) => (
  <div>
    <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .4, display: "block" }}>{label}</span>
    <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 600 }}>{value}</span>
  </div>
);

const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: .4, textTransform: "uppercase", marginBottom: 4 };
const cellInput  = { width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box", background: "#fff", outline: "none" };
const ghostBtn   = { background: "#f1f5f9", color: "#475569", padding: "7px 14px", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const primaryBtn = { background: "#0f172a", color: "#fff", padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const greenBtn   = { background: "#10b981", color: "#fff", padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const redBtn     = { background: "#fee2e2", color: "#b91c1c", padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const iconBtn    = { background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const seqBadge   = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "#0f172a", color: "#fff", fontSize: 11, fontWeight: 800, marginRight: 6 };
const stopCard   = { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 12 };
const grid2      = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 14px" };
const grid3      = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 14px" };