import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import DeliveryProducts from "./DeliveryProducts";
import DeliveryStops from "./DeliveryStops";

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

  const fetchDelivery = () => {
    if (id) {
      api
        .get(`/delivery-management/deliveries/${id}/`)
        .then((res) => setDelivery(res.data))
        .catch(() => setDelivery(null));
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const handleAction = (action) => {
    api
      .post(`/delivery-management/deliveries/${id}/${action}/`)
      .then(() => {
        alert(`Delivery ${action}ed successfully!`);
        fetchDelivery();
      })
      .catch((err) => {
        console.error(err);
        alert(`Failed to ${action} delivery.`);
      });
  };

  if (!delivery) return <div>Loading...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: "#1e293b" }}>Delivery #{delivery.id}</h2>
        <div>
          <Link
            to={`/delivery-management/deliveries/${id}/edit`}
            style={{ marginRight: 12, color: "#dc2626" }}
          >
            Edit
          </Link>
          <button onClick={() => handleAction("start")} style={buttonStyle}>
            Start
          </button>
          <button onClick={() => handleAction("complete")} style={buttonStyle}>
            Complete
          </button>
          <button onClick={() => handleAction("cancel")} style={buttonStyle}>
            Cancel
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, background: "#ffffff", padding: 12, borderRadius: 8 }}>
        <div>
          <strong>Reference:</strong> {delivery.reference || "-"}
        </div>
        <div>
          <strong>Status:</strong> {delivery.status || "-"}
        </div>
        <div>
          <strong>Assigned To:</strong>{" "}
          {delivery.assigned_to?.name || delivery.assigned_to || "-"}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          <button
            onClick={() => setActiveTab("products")}
            style={activeTab === "products" ? activeTabStyle : tabStyle}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("stops")}
            style={activeTab === "stops" ? activeTabStyle : tabStyle}
          >
            Stops
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          {activeTab === "products" && <DeliveryProducts deliveryId={id} />}
          {activeTab === "stops" && <DeliveryStops deliveryId={id} />}
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  background: "#fee2e2",
  color: "#dc2626",
  padding: "6px 10px",
  borderRadius: 6,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  marginLeft: "8px",
};

const tabStyle = {
  padding: "8px 16px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#64748b",
  fontWeight: 500,
};

const activeTabStyle = {
  ...tabStyle,
  color: "#dc2626",
  borderBottom: "2px solid #dc2626",
};
