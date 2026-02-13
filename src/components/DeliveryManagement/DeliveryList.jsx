/**
 * DeliveryList.jsx
 * Main delivery management dashboard.
 * Imports DeliveryStatistics for the stats panel.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import DeliveryStatistics from "./DeliveryStatistics";

const STATUS_META = {
  scheduled:   { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6", label: "Scheduled"   },
  in_progress: { bg: "#fef9c3", color: "#a16207", dot: "#f59e0b", label: "In Progress" },
  completed:   { bg: "#dcfce7", color: "#15803d", dot: "#10b981", label: "Completed"   },
  cancelled:   { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444", label: "Cancelled"   },
};

const fmt = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const params = filter !== "all" ? `?status=${filter}` : "";
        const res = await api.get(`/delivery-management/deliveries/${params}`);
        // Handle paginated response: extract results array
        setDeliveries(res.data?.results || res.data || []);
      } catch { setDeliveries([]); }
      finally { setLoading(false); }
    };
    fetchDeliveries();
  }, [filter]);

  const filtered = deliveries.filter(d =>
    !search ||
    d.delivery_number?.toLowerCase().includes(search.toLowerCase()) ||
    d.employee_name?.toLowerCase().includes(search.toLowerCase())   ||
    d.vehicle_number?.toLowerCase().includes(search.toLowerCase())  ||
    d.route_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');`}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Delivery Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Plan routes, manage deliveries, and track collections</p>
        </div>
        <Link
          to="/delivery-management/deliveries/new"
          style={{ background: "#0f172a", color: "#fff", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}
        >
          + New Delivery
        </Link>
      </div>

      {/* ── Statistics panel (uses DeliveryStatistics component) ── */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16, marginBottom: 20 }}>
        <DeliveryStatistics compact={false} />
      </div>

      {/* ── Filter + Search ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Search by delivery #, driver, vehicle, route…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", outline: "none" }}
        />
        {["all", "scheduled", "in_progress", "completed", "cancelled"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: filter === s ? "#0f172a" : "#fff",
              color:      filter === s ? "#fff"    : "#475569",
              border:     filter === s ? "none"    : "1px solid #e2e8f0",
            }}
          >
            {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Delivery #", "Status", "Driver / Vehicle", "Route", "Date & Time", "Boxes", "Invoice", "Collected", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No deliveries found.</td></tr>
            ) : (
              filtered.map(d => {
                const sm = STATUS_META[d.status] || STATUS_META.scheduled;
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={td}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontFamily: "monospace", fontSize: 13 }}>
                        {d.delivery_number}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ background: sm.bg, color: sm.color, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sm.dot, display: "inline-block" }} />
                        {sm.label}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{d.employee_name || "—"}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{d.vehicle_number || "—"}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontSize: 13, color: "#0f172a" }}>{d.route_name || "—"}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontSize: 13, color: "#0f172a" }}>{d.scheduled_date}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{d.scheduled_time}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontSize: 13, fontFamily: "monospace", color: "#0f172a" }}>
                        {d.total_delivered_boxes || 0} / {d.total_loaded_boxes || 0}
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 13, color: "#0f172a" }}>₹{fmt(d.total_amount)}</span>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 13, color: "#15803d", fontWeight: 700 }}>₹{fmt(d.collected_amount)}</span>
                    </td>
                    <td style={td}>
                      <Link
                        to={`/delivery-management/deliveries/${d.id}`}
                        style={{
                          background: d.status === "in_progress" ? "#fef9c3" : "#f1f5f9",
                          color:      d.status === "in_progress" ? "#a16207" : "#0f172a",
                          padding: "5px 12px", borderRadius: 6,
                          textDecoration: "none", fontSize: 13, fontWeight: 700,
                          display: "inline-block", whiteSpace: "nowrap"
                        }}
                      >
                        {d.status === "scheduled"   ? "▶ Manage"  :
                         d.status === "in_progress" ? "🚚 Active"  :
                         "View"}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const page = { fontFamily: "'Outfit', system-ui, sans-serif", padding: 24, background: "#f8fafc", minHeight: "100vh" };
const td   = { padding: "10px 14px", color: "#0f172a", verticalAlign: "middle" };