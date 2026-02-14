/**
 * EmployeeDeliveryView.jsx
 *
 * Complete employee delivery workflow:
 *  1. LIST    → See assigned deliveries
 *  2. DETAIL  → View delivery info, products, stops
 *  3. START   → Start delivery (odometer + location)
 *  4. STOPS   → Work through each stop one-by-one
 *  5. STOP FORM → Log boxes delivered + cash collected
 *  6. ADD STOP  → Employee can add extra stops mid-delivery
 *  7. COMPLETE  → Finalise delivery with odometer + notes
 *  8. SUMMARY   → Read-only recap
 */
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/client";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const STATUS = {
  scheduled:   { bg: "#E8F4FD", color: "#1565C0", dot: "#2196F3", label: "Scheduled",   icon: "📅" },
  in_progress: { bg: "#FFF8E1", color: "#E65100", dot: "#FF9800", label: "In Progress",  icon: "🚚" },
  completed:   { bg: "#E8F5E9", color: "#1B5E20", dot: "#4CAF50", label: "Completed",    icon: "✅" },
  cancelled:   { bg: "#FFEBEE", color: "#B71C1C", dot: "#F44336", label: "Cancelled",    icon: "❌" },
};

const STOP_STATUS = {
  pending:   { bg: "#F5F5F5", color: "#616161", label: "Pending",   icon: "⏳" },
  delivered: { bg: "#E8F5E9", color: "#2E7D32", label: "Delivered", icon: "✅" },
  partial:   { bg: "#FFF8E1", color: "#E65100", label: "Partial",   icon: "⚡" },
  failed:    { bg: "#FFEBEE", color: "#C62828", label: "Failed",    icon: "❌" },
  skipped:   { bg: "#ECEFF1", color: "#546E7A", label: "Skipped",   icon: "⏭" },
};

