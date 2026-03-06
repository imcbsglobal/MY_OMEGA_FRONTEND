// src/components/WarehouseManagement/EmployeeWarehouseView.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/client";

const PRIMARY      = "#f87171";
const PRIMARY_DARK = "#ef4444";
const BG           = "#f0f2f5";

/* ── Tabs ─────────────────────────────────────────────────────── */
function WarehouseTabs() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const user   = JSON.parse(localStorage.getItem("user") || "{}");
  const level  = user?.user_level || "User";
  const isAdmin = level === "Admin" || level === "Super Admin" || user?.is_staff || user?.is_superuser;

  const tabs = [
    { label: "My Tasks", icon: "🛡",  path: "/warehouse/mytasks" },
    ...(isAdmin ? [
      { label: "Monitor", icon: "📊", path: "/warehouse/admin" },
      { label: "Assign",  icon: "📋", path: "/warehouse/assign" },
      { label: "Report",  icon: "📄", path: "/warehouse/duty-report" },
    ] : []),
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
    "Pending":     { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", icon: "⏱" },
    "In Progress": { bg: "#fff1f2", border: "#fecaca", text: "#ef4444", icon: "🔄" },
    "Completed":   { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", icon: "✓" },
  };
  const s = map[status] || map["Pending"];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "4px 12px",
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

/* ── Progress Bar ─────────────────────────────────────────────── */
function ProgressBar({ pct }) {
  const color = pct === 100 ? "#10b981" : PRIMARY;
  return (
    <div style={{ width: "100%", background: "#f3f4f6", borderRadius: 999, height: 6 }}>
      <div style={{
        height: 6,
        borderRadius: 999,
        width: `${Math.min(100, pct)}%`,
        background: color,
        transition: "width 0.7s ease",
      }} />
    </div>
  );
}

/* ── Task Card ────────────────────────────────────────────────── */
function TaskCard({ task, onSave, isLast }) {
  // keep as string so user can clear the input (empty string) instead of it auto-converting to 0
  const [completedWork, setCompletedWork] = useState(
    task.completed_work != null ? String(task.completed_work) : ""
  );
  const [status,        setStatus]        = useState(task.status);
  const [remarks,       setRemarks]       = useState(task.remarks || "");
  const [showForm,      setShowForm]      = useState(false);
  const [saving,        setSaving]        = useState(false);

  const numericCompleted = Number(completedWork) || 0;
  const pct = task.total_work > 0 ? Math.min(100, Math.round((numericCompleted / task.total_work) * 100)) : 0;
  const isDone = task.status === "Completed";

  const handleSave = async () => {
    const toSave = Number(completedWork) || 0;
    if (toSave > task.total_work)
      return toast.error(`Cannot exceed total (${task.total_work}).`);
    setSaving(true);
    try {
      const res = await api.patch(`warehouse/update/${task.id}/`, { completed_work: toSave, status, remarks });
      toast.success("Updated!");
      setShowForm(false);
      onSave(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.completed_work?.[0] || err?.response?.data?.detail || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const btnLabel = task.status === "Pending" ? "Start" : "Update Progress";

  const inputStyle = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    color: "#374151",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fff",
  };

  return (
    <div style={{
      padding: "16px 20px",
      borderBottom: isLast ? "none" : "1px solid #f3f4f6",
    }}>
      {/* Row 1: Title + Badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: 14, lineHeight: 1.4 }}>{task.task_title}</p>
        <StatusBadge status={task.status} />
      </div>

      {/* Row 2: Description */}
      {task.description && (
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#9ca3af" }}>{task.description}</p>
      )}

      {/* Row 3: units + pct */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
        <span>{completedWork} / {task.total_work} units</span>
        <span style={{ fontWeight: 600 }}>{pct}%</span>
      </div>

      {/* Row 4: Progress Bar */}
      <div style={{ marginBottom: 12 }}>
        <ProgressBar pct={pct} />
      </div>

      {/* Row 5: Due + Button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>Due {task.due_date}</span>
        {!isDone && (
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 500,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              padding: "6px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
          >
            <span style={{ fontSize: 11 }}>▶</span> {btnLabel}
          </button>
        )}
      </div>

      {/* Inline Update Form */}
      {showForm && !isDone && (
        <div style={{
          marginTop: 14,
          background: "#f9fafb",
          border: "1px solid #f3f4f6",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Completed Work</label>
            <input
              type="number"
              min="0"
              max={task.total_work}
              value={completedWork}
              onChange={(e) => {
                // allow empty string so user can clear the field; otherwise keep numeric characters only
                const v = e.target.value;
                if (v === "") return setCompletedWork("");
                // keep numeric value as string
                setCompletedWork(String(v));
              }}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add notes..."
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 8,
                border: "none",
                background: saving ? "#fca5a5" : PRIMARY,
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = PRIMARY_DARK; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = PRIMARY; }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#6b7280",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function EmployeeWarehouseView() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("warehouse/my-tasks/")
      .then((res) => setTasks(res.data))
      .catch(()  => toast.error("Failed to load your tasks."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (updated) =>
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: BG, fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 580 }}>

        <WarehouseTabs />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40,
            background: "#fff1f0",
            border: "1px solid #fecaca",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>
            📦
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>My Warehouse Tasks</h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>View and update your assigned warehouse work.</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 13 }}>Loading tasks…</div>
        )}

        {/* Empty */}
        {!loading && tasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <p style={{ fontSize: 40, margin: "0 0 10px" }}>📦</p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>No warehouse tasks assigned yet.</p>
          </div>
        )}

        {/* Task List */}
        {!loading && tasks.length > 0 && (
          <div style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                onSave={handleSave}
                isLast={i === tasks.length - 1}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}