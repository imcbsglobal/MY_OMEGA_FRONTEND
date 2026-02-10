                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  import React, { useState } from "react";
import { toast } from "react-toastify";
import { createRouteTarget } from "../../api/targetManagement";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  import "./targetManagement.css";

export default function RouteTargets() {
  const [form, setForm] = useState({ employee: "", route: "", product: "", start_date: "", end_date: "", amount: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRouteTarget(form);
      toast.success("Route target created");
      setForm({ employee: "", route: "", product: "", start_date: "", end_date: "", amount: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create route target");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { padding: 20, background: "#ffffff" },
    card: { borderRadius: 8, overflow: "hidden", border: "1px solid #fdecea" },
    header: { background: "#fdecea", padding: 16, display: "flex", alignItems: "center", gap: 12 },
    headerTitle: { margin: 0, color: "#991b1b" },
    form: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, padding: 16, background: "#fff" },
    input: { padding: "8px 10px", border: "1px solid #f3d6d6", borderRadius: 6, background: "#fff" },
    submit: { background: "#dc2626", color: "#fff", padding: "10px 14px", border: "none", borderRadius: 6, cursor: "pointer" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>Assign Route Target</h3>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Employee</label>
            <input name="employee" value={form.employee} onChange={handleChange} style={styles.input} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Route</label>
            <input name="route" value={form.route} onChange={handleChange} style={styles.input} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Product</label>
            <input name="product" value={form.product} onChange={handleChange} style={styles.input} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Start Date</label>
            <input name="start_date" type="date" value={form.start_date} onChange={handleChange} style={styles.input} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>End Date</label>
            <input name="end_date" type="date" value={form.end_date} onChange={handleChange} style={styles.input} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Amount</label>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} style={styles.input} />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={loading} style={styles.submit}>{loading ? "Saving..." : "Assign Target"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
