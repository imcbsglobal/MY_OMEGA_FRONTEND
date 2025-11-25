import React, { useState } from "react";
import api from "@/api/client";

export default function LeaveRequest() {
  const employeeData = [
    { name: "Admin User", id: "ADMIN001" },
    { name: "John Mathew", id: "EMP002" },
    { name: "Anjali Nair", id: "EMP003" },
    { name: "Rahul Raj", id: "EMP004" },
    { name: "Meera Thomas", id: "EMP005" },
  ];

  const [form, setForm] = useState({
    name: "",
    empId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    note: "",
  });

  const [filteredNames, setFilteredNames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setForm({ ...form, name: value, empId: "" });

      if (value.length > 0) {
        const matches = employeeData.filter((emp) =>
          emp.name.toLowerCase().startsWith(value.toLowerCase())
        );
        setFilteredNames(matches);
        setShowDropdown(matches.length > 0);
      } else {
        setShowDropdown(false);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSelect = (employee) => {
    setForm({ ...form, name: employee.name, empId: employee.id });
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.empId) {
      alert("⚠️ Please select a valid employee.");
      return;
    }

    setLoading(true);

    // Corrected payload
    const payload = {
      user: form.empId,
      leave_type: form.leaveType,
      from_date: form.startDate,
      to_date: form.endDate,
      reason: form.reason,
      note: form.note,
    };

    console.log("🔥 PAYLOAD SENT:", payload);

    try {
      await api.post("/hr/leave-requests/", payload);
      alert("✅ Leave request submitted successfully!");
      window.history.back();
    } catch (err) {
      console.log("🔥 FULL BACKEND ERROR:", err?.response?.data);
      console.log("🔥 STATUS CODE:", err?.response?.status);
      alert("❌ Failed to submit leave request. Check console for FULL ERROR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <h4 style={styles.title}>Request New Leave</h4>
          <button style={styles.backButton} onClick={() => window.history.back()}>
            ← Back to List
          </button>
        </div>

        <div style={styles.infoBanner}>
          <strong>Requesting as Admin</strong> — Your leave will be auto-approved by the system.
        </div>

        <form onSubmit={handleSubmit}>

          {/* Employee Info */}
          <section style={styles.section}>
            <h5 style={styles.sectionTitle}>Employee Information</h5>
            <div style={styles.formRow}>

              <div style={{ ...styles.formGroup, position: "relative" }}>
                <label style={styles.label}>Employee Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Type to search employee..."
                  style={styles.input}
                  required
                />

                {showDropdown && (
                  <div style={styles.dropdown}>
                    {filteredNames.map((emp) => (
                      <div
                        key={emp.id}
                        style={styles.dropdownItem}
                        onClick={() => handleSelect(emp)}
                      >
                        {emp.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Employee ID *</label>
                <input
                  type="text"
                  name="empId"
                  value={form.empId}
                  onChange={handleChange}
                  placeholder="Auto filled on name select"
                  style={styles.input}
                  required
                />
              </div>

            </div>
          </section>

          {/* Leave Details */}
          <section style={styles.section}>
            <h5 style={styles.sectionTitle}>Leave Details</h5>
            <div style={styles.formRow}>

              <div style={styles.formGroup}>
                <label style={styles.label}>Leave Type *</label>
               <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Select Type</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="earned">Earned Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="emergency">Emergency Leave</option>
              </select>

              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

            </div>
          </section>

          {/* Leave Info */}
          <section style={styles.section}>
            <h5 style={styles.sectionTitle}>Leave Information</h5>
            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Reason *</label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  rows="3"
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Additional Details</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows="3"
                  style={styles.textarea}
                />
              </div>
            </div>
          </section>

          <div style={styles.buttonRow}>
            <button type="button" onClick={() => window.history.back()} style={styles.btnLight}>
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

/* =======================
   STYLES (unchanged)
======================= */
const styles = {
  container: { padding: "40px", backgroundColor: "#f9fafb", display: "flex", justifyContent: "center", minHeight: "calc(100vh - 120px)" },
  card: { backgroundColor: "#ffffff", padding: "30px 40px", borderRadius: "10px", boxShadow: "0 5px 15px rgba(0,0,0,0.08)", width: "100%", maxWidth: "950px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title: { fontSize: "20px", fontWeight: "600", margin: 0 },
  backButton: { background: "#f3f4f6", color: "#111827", padding: "6px 16px", borderRadius: "6px", border: "1px solid #d1d5db", cursor: "pointer", fontSize: "14px" },
  infoBanner: { backgroundColor: "#eef5ff", color: "#1e3a8a", padding: "10px 14px", borderRadius: "8px", marginBottom: "25px", fontSize: "14px" },
  section: { marginBottom: "25px" },
  sectionTitle: { fontWeight: "600", marginBottom: "10px", color: "#111827" },
  formRow: { display: "flex", gap: "15px", flexWrap: "wrap" },
  formGroup: { display: "flex", flexDirection: "column", flex: "1" },
  label: { fontSize: "13.5px", fontWeight: "500", marginBottom: "5px" },
  input: { padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none", fontSize: "14px" },
  select: { padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" },
  textarea: { padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", resize: "none", fontSize: "14px" },
  buttonRow: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" },
  btnLight: { background: "#f3f4f6", color: "#111827", padding: "10px 18px", borderRadius: "6px", border: "1px solid #d1d5db", cursor: "pointer", fontWeight: "500" },
  btnPrimary: { background: "#2563eb", color: "#ffffff", padding: "10px 18px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "500" },
  dropdown: { position: "absolute", top: "64px", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", zIndex: 1000 },
  dropdownItem: { padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", fontSize: "14px" },
};
