import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import DeliveryProducts from "./DeliveryProducts";

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [showStartModal, setShowStartModal] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    address: ""
  });

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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            address: "Current Location"
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Failed to get current location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleStartDelivery = async () => {
    try {
      const payload = {
        start_location: locationData.address,
        start_latitude: locationData.latitude ? parseFloat(locationData.latitude) : null,
        start_longitude: locationData.longitude ? parseFloat(locationData.longitude) : null
      };

      await api.post(`/delivery-management/deliveries/${id}/start/`, payload);
      
      alert("Delivery started successfully!");
      setShowStartModal(false);
      fetchDelivery();
    } catch (error) {
      console.error("Error starting delivery:", error);
      console.log("Full error response:", error.response?.data);
      
      let errorMessage = "Failed to start delivery";
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'object') {
          // If it's validation errors, format them
          errorMessage = Object.entries(error.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        } else {
          errorMessage = error.response.data.message || error.message;
        }
      }
      alert(errorMessage);
    }
  };

  const handleAction = async (action) => {
    if (action === "start") {
      setShowStartModal(true);
      getCurrentLocation(); // Auto-get location when starting
      return;
    }

    if (action === "complete") {
      if (!confirm("Are you sure you want to complete this delivery?")) return;
      
      try {
        // Prepare products data with current delivered quantities
        const products = delivery.products?.map(p => ({
          product_id: p.product,
          delivered_quantity: p.delivered_quantity || p.loaded_quantity || 0
        })) || [];

        await api.post(`/delivery-management/deliveries/${id}/complete/`, {
          products: products,
          notes: "Delivery completed from detail view"
        });
        
        alert("Delivery completed successfully!");
        fetchDelivery();
      } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.error || err.message || "Failed to complete delivery.";
        alert(errorMessage);
      }
      return;
    }

    if (action === "cancel") {
      if (!confirm("Are you sure you want to cancel this delivery?")) return;
    }

    api
      .post(`/delivery-management/deliveries/${id}/${action}/`)
      .then(() => {
        alert(`Delivery ${action}ed successfully!`);
        fetchDelivery();
      })
      .catch((err) => {
        console.error(err);
        const errorMessage = err.response?.data?.error || err.message || `Failed to ${action} delivery.`;
        alert(errorMessage);
      });
  };

  if (!delivery) return <div style={{padding: "24px", textAlign: "center"}}>Loading...</div>;

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "Scheduled",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled"
    };
    return labels[status] || status;
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      scheduled: { background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" },
      in_progress: { background: "#fef3c7", color: "#d97706", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" },
      completed: { background: "#d1fae5", color: "#059669", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" },
      cancelled: { background: "#fee2e2", color: "#dc2626", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" }
    };
    return styles[status] || styles.scheduled;
  };

  return (
    <div style={styles.container}>
      {/* Header Card */}
      <div style={styles.headerCard}>
        <div style={styles.headerLeft}>
          <div style={styles.iconBox}>
            <span style={styles.icon}>📦</span>
          </div>
          <div>
            <h1 style={styles.deliveryTitle}>Delivery #{delivery.id}</h1>
            <span style={getStatusBadgeStyle(delivery.status)}>
              {getStatusLabel(delivery.status)}
            </span>
          </div>
        </div>
        <div style={styles.actionButtons}>
          <Link
            to={`/delivery-management/deliveries/${id}/edit`}
            style={styles.editLink}
          >
            ✏️ Edit
          </Link>
          <button onClick={() => handleAction("start")} style={styles.startButton}>
            ▶️ Start
          </button>
          <button onClick={() => handleAction("complete")} style={styles.completeButton}>
            ✓ Complete
          </button>
          <button onClick={() => handleAction("cancel")} style={styles.cancelButton}>
            ✕ Cancel
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <div style={styles.infoLabel}>REFERENCE</div>
          <div style={styles.infoValue}>{delivery.reference || "-"}</div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoLabel}>STATUS</div>
          <div style={styles.infoValue}>{getStatusLabel(delivery.status)}</div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoLabel}>ASSIGNED TO</div>
          <div style={styles.infoValue}>
            {delivery.employee_details?.full_name || delivery.employee_details?.employee_id || "-"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab("products")}
          style={activeTab === "products" ? styles.activeTabBtn : styles.tabBtn}
        >
          Products
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.tabContentArea}>
        {activeTab === "products" && (
          <div>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIconBox}>
                <span>📦</span>
              </div>
              <h3 style={styles.sectionTitle}>Products</h3>
            </div>
            <DeliveryProducts deliveryId={id} />
          </div>
        )}
      </div>

      {/* Start Delivery Modal */}
      {showStartModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            {/* Modal Header */}
            <div style={modalHeaderStyle}>
              <button 
                onClick={() => setShowStartModal(false)}
                style={backButtonStyle}
              >
                ← Back to delivery
              </button>
            </div>

            {/* Delivery Title Card */}
            <div style={modalTitleCard}>
              <div style={modalIconBox}>
                <span style={{fontSize: "24px"}}>🚚</span>
              </div>
              <div>
                <h3 style={modalTitleStyle}>Start Delivery</h3>
                <p style={modalDeliveryNumber}>#{delivery.delivery_number}</p>
              </div>
            </div>

            {/* Delivery Info Card */}
            <div style={modalInfoCard}>
              <div style={modalInfoItem}>
                <div style={modalInfoLabel}>EMPLOYEE</div>
                <div style={modalInfoValue}>
                  {delivery.employee_details?.full_name || delivery.employee_details?.employee_id || "Not assigned"}
                </div>
              </div>
              <div style={modalInfoItem}>
                <div style={modalInfoLabel}>VEHICLE</div>
                <div style={modalInfoValue}>
                  {delivery.vehicle_details?.registration_number || "Not assigned"}
                </div>
              </div>
              <div style={modalInfoItem}>
                <div style={modalInfoLabel}>ROUTE</div>
                <div style={modalInfoValue}>
                  {delivery.route_details?.route_name || "Not assigned"}
                </div>
              </div>
            </div>

            {/* Starting Location Card */}
            <div style={locationCard}>
              <div style={locationHeaderStyle}>
                <span style={{fontSize: "18px", marginRight: "8px"}}>📍</span>
                <span style={{fontSize: "15px", fontWeight: "600", color: "#1e293b"}}>Starting Location</span>
              </div>

              <div style={locationFormStyle}>
                <div style={inputGroupStyle}>
                  <label style={inputLabelStyle}>Address</label>
                  <input
                    type="text"
                    placeholder="Enter starting address"
                    value={locationData.address}
                    onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                    style={inputStyle}
                  />
                </div>

                <div style={locationInputsStyle}>
                  <div style={{flex: 1}}>
                    <label style={inputLabelStyle}>Latitude</label>
                    <input
                      type="text"
                      placeholder="0.000000"
                      value={locationData.latitude}
                      onChange={(e) => setLocationData({...locationData, latitude: e.target.value})}
                      style={locationInputStyle}
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={inputLabelStyle}>Longitude</label>
                    <input
                      type="text"
                      placeholder="0.000000"
                      value={locationData.longitude}
                      onChange={(e) => setLocationData({...locationData, longitude: e.target.value})}
                      style={locationInputStyle}
                    />
                  </div>
                </div>

                <button 
                  onClick={getCurrentLocation}
                  style={locationButtonStyle}
                >
                  <span style={{marginRight: "8px"}}>📍</span>
                  Get Current Location
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={modalActionsStyle}>
              <button
                onClick={() => setShowStartModal(false)}
                style={cancelModalButtonStyle}
              >
                Cancel
              </button>
              <button
                onClick={handleStartDelivery}
                style={{
                  ...startDeliveryButtonStyle,
                  opacity: (!locationData.latitude || !locationData.longitude) ? 0.5 : 1,
                }}
                disabled={!locationData.latitude || !locationData.longitude}
              >
                <span style={{marginRight: "8px"}}>🚚</span>
                Start Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// New Modern Styles
const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  headerCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    backgroundColor: "#eff6ff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: "24px",
  },
  deliveryTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  editLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid #e5e7eb",
  },
  startButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  completeButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  cancelButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  infoCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: "0.5px",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
  },
  tabsContainer: {
    backgroundColor: "white",
    borderRadius: "12px 12px 0 0",
    padding: "0 24px",
    display: "flex",
    gap: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tabBtn: {
    padding: "16px 0",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "15px",
    fontWeight: "500",
    color: "#64748b",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s",
  },
  activeTabBtn: {
    padding: "16px 0",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "15px",
    fontWeight: "600",
    color: "#3b82f6",
    cursor: "pointer",
    borderBottom: "2px solid #3b82f6",
  },
  tabContentArea: {
    backgroundColor: "white",
    borderRadius: "0 0 12px 12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  sectionIconBox: {
    width: "36px",
    height: "36px",
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
  },
};

