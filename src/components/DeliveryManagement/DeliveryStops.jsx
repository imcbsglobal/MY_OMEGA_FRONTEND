import React, { useEffect, useState } from "react";
import api from "../../api/client";

export default function DeliveryStops({ deliveryId }) {
  const [stops, setStops] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStop, setEditingStop] = useState(null);

  const fetchStops = () => {
    if (deliveryId) {
      api
        .get(`/delivery-management/deliveries/${deliveryId}/stops/`)
        .then((res) => setStops(res.data || []))
        .catch(() => setStops([]));
    }
  };

  useEffect(() => {
    fetchStops();
  }, [deliveryId]);

  const handleCompleteStop = (stopId) => {
    api
      .post(`/delivery-management/delivery-stops/${stopId}/complete/`)
      .then(() => {
        alert("Stop completed successfully!");
        fetchStops();
      })
      .catch(() => alert("Failed to complete stop."));
  };

  const handleDeleteStop = (stopId) => {
    api
      .delete(`/delivery-management/delivery-stops/${stopId}/`)
      .then(() => {
        alert("Stop deleted successfully!");
        fetchStops();
      })
      .catch(() => alert("Failed to delete stop."));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const request = editingStop
      ? api.patch(`/delivery-management/delivery-stops/${editingStop.id}/`, data)
      : api.post(`/delivery-management/deliveries/${deliveryId}/stops/`, data);

    request
      .then(() => {
        alert(`Stop ${editingStop ? "updated" : "created"} successfully!`);
        setShowForm(false);
        setEditingStop(null);
        fetchStops();
      })
      .catch(() => alert(`Failed to ${editingStop ? "update" : "create"} stop.`));
  };

  const openEditForm = (stop) => {
    setEditingStop(stop);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ color: "#1e293b" }}>Stops for Delivery #{deliveryId}</h3>
        <button onClick={() => { setShowForm(true); setEditingStop(null); }} style={buttonStyle}>
          Create Stop
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} style={{ marginTop: 12, background: "#ffffff", padding: 12, borderRadius: 8 }}>
          <h4 style={{ color: "#1e293b" }}>{editingStop ? "Edit Stop" : "Create Stop"}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <input name="address" placeholder="Address" defaultValue={editingStop?.address || ""} style={inputStyle} required />
            <input name="status" placeholder="Status" defaultValue={editingStop?.status || ""} style={inputStyle} />
          </div>
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <button type="button" onClick={() => setShowForm(false)} style={cancelButtonStyle}>Cancel</button>
            <button type="submit" style={buttonStyle}>{editingStop ? "Update" : "Create"}</button>
          </div>
        </form>
      )}

      <div style={{ marginTop: 12, background: "#ffffff", padding: 12, borderRadius: 8 }}>
        <table style={{ width: "100%" }}>
          <thead>
            <tr style={{ background: "#fff5f5" }}>
              <th style={th}>ID</th>
              <th style={th}>Address</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stops.length ? (
              stops.map((s) => (
                <tr key={s.id}>
                  <td style={td}>{s.id}</td>
                  <td style={td}>{s.address || s.location || "-"}</td>
                  <td style={td}>{s.status || "-"}</td>
                  <td style={td}>
                    <button onClick={() => openEditForm(s)} style={actionButtonStyle}>Edit</button>
                    <button onClick={() => handleCompleteStop(s.id)} style={actionButtonStyle}>Complete</button>
                    <button onClick={() => handleDeleteStop(s.id)} style={actionButtonStyle}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: 12, color: "#64748b" }}>
                  No stops found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign: "left", padding: "8px 12px", color: "#7f1d1d" };
const td = { padding: "8px 12px", borderTop: "1px solid #f1f5f9", color: "#0f172a" };
const buttonStyle = {
  background: "#fee2e2",
  color: "#dc2626",
  padding: "8px 12px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  marginLeft: "8px",
};
const cancelButtonStyle = { ...buttonStyle, background: "#f1f5f9", color: "#475569" };
const actionButtonStyle = {
  marginRight: 8,
  padding: "4px 8px",
  borderRadius: 4,
  border: "1px solid #cbd5e1",
  background: "transparent",
  cursor: "pointer",
};
const inputStyle = {
  padding: "8px 12px",
  borderRadius: 4,
  border: "1px solid #cbd5e1",
  width: "100%",
  boxSizing: "border-box",
};
