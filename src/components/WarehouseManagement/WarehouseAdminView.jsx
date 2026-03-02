// src/components/WarehouseManagement/WarehouseAdminView.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/client";

const PRIMARY = "#f87171";
const BG = "#f0f2f5";

/* ── Tabs ─────────────────────────────────────────────────────── */
function WarehouseTabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = [
    { label: "Task Monitor", icon: "📊", path: "/warehouse/admin" },
    { label: "Assign Work",  icon: "📋", path: "/warehouse/assign" },
  ];
  return (
    <div style={{
      display: "flex",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 20,
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      width: "100%",
    }}>
      {tabs.map((t, i) => {
        const active = pathname === t.path;
        return (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: active ? "#fff" : "#f9fafb",
              color: active ? "#111827" : "#9ca3af",
              borderRight: i < tabs.length - 1 ? "1px solid #e5e7eb" : "none",
              border: "none",
              cursor: "pointer",
              borderBottom: active ? `2px solid ${PRIMARY}` : "2px solid transparent",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Pending:     { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", icon: "⏱" },
    "In Progress": { bg: "#fff1f2", border: "#fecaca", text: "#ef4444", icon: "🔄" },
    Completed:   { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", icon: "✓" },
  };
  const s = map[status] || map.Pending;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "5px 14px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.text,
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 11 }}>{s.icon}</span> {status}
    </span>
  );
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon, value, label, color }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #f3f4f6",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      padding: "16px 12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      flex: 1,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{label}</p>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function WarehouseAdminView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api
      .get("warehouse/admin-tasks/", { params })
      .then((res) => setTasks(res.data))
      .catch(() => toast.error("Failed to load tasks."))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filtered = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.task_title?.toLowerCase().includes(q) ||
      t.assigned_to_name?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total:      tasks.length,
    pending:    tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed:  tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: BG, fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 620 }}>

        <WarehouseTabs />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, color: PRIMARY }}>⚡</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Warehouse – Task Monitor</h1>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Real-time view of all employee warehouse tasks.</p>
            </div>
          </div>
          <button
            onClick={fetchTasks}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontSize: 13,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <StatCard icon="📋" value={stats.total}      label="Total"       color="#6366f1" />
          <StatCard icon="⏱"  value={stats.pending}    label="Pending"     color="#f97316" />
          <StatCard icon="🔄" value={stats.inProgress} label="In Progress" color="#f87171" />
          <StatCard icon="✅" value={stats.completed}  label="Completed"   color="#10b981" />
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 13 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by task or employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                background: "#fff",
                borderRadius: 10,
                paddingLeft: 34,
                paddingRight: 12,
                paddingTop: 9,
                paddingBottom: 9,
                fontSize: 13,
                color: "#374151",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                border: "1px solid #e5e7eb",
                background: "#fff",
                borderRadius: 10,
                padding: "9px 32px 9px 14px",
                fontSize: 13,
                color: "#374151",
                outline: "none",
                appearance: "none",
                fontFamily: "inherit",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                cursor: "pointer",
              }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 11, pointerEvents: "none" }}>▼</span>
          </div>
        </div>

        {/* Task List */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading tasks…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
              <p style={{ fontSize: 36, margin: "0 0 8px" }}>📭</p>
              No tasks found.
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {filtered.map((task, i) => (
                <li
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f9fafb" : "none",
                    transition: "background 0.12s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: 13 }}>{task.task_title}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>
                      {task.assigned_to_name}
                      <span style={{ margin: "0 5px" }}>·</span>
                      {task.total_work} units
                      <span style={{ margin: "0 5px" }}>·</span>
                      Due {task.due_date}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}