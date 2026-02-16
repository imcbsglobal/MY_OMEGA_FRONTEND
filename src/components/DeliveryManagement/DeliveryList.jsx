/**
 * DeliveryList.jsx
 * Self-contained delivery management dashboard.
 * Includes statistics panel + full delivery table in one component.
 * No external DeliveryStatistics import needed — avoids routing issues.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

// ─── helpers ──────────────────────────────────────────────────────────────────
const FONT = "'Outfit', system-ui, sans-serif";
const fmt  = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (n) => parseFloat(n || 0).toLocaleString("en-IN");

const today = new Date();
const y     = today.getFullYear();
const mo    = String(today.getMonth() + 1).padStart(2, "0");
const FIRST = `${y}-${mo}-01`;
const LAST  = new Date(y, today.getMonth() + 1, 0).toISOString().slice(0, 10);

const STATUS_META = {
  scheduled:   { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe", label: "Scheduled"   },
  in_progress: { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b", border: "#fde68a", label: "In Progress" },
  completed:   { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e", border: "#bbf7d0", label: "Completed"   },
  cancelled:   { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e", border: "#fecdd3", label: "Cancelled"   },
};

// ─── Inline statistics panel ──────────────────────────────────────────────────
function StatsPanel() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [dates,   setDates]   = useState({ start_date: FIRST, end_date: LAST });

  const fetchStats = async (start = dates.start_date, end = dates.end_date) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/delivery-management/deliveries/statistics/?start_date=${start}&end_date=${end}`
      );
      setStats(res.data);
    } catch { setStats(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const eff      = parseFloat(stats?.average_efficiency || 0);
  const effColor = eff >= 80 ? "#16a34a" : eff >= 50 ? "#d97706" : "#dc2626";
  const effBg    = eff >= 80 ? "#f0fdf4"  : eff >= 50 ? "#fffbeb"  : "#fff1f2";
  const effBar   = eff >= 80
    ? "linear-gradient(90deg,#22c55e,#16a34a)"
    : eff >= 50 ? "linear-gradient(90deg,#fbbf24,#d97706)"
    : "linear-gradient(90deg,#f87171,#dc2626)";

  return (
    <>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: 99, border: "1px solid #e2e8f0" }}>📊 Analytics</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Delivery Statistics</span>
        </div>
        <form onSubmit={e => { e.preventDefault(); fetchStats(dates.start_date, dates.end_date); }}
          style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
          {[["From", "start_date"], ["To", "end_date"]].map(([lbl, key]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .7 }}>{lbl}</span>
              <input type="date" value={dates[key]}
                onChange={e => setDates(d => ({ ...d, [key]: e.target.value }))}
                style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: FONT, color: "#0f172a", fontWeight: 600, background: "#f8fafc", outline: "none" }} />
            </div>
          ))}
          <div style={{ width: 16, height: 2, background: "#e2e8f0", borderRadius: 99, marginBottom: 10 }} />
          <button type="submit"
            style={{ padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>
            Apply
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 82, borderRadius: 12, background: "#f1f5f9", animation: "shimmer 1.4s ease infinite" }} />
          ))}
        </div>
      ) : !stats ? (
        <div style={{ padding: "12px 16px", background: "#fff1f2", color: "#be123c", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid #fecdd3" }}>
          ⚠️ Could not load statistics.
        </div>
      ) : (
        <>
          {/* Row 1 – status counts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 10 }}>
            {[
              { label: "Total",       value: stats.total_deliveries,       icon: "📦", accent: "#0f172a", bg: "#f8fafc", border: "#e2e8f0" },
              { label: "Scheduled",   value: stats.scheduled_deliveries,   icon: "📅", accent: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "In Progress", value: stats.in_progress_deliveries, icon: "🚚", accent: "#b45309", bg: "#fffbeb", border: "#fde68a" },
              { label: "Completed",   value: stats.completed_deliveries,   icon: "✅", accent: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Cancelled",   value: stats.cancelled_deliveries,   icon: "❌", accent: "#be123c", bg: "#fff1f2", border: "#fecdd3" },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: 12, padding: "14px 16px", background: s.bg, border: `1px solid ${s.border}`, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: s.accent, textTransform: "uppercase", letterSpacing: .8, opacity: .75 }}>{s.label}</div>
                  <span style={{ fontSize: 15 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: s.accent, lineHeight: 1.1, marginTop: 6, fontFamily: FONT }}>{s.value ?? "—"}</div>
              </div>
            ))}
          </div>

          {/* Row 2 – KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
            {[
              { label: "Boxes Loaded",    value: fmtN(stats.total_boxes_loaded),    icon: "📦", accent: "#334155", bg: "#f8fafc", border: "#e2e8f0" },
              { label: "Boxes Delivered", value: fmtN(stats.total_boxes_delivered), icon: "📤", accent: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Balance Boxes",   value: fmtN(stats.total_boxes_returned),  icon: "↩",  accent: "#b45309", bg: "#fffbeb", border: "#fde68a" },
              { label: "Total Invoice",   value: `₹${fmt(stats.total_amount)}`,     icon: "🧾", accent: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Total Collected", value: `₹${fmt(stats.total_collected)}`,  icon: "💰", accent: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: 12, padding: "14px 16px", background: s.bg, border: `1px solid ${s.border}`, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: s.accent, textTransform: "uppercase", letterSpacing: .8, opacity: .75 }}>{s.label}</div>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: `1px solid ${s.border}` }}>{s.icon}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.accent, letterSpacing: -0.3 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Efficiency */}
          <div style={{ marginTop: 12, borderRadius: 12, padding: "12px 16px", background: effBg, border: `1px solid ${effColor}30`, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: effColor + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: effColor, textTransform: "uppercase", letterSpacing: .8 }}>Avg Efficiency</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: effColor, lineHeight: 1 }}>{eff.toFixed(1)}%</div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,.6)", borderRadius: 99, height: 10, overflow: "hidden", border: `1px solid ${effColor}20` }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${Math.min(eff, 100)}%`, background: effBar, transition: "width .6s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
                  {eff > 10 && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{eff.toFixed(0)}%</span>}
                </div>
              </div>
              <span style={{ fontSize: 11, color: effColor, fontWeight: 700, flexShrink: 0, opacity: .8 }}>
                {eff >= 80 ? "Excellent" : eff >= 50 ? "Average" : "Needs attention"}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [deleting,   setDeleting]   = useState(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await api.get(`/delivery-management/deliveries/${params}`);
      setDeliveries(res.data?.results || res.data || []);
    } catch { setDeliveries([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDeliveries(); }, [filter]);

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete ${d.delivery_number}? This cannot be undone.`)) return;
    setDeleting(d.id);
    try {
      await api.delete(`/delivery-management/deliveries/${d.id}/`);
      setDeliveries(prev => prev.filter(x => x.id !== d.id));
    } catch (e) {
      alert(e.response?.data?.error || e.response?.data?.detail || "Failed to delete.");
    } finally { setDeleting(null); }
  };

  const filtered = deliveries.filter(d =>
    !search ||
    d.delivery_number?.toLowerCase().includes(search.toLowerCase()) ||
    d.employee_name?.toLowerCase().includes(search.toLowerCase())   ||
    d.vehicle_number?.toLowerCase().includes(search.toLowerCase())  ||
    d.route_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: FONT, padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.45} }
        .del-row:hover td { background: #f8fafc !important; }
        .icon-btn:hover { filter: brightness(.9) !important; }
      `}</style>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Delivery Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Plan routes, manage deliveries, and track collections</p>
        </div>
        <Link to="/delivery-management/deliveries/new"
          style={{ background: "#0f172a", color: "#fff", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
          + New Delivery
        </Link>
      </div>

      {/* Statistics panel */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "18px 20px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
        <StatsPanel />
      </div>

      {/* Filter + Search bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Search by delivery #, driver, vehicle, route…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", outline: "none", fontFamily: FONT }}
        />
        <button onClick={fetchDeliveries} title="Refresh"
          style={{ padding: "9px 13px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 16, color: "#64748b" }}>
          ⟳
        </button>
        {["all", "scheduled", "in_progress", "completed", "cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              background: filter === s ? "#0f172a" : "#fff",
              color:      filter === s ? "#fff"    : "#475569",
              border:     filter === s ? "none"    : "1px solid #e2e8f0",
            }}>
            {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Delivery table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>

        {/* Table label + count */}
        <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            All Deliveries
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 99 }}>
              {filtered.length}
            </span>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {[
                ["Delivery #",       "left"],
                ["Status",           "left"],
                ["Driver / Vehicle", "left"],
                ["Route",            "left"],
                ["Date & Time",      "left"],
                ["Boxes",            "right"],
                ["Invoice",          "right"],
                ["Collected",        "right"],
                ["Actions",          "center"],
              ].map(([h, align]) => (
                <th key={h} style={{ textAlign: align, padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1px solid #e2e8f0" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* skeleton loading */}
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {[...Array(9)].map((__, j) => (
                    <td key={j} style={{ padding: "14px 16px" }}>
                      <div style={{ height: 13, borderRadius: 5, background: "#f1f5f9", width: j === 0 ? "75%" : j === 8 ? "55%" : "65%", animation: "shimmer 1.4s ease infinite" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "52px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>No deliveries found</div>
                  <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
                    {search ? "Try a different search term" : "Create a new delivery to get started"}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(d => {
                const sm = STATUS_META[d.status] || STATUS_META.scheduled;
                return (
                  <tr key={d.id} className="del-row" style={{ borderBottom: "1px solid #f1f5f9" }}>

                    {/* Delivery # */}
                    <td style={TD}>
                      <span style={{ fontWeight: 800, color: "#0f172a", fontFamily: "monospace", fontSize: 13, letterSpacing: -0.3 }}>
                        {d.delivery_number}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={TD}>
                      <span style={{ background: sm.bg, color: sm.color, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${sm.border}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sm.dot }} />
                        {sm.label}
                      </span>
                    </td>

                    {/* Driver / Vehicle */}
                    <td style={TD}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{d.employee_name || "—"}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, fontFamily: "monospace" }}>{d.vehicle_number || "—"}</div>
                    </td>

                    {/* Route */}
                    <td style={TD}>
                      <span style={{ fontSize: 13, color: "#334155" }}>{d.route_name || "—"}</span>
                    </td>

                    {/* Date & Time */}
                    <td style={TD}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{d.scheduled_date}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{d.scheduled_time}</div>
                    </td>

                    {/* Boxes delivered / loaded */}
                    <td style={{ ...TD, textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontFamily: "monospace" }}>
                        <span style={{ color: "#15803d", fontWeight: 700 }}>{d.total_delivered_boxes || 0}</span>
                        <span style={{ color: "#cbd5e1", margin: "0 3px" }}>/</span>
                        <span style={{ color: "#64748b" }}>{d.total_loaded_boxes || 0}</span>
                      </span>
                    </td>

                    {/* Invoice */}
                    <td style={{ ...TD, textAlign: "right" }}>
                      <span style={{ fontSize: 13, color: "#334155", fontFamily: "monospace" }}>₹{fmt(d.total_amount)}</span>
                    </td>

                    {/* Collected */}
                    <td style={{ ...TD, textAlign: "right" }}>
                      <span style={{ fontSize: 13, color: "#15803d", fontWeight: 800, fontFamily: "monospace" }}>₹{fmt(d.collected_amount)}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ ...TD, textAlign: "center" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Link to={`/delivery-management/deliveries/${d.id}`}
                          style={{
                            padding: "5px 11px", borderRadius: 6, textDecoration: "none",
                            fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                            background: d.status === "in_progress" ? "#fffbeb" : "#f1f5f9",
                            color:      d.status === "in_progress" ? "#b45309" : "#0f172a",
                            border:     d.status === "in_progress" ? "1px solid #fde68a" : "1px solid #e2e8f0",
                          }}>
                          {d.status === "scheduled"   ? "▶ Manage" :
                           d.status === "in_progress" ? "🚚 Active" : "View"}
                        </Link>

                        <Link to={`/delivery-management/deliveries/${d.id}/edit`}
                          className="icon-btn"
                          title="Edit"
                          style={{ width: 30, height: 30, borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, textDecoration: "none" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#dbeafe"}
                          onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}>
                          ✏️
                        </Link>

                        <button
                          onClick={() => handleDelete(d)}
                          disabled={deleting === d.id}
                          className="icon-btn"
                          title="Delete"
                          style={{ width: 30, height: 30, borderRadius: 6, background: "#fff0f0", border: "1px solid #fecaca", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: deleting === d.id ? "not-allowed" : "pointer", opacity: deleting === d.id ? .5 : 1 }}
                          onMouseEnter={e => { if (deleting !== d.id) e.currentTarget.style.background = "#fee2e2"; }}
                          onMouseLeave={e => { if (deleting !== d.id) e.currentTarget.style.background = "#fff0f0"; }}>
                          {deleting === d.id ? "…" : "🗑"}
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && filtered.length > 0 && (
          <div style={{ padding: "10px 20px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>
            Showing {filtered.length} of {deliveries.length} deliveries
          </div>
        )}
      </div>
    </div>
  );
}

const TD = { padding: "12px 16px", color: "#0f172a", verticalAlign: "middle" };