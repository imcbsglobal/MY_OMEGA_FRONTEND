// src/components/WarehouseManagement/WarehouseAssign.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/client";

const PRIMARY      = "#f87171";
const PRIMARY_DARK = "#ef4444";
const BG           = "#f3f4f6";

/* ── Tabs ─────────────────────────────────────────────────────── */
function WarehouseTabs() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const tabs = [
    { label: "Task Monitor", icon: "📊", path: "/warehouse/admin"  },
    { label: "Assign Work",  icon: "📋", path: "/warehouse/assign" },
    { label: "Report",       icon: "📄", path: "/warehouse/duty-report" },
  ];
          return (
            <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 24, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", width: "fit-content" }}>
              {tabs.map((t, i) => {
                const active = pathname === t.path;
                return (
                  <button
                    key={t.path}
                    onClick={() => navigate(t.path)}
                    style={{
                      padding: "10px 20px",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: active ? PRIMARY : "#fff",
                      color: active ? "#fff" : "#6b7280",
                      borderRight: i < tabs.length - 1 ? "1px solid #e5e7eb" : "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                );
              })}
            </div>
          );
        }

        /* ── Field Label ─────────────────────────────────────────────── */
        function Label({ icon, text, required }) {
          return (
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: PRIMARY }}>{icon}</span>
              {text}
              {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
            </label>
          );
        }

        const inputStyle = {
          width: "100%",
          border: "1.5px solid #e5e7eb",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 13,
          color: "#374151",
          background: "#fff",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          transition: "border-color 0.15s",
        };

        /* ── Main ─────────────────────────────────────────────────────── */
        export default function WarehouseAssign() {
          const [employees,  setEmployees]  = useState([]);
          const [loading,    setLoading]    = useState(false);
          const [submitting, setSubmitting] = useState(false);
          const [focusedField, setFocusedField] = useState(null);

          const today = new Date().toISOString().split("T")[0];

          const [form, setForm] = useState({
            assigned_to  : "",
            task_title   : "",
            task_title_custom: "",
            description  : "",
            total_work   : "",
            assigned_date: today,
            due_date     : "",
          });

          const [customTitles, setCustomTitles] = useState([]);

          // Load custom titles from localStorage on mount
          useEffect(() => {
            setLoading(true);
            api.get("warehouse/employees/")
              .then((res) => setEmployees(res.data))
              .catch(()   => toast.error("Failed to load employee list."))
              .finally(() => setLoading(false));
            const savedTitles = JSON.parse(localStorage.getItem('warehouseCustomTaskTitles') || '[]');
            setCustomTitles(savedTitles);
          }, []);

          const handleChange = (e) =>
            setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

          const handleSubmit = async (e) => {
            e.preventDefault();
            if (!form.assigned_to)                    return toast.error("Please select an employee.");
            if (form.task_title === "custom" && !form.task_title_custom.trim())
              return toast.error("Custom task title is required.");
            if (!form.task_title.trim())               return toast.error("Task title is required.");
            if (!form.total_work || Number(form.total_work) <= 0)
                                                      return toast.error("Total work must be greater than 0.");
            if (!form.due_date)                        return toast.error("Due date is required.");

            // Save custom task title if entered
            if (form.task_title === "custom" && form.task_title_custom.trim()) {
              const savedTitles = JSON.parse(localStorage.getItem('warehouseCustomTaskTitles') || '[]');
              if (!savedTitles.includes(form.task_title_custom.trim())) {
                const updatedTitles = [...savedTitles, form.task_title_custom.trim()];
                localStorage.setItem('warehouseCustomTaskTitles', JSON.stringify(updatedTitles));
                setCustomTitles(updatedTitles);
              }
            }

            setSubmitting(true);
            try {
              // Use custom title if selected
              const submitData = {
                ...form,
                task_title: form.task_title === "custom" ? form.task_title_custom.trim() : form.task_title,
                total_work: Number(form.total_work)
      };
      await api.post("warehouse/assign/", submitData);
      toast.success("Task assigned successfully!");
      setForm({ assigned_to: "", task_title: "", task_title_custom: "", description: "", total_work: "", assigned_date: today, due_date: "" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || JSON.stringify(err?.response?.data) || "Failed to assign task.");
    } finally {
      setSubmitting(false);
    }
  };

  const getFocusStyle = (name) =>
    focusedField === name ? { borderColor: PRIMARY, boxShadow: "0 0 0 3px rgba(248,113,113,0.15)" } : {};

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: BG, fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
      <WarehouseTabs />

      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, background: PRIMARY, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 2px 8px rgba(248,113,113,0.3)" }}>
          📦
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1f2937" }}>Warehouse – Assign Work</h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#9ca3af" }}>Assign warehouse tasks to employees and set deadlines.</p>
        </div>
      </div>

      {/* Card */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {/* Card Header */}
        <div style={{ background: PRIMARY, padding: "14px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🗂</span>
          <h2 style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: 15 }}>New Task Assignment</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Employee */}
          <div>
            <Label icon="👤" text="Select Employee" required />
            {loading ? (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading employees…</p>
            ) : (
              <div style={{ position: "relative" }}>
                <select
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("assigned_to")}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer", ...getFocusStyle("assigned_to") }}
                  required
                >
                  <option value="">Choose an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}{emp.email ? ` (${emp.email})` : ""}
                    </option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 11, pointerEvents: "none" }}>▼</span>
              </div>
            )}
          </div>

          {/* Task Title */}
          <div>
            <Label icon="✏️" text="Task Title" required />
            <div style={{ position: "relative" }}>
              <select
                name="task_title"
                value={form.task_title}
                onChange={handleChange}
                onFocus={() => setFocusedField("task_title")}
                onBlur={() => setFocusedField(null)}
                style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer", ...getFocusStyle("task_title") }}
                required
              >
                <option value="">Choose a task title...</option>
                {/* Custom titles from localStorage */}
                {customTitles.map((title, idx) => (
                  <option key={"custom-"+idx} value={title}>{title}</option>
                ))}
                {/* Default options */}
                <option value="Supporting">Supporting</option>
                <option value="MRP Sticking">MRP Sticking</option>
                <option value="Running Stock Filling">Running Stock Filling</option>
                <option value="Godown Filling">Godown Filling</option>
                <option value="custom">Other (Type below)</option>
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 11, pointerEvents: "none" }}>▼</span>
            </div>
            {form.task_title === "custom" && (
              <input
                type="text"
                name="task_title_custom"
                value={form.task_title_custom || ""}
                onChange={e => setForm(f => ({ ...f, task_title_custom: e.target.value }))}
                onFocus={() => setFocusedField("task_title_custom")}
                onBlur={() => setFocusedField(null)}
                placeholder="Type custom task title..."
                style={{ ...inputStyle, marginTop: 8, ...getFocusStyle("task_title_custom") }}
                required
              />
            )} 
          </div>

          {/* Description */}
          <div>
            <Label icon="📄" text="Description" />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
              rows={3}
              placeholder="Describe the task in detail..."
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5, ...getFocusStyle("description") }}
            />
          </div>

          {/* Total Work */}
          <div>
            <Label icon="#" text="Total Work Units" required />
            <input
              type="number"
              name="total_work"
              value={form.total_work}
              onChange={handleChange}
              onFocus={() => setFocusedField("total_work")}
              onBlur={() => setFocusedField(null)}
              min="1"
              placeholder="e.g., 100"
              style={{ ...inputStyle, ...getFocusStyle("total_work") }}
              required
            />
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <Label icon="📅" text="Assign Date" required />
              <input
                type="date"
                name="assigned_date"
                value={form.assigned_date}
                onChange={handleChange}
                onFocus={() => setFocusedField("assigned_date")}
                onBlur={() => setFocusedField(null)}
                style={{ ...inputStyle, ...getFocusStyle("assigned_date") }}
                required
              />
            </div>
            <div>
              <Label icon="📅" text="Due Date" required />
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                onFocus={() => setFocusedField("due_date")}
                onBlur={() => setFocusedField(null)}
                min={form.assigned_date}
                style={{ ...inputStyle, ...getFocusStyle("due_date") }}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: submitting ? "#fca5a5" : PRIMARY,
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "background 0.15s, transform 0.1s",
              boxShadow: submitting ? "none" : "0 2px 8px rgba(248,113,113,0.35)",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = PRIMARY_DARK; }}
            onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = PRIMARY; }}
            onMouseDown={(e)  => { if (!submitting) e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e)    => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span>🚀</span>
            {submitting ? "Assigning…" : "Assign Task"}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}