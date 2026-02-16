/**
 * DeliveryStatistics.jsx
 *
 * Shows delivery statistics for a date range.
 * Can be used standalone or embedded inside DeliveryList.
 *
 * Props:
 *  compact=true  → shows only the stat grid (no title/date inputs)
 *                  used when DeliveryList already has its own date pickers
 */
import React, { useState, useEffect } from "react";
import api from "../../api/client";

const fmt    = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today  = new Date();
const y      = today.getFullYear();
const m      = String(today.getMonth() + 1).padStart(2, "0");
const FIRST  = `${y}-${m}-01`;
const LAST   = new Date(y, today.getMonth() + 1, 0).toISOString().slice(0, 10);

export default function DeliveryStatistics({ compact = false }) {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates]   = useState({ start_date: FIRST, end_date: LAST });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStats(dates.start_date, dates.end_date);
  };

  return (
    <div style={{ background: "#ffffff", padding: compact ? 0 : 16, borderRadius: compact ? 0 : 10, border: compact ? "none" : "1px solid #e2e8f0", marginBottom: compact ? 0 : 20 }}>
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Delivery Statistics</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="date" name="start_date" value={dates.start_date}
              onChange={e => setDates(d => ({ ...d, start_date: e.target.value }))} style={dateInput} />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>to</span>
            <input type="date" name="end_date" value={dates.end_date}
              onChange={e => setDates(d => ({ ...d, end_date: e.target.value }))} style={dateInput} />
            <button type="submit" style={filterBtn}>Apply</button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>Loading statistics…</div>
      ) : !stats ? (
        <div style={{ padding: "20px 0", color: "#ef4444", fontSize: 13 }}>Could not load statistics.</div>
      ) : (
        <>
          {/* Status counts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 12 }}>
            {[
              { label: "Total",       value: stats.total_deliveries,       color: "#0f172a" },
              { label: "Scheduled",   value: stats.scheduled_deliveries,   color: "#1d4ed8" },
              { label: "In Progress", value: stats.in_progress_deliveries, color: "#a16207" },
              { label: "Completed",   value: stats.completed_deliveries,   color: "#15803d" },
              { label: "Cancelled",   value: stats.cancelled_deliveries,   color: "#b91c1c" },
            ].map(s => (
              <div key={s.label} style={statBox}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .5 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4, fontFamily: "monospace" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Box + Financial summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {[
              { label: "Boxes Loaded",    value: fmt(stats.total_boxes_loaded),    color: "#0f172a" },
              { label: "Boxes Delivered", value: fmt(stats.total_boxes_delivered), color: "#15803d" },
              { label: "Balance Boxes",   value: fmt(stats.total_boxes_returned),  color: "#a16207" },
              { label: "Total Invoice",   value: `₹${fmt(stats.total_amount)}`,    color: "#0f172a" },
              { label: "Total Collected", value: `₹${fmt(stats.total_collected)}`, color: "#15803d" },
            ].map(s => (
              <div key={s.label} style={{ ...statBox, background: "#f8fafc" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .5 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color, marginTop: 4, fontFamily: "monospace" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Efficiency */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 99, height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99, background: "#10b981",
                width: `${Math.min(parseFloat(stats.average_efficiency || 0), 100)}%`,
                transition: "width .5s ease"
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d", whiteSpace: "nowrap" }}>
              {parseFloat(stats.average_efficiency || 0).toFixed(1)}% avg efficiency
            </span>
          </div>
        </>
      )}
    </div>
  );
}

const dateInput = {
  padding: "7px 10px", borderRadius: 7, border: "1px solid #e2e8f0",
  fontSize: 13, background: "#f8fafc", outline: "none"
};
const filterBtn = {
  background: "#0f172a", color: "#fff", padding: "7px 14px",
  borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600
};
const statBox = {
  background: "#fff", border: "1px solid #e2e8f0",
  borderRadius: 9, padding: "12px 14px"
};