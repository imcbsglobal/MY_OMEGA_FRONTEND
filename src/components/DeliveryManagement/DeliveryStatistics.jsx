import React, { useState, useEffect } from "react";
import api from "../../api/client";

export default function DeliveryStatistics() {
  const [stats, setStats] = useState(null);
  const [dates, setDates] = useState({
    start_date: "2024-02-01",
    end_date: "2024-02-28",
  });

  const fetchStats = () => {
    api
      .get(
        `/delivery-management/deliveries/statistics/?start_date=${dates.start_date}&end_date=${dates.end_date}`
      )
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStats();
  };

  return (
    <div style={{ background: "#ffffff", padding: 12, borderRadius: 8, marginTop: 12 }}>
      <h2 style={{ color: "#1e293b" }}>Delivery Statistics</h2>
      <form onSubmit={handleSubmit} style={{ margin: "16px 0" }}>
        <input
          type="date"
          name="start_date"
          value={dates.start_date}
          onChange={handleDateChange}
          style={inputStyle}
        />
        <input
          type="date"
          name="end_date"
          value={dates.end_date}
          onChange={handleDateChange}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Get Stats
        </button>
      </form>

      {stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
          <div style={statBoxStyle}>
            <h4>Total Deliveries</h4>
            <p>{stats.total_deliveries}</p>
          </div>
          <div style={statBoxStyle}>
            <h4>Completed</h4>
            <p>{stats.completed_deliveries}</p>
          </div>
          <div style={statBoxStyle}>
            <h4>In Progress</h4>
            <p>{stats.in_progress_deliveries}</p>
          </div>
          <div style={statBoxStyle}>
            <h4>Cancelled</h4>
            <p>{stats.cancelled_deliveries}</p>
          </div>
        </div>
      ) : (
        <p>Loading statistics...</p>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #e6e6e6",
  marginRight: "10px",
};
const buttonStyle = {
  background: "#fee2e2",
  color: "#dc2626",
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};
const statBoxStyle = {
  background: "#f1f5f9",
  padding: "16px",
  borderRadius: "8px",
  textAlign: "center",
};
