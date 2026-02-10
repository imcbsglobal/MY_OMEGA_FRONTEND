import React, { useState } from "react";
import theme from "../../styles/targetTheme";
import "./targetManagement.css";

export default function OrderTarget() {
  const [form, setForm] = useState({
    date: "",
    day: "",
    area: "",
    team: "",
    shopsVisited: "",
    targetCategory: "",
    totalOrders: "",
    orderReceived: "",
    boxQty: "",
    notes: "",
  });

  const [entries, setEntries] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEntries((prev) => [form, ...prev]);
    setForm({
      date: "",
      day: "",
      area: "",
      team: "",
      shopsVisited: "",
      targetCategory: "",
      totalOrders: "",
      orderReceived: "",
      boxQty: "",
      notes: "",
    });
  };

  const styles = theme;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>Order Target</h3>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <label style={styles.label}>Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Day</label>
            <select name="day" value={form.day} onChange={handleChange} style={styles.input}>
              <option value="">Select day</option>
              <option>MON</option>
              <option>TUE</option>
              <option>WED</option>
              <option>THU</option>
              <option>FRI</option>
              <option>SAT</option>
              <option>SUN</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Area / Route</label>
            <input name="area" value={form.area} onChange={handleChange} style={styles.input} placeholder="Area / Route" />
          </div>

          <div>
            <label style={styles.label}>Team / Agent</label>
            <input name="team" value={form.team} onChange={handleChange} style={styles.input} placeholder="Team / Agent" />
          </div>

          <div>
            <label style={styles.label}>No. of Shops Visited</label>
            <input name="shopsVisited" type="number" value={form.shopsVisited} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Target Category</label>
            <input name="targetCategory" value={form.targetCategory} onChange={handleChange} style={styles.input} placeholder="Category" />
          </div>

          <div>
            <label style={styles.label}>Total Orders (Planned)</label>
            <input name="totalOrders" type="number" value={form.totalOrders} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Order Received</label>
            <input name="orderReceived" type="number" value={form.orderReceived} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Box Qty</label>
            <input name="boxQty" type="number" value={form.boxQty} onChange={handleChange} style={styles.input} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={styles.label}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} style={styles.textarea} placeholder="Any notes..." />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" style={styles.submit}>Save Entry</button>
          </div>
        </form>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Day</th>
                <th style={styles.th}>Area</th>
                <th style={styles.th}>Team</th>
                <th style={styles.th}>Shops Visited</th>
                <th style={styles.th}>Target Cat.</th>
                <th style={styles.th}>Planned</th>
                <th style={styles.th}>Received</th>
                <th style={styles.th}>Box Qty</th>
                <th style={styles.th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={10}>No entries yet</td>
                </tr>
              ) : (
                entries.map((en, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{en.date}</td>
                    <td style={styles.td}>{en.day}</td>
                    <td style={styles.td}>{en.area}</td>
                    <td style={styles.td}>{en.team}</td>
                    <td style={styles.td}>{en.shopsVisited}</td>
                    <td style={styles.td}>{en.targetCategory}</td>
                    <td style={styles.td}>{en.totalOrders}</td>
                    <td style={styles.td}>{en.orderReceived}</td>
                    <td style={styles.td}>{en.boxQty}</td>
                    <td style={styles.td}>{en.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
