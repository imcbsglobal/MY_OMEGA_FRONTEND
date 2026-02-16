/**
 * DeliveryDetail.jsx  –  Full admin detail view
 *
 * Sections:
 *  1. Hero header  – delivery number, status badge, action buttons
 *  2. Key-metrics bar  – boxes loaded / delivered / balance / amount / collected / efficiency
 *  3. Info grid  – employee, vehicle, route, schedule, odometer, fuel, timestamps, location
 *  4. Tabs: Products | Stops | Timeline
 *  5. Start-delivery modal
 *  6. Complete-delivery modal (with odometer end)
 */
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/client";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt  = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (n) => parseFloat(n || 0).toLocaleString("en-IN");
const pct  = (n) => `${parseFloat(n || 0).toFixed(1)}%`;

const STATUS_CFG = {
  scheduled:   { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6", label: "Scheduled"   },
  in_progress: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", dot: "#F59E0B", label: "In Progress" },
  completed:   { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0", dot: "#22C55E", label: "Completed"   },
  cancelled:   { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3", dot: "#F43F5E", label: "Cancelled"   },
};

const STOP_CFG = {
  pending:   { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", label: "Pending",   icon: "○" },
  delivered: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0", label: "Delivered", icon: "✓" },
  partial:   { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Partial",   icon: "◐" },
  failed:    { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3", label: "Failed",    icon: "✕" },
  skipped:   { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0", label: "Skipped",   icon: "→" },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDateTime = (d) => d ? `${fmtDate(d)}, ${fmtTime(d)}` : "—";

// ─── main component ───────────────────────────────────────────────────────────
export default function DeliveryDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();

  const [delivery,  setDelivery]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  // modals
  const [modal, setModal] = useState(null); // "start" | "complete" | "cancel"

  // start form
  const [startForm, setStartForm] = useState({
    odometer_reading: "", fuel_level: "", notes: "",
    start_location: "", start_latitude: "", start_longitude: "",
  });

  // complete form
  const [completeForm, setCompleteForm] = useState({
    odometer_reading: "", fuel_level: "", notes: "",
  });

  // ── fetch ───────────────────────────────────────────────────────────────
  const fetchDelivery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/delivery-management/deliveries/${id}/`);
      setDelivery(res.data);
    } catch { setDelivery(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDelivery(); }, [fetchDelivery]);

  // ── geolocation ─────────────────────────────────────────────────────────
  const getGPS = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setStartForm(f => ({
        ...f,
        start_latitude:  parseFloat(pos.coords.latitude.toFixed(6)).toString(),
        start_longitude: parseFloat(pos.coords.longitude.toFixed(6)).toString(),
        start_location:  f.start_location || "Current GPS Location",
      })),
      () => alert("Could not get GPS location.")
    );
  };

  // ── actions ─────────────────────────────────────────────────────────────
  const handleStart = async () => {
    setSaving(true);
    try {
      await api.post(`/delivery-management/deliveries/${id}/start/`, {
        odometer_reading: startForm.odometer_reading ? parseFloat(startForm.odometer_reading) : null,
        fuel_level:       startForm.fuel_level       ? parseFloat(startForm.fuel_level)       : null,
        notes:            startForm.notes,
        start_location:   startForm.start_location || "",
        start_latitude:   startForm.start_latitude  ? parseFloat(startForm.start_latitude)    : null,
        start_longitude:  startForm.start_longitude ? parseFloat(startForm.start_longitude)   : null,
      });
      setModal(null);
      fetchDelivery();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to start delivery.");
    } finally { setSaving(false); }
  };

  const handleComplete = async () => {
    if (!window.confirm("Complete this delivery? This action cannot be undone.")) return;
    setSaving(true);
    try {
      const products = (delivery.products || []).map(p => ({
        product_id:         p.product,
        delivered_quantity: parseFloat(p.delivered_quantity || p.loaded_quantity || 0),
      }));
      await api.post(`/delivery-management/deliveries/${id}/complete/`, {
        odometer_reading: completeForm.odometer_reading ? parseFloat(completeForm.odometer_reading) : null,
        fuel_level:       completeForm.fuel_level       ? parseFloat(completeForm.fuel_level)       : null,
        notes:            completeForm.notes || "Completed via admin panel.",
        products,
      });
      setModal(null);
      fetchDelivery();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to complete delivery.");
    } finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this delivery?")) return;
    setSaving(true);
    try {
      await api.post(`/delivery-management/deliveries/${id}/cancel/`, { reason: "Cancelled via admin panel." });
      fetchDelivery();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to cancel delivery.");
    } finally { setSaving(false); }
  };

  // ── loading / error ──────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: FONT }}>
      <div>
        <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTopColor: "#0F172A", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: "#94A3B8", fontSize: 14 }}>Loading delivery…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!delivery) return (
    <div style={{ padding: 32, textAlign: "center", color: "#64748B", fontFamily: FONT }}>
      Delivery not found. <Link to="/delivery-management/deliveries/" style={{ color: "#3B82F6" }}>Go back</Link>
    </div>
  );

  const sc          = STATUS_CFG[delivery.status] || STATUS_CFG.scheduled;
  const isScheduled = delivery.status === "scheduled";
  const isActive    = delivery.status === "in_progress";
  const isDone      = delivery.status === "completed";
  const isCancelled = delivery.status === "cancelled";
  const efficiency  = parseFloat(delivery.delivery_efficiency || 0);
  const products    = delivery.products || [];
  const stops       = (delivery.stops || []).slice().sort((a, b) => a.stop_sequence - b.stop_sequence);

  return (
    <div style={{ fontFamily: FONT, background: "#F8FAFC", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        .detail-tab:hover { background:#F1F5F9 !important; }
        .action-btn:hover { filter: brightness(0.93); }
        .stop-row:hover { background:#F8FAFC !important; }
        .info-hover:hover { background:#F8FAFC !important; }
        input:focus, textarea:focus, select:focus { border-color:#3B82F6 !important; outline:none; box-shadow:0 0 0 3px rgba(59,130,246,.12); }
      `}</style>

      {/* ── breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 32px 0", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748B" }}>
        <Link to="/delivery-management/deliveries/" style={{ color: "#64748B", textDecoration: "none" }}>Deliveries</Link>
        <span style={{ color: "#CBD5E1" }}>›</span>
        <span style={{ color: "#0F172A", fontWeight: 600 }}>{delivery.delivery_number}</span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 32px 0" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,.05)", animation: "fadeIn .25s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>

            {/* left: number + status */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, background: sc.bg, borderRadius: 14, border: `1.5px solid ${sc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                🚚
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: -0.4 }}>
                    {delivery.delivery_number}
                  </h1>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                    {sc.label}
                  </span>
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: "#64748B", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>📅 {delivery.scheduled_date} at {delivery.scheduled_time}</span>
                  {delivery.route_name && <span>🛣 {delivery.route_name}</span>}
                  {delivery.created_by_name && <span>👤 Created by {delivery.created_by_name}</span>}
                </div>
              </div>
            </div>

            {/* right: action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Link to={`/delivery-management/deliveries/${id}/edit`}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none", background: "#F1F5F9", color: "#374151", border: "1px solid #E2E8F0" }}>
                ✏️ Edit
              </Link>
              {(isScheduled || isActive) && (
                <button className="action-btn" onClick={() => setModal("start")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", background: "#0F172A", color: "#fff" }}>
                  ▶ Start
                </button>
              )}
              {isActive && (
                <button className="action-btn" onClick={() => setModal("complete")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", background: "#15803D", color: "#fff" }}>
                  ✓ Complete
                </button>
              )}
              {!isDone && !isCancelled && (
                <button className="action-btn" onClick={handleCancel}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", background: "#FFF1F2", color: "#BE123C" }}>
                  ✕ Cancel
                </button>
              )}
            </div>
          </div>

          {/* ── KPI metric bar ─────────────────────────────────────────── */}
          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 1, background: "#E2E8F0", borderRadius: 12, overflow: "hidden", border: "1px solid #E2E8F0" }}>
            {[
              { label: "Loaded",        value: fmtN(delivery.total_loaded_boxes),    unit: "boxes",   color: "#0F172A" },
              { label: "Delivered",     value: fmtN(delivery.total_delivered_boxes), unit: "boxes",   color: "#15803D" },
              { label: "Balance",       value: fmtN(delivery.total_balance_boxes),   unit: "boxes",   color: parseFloat(delivery.total_balance_boxes) > 0 ? "#B45309" : "#15803D" },
              { label: "Invoice",       value: `₹${fmt(delivery.total_amount)}`,     unit: "",        color: "#0F172A" },
              { label: "Collected",     value: `₹${fmt(delivery.collected_amount)}`, unit: "",        color: "#15803D" },
              { label: "Pending",       value: `₹${fmt(delivery.total_pending_amount)}`, unit: "",    color: parseFloat(delivery.total_pending_amount) > 0 ? "#B45309" : "#15803D" },
              { label: "Efficiency",    value: pct(delivery.delivery_efficiency),    unit: "",        color: efficiency >= 90 ? "#15803D" : efficiency >= 70 ? "#B45309" : "#BE123C" },
            ].map(m => (
              <div key={m.label} style={{ background: "#fff", padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: .7, marginBottom: 5 }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: -0.5 }}>{m.value}</div>
                {m.unit && <div style={{ fontSize: 10, color: "#CBD5E1", marginTop: 2 }}>{m.unit}</div>}
              </div>
            ))}
          </div>

          {/* efficiency bar */}
          {isDone && (
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>Delivery Efficiency</div>
              <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${Math.min(efficiency, 100)}%`, background: efficiency >= 90 ? "#22C55E" : efficiency >= 70 ? "#F59E0B" : "#F43F5E", transition: "width .6s ease" }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: efficiency >= 90 ? "#15803D" : "#B45309", whiteSpace: "nowrap" }}>{pct(delivery.delivery_efficiency)}</div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          INFO GRID  – 3 columns: Assignment | Schedule & Journey | Notes
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "16px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, animation: "fadeIn .3s ease" }}>

        {/* Card 1 – Assignment */}
        <InfoCard title="👤 Assignment">
          <InfoRow label="Driver" value={delivery.employee_details?.full_name || delivery.employee_name || "—"} strong />
          <InfoRow label="Employee ID" value={delivery.employee_details?.employee_id || "—"} />
          <InfoRow label="Phone" value={delivery.employee_details?.phone_number || "—"} />
          <InfoRow label="Designation" value={delivery.employee_details?.designation || "—"} />
          <Divider />
          <InfoRow label="Vehicle" value={delivery.vehicle_details?.registration_number || delivery.vehicle_number || "—"} strong />
          <InfoRow label="Type" value={delivery.vehicle_details?.vehicle_type || "—"} />
          <InfoRow label="Model" value={delivery.vehicle_details?.model || "—"} />
          <Divider />
          <InfoRow label="Route" value={delivery.route_details?.route_name || delivery.route_name || "—"} strong />
          <InfoRow label="From" value={delivery.route_details?.origin || "—"} />
          <InfoRow label="To" value={delivery.route_details?.destination || "—"} />
        </InfoCard>

        {/* Card 2 – Schedule & Journey */}
        <InfoCard title="📅 Schedule & Journey">
          <InfoRow label="Scheduled Date" value={delivery.scheduled_date || "—"} strong />
          <InfoRow label="Scheduled Time" value={delivery.scheduled_time || "—"} />
          <Divider />
          <InfoRow label="Started" value={fmtDateTime(delivery.start_datetime)} />
          <InfoRow label="Completed" value={fmtDateTime(delivery.end_datetime)} />
          {delivery.duration_minutes != null && (
            <InfoRow label="Duration" value={
              delivery.duration_minutes >= 60
                ? `${Math.floor(delivery.duration_minutes / 60)}h ${delivery.duration_minutes % 60}m`
                : `${delivery.duration_minutes} min`
            } strong />
          )}
          <Divider />
          <InfoRow label="Odometer Start" value={delivery.odometer_start ? `${fmtN(delivery.odometer_start)} km` : "—"} />
          <InfoRow label="Odometer End"   value={delivery.odometer_end   ? `${fmtN(delivery.odometer_end)} km`   : "—"} />
          <InfoRow label="Distance"       value={delivery.distance_traveled ? `${fmtN(delivery.distance_traveled)} km` : "—"} strong />
          <Divider />
          <InfoRow label="Fuel Start"    value={delivery.fuel_start    ? `${fmt(delivery.fuel_start)} L`    : "—"} />
          <InfoRow label="Fuel End"      value={delivery.fuel_end      ? `${fmt(delivery.fuel_end)} L`      : "—"} />
          <InfoRow label="Fuel Consumed" value={delivery.fuel_consumed ? `${fmt(delivery.fuel_consumed)} L` : "—"} strong />
        </InfoCard>

        {/* Card 3 – Financial + Notes + Location */}
        <InfoCard title="💰 Financials & Notes">
          <InfoRow label="Total Invoice"    value={`₹${fmt(delivery.total_amount)}`}           strong />
          <InfoRow label="Collected"        value={`₹${fmt(delivery.collected_amount)}`}        color="#15803D" strong />
          <InfoRow label="Pending"          value={`₹${fmt(delivery.total_pending_amount)}`}    color={parseFloat(delivery.total_pending_amount) > 0 ? "#B45309" : "#15803D"} />
          <Divider />
          <InfoRow label="Boxes Loaded"     value={fmtN(delivery.total_loaded_boxes)} />
          <InfoRow label="Boxes Delivered"  value={fmtN(delivery.total_delivered_boxes)} color="#15803D" strong />
          <InfoRow label="Balance Boxes"    value={fmtN(delivery.total_balance_boxes)}  color={parseFloat(delivery.total_balance_boxes) > 0 ? "#B45309" : "#64748B"} />
          <Divider />
          {delivery.start_location && <InfoRow label="Start Location" value={delivery.start_location} />}
          {delivery.completion_location && <InfoRow label="End Location" value={delivery.completion_location} />}
          {delivery.start_notes && <InfoRow label="Start Notes" value={delivery.start_notes} multiline />}
          {delivery.end_notes   && <InfoRow label="End Notes"   value={delivery.end_notes}   multiline />}
          {delivery.remarks     && <InfoRow label="Remarks"     value={delivery.remarks}      multiline />}
          <Divider />
          <InfoRow label="Created At" value={fmtDateTime(delivery.created_at)} />
          <InfoRow label="Created By" value={delivery.created_by_name || "—"} />
          {delivery.completed_by_name && <InfoRow label="Completed By" value={delivery.completed_by_name} />}
        </InfoCard>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TABS  –  Products | Stops | Timeline
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "16px 32px 32px", animation: "fadeIn .35s ease" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,.04)", overflow: "hidden" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", padding: "0 24px", background: "#FAFAFA" }}>
            {[
              { key: "products", label: `📦 Products (${products.length})` },
              { key: "stops",    label: `📍 Stops (${stops.length})` },
              { key: "timeline", label: "🕐 Timeline" },
            ].map(t => (
              <button key={t.key} className="detail-tab"
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500,
                  color: activeTab === t.key ? "#0F172A" : "#64748B",
                  borderBottom: activeTab === t.key ? "2px solid #0F172A" : "2px solid transparent",
                  marginBottom: -1, whiteSpace: "nowrap", fontFamily: FONT,
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── PRODUCTS TAB ─────────────────────────────────────────── */}
          {activeTab === "products" && (
            <div style={{ padding: 24 }}>
              {products.length === 0 ? (
                <Empty text="No products attached to this delivery." />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["Product", "Code", "Unit", "Loaded", "Delivered", "Balance", "Delivery %", "Unit Price", "Total Amount", "Notes"].map(h => (
                        <th key={h} style={TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => {
                      const dp = parseFloat(p.delivery_percentage || 0);
                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ ...TD, fontWeight: 600, color: "#0F172A" }}>{p.product_name || p.product_details?.product_name || "—"}</td>
                          <td style={{ ...TD, fontFamily: "monospace", color: "#64748B" }}>{p.product_details?.product_code || "—"}</td>
                          <td style={TD}>{p.product_details?.unit || "—"}</td>
                          <td style={{ ...TD, fontFamily: "monospace", textAlign: "right" }}>{fmt(p.loaded_quantity)}</td>
                          <td style={{ ...TD, fontFamily: "monospace", textAlign: "right", color: "#15803D", fontWeight: 600 }}>{fmt(p.delivered_quantity)}</td>
                          <td style={{ ...TD, fontFamily: "monospace", textAlign: "right", color: parseFloat(p.balance_quantity) > 0 ? "#B45309" : "#64748B" }}>{fmt(p.balance_quantity)}</td>
                          <td style={{ ...TD, textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                              <div style={{ width: 48, height: 4, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.min(dp, 100)}%`, background: dp >= 90 ? "#22C55E" : dp >= 60 ? "#F59E0B" : "#F43F5E", borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: dp >= 90 ? "#15803D" : dp >= 60 ? "#B45309" : "#BE123C" }}>{pct(p.delivery_percentage)}</span>
                            </div>
                          </td>
                          <td style={{ ...TD, textAlign: "right", fontFamily: "monospace" }}>{p.unit_price ? `₹${fmt(p.unit_price)}` : "—"}</td>
                          <td style={{ ...TD, textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#0F172A" }}>{p.total_amount ? `₹${fmt(p.total_amount)}` : "—"}</td>
                          <td style={{ ...TD, color: "#64748B", maxWidth: 160 }}>{p.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#F8FAFC", borderTop: "2px solid #E2E8F0" }}>
                      <td colSpan={3} style={{ ...TD, fontWeight: 700, color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>TOTALS</td>
                      <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, textAlign: "right" }}>{fmt(products.reduce((a, p) => a + parseFloat(p.loaded_quantity    || 0), 0))}</td>
                      <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, color: "#15803D", textAlign: "right" }}>{fmt(products.reduce((a, p) => a + parseFloat(p.delivered_quantity || 0), 0))}</td>
                      <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, textAlign: "right" }}>{fmt(products.reduce((a, p) => a + parseFloat(p.balance_quantity   || 0), 0))}</td>
                      <td colSpan={2} />
                      <td style={{ ...TD, fontFamily: "monospace", fontWeight: 800, color: "#15803D", textAlign: "right", fontSize: 15 }}>₹{fmt(products.reduce((a, p) => a + parseFloat(p.total_amount || 0), 0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}

          {/* ── STOPS TAB ────────────────────────────────────────────── */}
          {activeTab === "stops" && (
            <div style={{ padding: 24 }}>
              {stops.length === 0 ? (
                <Empty text="No stops assigned to this delivery." />
              ) : (
                <>
                  {/* stops summary bar */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
                    {[
                      { label: "Total Stops",    value: stops.length,                                      color: "#0F172A" },
                      { label: "Delivered",      value: stops.filter(s => s.status === "delivered").length, color: "#15803D" },
                      { label: "Partial",        value: stops.filter(s => s.status === "partial").length,   color: "#B45309" },
                      { label: "Failed/Skipped", value: stops.filter(s => ["failed","skipped"].includes(s.status)).length, color: "#BE123C" },
                      { label: "Pending",        value: stops.filter(s => s.status === "pending").length,   color: "#64748B" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: .5, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* stops table */}
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC" }}>
                        {["#", "Customer", "Address", "Status", "Planned Boxes", "Delivered", "Balance", "Planned Amt", "Collected", "Pending", "Arrival", "Duration", "Notes"].map(h => (
                          <th key={h} style={TH}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stops.map(stop => {
                        const sc2 = STOP_CFG[stop.status] || STOP_CFG.pending;
                        return (
                          <tr key={stop.id} className="stop-row" style={{ borderBottom: "1px solid #F1F5F9", transition: "background .1s" }}>
                            <td style={{ ...TD, textAlign: "center" }}>
                              <span style={{ width: 26, height: 26, borderRadius: "50%", background: sc2.bg, border: `1px solid ${sc2.border}`, color: sc2.color, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                {stop.stop_sequence}
                              </span>
                            </td>
                            <td style={{ ...TD, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap" }}>
                              <div>{stop.customer_name}</div>
                              {stop.customer_phone && <div style={{ fontSize: 11, color: "#64748B", fontWeight: 400 }}>📞 {stop.customer_phone}</div>}
                            </td>
                            <td style={{ ...TD, color: "#64748B", fontSize: 12, maxWidth: 150 }}>{stop.customer_address}</td>
                            <td style={TD}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: sc2.bg, color: sc2.color, border: `1px solid ${sc2.border}`, whiteSpace: "nowrap" }}>
                                {sc2.icon} {sc2.label}
                              </span>
                            </td>
                            <td style={{ ...TD, fontFamily: "monospace", textAlign: "right" }}>{fmt(stop.planned_boxes)}</td>
                            <td style={{ ...TD, fontFamily: "monospace", textAlign: "right", color: "#15803D", fontWeight: 600 }}>{fmt(stop.delivered_boxes)}</td>
                            <td style={{ ...TD, fontFamily: "monospace", textAlign: "right", color: parseFloat(stop.balance_boxes) > 0 ? "#B45309" : "#64748B" }}>{fmt(stop.balance_boxes)}</td>
                            <td style={{ ...TD, fontFamily: "monospace", textAlign: "right" }}>₹{fmt(stop.planned_amount)}</td>
                            <td style={{ ...TD, fontFamily: "monospace", textAlign: "right", color: "#15803D", fontWeight: 600 }}>₹{fmt(stop.collected_amount)}</td>
                            <td style={{ ...TD, fontFamily: "monospace", textAlign: "right", color: parseFloat(stop.pending_amount) > 0 ? "#B45309" : "#64748B" }}>₹{fmt(stop.pending_amount)}</td>
                            <td style={{ ...TD, fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>
                              {stop.actual_arrival ? fmtTime(stop.actual_arrival) : "—"}
                              {stop.estimated_arrival && <div style={{ fontSize: 10, color: "#94A3B8" }}>Est. {stop.estimated_arrival}</div>}
                            </td>
                            <td style={{ ...TD, fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>
                              {stop.stop_duration != null ? `${stop.stop_duration} min` : "—"}
                            </td>
                            <td style={{ ...TD, fontSize: 12, color: "#64748B", maxWidth: 150 }}>
                              {stop.notes || ""}
                              {stop.failure_reason && <div style={{ color: "#BE123C" }}>{stop.failure_reason}</div>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* stops totals */}
                    <tfoot>
                      <tr style={{ background: "#F8FAFC", borderTop: "2px solid #E2E8F0" }}>
                        <td colSpan={4} style={{ ...TD, fontWeight: 700, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>TOTALS</td>
                        <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, textAlign: "right" }}>{fmt(stops.reduce((a, s) => a + parseFloat(s.planned_boxes   || 0), 0))}</td>
                        <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, color: "#15803D", textAlign: "right" }}>{fmt(stops.reduce((a, s) => a + parseFloat(s.delivered_boxes || 0), 0))}</td>
                        <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, textAlign: "right" }}>{fmt(stops.reduce((a, s) => a + parseFloat(s.balance_boxes   || 0), 0))}</td>
                        <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, textAlign: "right" }}>₹{fmt(stops.reduce((a, s) => a + parseFloat(s.planned_amount    || 0), 0))}</td>
                        <td style={{ ...TD, fontFamily: "monospace", fontWeight: 800, color: "#15803D", textAlign: "right", fontSize: 15 }}>₹{fmt(stops.reduce((a, s) => a + parseFloat(s.collected_amount || 0), 0))}</td>
                        <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, textAlign: "right" }}>₹{fmt(stops.reduce((a, s) => a + parseFloat(s.pending_amount   || 0), 0))}</td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>
                </>
              )}
            </div>
          )}

          {/* ── TIMELINE TAB ─────────────────────────────────────────── */}
          {activeTab === "timeline" && (
            <div style={{ padding: 24 }}>
              <div style={{ maxWidth: 600 }}>
                {buildTimeline(delivery, stops).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    {/* line + dot */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.done ? "#0F172A" : item.active ? "#3B82F6" : "#E2E8F0", border: `2px solid ${item.done ? "#0F172A" : item.active ? "#3B82F6" : "#CBD5E1"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: item.done || item.active ? "#fff" : "#94A3B8", flexShrink: 0, zIndex: 1 }}>
                        {item.icon}
                      </div>
                      {i < buildTimeline(delivery, stops).length - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: 24, background: item.done ? "#0F172A" : "#E2E8F0", marginTop: 4 }} />
                      )}
                    </div>
                    {/* content */}
                    <div style={{ paddingTop: 4, flex: 1, paddingBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: item.done || item.active ? "#0F172A" : "#94A3B8" }}>{item.title}</div>
                      {item.time && <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{item.time}</div>}
                      {item.detail && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{item.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════ */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>

          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)", animation: "fadeIn .2s ease" }}>

            {/* ── START MODAL ─────────────────────────────────────── */}
            {modal === "start" && (
              <>
                <ModalHeader title="🚀 Start Delivery" sub={delivery.delivery_number} onClose={() => setModal(null)} />
                <div style={{ padding: "0 24px 24px" }}>
                  {/* context pills */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                    {[
                      delivery.employee_name && `👤 ${delivery.employee_name}`,
                      delivery.vehicle_number && `🚚 ${delivery.vehicle_number}`,
                      delivery.route_name && `🛣 ${delivery.route_name}`,
                    ].filter(Boolean).map(p => <span key={p} style={{ padding: "4px 10px", background: "#F1F5F9", borderRadius: 6, fontSize: 12, color: "#374151" }}>{p}</span>)}
                  </div>
                  <ModalField label="Odometer Start (km)" type="number" placeholder="e.g. 45230" value={startForm.odometer_reading} onChange={v => setStartForm(f => ({ ...f, odometer_reading: v }))} />
                  <ModalField label="Fuel Level (liters)" type="number" placeholder="e.g. 35" value={startForm.fuel_level} onChange={v => setStartForm(f => ({ ...f, fuel_level: v }))} />
                  <ModalField label="Start Location" placeholder="Warehouse / depot name" value={startForm.start_location} onChange={v => setStartForm(f => ({ ...f, start_location: v }))}
                    suffix={<button onClick={getGPS} style={{ padding: "8px 12px", borderRadius: 7, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontSize: 13 }}>📍 GPS</button>} />
                  {startForm.start_latitude && (
                    <div style={{ margin: "-8px 0 12px", fontSize: 12, color: "#15803D", background: "#F0FDF4", padding: "6px 10px", borderRadius: 6 }}>
                      ✓ GPS: {startForm.start_latitude}, {startForm.start_longitude}
                    </div>
                  )}
                  <ModalField label="Start Notes" type="textarea" placeholder="Any notes before departing…" value={startForm.notes} onChange={v => setStartForm(f => ({ ...f, notes: v }))} />
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button onClick={() => setModal(null)} style={CANCEL_BTN}>Cancel</button>
                    <button onClick={handleStart} disabled={saving} style={PRIMARY_BTN}>{saving ? "Starting…" : "🚀 Start Delivery"}</button>
                  </div>
                </div>
              </>
            )}

            {/* ── COMPLETE MODAL ───────────────────────────────── */}
            {modal === "complete" && (
              <>
                <ModalHeader title="✅ Complete Delivery" sub={delivery.delivery_number} onClose={() => setModal(null)} color="#F0FDF4" />
                <div style={{ padding: "0 24px 24px" }}>
                  {/* quick summary */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, background: "#F8FAFC", borderRadius: 10, padding: 14, border: "1px solid #E2E8F0" }}>
                    {[
                      { l: "Stops done",      v: `${stops.filter(s => s.status !== "pending").length}/${stops.length}` },
                      { l: "Boxes delivered", v: fmtN(delivery.total_delivered_boxes), green: true },
                      { l: "Cash collected",  v: `₹${fmt(delivery.collected_amount)}`, green: true },
                      { l: "Pending",         v: `₹${fmt(delivery.total_pending_amount)}` },
                    ].map(s => (
                      <div key={s.l}>
                        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: .5 }}>{s.l}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: s.green ? "#15803D" : "#0F172A", fontFamily: "monospace" }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <ModalField label="Odometer End (km)" type="number" placeholder="e.g. 45620" value={completeForm.odometer_reading} onChange={v => setCompleteForm(f => ({ ...f, odometer_reading: v }))} />
                  <ModalField label="Fuel Level at End (liters)" type="number" placeholder="e.g. 18" value={completeForm.fuel_level} onChange={v => setCompleteForm(f => ({ ...f, fuel_level: v }))} />
                  <ModalField label="Completion Notes" type="textarea" placeholder="Any final notes…" value={completeForm.notes} onChange={v => setCompleteForm(f => ({ ...f, notes: v }))} />
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button onClick={() => setModal(null)} style={CANCEL_BTN}>Cancel</button>
                    <button onClick={handleComplete} disabled={saving} style={{ ...PRIMARY_BTN, background: "#15803D" }}>{saving ? "Completing…" : "✅ Complete Delivery"}</button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// ─── small sub-components ─────────────────────────────────────────────────────
function InfoCard({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,.04)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{title}</div>
      </div>
      <div style={{ padding: "12px 18px 16px" }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, strong, color, multiline }) {
  return (
    <div className="info-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: multiline ? "flex-start" : "center", padding: "5px 4px", borderRadius: 6, gap: 12 }}>
      <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, textTransform: "uppercase", letterSpacing: .4 }}>{label}</span>
      <span style={{ fontSize: 13, color: color || (strong ? "#0F172A" : "#374151"), fontWeight: strong ? 700 : 400, textAlign: "right", wordBreak: "break-word" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#F1F5F9", margin: "8px 0" }} />;
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 24px", color: "#94A3B8", fontSize: 13 }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
      {text}
    </div>
  );
}

function ModalHeader({ title, sub, onClose, color = "#F8FAFC" }) {
  return (
    <div style={{ background: color, borderRadius: "16px 16px 0 0", padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8", lineHeight: 1 }}>×</button>
    </div>
  );
}

function ModalField({ label, type = "text", placeholder, value, onChange, suffix }) {
  const isTextarea = type === "textarea";
  const Tag = isTextarea ? "textarea" : "input";
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: .7, marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <Tag type={isTextarea ? undefined : type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          rows={isTextarea ? 3 : undefined}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14, fontFamily: FONT, resize: isTextarea ? "vertical" : undefined, background: "#fff" }} />
        {suffix}
      </div>
    </div>
  );
}

// ─── timeline builder ─────────────────────────────────────────────────────────
function buildTimeline(delivery, stops) {
  const events = [];
  const isDone   = delivery.status === "completed";
  const isActive = delivery.status === "in_progress";

  events.push({
    icon: "📋", title: "Delivery Created",
    time: delivery.created_at ? new Date(delivery.created_at).toLocaleString("en-IN") : null,
    detail: delivery.created_by_name ? `by ${delivery.created_by_name}` : null,
    done: true,
  });

  events.push({
    icon: "📅", title: "Scheduled",
    time: `${delivery.scheduled_date} at ${delivery.scheduled_time}`,
    done: true,
  });

  events.push({
    icon: "🚀", title: "Delivery Started",
    time: delivery.start_datetime ? new Date(delivery.start_datetime).toLocaleString("en-IN") : null,
    detail: delivery.start_location || null,
    done: isActive || isDone,
    active: isActive && !delivery.start_datetime,
  });

  stops.forEach(stop => {
    const sc2 = STOP_CFG[stop.status] || STOP_CFG.pending;
    events.push({
      icon: sc2.icon,
      title: `Stop ${stop.stop_sequence}: ${stop.customer_name}`,
      time: stop.actual_arrival ? new Date(stop.actual_arrival).toLocaleString("en-IN") : null,
      detail: stop.status !== "pending" ? `${sc2.label} · ₹${parseFloat(stop.collected_amount || 0).toFixed(2)} collected` : stop.customer_address,
      done: stop.status !== "pending",
      active: stop.status === "pending" && (delivery.status === "in_progress"),
    });
  });

  events.push({
    icon: "✅", title: "Delivery Completed",
    time: delivery.end_datetime ? new Date(delivery.end_datetime).toLocaleString("en-IN") : null,
    detail: delivery.completed_by_name ? `by ${delivery.completed_by_name}` : null,
    done: isDone,
    active: !isDone && isActive,
  });

  return events;
}

// ─── style constants ──────────────────────────────────────────────────────────
const FONT = "'Inter', system-ui, sans-serif";

const TH = {
  textAlign: "left", padding: "10px 12px", fontSize: 10, fontWeight: 700,
  color: "#64748B", textTransform: "uppercase", letterSpacing: .6,
  borderBottom: "2px solid #E2E8F0", whiteSpace: "nowrap",
};
const TD = { padding: "10px 12px", fontSize: 13, color: "#374151", verticalAlign: "middle" };

const PRIMARY_BTN = {
  flex: 1, padding: "11px 20px", borderRadius: 9, border: "none", cursor: "pointer",
  background: "#0F172A", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: FONT,
};
const CANCEL_BTN = {
  flex: 0, padding: "11px 20px", borderRadius: 9, border: "1px solid #E2E8F0", cursor: "pointer",
  background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, fontFamily: FONT,
};