// Modal Styles (keeping existing)
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

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "24px",
  maxWidth: "520px",
  width: "90%",
  maxHeight: "85vh",
  overflowY: "auto",
};

const modalHeaderStyle = {
  marginBottom: "20px",
};

const backButtonStyle = {
  backgroundColor: "transparent",
  border: "none",
  fontSize: "14px",
  cursor: "pointer",
  color: "#64748b",
  padding: "0",
  display: "flex",
  alignItems: "center",
  fontWeight: "400",
};

const modalTitleCard = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const modalIconBox = {
  width: "48px",
  height: "48px",
  backgroundColor: "#e0f2fe",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalTitleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
  color: "#1e293b",
};

const modalDeliveryNumber = {
  fontSize: "13px",
  color: "#64748b",
  margin: "4px 0 0 0",
};

const modalInfoCard = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "16px",
  display: "flex",
  gap: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const modalInfoItem = {
  flex: 1,
};

const modalInfoLabel = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#64748b",
  marginBottom: "6px",
  letterSpacing: "0.5px",
};

const modalInfoValue = {
  fontSize: "14px",
  color: "#1e293b",
  fontWeight: "500",
};

const locationCard = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const locationHeaderStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "20px",
  paddingBottom: "12px",
  borderBottom: "1px solid #e2e8f0",
};

const locationFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const inputLabelStyle = {
  fontSize: "12px",
  fontWeight: "500",
  color: "#475569",
  marginBottom: "6px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const locationInputsStyle = {
  display: "flex",
  gap: "12px",
};

const locationInputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const locationButtonStyle = {
  backgroundColor: "white",
  color: "#ef4444",
  padding: "10px 16px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalActionsStyle = {
  display: "flex",
  gap: "12px",
  justifyContent: "flex-end",
};

const startDeliveryButtonStyle = {
  backgroundColor: "#10b981",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
};

const cancelModalButtonStyle = {
  backgroundColor: "transparent",
  color: "#64748b",
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
};
