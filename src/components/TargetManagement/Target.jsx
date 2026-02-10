import React, { useState } from "react";
import theme from "../../styles/targetTheme";
import "./targetManagement.css";

export default function CallTarget() {
  const [form, setForm] = useState({
    date: "",
    day: "",
    area: "",
    team: "",
    totalCalls: "",
    attended: "",
    callAttempted: "",
    notAttended: "",
    orderReceived: "",
    boxQty: "",
    feedback: "",
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
      totalCalls: "",
      attended: "",
      callAttempted: "",
      notAttended: "",
      orderReceived: "",
      boxQty: "",
      feedback: "",
    });
  };

  const styles = theme;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>Call Target</h3>
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
            <label style={styles.label}>Area</label>
            <input name="area" value={form.area} onChange={handleChange} style={styles.input} placeholder="Area / Route" />
          </div>

          <div>
            <label style={styles.label}>Team</label>
            <input name="team" value={form.team} onChange={handleChange} style={styles.input} placeholder="Team / Agent" />
          </div>

          <div>
            <label style={styles.label}>Total Calls</label>
            <input name="totalCalls" type="number" value={form.totalCalls} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Attended Calls</label>
            <input name="attended" type="number" value={form.attended} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Call Attempted</label>
            <input name="callAttempted" type="number" value={form.callAttempted} onChange={handleChange} style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Not Attended</label>
            <input name="notAttended" type="number" value={form.notAttended} onChange={handleChange} style={styles.input} />
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
            <label style={styles.label}>Feedback / Remarks</label>
            <textarea name="feedback" value={form.feedback} onChange={handleChange} style={styles.textarea} placeholder="Any notes..." />
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
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Attended</th>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Box Qty</th>
                <th style={styles.th}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={9}>No entries yet</td>
                </tr>
              ) : (
                entries.map((en, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{en.date}</td>
                    <td style={styles.td}>{en.day}</td>
                    <td style={styles.td}>{en.area}</td>
                    <td style={styles.td}>{en.team}</td>
                    <td style={styles.td}>{en.totalCalls}</td>
                    <td style={styles.td}>{en.attended}</td>
                    <td style={styles.td}>{en.orderReceived}</td>
                    <td style={styles.td}>{en.boxQty}</td>
                    <td style={styles.td}>{en.feedback}</td>
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