const fmt  = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (n) => parseFloat(n || 0).toFixed(0);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeDeliveryView() {
  // ── View state ──
  // "list" | "detail" | "start_modal" | "stops_overview" | "stop_form" | "add_stop" | "complete_modal" | "summary"
  const [view, setView] = useState("list");

  // ── Data ──
  const [deliveries,       setDeliveries]       = useState([]);
  const [selected,         setSelected]         = useState(null);  // full delivery object
  const [stops,            setStops]            = useState([]);
  const [products,         setProducts]         = useState([]);
  const [currentStop,      setCurrentStop]      = useState(null);

  // ── UI ──
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [tab,      setTab]      = useState("stops"); // detail tabs: stops | products

  // ── Forms ──
  const [startForm, setStartForm] = useState({
    odometer_start: "", fuel_start: "", start_notes: "",
    start_latitude: "", start_longitude: "", start_location: "",
  });
  const [stopForm, setStopForm] = useState({
    delivered_boxes: "", collected_amount: "",
    status: "delivered", notes: "", failure_reason: "",
  });
  const [addStopForm, setAddStopForm] = useState({
    customer_name: "", customer_address: "", customer_phone: "",
    planned_boxes: "", planned_amount: "", estimated_arrival: "", notes: "",
  });
  const [completeForm, setCompleteForm] = useState({
    odometer_end: "", fuel_end: "", end_notes: "",
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────────────────
  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter !== "all" ? `?status=${filter}` : "";
      const res = await api.get(`delivery-management/deliveries/${q}`);
      setDeliveries(res.data?.results || res.data || []);
    } catch { setDeliveries([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const loadDelivery = async (id) => {
    setLoading(true);
    try {
      const [delRes, stopRes, prodRes] = await Promise.all([
        api.get(`delivery-management/deliveries/${id}/`),
        api.get(`delivery-management/deliveries/${id}/stops/`),
        api.get(`delivery-management/deliveries/${id}/products/`),
      ]);
      setSelected(delRes.data);
      setStops(stopRes.data?.results || stopRes.data || []);
      setProducts(prodRes.data?.results || prodRes.data || []);
      setView("detail");
    } catch (e) {
      alert("Failed to load delivery: " + (e.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };

  const refreshStops = async () => {
    if (!selected) return;
    try {
      const res = await api.get(`delivery-management/deliveries/${selected.id}/stops/`);
      setStops(res.data?.results || res.data || []);
    } catch {}
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GEOLOCATION HELPER
  // ─────────────────────────────────────────────────────────────────────────
  const getLocation = (onSuccess) => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        onSuccess(lat, lng);
      },
      () => alert("Could not get location. Please enter manually.")
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!startForm.odometer_start) { alert("Please enter starting odometer reading."); return; }
    setSaving(true);
    try {
      await api.post(`delivery-management/deliveries/${selected.id}/start/`, {
        odometer_start:   parseFloat(startForm.odometer_start),
        fuel_start:       startForm.fuel_start ? parseFloat(startForm.fuel_start) : null,
        start_notes:      startForm.start_notes,
        start_latitude:   startForm.start_latitude || null,
        start_longitude:  startForm.start_longitude || null,
        start_location:   startForm.start_location || "Current Location",
      });
      await loadDelivery(selected.id);
      await fetchDeliveries();
      setView("stops_overview");
    } catch (e) {
      alert("Failed to start: " + (e.response?.data?.error || e.message));
    } finally { setSaving(false); }
  };

  const openStopForm = (stop) => {
    setCurrentStop(stop);
    setStopForm({
      delivered_boxes:  stop.planned_boxes || "",
      collected_amount: stop.planned_amount || "",
      status:           "delivered",
      notes:            "",
      failure_reason:   "",
    });
    setView("stop_form");
  };

  const handleCompleteStop = async () => {
    if (!stopForm.delivered_boxes && stopForm.status === "delivered") {
      alert("Please enter number of boxes delivered.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`delivery-management/delivery-stops/${currentStop.id}/complete/`, {
        delivered_boxes:  parseFloat(stopForm.delivered_boxes || 0),
        collected_amount: parseFloat(stopForm.collected_amount || 0),
        status:           stopForm.status,
        notes:            stopForm.notes,
        failure_reason:   stopForm.failure_reason,
      });
      await refreshStops();
      // Reload selected delivery summary numbers
      const res = await api.get(`delivery-management/deliveries/${selected.id}/`);
      setSelected(res.data);
      setView("stops_overview");
    } catch (e) {
      alert("Failed to complete stop: " + (e.response?.data?.error || e.message));
    } finally { setSaving(false); }
  };

  const handleAddStop = async () => {
    if (!addStopForm.customer_name || !addStopForm.customer_address) {
      alert("Customer name and address are required.");
      return;
    }
    setSaving(true);
    try {
      // Find next sequence number
      const maxSeq = stops.reduce((m, s) => Math.max(m, s.stop_sequence || 0), 0);
      await api.post(`delivery-management/deliveries/${selected.id}/stops/`, {
        ...addStopForm,
        stop_sequence:  maxSeq + 1,
        planned_boxes:  parseFloat(addStopForm.planned_boxes || 0),
        planned_amount: parseFloat(addStopForm.planned_amount || 0),
      });
      await refreshStops();
      setAddStopForm({ customer_name: "", customer_address: "", customer_phone: "", planned_boxes: "", planned_amount: "", estimated_arrival: "", notes: "" });
      setView("stops_overview");
    } catch (e) {
      alert("Failed to add stop: " + (e.response?.data?.error || e.message));
    } finally { setSaving(false); }
  };

  const handleComplete = async () => {
    if (!completeForm.odometer_end) { alert("Please enter ending odometer reading."); return; }
    setSaving(true);
    try {
      await api.post(`delivery-management/deliveries/${selected.id}/complete/`, {
        odometer_reading: parseFloat(completeForm.odometer_end),
        fuel_level:       completeForm.fuel_end ? parseFloat(completeForm.fuel_end) : null,
        notes:            completeForm.end_notes || "Delivery completed.",
        products: products.map(p => ({
          product_id: p.product,
          delivered_quantity: parseFloat(p.delivered_quantity || 0),
        })),
      });
      const res = await api.get(`delivery-management/deliveries/${selected.id}/`);
      setSelected(res.data);
      await fetchDeliveries();
      setView("summary");
    } catch (e) {
      alert("Failed to complete delivery: " + (e.response?.data?.error || e.message));
    } finally { setSaving(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────────────────
  const filtered = deliveries.filter(d =>
    !search ||
    d.delivery_number?.toLowerCase().includes(search.toLowerCase()) ||
    d.route_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicle_number?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingStops    = stops.filter(s => s.status === "pending");
  const completedStops  = stops.filter(s => s.status !== "pending");
  const allStopsDone    = stops.length > 0 && pendingStops.length === 0;

  // ─────────────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  //  V I E W   R E N D E R E R S
  // ══════════════════════════════════════════════════════════════════════════
  // ─────────────────────────────────────────────────────────────────────────

  // ── LOADING SCREEN ──────────────────────────────────────────────────────
  if (loading && !deliveries.length && !selected) {
    return (
      <div style={S.fullCenter}>
        <div style={S.spinner} />
        <p style={{ color: "#78909C", fontFamily: "DM Sans, sans-serif", marginTop: 16 }}>Loading deliveries…</p>
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div style={S.page}>
        {FONT_IMPORT}

        {/* Header */}
        <div style={S.listHeader}>
          <div>
            <div style={S.listHeaderBadge}>Employee Portal</div>
            <h1 style={S.listTitle}>My Deliveries</h1>
          </div>
          <button onClick={fetchDeliveries} style={S.iconBtn} title="Refresh">⟳</button>
        </div>

        {/* Search + Filters */}
        <div style={{ padding: "0 20px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="Search by delivery #, route, vehicle…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={S.searchInput}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all", "scheduled", "in_progress", "completed", "cancelled"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{ ...S.filterChip, ...(filter === s ? S.filterChipActive : {}) }}>
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Cards */}
        <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={S.emptyState}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={S.emptyState}>No deliveries found.</div>
          ) : (
            filtered.map(d => {
              const sm = STATUS[d.status] || STATUS.scheduled;
              const isActive = d.status === "in_progress";
              return (
                <div key={d.id} style={{ ...S.deliveryCard, ...(isActive ? S.deliveryCardActive : {}) }}
                  onClick={() => loadDelivery(d.id)}>
                  {/* Status strip */}
                  <div style={{ ...S.statusStrip, background: sm.dot }} />

                  <div style={{ padding: "14px 16px 14px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={S.deliveryNumber}>{d.delivery_number}</div>
                        <div style={S.deliveryMeta}>{d.route_name || "—"} · {d.vehicle_number || "—"}</div>
                      </div>
                      <span style={{ ...S.statusBadge, background: sm.bg, color: sm.color }}>
                        <span style={{ ...S.statusDot, background: sm.dot }} />
                        {sm.label}
                      </span>
                    </div>
                    <div style={S.deliveryInfoRow}>
                      <span style={S.infoChip}>📅 {d.scheduled_date}</span>
                      <span style={S.infoChip}>⏰ {d.scheduled_time}</span>
                      {d.total_loaded_boxes > 0 && (
                        <span style={S.infoChip}>📦 {fmtN(d.total_loaded_boxes)} boxes</span>
                      )}
                    </div>
                    {isActive && (
                      <div style={S.activeIndicator}>
                        <span style={{ animation: "pulse 1.5s infinite", display: "inline-block" }}>●</span>
                        &nbsp;Active — Tap to manage
                      </div>
                    )}
                  </div>
                  <div style={S.cardArrow}>›</div>
                </div>
              );
            })
          )}
        </div>
        <style>{ANIM_CSS}</style>
      </div>
    );
  }

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (view === "detail" && selected) {
    const sm = STATUS[selected.status] || STATUS.scheduled;
    const isScheduled   = selected.status === "scheduled";
    const isInProgress  = selected.status === "in_progress";
    const isCompleted   = selected.status === "completed";

    return (
      <div style={S.page}>
        {FONT_IMPORT}
        {/* Top nav */}
        <div style={S.topNav}>
          <button onClick={() => setView("list")} style={S.backBtn}>← Back</button>
          <span style={{ ...S.statusBadge, background: sm.bg, color: sm.color, fontSize: 12 }}>
            <span style={{ ...S.statusDot, background: sm.dot }} />{sm.label}
          </span>
        </div>

        {/* Hero card */}
        <div style={S.heroCard}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#90A4AE", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            Delivery
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0D1B2A", fontFamily: "DM Sans, sans-serif", letterSpacing: -0.5 }}>
            {selected.delivery_number}
          </div>
          <div style={{ fontSize: 13, color: "#546E7A", marginTop: 4, marginBottom: 14 }}>
            {selected.route_name || "—"} · {selected.vehicle_number || "—"}
          </div>

          {/* Stats strip */}
          <div style={S.statsStrip}>
            {[
              { label: "Loaded",    value: fmtN(selected.total_loaded_boxes),    unit: "boxes" },
              { label: "Delivered", value: fmtN(selected.total_delivered_boxes), unit: "boxes", green: true },
              { label: "Balance",   value: fmtN(selected.total_balance_boxes),   unit: "boxes", amber: parseFloat(selected.total_balance_boxes) > 0 },
              { label: "Collected", value: `₹${fmt(selected.collected_amount)}`, unit: "",      green: true },
            ].map(s => (
              <div key={s.label} style={S.statItem}>
                <div style={{ fontSize: 17, fontWeight: 800, color: s.green ? "#2E7D32" : s.amber ? "#E65100" : "#0D1B2A", fontFamily: "DM Mono, monospace" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 9, color: "#90A4AE", textTransform: "uppercase", letterSpacing: .5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <div style={{ padding: "0 20px 16px" }}>
          {isScheduled && (
            <button onClick={() => { setStartForm({ odometer_start: "", fuel_start: "", start_notes: "", start_latitude: "", start_longitude: "", start_location: "" }); setView("start_modal"); }}
              style={S.primaryBtn}>
              🚀 Start Delivery
            </button>
          )}
          {isInProgress && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setView("stops_overview")} style={{ ...S.primaryBtn, flex: 1 }}>
                📍 Manage Stops
              </button>
              {allStopsDone && (
                <button onClick={() => setView("complete_modal")} style={{ ...S.successBtn, flex: 1 }}>
                  ✅ Complete
                </button>
              )}
            </div>
          )}
          {isCompleted && (
            <button onClick={() => setView("summary")} style={{ ...S.primaryBtn, background: "#1B5E20" }}>
              📊 View Summary
            </button>
          )}
        </div>

        {/* Tab nav */}
        <div style={S.tabNav}>
          {["stops", "products"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...S.tabBtn, ...(tab === t ? S.tabBtnActive : {}) }}>
              {t === "stops" ? `📍 Stops (${stops.length})` : `📦 Products (${products.length})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "0 20px 32px" }}>
          {tab === "stops" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stops.length === 0 ? (
                <div style={S.emptyState}>No stops assigned.</div>
              ) : (
                stops.map((stop, i) => {
                  const ss = STOP_STATUS[stop.status] || STOP_STATUS.pending;
                  const isPending = stop.status === "pending";
                  return (
                    <div key={stop.id} style={{ ...S.stopCard, ...(isPending && isInProgress ? S.stopCardClickable : {}) }}
                      onClick={() => isPending && isInProgress && openStopForm(stop)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ ...S.stopSeq, background: isPending ? "#0D1B2A" : ss.bg, color: isPending ? "#fff" : ss.color }}>
                            {stop.stop_sequence}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>{stop.customer_name}</div>
                            <div style={{ fontSize: 12, color: "#78909C", marginTop: 1 }}>{stop.customer_address}</div>
                          </div>
                        </div>
                        <span style={{ ...S.statusBadge, background: ss.bg, color: ss.color, fontSize: 11 }}>
                          {ss.icon} {ss.label}
                        </span>
                      </div>
                      <div style={S.stopInfoRow}>
                        <span style={S.stopInfoItem}>Planned: <b>{fmtN(stop.planned_boxes)} boxes</b></span>
                        {stop.status !== "pending" && (
                          <>
                            <span style={S.stopInfoItem}>Delivered: <b style={{ color: "#2E7D32" }}>{fmtN(stop.delivered_boxes)}</b></span>
                            <span style={S.stopInfoItem}>Cash: <b style={{ color: "#2E7D32" }}>₹{fmt(stop.collected_amount)}</b></span>
                          </>
                        )}
                      </div>
                      {isPending && isInProgress && (
                        <div style={S.tapHint}>Tap to complete this stop →</div>
                      )}
                    </div>
                  );
                })
              )}
              {isInProgress && (
                <button onClick={() => setView("add_stop")} style={S.addStopBtn}>
                  + Add Extra Stop
                </button>
              )}
            </div>
          ) : (
            <div style={S.productTable}>
              {products.length === 0 ? (
                <div style={S.emptyState}>No products.</div>
              ) : (
                products.map(p => (
                  <div key={p.id} style={S.productRow}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0D1B2A" }}>{p.product_name || p.product}</div>
                      {p.unit_price && <div style={{ fontSize: 12, color: "#78909C" }}>₹{fmt(p.unit_price)} / unit</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontFamily: "DM Mono, monospace", color: "#0D1B2A" }}>
                        {fmtN(p.delivered_quantity || 0)} / {fmtN(p.loaded_quantity)}
                      </div>
                      <div style={{ fontSize: 11, color: "#90A4AE" }}>del / loaded</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <style>{ANIM_CSS}</style>
      </div>
    );
  }

  // ── START MODAL ──────────────────────────────────────────────────────────
  if (view === "start_modal") {
    return (
      <div style={S.page}>
        {FONT_IMPORT}
        <div style={S.topNav}>
          <button onClick={() => setView("detail")} style={S.backBtn}>← Back</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Start Delivery</span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ padding: "20px 20px 32px" }}>
          <div style={S.sectionTitle}>🚀 Ready to go?</div>
          <p style={{ fontSize: 13, color: "#546E7A", marginBottom: 20 }}>
            Fill in the start details before heading out.
          </p>

          <label style={S.label}>Odometer Start (km) <span style={S.required}>*</span></label>
          <input type="number" placeholder="e.g. 45230" value={startForm.odometer_start}
            onChange={e => setStartForm(f => ({ ...f, odometer_start: e.target.value }))}
            style={S.input} />

          <label style={S.label}>Fuel Level (liters)</label>
          <input type="number" placeholder="e.g. 35" value={startForm.fuel_start}
            onChange={e => setStartForm(f => ({ ...f, fuel_start: e.target.value }))}
            style={S.input} />

          <label style={S.label}>Start Location</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input placeholder="Address / warehouse name" value={startForm.start_location}
              onChange={e => setStartForm(f => ({ ...f, start_location: e.target.value }))}
              style={{ ...S.input, marginBottom: 0, flex: 1 }} />
            <button onClick={() => getLocation((lat, lng) =>
              setStartForm(f => ({ ...f, start_latitude: lat, start_longitude: lng, start_location: `GPS ${lat}, ${lng}` }))
            )} style={S.gpsBtn} title="Get GPS location">📍</button>
          </div>
          {startForm.start_latitude && (
            <div style={S.gpsConfirm}>📍 GPS: {startForm.start_latitude}, {startForm.start_longitude}</div>
          )}

          <label style={S.label}>Start Notes</label>
          <textarea placeholder="Any notes before you go…" value={startForm.start_notes}
            onChange={e => setStartForm(f => ({ ...f, start_notes: e.target.value }))}
            rows={3} style={S.textarea} />

          <button onClick={handleStart} disabled={saving} style={S.primaryBtn}>
            {saving ? "Starting…" : "🚀 Start Delivery"}
          </button>
        </div>
      </div>
    );
  }

  // ── STOPS OVERVIEW ───────────────────────────────────────────────────────
  if (view === "stops_overview" && selected) {
    const totalPlanned   = stops.reduce((a, s) => a + parseFloat(s.planned_boxes  || 0), 0);
    const totalDelivered = stops.reduce((a, s) => a + parseFloat(s.delivered_boxes|| 0), 0);
    const totalCash      = stops.reduce((a, s) => a + parseFloat(s.collected_amount|| 0), 0);
    const progress       = totalPlanned > 0 ? Math.round((totalDelivered / totalPlanned) * 100) : 0;

    return (
      <div style={S.page}>
        {FONT_IMPORT}
        <div style={S.topNav}>
          <button onClick={() => setView("detail")} style={S.backBtn}>← Back</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Stops</span>
          <button onClick={() => setView("add_stop")} style={S.addBtnSmall}>+ Add</button>
        </div>

        {/* Progress banner */}
        <div style={S.progressBanner}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0D1B2A" }}>
              {completedStops.length} of {stops.length} stops done
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#2E7D32" }}>{progress}%</span>
          </div>
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: `${progress}%` }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: "#546E7A" }}>📦 {fmtN(totalDelivered)} / {fmtN(totalPlanned)} boxes</span>
            <span style={{ fontSize: 12, color: "#2E7D32", fontWeight: 700 }}>💰 ₹{fmt(totalCash)} collected</span>
          </div>
        </div>

        {/* Stop list */}
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {stops.map(stop => {
            const ss      = STOP_STATUS[stop.status] || STOP_STATUS.pending;
            const isNext  = stop.status === "pending" && stops.filter(s => s.status === "pending")[0]?.id === stop.id;
            return (
              <div key={stop.id}
                style={{ ...S.stopCard, ...(stop.status === "pending" ? S.stopCardClickable : {}), ...(isNext ? S.nextStopHighlight : {}) }}
                onClick={() => stop.status === "pending" && openStopForm(stop)}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ ...S.stopSeq, background: isNext ? "#FF9800" : stop.status !== "pending" ? ss.bg : "#0D1B2A", color: isNext ? "#fff" : stop.status !== "pending" ? ss.color : "#fff" }}>
                      {stop.stop_sequence}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>{stop.customer_name}</div>
                      <div style={{ fontSize: 11, color: "#78909C" }}>{stop.customer_address?.slice(0, 40)}{stop.customer_address?.length > 40 ? "…" : ""}</div>
                    </div>
                  </div>
                  <span style={{ ...S.statusBadge, background: ss.bg, color: ss.color, fontSize: 11 }}>
                    {ss.icon} {ss.label}
                  </span>
                </div>

                {stop.status !== "pending" ? (
                  <div style={{ ...S.stopInfoRow, marginTop: 8 }}>
                    <span style={S.stopInfoItem}>🎁 {fmtN(stop.delivered_boxes)} boxes</span>
                    <span style={S.stopInfoItem}>💰 ₹{fmt(stop.collected_amount)}</span>
                    {parseFloat(stop.balance_boxes) > 0 && (
                      <span style={{ ...S.stopInfoItem, color: "#E65100" }}>↩ {fmtN(stop.balance_boxes)} returned</span>
                    )}
                  </div>
                ) : (
                  <div style={{ ...S.stopInfoRow, marginTop: 8 }}>
                    <span style={S.stopInfoItem}>Planned: {fmtN(stop.planned_boxes)} boxes · ₹{fmt(stop.planned_amount)}</span>
                  </div>
                )}

                {isNext && <div style={S.nextHint}>← Next stop — tap to deliver</div>}
              </div>
            );
          })}

          {stops.length === 0 && <div style={S.emptyState}>No stops yet. Add one below.</div>}

          <button onClick={() => setView("add_stop")} style={S.addStopBtn}>+ Add Extra Stop</button>

          {allStopsDone && (
            <button onClick={() => setView("complete_modal")} style={S.successBtn}>
              ✅ Complete Delivery
            </button>
          )}
        </div>
        <style>{ANIM_CSS}</style>
      </div>
    );
  }

  // ── STOP FORM ────────────────────────────────────────────────────────────
  if (view === "stop_form" && currentStop) {
    const isFailOrSkip = ["failed", "skipped"].includes(stopForm.status);
    return (
      <div style={S.page}>
        {FONT_IMPORT}
        <div style={S.topNav}>
          <button onClick={() => setView("stops_overview")} style={S.backBtn}>← Back</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Stop #{currentStop.stop_sequence}</span>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: "16px 20px 32px" }}>
          {/* Customer card */}
          <div style={S.customerCard}>
            <div style={{ fontSize: 10, color: "#90A4AE", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Customer</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0D1B2A" }}>{currentStop.customer_name}</div>
            <div style={{ fontSize: 12, color: "#546E7A", marginTop: 2 }}>{currentStop.customer_address}</div>
            {currentStop.customer_phone && (
              <a href={`tel:${currentStop.customer_phone}`} style={{ display: "inline-block", marginTop: 8, fontSize: 13, color: "#1565C0", fontWeight: 600, textDecoration: "none" }}>
                📞 {currentStop.customer_phone}
              </a>
            )}
            <div style={{ marginTop: 12, padding: "10px 0 0", borderTop: "1px solid #ECEFF1", display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "#90A4AE" }}>Planned Boxes</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", fontFamily: "DM Mono, monospace" }}>{fmtN(currentStop.planned_boxes)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#90A4AE" }}>Planned Amount</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", fontFamily: "DM Mono, monospace" }}>₹{fmt(currentStop.planned_amount)}</div>
              </div>
            </div>
          </div>

          {/* Status selector */}
          <label style={S.label}>Delivery Status <span style={S.required}>*</span></label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { v: "delivered", label: "✅ Delivered",    color: "#2E7D32", bg: "#E8F5E9" },
              { v: "partial",   label: "⚡ Partial",       color: "#E65100", bg: "#FFF8E1" },
              { v: "failed",    label: "❌ Failed",         color: "#C62828", bg: "#FFEBEE" },
              { v: "skipped",   label: "⏭ Skipped",        color: "#546E7A", bg: "#ECEFF1" },
            ].map(opt => (
              <button key={opt.v} onClick={() => setStopForm(f => ({ ...f, status: opt.v }))}
                style={{ padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "2px solid",
                  borderColor: stopForm.status === opt.v ? opt.color : "transparent",
                  background: stopForm.status === opt.v ? opt.bg : "#F5F5F5",
                  color: stopForm.status === opt.v ? opt.color : "#78909C" }}>
                {opt.label}
              </button>
            ))}
          </div>

          {!isFailOrSkip && (
            <>
              <label style={S.label}>Boxes Delivered <span style={S.required}>*</span></label>
              <input type="number" min="0" max={currentStop.planned_boxes} placeholder="0"
                value={stopForm.delivered_boxes}
                onChange={e => setStopForm(f => ({ ...f, delivered_boxes: e.target.value }))}
                style={S.inputLarge} />

              <label style={S.label}>Cash Collected (₹) <span style={S.required}>*</span></label>
              <input type="number" min="0" placeholder="0.00"
                value={stopForm.collected_amount}
                onChange={e => setStopForm(f => ({ ...f, collected_amount: e.target.value }))}
                style={S.inputLarge} />
            </>
          )}

          {isFailOrSkip && (
            <>
              <label style={S.label}>Reason <span style={S.required}>*</span></label>
              <textarea placeholder="Why couldn't this stop be completed?"
                value={stopForm.failure_reason}
                onChange={e => setStopForm(f => ({ ...f, failure_reason: e.target.value }))}
                rows={3} style={S.textarea} />
            </>
          )}

          <label style={S.label}>Notes (optional)</label>
          <textarea placeholder="Any notes about this stop…" value={stopForm.notes}
            onChange={e => setStopForm(f => ({ ...f, notes: e.target.value }))}
            rows={2} style={S.textarea} />

          <button onClick={handleCompleteStop} disabled={saving} style={S.primaryBtn}>
            {saving ? "Saving…" : "✅ Complete Stop"}
          </button>
        </div>
      </div>
    );
  }

  // ── ADD STOP FORM ────────────────────────────────────────────────────────
  if (view === "add_stop") {
    return (
      <div style={S.page}>
        {FONT_IMPORT}
        <div style={S.topNav}>
          <button onClick={() => setView("stops_overview")} style={S.backBtn}>← Back</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Add Extra Stop</span>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: "16px 20px 32px" }}>
          <p style={{ fontSize: 13, color: "#546E7A", marginBottom: 20 }}>
            Add an unplanned stop to this delivery route.
          </p>

          <label style={S.label}>Customer Name <span style={S.required}>*</span></label>
          <input placeholder="Full name or shop name" value={addStopForm.customer_name}
            onChange={e => setAddStopForm(f => ({ ...f, customer_name: e.target.value }))}
            style={S.input} />

          <label style={S.label}>Address <span style={S.required}>*</span></label>
          <textarea placeholder="Full delivery address" value={addStopForm.customer_address}
            onChange={e => setAddStopForm(f => ({ ...f, customer_address: e.target.value }))}
            rows={2} style={S.textarea} />

          <label style={S.label}>Phone</label>
          <input type="tel" placeholder="Mobile number" value={addStopForm.customer_phone}
            onChange={e => setAddStopForm(f => ({ ...f, customer_phone: e.target.value }))}
            style={S.input} />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Planned Boxes</label>
              <input type="number" min="0" placeholder="0" value={addStopForm.planned_boxes}
                onChange={e => setAddStopForm(f => ({ ...f, planned_boxes: e.target.value }))}
                style={S.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Planned Amount (₹)</label>
              <input type="number" min="0" placeholder="0.00" value={addStopForm.planned_amount}
                onChange={e => setAddStopForm(f => ({ ...f, planned_amount: e.target.value }))}
                style={S.input} />
            </div>
          </div>

          <label style={S.label}>Estimated Arrival Time</label>
          <input type="time" value={addStopForm.estimated_arrival}
            onChange={e => setAddStopForm(f => ({ ...f, estimated_arrival: e.target.value }))}
            style={S.input} />

          <label style={S.label}>Notes</label>
          <textarea placeholder="Any notes for this stop…" value={addStopForm.notes}
            onChange={e => setAddStopForm(f => ({ ...f, notes: e.target.value }))}
            rows={2} style={S.textarea} />

          <button onClick={handleAddStop} disabled={saving} style={S.primaryBtn}>
            {saving ? "Adding…" : "+ Add Stop"}
          </button>
        </div>
      </div>
    );
  }

  // ── COMPLETE MODAL ───────────────────────────────────────────────────────
  if (view === "complete_modal") {
    return (
      <div style={S.page}>
        {FONT_IMPORT}
        <div style={S.topNav}>
          <button onClick={() => setView("stops_overview")} style={S.backBtn}>← Back</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Complete Delivery</span>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: "16px 20px 32px" }}>
          {/* Summary snapshot */}
          <div style={S.completeSummaryCard}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1B5E20", marginBottom: 12 }}>📊 Delivery Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Stops Done",    value: `${completedStops.length}/${stops.length}` },
                { label: "Boxes Loaded",  value: fmtN(selected.total_loaded_boxes) },
                { label: "Boxes Delivered", value: fmtN(selected.total_delivered_boxes), green: true },
                { label: "Cash Collected",  value: `₹${fmt(selected.collected_amount)}`, green: true },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #E8F5E9" }}>
                  <div style={{ fontSize: 11, color: "#90A4AE", textTransform: "uppercase", letterSpacing: .5 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.green ? "#2E7D32" : "#0D1B2A", fontFamily: "DM Mono, monospace", marginTop: 2 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <label style={S.label}>Odometer End (km) <span style={S.required}>*</span></label>
          <input type="number" placeholder="e.g. 45530" value={completeForm.odometer_end}
            onChange={e => setCompleteForm(f => ({ ...f, odometer_end: e.target.value }))}
            style={S.input} />

          <label style={S.label}>Fuel Level at End (liters)</label>
          <input type="number" placeholder="e.g. 22" value={completeForm.fuel_end}
            onChange={e => setCompleteForm(f => ({ ...f, fuel_end: e.target.value }))}
            style={S.input} />

          <label style={S.label}>Final Notes</label>
          <textarea placeholder="Any observations, issues, or notes…" value={completeForm.end_notes}
            onChange={e => setCompleteForm(f => ({ ...f, end_notes: e.target.value }))}
            rows={3} style={S.textarea} />

          <button onClick={handleComplete} disabled={saving} style={S.successBtn}>
            {saving ? "Completing…" : "🎉 Complete Delivery"}
          </button>
        </div>
      </div>
    );
  }

  // ── SUMMARY VIEW ─────────────────────────────────────────────────────────
  if (view === "summary" && selected) {
    const distance = selected.odometer_end && selected.odometer_start
      ? (parseFloat(selected.odometer_end) - parseFloat(selected.odometer_start)).toFixed(1)
      : null;

    return (
      <div style={S.page}>
        {FONT_IMPORT}
        <div style={S.topNav}>
          <button onClick={() => setView("list")} style={S.backBtn}>← Home</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Summary</span>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: "16px 20px 32px" }}>
          {/* Celebration banner */}
          <div style={S.celebrationBanner}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1B5E20" }}>Delivery Complete!</div>
            <div style={{ fontSize: 13, color: "#2E7D32", marginTop: 4 }}>{selected.delivery_number}</div>
          </div>

          {/* Key metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Stops Completed",  value: `${completedStops.length}/${stops.length}`,         icon: "📍" },
              { label: "Boxes Delivered",  value: fmtN(selected.total_delivered_boxes),                icon: "📦", green: true },
              { label: "Balance Boxes",    value: fmtN(selected.total_balance_boxes),                  icon: "↩",  amber: parseFloat(selected.total_balance_boxes) > 0 },
              { label: "Cash Collected",   value: `₹${fmt(selected.collected_amount)}`,                icon: "💰", green: true },
              { label: "Total Invoice",    value: `₹${fmt(selected.total_amount)}`,                    icon: "📄" },
              { label: "Pending Amount",   value: `₹${fmt(selected.total_pending_amount)}`,            icon: "⏳", amber: parseFloat(selected.total_pending_amount) > 0 },
              distance && { label: "Distance",          value: `${distance} km`,                        icon: "🛣" },
              distance && { label: "Fuel Consumed",     value: selected.fuel_consumed ? `${fmt(selected.fuel_consumed)} L` : "—", icon: "⛽" },
            ].filter(Boolean).map(m => (
              <div key={m.label} style={S.summaryTile}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 11, color: "#90A4AE", textTransform: "uppercase", letterSpacing: .4 }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.green ? "#2E7D32" : m.amber ? "#E65100" : "#0D1B2A", fontFamily: "DM Mono, monospace", marginTop: 2 }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Stop breakdown */}
          <div style={{ ...S.sectionTitle, marginBottom: 10 }}>Stop Breakdown</div>
          {stops.map(stop => {
            const ss = STOP_STATUS[stop.status] || STOP_STATUS.pending;
            return (
              <div key={stop.id} style={{ ...S.stopCard, marginBottom: 8, cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ ...S.stopSeq, background: ss.bg, color: ss.color }}>{stop.stop_sequence}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0D1B2A" }}>{stop.customer_name}</div>
                  </div>
                  <span style={{ ...S.statusBadge, background: ss.bg, color: ss.color, fontSize: 11 }}>{ss.icon} {ss.label}</span>
                </div>
                <div style={{ ...S.stopInfoRow, marginTop: 6 }}>
                  <span style={S.stopInfoItem}>{fmtN(stop.delivered_boxes)} boxes</span>
                  <span style={S.stopInfoItem}>₹{fmt(stop.collected_amount)}</span>
                  {parseFloat(stop.balance_boxes) > 0 && (
                    <span style={{ ...S.stopInfoItem, color: "#E65100" }}>{fmtN(stop.balance_boxes)} returned</span>
                  )}
                </div>
              </div>
            );
          })}

          <button onClick={() => setView("list")} style={{ ...S.primaryBtn, marginTop: 8 }}>
            ← Back to My Deliveries
          </button>
        </div>
        <style>{ANIM_CSS}</style>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const FONT_IMPORT = (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');`}</style>
);

const ANIM_CSS = `
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes slideUp { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  * { box-sizing: border-box; }
`;

const BASE = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  WebkitFontSmoothing: "antialiased",
};

const S = {
  // ── Layout ──
  page: {
    ...BASE,
    background: "#F7F9FC",
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  },
  fullCenter: {
    ...BASE,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#F7F9FC",
  },
  spinner: {
    width: 36, height: 36, border: "3px solid #E0E0E0",
    borderTopColor: "#0D1B2A", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  // ── List ──
  listHeader: {
    padding: "24px 20px 16px",
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    borderBottom: "1px solid #ECEFF1",
    background: "#fff",
  },
  listHeaderBadge: {
    fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
    color: "#90A4AE", marginBottom: 4,
  },
  listTitle: {
    margin: 0, fontSize: 24, fontWeight: 800, color: "#0D1B2A", letterSpacing: -0.5,
  },
  iconBtn: {
    background: "none", border: "1px solid #ECEFF1", borderRadius: 8,
    width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#546E7A",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  searchInput: {
    width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E0E0E0",
    fontSize: 14, background: "#fff", outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  filterChip: {
    padding: "6px 12px", borderRadius: 20, border: "1px solid #E0E0E0",
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    background: "#fff", color: "#546E7A",
  },
  filterChipActive: {
    background: "#0D1B2A", color: "#fff", borderColor: "#0D1B2A",
  },
  emptyState: {
    padding: "32px 0", textAlign: "center", color: "#90A4AE", fontSize: 13,
  },

  // ── Delivery Card ──
  deliveryCard: {
    background: "#fff", borderRadius: 14, border: "1px solid #ECEFF1",
    display: "flex", position: "relative", overflow: "hidden",
    cursor: "pointer", transition: "transform .1s, box-shadow .1s",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    animation: "slideUp .2s ease",
  },
  deliveryCardActive: {
    border: "1.5px solid #FFB74D",
    boxShadow: "0 2px 10px rgba(255,152,0,.15)",
  },
  statusStrip: {
    width: 4, flexShrink: 0, borderRadius: "14px 0 0 14px",
  },
  deliveryNumber: {
    fontSize: 15, fontWeight: 800, color: "#0D1B2A",
    fontFamily: "'DM Mono', monospace", letterSpacing: -0.5,
  },
  deliveryMeta: {
    fontSize: 12, color: "#78909C", marginTop: 2,
  },
  deliveryInfoRow: {
    display: "flex", gap: 6, flexWrap: "wrap",
  },
  infoChip: {
    fontSize: 11, color: "#546E7A", background: "#F5F5F5",
    padding: "3px 8px", borderRadius: 6,
  },
  activeIndicator: {
    marginTop: 8, fontSize: 12, color: "#E65100", fontWeight: 700,
  },
  cardArrow: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    fontSize: 20, color: "#CFD8DC",
  },

  // ── Status ──
  statusBadge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
  },
  statusDot: {
    width: 6, height: 6, borderRadius: "50%", display: "inline-block",
  },

  // ── Nav ──
  topNav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 20px", background: "#fff", borderBottom: "1px solid #ECEFF1",
    position: "sticky", top: 0, zIndex: 10,
  },
  backBtn: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 14, fontWeight: 600, color: "#1565C0",
    fontFamily: "'DM Sans', sans-serif", padding: 0, minWidth: 60,
  },
  addBtnSmall: {
    background: "#0D1B2A", color: "#fff", border: "none", cursor: "pointer",
    fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8,
    fontFamily: "'DM Sans', sans-serif",
  },

  // ── Hero card ──
  heroCard: {
    background: "#fff", borderRadius: 0,
    padding: "20px 20px 16px",
    borderBottom: "1px solid #ECEFF1",
  },
  statsStrip: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
    background: "#F7F9FC", borderRadius: 12, padding: "12px 8px",
    border: "1px solid #ECEFF1",
  },
  statItem: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "4px 8px",
    borderRight: "1px solid #ECEFF1",
  },

  // ── Tabs ──
  tabNav: {
    display: "flex", background: "#fff", borderBottom: "1px solid #ECEFF1",
    padding: "0 20px",
  },
  tabBtn: {
    flex: 1, padding: "12px 8px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    background: "none", border: "none", color: "#90A4AE",
    borderBottom: "2px solid transparent",
    fontFamily: "'DM Sans', sans-serif",
  },
  tabBtnActive: {
    color: "#0D1B2A", borderBottomColor: "#0D1B2A",
  },

  // ── Stop cards ──
  stopCard: {
    background: "#fff", borderRadius: 12, padding: "14px",
    border: "1px solid #ECEFF1",
    boxShadow: "0 1px 3px rgba(0,0,0,.04)",
  },
  stopCardClickable: {
    cursor: "pointer",
    transition: "box-shadow .15s",
  },
  nextStopHighlight: {
    border: "1.5px solid #FFB74D",
    boxShadow: "0 2px 10px rgba(255,152,0,.12)",
  },
  stopSeq: {
    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0,
  },
  stopInfoRow: {
    display: "flex", gap: 12, flexWrap: "wrap",
  },
  stopInfoItem: {
    fontSize: 12, color: "#546E7A",
  },
  tapHint: {
    marginTop: 8, fontSize: 11, color: "#FF9800", fontWeight: 700,
  },
  nextHint: {
    marginTop: 6, fontSize: 11, color: "#FF9800", fontWeight: 700,
  },

  // ── Forms ──
  sectionTitle: {
    fontSize: 16, fontWeight: 800, color: "#0D1B2A", marginBottom: 16,
  },
  label: {
    display: "block", fontSize: 11, fontWeight: 700, color: "#546E7A",
    textTransform: "uppercase", letterSpacing: .8, marginBottom: 6,
  },
  required: { color: "#F44336" },
  input: {
    display: "block", width: "100%", padding: "11px 14px",
    borderRadius: 10, border: "1px solid #E0E0E0",
    fontSize: 15, background: "#fff", outline: "none", marginBottom: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  inputLarge: {
    display: "block", width: "100%", padding: "14px",
    borderRadius: 10, border: "2px solid #E0E0E0",
    fontSize: 24, fontWeight: 800, background: "#fff", outline: "none", marginBottom: 14,
    fontFamily: "'DM Mono', monospace", textAlign: "center",
    color: "#0D1B2A",
  },
  textarea: {
    display: "block", width: "100%", padding: "11px 14px",
    borderRadius: 10, border: "1px solid #E0E0E0",
    fontSize: 14, background: "#fff", outline: "none", resize: "vertical", marginBottom: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  gpsBtn: {
    padding: "11px 14px", borderRadius: 10, border: "1px solid #E0E0E0",
    background: "#F7F9FC", cursor: "pointer", fontSize: 18,
  },
  gpsConfirm: {
    fontSize: 12, color: "#2E7D32", fontWeight: 600, marginBottom: 14,
    background: "#E8F5E9", padding: "8px 12px", borderRadius: 8,
  },

  // ── Buttons ──
  primaryBtn: {
    display: "block", width: "100%", padding: "14px",
    borderRadius: 12, border: "none", cursor: "pointer",
    background: "#0D1B2A", color: "#fff",
    fontSize: 15, fontWeight: 800, fontFamily: "'DM Sans', sans-serif",
    marginTop: 4,
  },
  successBtn: {
    display: "block", width: "100%", padding: "14px",
    borderRadius: 12, border: "none", cursor: "pointer",
    background: "#1B5E20", color: "#fff",
    fontSize: 15, fontWeight: 800, fontFamily: "'DM Sans', sans-serif",
  },
  addStopBtn: {
    display: "block", width: "100%", padding: "12px",
    borderRadius: 12, border: "1.5px dashed #B0BEC5", cursor: "pointer",
    background: "#fff", color: "#546E7A",
    fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
  },

  // ── Products ──
  productTable: {
    background: "#fff", borderRadius: 12, border: "1px solid #ECEFF1", overflow: "hidden",
  },
  productRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", borderBottom: "1px solid #F5F5F5",
  },

  // ── Progress ──
  progressBanner: {
    margin: "12px 20px", background: "#fff", borderRadius: 14,
    padding: "14px 16px", border: "1px solid #ECEFF1",
  },
  progressTrack: {
    background: "#ECEFF1", borderRadius: 99, height: 8, overflow: "hidden",
  },
  progressFill: {
    height: "100%", background: "linear-gradient(90deg, #2E7D32, #4CAF50)",
    borderRadius: 99, transition: "width .4s ease",
  },

  // ── Customer card ──
  customerCard: {
    background: "#F7F9FC", borderRadius: 14, padding: "16px", marginBottom: 20,
    border: "1px solid #ECEFF1",
  },

  // ── Complete + Summary ──
  completeSummaryCard: {
    background: "#F0FDF4", borderRadius: 14, padding: "16px", marginBottom: 20,
    border: "1px solid #BBF7D0",
  },
  celebrationBanner: {
    background: "linear-gradient(135deg, #E8F5E9, #F0FDF4)",
    borderRadius: 16, padding: "24px", textAlign: "center",
    marginBottom: 16, border: "1px solid #A5D6A7",
  },
  summaryTile: {
    background: "#fff", borderRadius: 12, padding: "14px",
    border: "1px solid #ECEFF1",
  },
};