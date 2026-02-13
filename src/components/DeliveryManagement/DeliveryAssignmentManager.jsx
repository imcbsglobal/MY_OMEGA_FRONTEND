import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";

const STATUS_COLORS = {
  scheduled: { bg: "#dbeafe", color: "#1e40af", label: "Scheduled" },
  in_progress: { bg: "#fef3c7", color: "#d97706", label: "In Progress" },
  completed: { bg: "#d1fae5", color: "#059669", label: "Completed" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "Cancelled" }
};

export default function DeliveryAssignmentManager() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    address: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get("/delivery-management/deliveries/");
      setDeliveries(response.data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      alert("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const handleManageClick = (delivery) => {
    setSelectedDelivery(delivery);
    setShowManageModal(true);
    // Get current location if delivery is not started yet
    if (delivery.status === "scheduled") {
      getCurrentLocation();
    }
  };

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
    if (!selectedDelivery) return;

    try {
      const payload = {
        start_location: locationData.address,
        start_latitude: locationData.latitude ? parseFloat(locationData.latitude) : null,
        start_longitude: locationData.longitude ? parseFloat(locationData.longitude) : null
      };

      await api.post(`/delivery-management/deliveries/${selectedDelivery.id}/start/`, payload);
      
      alert("Delivery started successfully!");
      setShowManageModal(false);
      setSelectedDelivery(null);
      fetchDeliveries(); // Refresh list
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

  const handleCompleteDelivery = async () => {
    if (!selectedDelivery) return;

    try {
      await api.post(`/delivery-management/deliveries/${selectedDelivery.id}/complete/`);
      
      alert("Delivery completed successfully!");
      setShowManageModal(false);
      setSelectedDelivery(null);
      fetchDeliveries(); // Refresh list
    } catch (error) {
      console.error("Error completing delivery:", error);
      alert("Failed to complete delivery");
    }
  };

  const handleCancelDelivery = async () => {
    if (!selectedDelivery) return;
    
    if (!confirm("Are you sure you want to cancel this delivery?")) return;

    try {
      await api.post(`/delivery-management/deliveries/${selectedDelivery.id}/cancel/`);
      
      alert("Delivery cancelled successfully!");
      setShowManageModal(false);
      setSelectedDelivery(null);
      fetchDeliveries(); // Refresh list
    } catch (error) {
      console.error("Error cancelling delivery:", error);
      alert("Failed to cancel delivery");
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading deliveries...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Delivery Assignment Manager</h2>
        <Link to="/delivery-management/deliveries/create" style={styles.createBtn}>
          Create New Delivery
        </Link>
      </div>

      <div style={styles.grid}>
        {deliveries.map((delivery) => (
          <div key={delivery.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.deliveryNumber}>#{delivery.delivery_number}</h3>
              <div 
                style={{
                  ...styles.statusBadge,
                  ...STATUS_COLORS[delivery.status]
                }}
              >
                {STATUS_COLORS[delivery.status]?.label || delivery.status}
              </div>
            </div>

            <div style={styles.cardContent}>
              <div style={styles.infoRow}>
                <strong>Employee:</strong> {delivery.employee_details?.full_name || 
                  delivery.employee_details?.employee_id || "Not assigned"}
              </div>
              <div style={styles.infoRow}>
                <strong>Vehicle:</strong> {delivery.vehicle_details?.registration_number || "Not assigned"}
              </div>
              <div style={styles.infoRow}>
                <strong>Route:</strong> {delivery.route_details?.route_name || "Not assigned"}
              </div>
              <div style={styles.infoRow}>
                <strong>Scheduled:</strong> {delivery.scheduled_date} at {delivery.scheduled_time}
              </div>
              <div style={styles.infoRow}>
                <strong>Total Amount:</strong> ₹{parseFloat(delivery.total_amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </div>
            </div>

            <div style={styles.cardActions}>
              <Link 
                to={`/delivery-management/deliveries/${delivery.id}`}
                style={styles.viewBtn}
              >
                View Details
              </Link>
              <button
                onClick={() => handleManageClick(delivery)}
                style={styles.manageBtn}
                disabled={delivery.status === 'cancelled'}
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {deliveries.length === 0 && (
        <div style={styles.emptyState}>
          <p>No deliveries found. <Link to="/delivery-management/deliveries/create">Create your first delivery</Link></p>
        </div>
      )}

      {/* Management Modal */}
      {showManageModal && selectedDelivery && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Manage Delivery #{selectedDelivery.delivery_number}</h3>
              <button 
                onClick={() => setShowManageModal(false)}
                style={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.deliveryInfo}>
                <p><strong>Status:</strong> {STATUS_COLORS[selectedDelivery.status]?.label}</p>
                <p><strong>Employee:</strong> {selectedDelivery.employee_details?.full_name || 
                  selectedDelivery.employee_details?.employee_id || "Not assigned"}</p>
                <p><strong>Vehicle:</strong> {selectedDelivery.vehicle_details?.registration_number || "Not assigned"}</p>
              </div>

              {selectedDelivery.status === "scheduled" && (
                <div style={styles.locationSection}>
                  <h4>Start Location</h4>
                  <div style={styles.inputGroup}>
                    <input
                      type="text"
                      placeholder="Address"
                      value={locationData.address}
                      onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.locationInputs}>
                    <input
                      type="text"
                      placeholder="Latitude"
                      value={locationData.latitude}
                      onChange={(e) => setLocationData({...locationData, latitude: e.target.value})}
                      style={styles.locationInput}
                    />
                    <input
                      type="text"
                      placeholder="Longitude"
                      value={locationData.longitude}
                      onChange={(e) => setLocationData({...locationData, longitude: e.target.value})}
                      style={styles.locationInput}
                    />
                  </div>
                  <button 
                    onClick={getCurrentLocation}
                    style={styles.locationBtn}
                  >
                    Get Current Location
                  </button>
                </div>
              )}

              <div style={styles.modalActions}>
                {selectedDelivery.status === "scheduled" && (
                  <button
                    onClick={handleStartDelivery}
                    style={styles.startBtn}
                    disabled={!locationData.latitude || !locationData.longitude}
                  >
                    Start Delivery
                  </button>
                )}
                
                {selectedDelivery.status === "in_progress" && (
                  <button
                    onClick={handleCompleteDelivery}
                    style={styles.completeBtn}
                  >
                    Complete Delivery
                  </button>
                )}

                {selectedDelivery.status !== "completed" && selectedDelivery.status !== "cancelled" && (
                  <button
                    onClick={handleCancelDelivery}
                    style={styles.cancelBtn}
                  >
                    Cancel Delivery
                  </button>
                )}

                <Link 
                  to={`/employee-delivery-view/${selectedDelivery.id}`}
                  style={styles.employeeViewBtn}
                >
                  Employee View
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: 0,
  },
  createBtn: {
    backgroundColor: "#059669",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  loading: {
    textAlign: "center",
    padding: "48px",
    fontSize: "18px",
    color: "#64748b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  deliveryNumber: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: 0,
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardContent: {
    marginBottom: "16px",
  },
  infoRow: {
    marginBottom: "8px",
    fontSize: "14px",
    color: "#475569",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
  },
  viewBtn: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    padding: "8px 16px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
  manageBtn: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px",
    color: "#64748b",
  },
  modalOverlay: {
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
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "12px",
  },
  closeBtn: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#64748b",
  },
  modalContent: {
    marginBottom: "20px",
  },
  deliveryInfo: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  locationSection: {
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
  },
  locationInputs: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  },
  locationInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
  },
  locationBtn: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  modalActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  startBtn: {
    backgroundColor: "#059669",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  completeBtn: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  cancelBtn: {
    backgroundColor: "#6b7280",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  employeeViewBtn: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "10px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "500",
  },
};