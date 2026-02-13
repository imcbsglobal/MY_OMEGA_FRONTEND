/**
 * EmployeeDeliveryView.jsx
 * 
 * Shows the employee's assigned deliveries with filtering and search capabilities
 * Provides detailed view and delivery management workflow
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import DeliveryProducts from "./DeliveryProducts";

// Status configuration
const STATUS_META = {
  scheduled:   { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6", label: "Scheduled", icon: "📅" },
  in_progress: { bg: "#fef9c3", color: "#a16207", dot: "#f59e0b", label: "In Progress", icon: "🚚" },
  completed:   { bg: "#dcfce7", color: "#15803d", dot: "#10b981", label: "Completed", icon: "✅" },
  cancelled:   { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444", label: "Cancelled", icon: "❌" },
};

const STOP_STATUS = {
  pending:   { bg: "#f1f5f9", color: "#64748b", label: "Pending" },
  delivered: { bg: "#dcfce7", color: "#15803d", label: "Delivered" },
  partial:   { bg: "#fef9c3", color: "#a16207", label: "Partial" },
  failed:    { bg: "#fee2e2", color: "#b91c1c", label: "Failed" },
  skipped:   { bg: "#f3f4f6", color: "#6b7280", label: "Skipped" },
};

// Utility function
const fmt = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function EmployeeDeliveryView() {
  const navigate = useNavigate();
  
  // Main state
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list, detail, all_stops, stop_detail, summary 
  const [activeTab, setActiveTab] = useState("products");
  
  // Current stop management
  const [currentStop, setCurrentStop] = useState(null);
  const [stopForm, setStopForm] = useState({
    delivered_boxes: "",
    collected_amount: "",
    status: "delivered",
    notes: "",
  });
  const [deliverySummary, setDeliverySummary] = useState(null);
  
  // Start delivery modal state
  const [showStartModal, setShowStartModal] = useState(false);
  const [locationData, setLocationData] = useState({
    address: "",
    latitude: "",
    longitude: "",
  });
  
  // Filtering and search state
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  useEffect(() => {
    fetchMyDeliveries();
  }, [filter]);

  // API Functions
  const fetchMyDeliveries = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      console.log(`Fetching deliveries from: delivery-management/deliveries/${params}`);
      const res = await api.get(`delivery-management/deliveries/${params}`);
      console.log("Deliveries response:", res.data);
      
      // Handle paginated response: extract results array or use data directly
      const deliveriesData = res.data?.results || res.data || [];
      setDeliveries(deliveriesData);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
      console.error("Error details:", err.response?.data);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const selectDelivery = async (delivery) => {
    setLoading(true);
    try {
      console.log(`Fetching delivery details for ID: ${delivery.id}`);
      const res = await api.get(`delivery-management/deliveries/${delivery.id}/`);
      console.log("Delivery details response:", res.data);
      setSelectedDelivery(res.data);
      setView("detail"); // Show detailed view first
    } catch (err) {
      console.error("Failed to load delivery details:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to load delivery details: " + (err.response?.data?.error || err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // NEW: Load next pending stop
  const loadNextStop = async (deliveryId) => {
    try {
      const res = await api.get(`delivery-management/deliveries/${deliveryId}/next-stop/`);
      if (res.data && res.data.id) {
        setCurrentStop(res.data);
        setStopForm({
          delivered_boxes: res.data.planned_boxes || "",
          collected_amount: res.data.planned_amount || "",
          status: "delivered",
          notes: "",
        });
        setView("stop_detail");
      } else {
        // No more stops - show summary
        alert(res.data.message || "No pending stops remaining");
        setView("summary");
      }
    } catch (err) {
      console.error("Failed to load next stop:", err);
      setView("all_stops");
    }
  };

  const startDelivery = async (deliveryId) => {
    console.log("🚀 Starting delivery process for ID:", deliveryId);
    console.log("📦 Selected delivery:", selectedDelivery);
    console.log("📍 Show start modal:", showStartModal);
    
    setShowStartModal(true);
    getCurrentLocation(); // Auto-get location when opening modal
    
    console.log("✅ Modal should now be visible");
  };

  const getCurrentLocation = () => {
    console.log("Getting current location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location obtained:", position.coords);
          // Round to 6 decimal places to match backend requirements (max_digits=9, decimal_places=6)
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          setLocationData({
            latitude: lat.toString(),
            longitude: lng.toString(),
            address: "Current Location"
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Failed to get current location. Please enter manually.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleStartDelivery = async () => {
    if (!selectedDelivery) return;

    // Validate location data
    if (!locationData.address && !locationData.latitude) {
      alert("Please get your current location or enter address manually");
      return;
    }

    setLoading(true);
    try {
      // Round coordinates to 6 decimal places to match backend validation
      const roundedLat = locationData.latitude ? parseFloat(parseFloat(locationData.latitude).toFixed(6)) : null;
      const roundedLng = locationData.longitude ? parseFloat(parseFloat(locationData.longitude).toFixed(6)) : null;
      
      const payload = {
        start_location: locationData.address || "Current Location",
        start_latitude: roundedLat,
        start_longitude: roundedLng
      };

      console.log("Starting/updating delivery with payload:", payload);
      
      // Use the start endpoint - backend now handles both scheduled and in_progress
      const response = await api.post(`delivery-management/deliveries/${selectedDelivery.id}/start/`, payload);
      
      alert(response.data.message || "✅ Delivery updated successfully!");
      
      setShowStartModal(false);
      fetchMyDeliveries(); // Refresh list
      
      // Refresh selected delivery
      const res = await api.get(`delivery-management/deliveries/${selectedDelivery.id}/`);
      setSelectedDelivery(res.data);
    } catch (error) {
      console.error("Error starting delivery:", error);
      let errorMessage = "Failed to start delivery";
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Complete current stop with new API response
  const completeCurrentStop = async () => {
    if (!currentStop || !selectedDelivery) return;

    if (!stopForm.delivered_boxes || !stopForm.collected_amount) {
      alert("Please enter delivered boxes and collected amount");
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch(`delivery-management/delivery-stops/${currentStop.id}/`, {
        delivered_boxes: parseFloat(stopForm.delivered_boxes),
        collected_amount: parseFloat(stopForm.collected_amount),
        status: stopForm.status,
        notes: stopForm.notes,
        // Add GPS if available
        latitude: null, // You can add geolocation here
        longitude: null,
      });

      // NEW: Response includes delivery summary
      if (res.data.delivery_summary) {
        setDeliverySummary(res.data.delivery_summary);
      }

      alert(`✅ Stop completed!\n\nRunning Totals:\nDelivered: ${res.data.delivery_summary?.total_delivered_boxes || 0}\nBalance: ${res.data.delivery_summary?.total_balance_boxes || 0}\nCollected: ₹${res.data.delivery_summary?.collected_amount || 0}\nPending: ₹${res.data.delivery_summary?.total_pending_amount || 0}`);

      // Load next stop
      loadNextStop(selectedDelivery.id);
    } catch (err) {
      alert("Failed to update stop: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const completeDelivery = async () => {
    if (!selectedDelivery) return;

    // Enhanced completion with location capture
    const confirmComplete = confirm("Complete this delivery? This will finalize all stops and delivery data.");
    if (!confirmComplete) return;

    const odometer = prompt("Enter ending odometer reading (km):");
    if (!odometer) return;

    const fuel = prompt("Enter ending fuel level (liters) - optional:");

    setLoading(true);
    try {
      // Get completion location
      let completionLocation = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          completionLocation = {
            completion_latitude: position.coords.latitude,
            completion_longitude: position.coords.longitude,
            completion_location: "Delivery completion location"
          };
        } catch (err) {
          console.log("Could not get completion location:", err);
        }
      }

      // Get product quantities
      const products = selectedDelivery.products.map(p => ({
        product_id: p.product,
        delivered_quantity: p.delivered_quantity || 0,
      }));

      await api.post(`delivery-management/deliveries/${selectedDelivery.id}/complete/`, {
        odometer_reading: parseFloat(odometer),
        fuel_level: fuel ? parseFloat(fuel) : null,
        notes: "Delivery completed via mobile interface",
        products: products,
        ...completionLocation
      });

      alert("🎉 Delivery completed successfully!");
      
      // Refresh delivery data and show summary
      const res = await api.get(`delivery-management/deliveries/${selectedDelivery.id}/`);
      setSelectedDelivery(res.data);
      setView("summary");
      fetchMyDeliveries(); // Refresh main list too
      
    } catch (err) {
      alert("Failed to complete delivery: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Filter deliveries based on search
  const filteredDeliveries = deliveries.filter(d =>
    !search ||
    d.delivery_number?.toLowerCase().includes(search.toLowerCase()) ||
    d.route_name?.toLowerCase().includes(search.toLowerCase())      ||
    d.vehicle_number?.toLowerCase().includes(search.toLowerCase())  ||
    d.customer_names?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper functions for detailed view
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

  // ========== RENDER ==========

  if (loading && !deliveries.length && !selectedDelivery) {
    return <div style={styles.loading}>Loading...</div>;
  }

  // LIST VIEW
  if (view === "list") {
    return (
      <div style={styles.container}>
        <style>{FONTS}</style>
        
        <div style={styles.header}>
          <h1 style={styles.title}>📦 My Deliveries</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => fetchMyDeliveries()} 
              style={styles.refreshBtn}
            >
              🔄 Refresh
            </button>
            {/* Quick Start button - works on first scheduled delivery */}
            {filteredDeliveries.find(d => d.status === "scheduled") && (
              <button 
                onClick={() => {
                  const scheduledDelivery = filteredDeliveries.find(d => d.status === "scheduled");
                  if (scheduledDelivery) {
                    setSelectedDelivery(scheduledDelivery);
                    startDelivery(scheduledDelivery.id);
                  }
                }}
                style={styles.quickStartBtn}
              >
                🚀 Quick Start
              </button>
            )}
          </div>
        </div>

        {/* Filter + Search Controls */}
        <div style={styles.filterSection}>
          <input
            placeholder="Search by delivery #, route, vehicle, customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.filterButtons}>
            {["all", "scheduled", "in_progress", "completed", "cancelled"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  ...styles.filterBtn,
                  background: filter === s ? "#0f172a" : "#fff",
                  color:      filter === s ? "#fff"    : "#475569",
                  border:     filter === s ? "none"    : "1px solid #e2e8f0",
                }}
              >
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div style={styles.emptyState}>
            <p>{search ? "No deliveries match your search" : "No deliveries assigned"}</p>
          </div>
        ) : (
          <div style={styles.deliveryList}>
            {filteredDeliveries.map((delivery) => {
              const meta = STATUS_META[delivery.status] || STATUS_META.scheduled;
              return (
                <div key={delivery.id} style={styles.deliveryCard} onClick={() => selectDelivery(delivery)}>
                  <div style={styles.deliveryHeader}>
                    <div>
                      <h3 style={styles.deliveryNumber}>{delivery.delivery_number}</h3>
                      <p style={styles.deliveryRoute}>{delivery.route_name}</p>
                    </div>
                    <div style={{ ...styles.statusBadge, background: meta.bg, color: meta.color }}>
                      {meta.icon} {meta.label}
                    </div>
                  </div>

                  <div style={styles.deliveryInfo}>
                    <div style={styles.infoRow}>
                      <span>📅 {delivery.scheduled_date} at {delivery.scheduled_time}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span>🚗 {delivery.vehicle_number}</span>
                    </div>
                  </div>

                  <div style={styles.deliveryMetrics}>
                    <div style={styles.metric}>
                      <div style={styles.metricValue}>{fmt(delivery.total_loaded_boxes)}</div>
                      <div style={styles.metricLabel}>Loaded Boxes</div>
                    </div>
                    <div style={styles.metric}>
                      <div style={styles.metricValue}>{fmt(delivery.total_delivered_boxes)}</div>
                      <div style={styles.metricLabel}>Delivered</div>
                    </div>
                    <div style={styles.metric}>
                      <div style={{ ...styles.metricValue, color: "#dc2626" }}>{fmt(delivery.total_balance_boxes)}</div>
                      <div style={styles.metricLabel}>Balance</div>
                    </div>
                  </div>

                  <div style={styles.deliveryMetrics}>
                    <div style={styles.metric}>
                      <div style={{ ...styles.metricValue, color: "#15803d" }}>₹{fmt(delivery.collected_amount)}</div>
                      <div style={styles.metricLabel}>Collected</div>
                    </div>
                    <div style={styles.metric}>
                      <div style={{ ...styles.metricValue, color: "#dc2626" }}>₹{fmt(delivery.total_pending_amount)}</div>
                      <div style={styles.metricLabel}>Pending Cash</div>
                    </div>
                  </div>

                  {delivery.status === "scheduled" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDelivery(delivery); // Set selected delivery for modal
                        startDelivery(delivery.id);
                      }}
                      style={styles.startBtn}
                    >
                      🚀 Start Delivery
                    </button>
                  )}

                  {delivery.status === "in_progress" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectDelivery(delivery);
                      }}
                      style={styles.continueBtn}
                    >
                      ▶️ Continue Delivery
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Start Delivery Modal */}
        {showStartModal && selectedDelivery && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
              {/* Modal Header */}
              <div style={modalStyles.header}>
                <button 
                  onClick={() => setShowStartModal(false)}
                  style={modalStyles.backButton}
                >
                  ← Back to delivery
                </button>
              </div>

              {/* Delivery Title Card */}
              <div style={modalStyles.titleCard}>
                <div style={modalStyles.iconBox}>
                  <span style={{fontSize: "24px"}}>🚚</span>
                </div>
                <div>
                  <h3 style={modalStyles.title}>Start Delivery</h3>
                  <p style={modalStyles.deliveryNumber}>#{selectedDelivery.delivery_number}</p>
                </div>
              </div>

              {/* Delivery Info Card */}
              <div style={modalStyles.infoCard}>
                <div style={modalStyles.infoItem}>
                  <div style={modalStyles.infoLabel}>EMPLOYEE</div>
                  <div style={modalStyles.infoValue}>
                    {selectedDelivery.employee_details?.full_name || 
                     selectedDelivery.employee_details?.employee_id || 
                     selectedDelivery.employee_name || "Not assigned"}
                  </div>
                </div>
                <div style={modalStyles.infoItem}>
                  <div style={modalStyles.infoLabel}>VEHICLE</div>
                  <div style={modalStyles.infoValue}>
                    {selectedDelivery.vehicle_details?.registration_number || 
                     selectedDelivery.vehicle_number || "Not assigned"}
                  </div>
                </div>
                <div style={modalStyles.infoItem}>
                  <div style={modalStyles.infoLabel}>ROUTE</div>
                  <div style={modalStyles.infoValue}>
                    {selectedDelivery.route_details?.route_name || 
                     selectedDelivery.route_name || "Not assigned"}
                  </div>
                </div>
              </div>

              {/* Starting Location Card */}
              <div style={modalStyles.locationCard}>
                <div style={modalStyles.locationHeader}>
                  <span style={{fontSize: "18px", marginRight: "8px"}}>📍</span>
                  <span style={{fontSize: "15px", fontWeight: "600", color: "#1e293b"}}>Starting Location</span>
                </div>

                <div style={modalStyles.locationForm}>
                  <div style={modalStyles.inputGroup}>
                    <label style={modalStyles.inputLabel}>Address</label>
                    <input
                      type="text"
                      placeholder="Enter starting address"
                      value={locationData.address}
                      onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                      style={modalStyles.input}
                    />
                  </div>

                  <div style={modalStyles.locationInputs}>
                    <div style={{flex: 1}}>
                      <label style={modalStyles.inputLabel}>Latitude</label>
                      <input
                        type="text"
                        placeholder="0.0"
                        value={locationData.latitude}
                        onChange={(e) => setLocationData({...locationData, latitude: e.target.value})}
                        style={modalStyles.input}
                      />
                    </div>
                    <div style={{flex: 1, marginLeft: 12}}>
                      <label style={modalStyles.inputLabel}>Longitude</label>
                      <input
                        type="text"
                        placeholder="0.0"
                        value={locationData.longitude}
                        onChange={(e) => setLocationData({...locationData, longitude: e.target.value})}
                        style={modalStyles.input}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={getCurrentLocation}
                    style={modalStyles.locationButton}
                  >
                    📍 Get Current Location
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={modalStyles.actionButtons}>
                <button 
                  onClick={() => setShowStartModal(false)}
                  style={modalStyles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartDelivery}
                  disabled={loading}
                  style={modalStyles.startButton}
                >
                  🚚 {loading ? "Starting..." : "Start Delivery"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DETAILED VIEW (matches DeliveryDetail component)
  if (view === "detail" && selectedDelivery) {
    return (
      <div style={styles.container}>
        <style>{FONTS}</style>
        
        {/* Header Card */}
        <div style={detailStyles.headerCard}>
          <div style={detailStyles.headerLeft}>
            <div style={detailStyles.iconBox}>
              <span style={detailStyles.icon}>📦</span>
            </div>
            <div>
              <h1 style={detailStyles.deliveryTitle}>Delivery #{selectedDelivery.id}</h1>
              <span style={getStatusBadgeStyle(selectedDelivery.status)}>
                {getStatusLabel(selectedDelivery.status)}
              </span>
            </div>
          </div>
          <div style={detailStyles.actionButtons}>
            <button 
              onClick={() => setView("list")}
              style={detailStyles.backButton}
            >
              ← Back to List
            </button>
            {selectedDelivery.status === "scheduled" && (
              <button 
                onClick={() => startDelivery(selectedDelivery.id)} 
                style={detailStyles.startButton}
              >
                ▶️ Start
              </button>
            )}
            {selectedDelivery.status === "in_progress" && (
              <button 
                onClick={() => {
                  if (selectedDelivery.status === "in_progress") {
                    loadNextStop(selectedDelivery.id);
                  } else {
                    setView("all_stops");
                  }
                }}
                style={detailStyles.continueButton}
              >
                🚚 Continue Delivery
              </button>
            )}
            {selectedDelivery.status === "in_progress" && (
              <button 
                onClick={() => startDelivery(selectedDelivery.id)} 
                style={detailStyles.startButton}
              >
                🚀 Start
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div style={detailStyles.infoGrid}>
          <div style={detailStyles.infoCard}>
            <div style={detailStyles.infoLabel}>DELIVERY NUMBER</div>
            <div style={detailStyles.infoValue}>{selectedDelivery.delivery_number || "-"}</div>
          </div>
          <div style={detailStyles.infoCard}>
            <div style={detailStyles.infoLabel}>STATUS</div>
            <div style={detailStyles.infoValue}>{getStatusLabel(selectedDelivery.status)}</div>
          </div>
          <div style={detailStyles.infoCard}>
            <div style={detailStyles.infoLabel}>ASSIGNED TO</div>
            <div style={detailStyles.infoValue}>
              {selectedDelivery.employee_details?.full_name || 
               selectedDelivery.employee_name || "-"}
            </div>
          </div>
          <div style={detailStyles.infoCard}>
            <div style={detailStyles.infoLabel}>VEHICLE</div>
            <div style={detailStyles.infoValue}>
              {selectedDelivery.vehicle_details?.registration_number || 
               selectedDelivery.vehicle_number || "-"}
            </div>
          </div>
          <div style={detailStyles.infoCard}>
            <div style={detailStyles.infoLabel}>ROUTE</div>
            <div style={detailStyles.infoValue}>
              {selectedDelivery.route_details?.route_name || 
               selectedDelivery.route_name || "-"}
            </div>
          </div>
          <div style={detailStyles.infoCard}>
            <div style={detailStyles.infoLabel}>SCHEDULED</div>
            <div style={detailStyles.infoValue}>
              {selectedDelivery.scheduled_date} {selectedDelivery.scheduled_time}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={detailStyles.tabsContainer}>
          <button
            onClick={() => setActiveTab("products")}
            style={activeTab === "products" ? detailStyles.activeTabBtn : detailStyles.tabBtn}
          >
            Products
          </button>
        </div>

        {/* Tab Content */}
        <div style={detailStyles.tabContentArea}>
          {activeTab === "products" && (
            <div>
              <div style={detailStyles.sectionHeader}>
                <div style={detailStyles.sectionIconBox}>
                  <span>📦</span>
                </div>
                <h3 style={detailStyles.sectionTitle}>Products</h3>
              </div>
              <DeliveryProducts deliveryId={selectedDelivery.id} />
            </div>
          )}
        </div>

        {/* Start Delivery Modal */}
        {showStartModal && selectedDelivery && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
              {/* Modal Header */}
              <div style={modalStyles.header}>
                <button 
                  onClick={() => setShowStartModal(false)}
                  style={modalStyles.backButton}
                >
                  ← Back to delivery
                </button>
              </div>

              {/* Delivery Title Card */}
              <div style={modalStyles.titleCard}>
                <div style={modalStyles.iconBox}>
                  <span style={{fontSize: "24px"}}>🚚</span>
                </div>
                <div>
                  <h3 style={modalStyles.title}>Start Delivery</h3>
                  <p style={modalStyles.deliveryNumber}>#{selectedDelivery.delivery_number}</p>
                </div>
              </div>

              {/* Delivery Info Card */}
              <div style={modalStyles.infoCard}>
                <div style={modalStyles.infoItem}>
                  <div style={modalStyles.infoLabel}>EMPLOYEE</div>
                  <div style={modalStyles.infoValue}>
                    {selectedDelivery.employee_details?.full_name || 
                     selectedDelivery.employee_details?.employee_id || 
                     selectedDelivery.employee_name || "Not assigned"}
                  </div>
                </div>
                <div style={modalStyles.infoItem}>
                  <div style={modalStyles.infoLabel}>VEHICLE</div>
                  <div style={modalStyles.infoValue}>
                    {selectedDelivery.vehicle_details?.registration_number || 
                     selectedDelivery.vehicle_number || "Not assigned"}
                  </div>
                </div>
                <div style={modalStyles.infoItem}>
                  <div style={modalStyles.infoLabel}>ROUTE</div>
                  <div style={modalStyles.infoValue}>
                    {selectedDelivery.route_details?.route_name || 
                     selectedDelivery.route_name || "Not assigned"}
                  </div>
                </div>
              </div>

              {/* Starting Location Card */}
              <div style={modalStyles.locationCard}>
                <div style={modalStyles.locationHeader}>
                  <span style={{fontSize: "18px", marginRight: "8px"}}>📍</span>
                  <span style={{fontSize: "15px", fontWeight: "600", color: "#1e293b"}}>Starting Location</span>
                </div>

                <div style={modalStyles.locationForm}>
                  <div style={modalStyles.inputGroup}>
                    <label style={modalStyles.inputLabel}>Address</label>
                    <input
                      type="text"
                      placeholder="Enter starting address"
                      value={locationData.address}
                      onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                      style={modalStyles.input}
                    />
                  </div>

                  <div style={modalStyles.locationInputs}>
                    <div style={{flex: 1}}>
                      <label style={modalStyles.inputLabel}>Latitude</label>
                      <input
                        type="text"
                        placeholder="0.0"
                        value={locationData.latitude}
                        onChange={(e) => setLocationData({...locationData, latitude: e.target.value})}
                        style={modalStyles.input}
                      />
                    </div>
                    <div style={{flex: 1, marginLeft: 12}}>
                      <label style={modalStyles.inputLabel}>Longitude</label>
                      <input
                        type="text"
                        placeholder="0.0"
                        value={locationData.longitude}
                        onChange={(e) => setLocationData({...locationData, longitude: e.target.value})}
                        style={modalStyles.input}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={getCurrentLocation}
                    style={modalStyles.locationButton}
                  >
                    📍 Get Current Location
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={modalStyles.actionButtons}>
                <button 
                  onClick={() => setShowStartModal(false)}
                  style={modalStyles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartDelivery}
                  disabled={loading}
                  style={modalStyles.startButton}
                >
                  🚚 {loading ? "Starting..." : "Start Delivery"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STOP DETAIL VIEW (Current Stop)
  if (view === "stop_detail" && currentStop) {
    const stopMeta = STOP_STATUS[currentStop.status] || STOP_STATUS.pending;
    
    return (
      <div style={styles.container}>
        <style>{FONTS}</style>

        <div style={styles.header}>
          <button onClick={() => setView("all_stops")} style={styles.backBtn}>← Back</button>
          <h1 style={styles.title}>Stop #{currentStop.stop_sequence}</h1>
        </div>

        {/* Delivery Summary Banner */}
        {deliverySummary && (
          <div style={styles.summaryBanner}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#64748b" }}>
              📊 Current Delivery Status
            </h3>
            <div style={styles.summaryGrid}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(deliverySummary.total_delivered_boxes)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Delivered</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>{fmt(deliverySummary.total_balance_boxes)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Balance</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#15803d" }}>₹{fmt(deliverySummary.collected_amount)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Collected</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>₹{fmt(deliverySummary.total_pending_amount)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Pending</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.stopHeader}>
            <h2 style={styles.customerName}>🏪 {currentStop.customer_name}</h2>
            <div style={{ ...styles.statusBadge, background: stopMeta.bg, color: stopMeta.color }}>
              {stopMeta.label}
            </div>
          </div>

          <div style={styles.customerInfo}>
            <p>📍 {currentStop.customer_address}</p>
            {currentStop.customer_phone && <p>📞 {currentStop.customer_phone}</p>}
          </div>

          <div style={styles.plannedInfo}>
            <div style={styles.plannedItem}>
              <span style={styles.plannedLabel}>Planned Boxes:</span>
              <span style={styles.plannedValue}>{fmt(currentStop.planned_boxes)}</span>
            </div>
            <div style={styles.plannedItem}>
              <span style={styles.plannedLabel}>Planned Amount:</span>
              <span style={styles.plannedValue}>₹{fmt(currentStop.planned_amount)}</span>
            </div>
          </div>

          <div style={styles.formSection}>
            <h3 style={styles.formTitle}>Update Delivery</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Boxes Delivered *</label>
              <input
                type="number"
                step="0.01"
                value={stopForm.delivered_boxes}
                onChange={(e) => setStopForm({ ...stopForm, delivered_boxes: e.target.value })}
                style={styles.input}
                placeholder="Enter quantity"
              />
              <div style={styles.hint}>
                Balance: {fmt((currentStop.planned_boxes || 0) - (stopForm.delivered_boxes || 0))} boxes
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Cash Collected *</label>
              <input
                type="number"
                step="0.01"
                value={stopForm.collected_amount}
                onChange={(e) => setStopForm({ ...stopForm, collected_amount: e.target.value })}
                style={styles.input}
                placeholder="Enter amount"
              />
              <div style={styles.hint}>
                Pending: ₹{fmt((currentStop.planned_amount || 0) - (stopForm.collected_amount || 0))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status *</label>
              <select
                value={stopForm.status}
                onChange={(e) => setStopForm({ ...stopForm, status: e.target.value })}
                style={styles.input}
              >
                <option value="delivered">Delivered</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes (Optional)</label>
              <textarea
                value={stopForm.notes}
                onChange={(e) => setStopForm({ ...stopForm, notes: e.target.value })}
                style={{ ...styles.input, minHeight: 80 }}
                placeholder="Add any notes about this delivery..."
              />
            </div>

            <button
              onClick={completeCurrentStop}
              disabled={loading}
              style={styles.primaryBtn}
            >
              {loading ? "Saving..." : "✅ Complete Stop & Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ALL STOPS VIEW
  if (view === "all_stops" && selectedDelivery) {
    return (
      <div style={styles.container}>
        <style>{FONTS}</style>

        <div style={styles.header}>
          <button onClick={() => { setView("list"); setSelectedDelivery(null); }} style={styles.backBtn}>
            ← Back to List
          </button>
          <h1 style={styles.title}>{selectedDelivery.delivery_number}</h1>
        </div>

        <div style={styles.deliverySummaryCard}>
          <h3>Delivery Progress</h3>
          <div style={styles.summaryGrid}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(selectedDelivery.total_loaded_boxes)}</div>
              <div style={styles.metricLabel}>Loaded</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#15803d" }}>{fmt(selectedDelivery.total_delivered_boxes)}</div>
              <div style={styles.metricLabel}>Delivered</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>{fmt(selectedDelivery.total_balance_boxes)}</div>
              <div style={styles.metricLabel}>Balance</div>
            </div>
          </div>
          <div style={{ ...styles.summaryGrid, marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#15803d" }}>₹{fmt(selectedDelivery.collected_amount)}</div>
              <div style={styles.metricLabel}>Collected</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>₹{fmt(selectedDelivery.total_pending_amount)}</div>
              <div style={styles.metricLabel}>Pending Cash</div>
            </div>
          </div>
        </div>

        <div style={styles.stopsSection}>
          <h3 style={styles.sectionTitle}>Delivery Stops</h3>
          {selectedDelivery.stops?.map((stop) => {
            const meta = STOP_STATUS[stop.status] || STOP_STATUS.pending;
            return (
              <div key={stop.id} style={styles.stopCard}>
                <div style={styles.stopCardHeader}>
                  <div>
                    <div style={styles.stopSequence}>Stop #{stop.stop_sequence}</div>
                    <div style={styles.stopCustomer}>{stop.customer_name}</div>
                  </div>
                  <div style={{ ...styles.statusBadge, background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </div>
                </div>

                <div style={styles.stopMetrics}>
                  <div>
                    <span style={styles.stopMetricLabel}>Boxes:</span>
                    <span style={styles.stopMetricValue}>
                      {fmt(stop.delivered_boxes)} / {fmt(stop.planned_boxes)}
                      {stop.balance_boxes > 0 && (
                        <span style={{ color: "#dc2626", marginLeft: 8 }}>
                          (Bal: {fmt(stop.balance_boxes)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span style={styles.stopMetricLabel}>Cash:</span>
                    <span style={styles.stopMetricValue}>
                      ₹{fmt(stop.collected_amount)} / ₹{fmt(stop.planned_amount)}
                      {stop.pending_amount > 0 && (
                        <span style={{ color: "#dc2626", marginLeft: 8 }}>
                          (Pending: ₹{fmt(stop.pending_amount)})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {stop.notes && (
                  <div style={styles.stopNotes}>📝 {stop.notes}</div>
                )}
              </div>
            );
          })}
        </div>

        {selectedDelivery.status === "in_progress" && (
          <div style={styles.actionButtons}>
            <button onClick={() => loadNextStop(selectedDelivery.id)} style={styles.primaryBtn}>
              ▶️ Continue to Next Stop
            </button>
            <button onClick={completeDelivery} style={styles.completeBtn}>
              ✅ Complete Delivery
            </button>
          </div>
        )}
      </div>
    );
  }

  // DELIVERY SUMMARY VIEW
  if (view === "summary" && selectedDelivery) {
    return (
      <div style={styles.container}>
        <style>{FONTS}</style>

        <div style={styles.header}>
          <button onClick={() => setView("list")} style={styles.backBtn}>← Back to List</button>
          <h1 style={styles.title}>📋 Delivery Summary</h1>
        </div>

        <div style={styles.card}>
          <div style={styles.summaryHeader}>
            <h2 style={styles.deliveryNumber}>#{selectedDelivery.delivery_number}</h2>
            <div style={{ ...styles.statusBadge, background: STATUS_META.completed.bg, color: STATUS_META.completed.color }}>
              ✅ Completed
            </div>
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.sectionTitle}>📊 Final Summary</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryValue}>{fmt(selectedDelivery.total_loaded_boxes)}</div>
                <div style={styles.summaryLabel}>Total Loaded</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={{ ...styles.summaryValue, color: "#15803d" }}>{fmt(selectedDelivery.total_delivered_boxes)}</div>
                <div style={styles.summaryLabel}>Total Delivered</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={{ ...styles.summaryValue, color: "#dc2626" }}>{fmt(selectedDelivery.total_balance_boxes)}</div>
                <div style={styles.summaryLabel}>Balance Returned</div>
              </div>
            </div>
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.sectionTitle}>💰 Cash Summary</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryValue}>₹{fmt(selectedDelivery.total_amount)}</div>
                <div style={styles.summaryLabel}>Total Amount</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={{ ...styles.summaryValue, color: "#15803d" }}>₹{fmt(selectedDelivery.collected_amount)}</div>
                <div style={styles.summaryLabel}>Collected</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={{ ...styles.summaryValue, color: "#dc2626" }}>₹{fmt(selectedDelivery.total_pending_amount)}</div>
                <div style={styles.summaryLabel}>Pending</div>
              </div>
            </div>
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.sectionTitle}>📍 Delivery Timeline</h3>
            <div style={styles.timelineItem}>
              <span style={styles.timelineLabel}>Started:</span>
              <span>{selectedDelivery.start_datetime ? new Date(selectedDelivery.start_datetime).toLocaleString() : "Not recorded"}</span>
            </div>
            <div style={styles.timelineItem}>
              <span style={styles.timelineLabel}>Completed:</span>
              <span>{selectedDelivery.end_datetime ? new Date(selectedDelivery.end_datetime).toLocaleString() : "Just now"}</span>
            </div>
            {selectedDelivery.start_datetime && selectedDelivery.end_datetime && (
              <div style={styles.timelineItem}>
                <span style={styles.timelineLabel}>Duration:</span>
                <span>
                  {Math.floor((new Date(selectedDelivery.end_datetime) - new Date(selectedDelivery.start_datetime)) / (1000 * 60))} minutes
                </span>
              </div>
            )}
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.sectionTitle}>🛣️ Stops Completed</h3>
            {selectedDelivery.stops?.map((stop, index) => {
              const stopMeta = STOP_STATUS[stop.status] || STOP_STATUS.delivered;
              return (
                <div key={stop.id} style={styles.completedStopCard}>
                  <div style={styles.stopCardHeader}>
                    <div>
                      <div style={styles.stopSequence}>Stop #{stop.stop_sequence}</div>
                      <div style={styles.stopCustomer}>{stop.customer_name}</div>
                    </div>
                    <div style={{ ...styles.statusBadge, background: stopMeta.bg, color: stopMeta.color }}>
                      {stopMeta.label}
                    </div>
                  </div>
                  <div style={styles.stopMetrics}>
                    <div>📦 {fmt(stop.delivered_boxes)} / {fmt(stop.planned_boxes)} boxes</div>
                    <div>💰 ₹{fmt(stop.collected_amount)} / ₹{fmt(stop.planned_amount)} collected</div>
                  </div>
                  {stop.notes && (
                    <div style={styles.stopNotes}>📝 {stop.notes}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={styles.actionButtons}>
            <button onClick={() => setView("list")} style={styles.primaryBtn}>
              🏠 Back to Deliveries
            </button>
            <button 
              onClick={() => window.print()} 
              style={{...styles.secondaryBtn, marginLeft: "12px"}}
            >
              🖨️ Print Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div style={styles.container}>Loading...</div>;
}

// ========== STYLES ==========

const styles = {
  container: {
    fontFamily: "'Outfit', system-ui, sans-serif",
    maxWidth: 600,
    margin: "0 auto",
    padding: 16,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: 18,
    color: "#64748b",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
  },
  backBtn: {
    background: "#f1f5f9",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    color: "#475569",
  },
  refreshBtn: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  quickStartBtn: {
    background: "#059669",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    animation: "pulse 2s infinite",
  },
  filterSection: {
    marginBottom: 20,
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  filterButtons: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  deliveryList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  deliveryCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deliveryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deliveryNumber: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  deliveryRoute: {
    fontSize: 13,
    color: "#64748b",
    margin: 0,
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  deliveryInfo: {
    marginBottom: 16,
  },
  infoRow: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 4,
  },
  deliveryMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #f1f5f9",
  },
  metric: {
    textAlign: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  startBtn: {
    width: "100%",
    marginTop: 16,
    background: "#15803d",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  continueBtn: {
    width: "100%",
    marginTop: 16,
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  summaryBanner: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    border: "1px solid #e2e8f0",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e2e8f0",
  },
  stopHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  customerInfo: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: "1px solid #f1f5f9",
  },
  plannedInfo: {
    background: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  plannedItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  plannedLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
  },
  plannedValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  formSection: {
    marginTop: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    boxSizing: "border-box",
    background: "#f8fafc",
  },
  hint: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  primaryBtn: {
    width: "100%",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  deliverySummaryCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    border: "1px solid #e2e8f0",
  },
  stopsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 12,
  },
  stopCard: {
    background: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    border: "1px solid #e2e8f0",
  },
  stopCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stopSequence: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stopCustomer: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    marginTop: 4,
  },
  stopMetrics: {
    fontSize: 13,
    color: "#475569",
  },
  stopMetricLabel: {
    fontWeight: 600,
    marginRight: 8,
  },
  stopMetricValue: {
    fontWeight: 500,
  },
  stopNotes: {
    marginTop: 12,
    padding: 12,
    background: "#f8fafc",
    borderRadius: 6,
    fontSize: 12,
    color: "#475569",
  },
  actionButtons: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  completeBtn: {
    width: "100%",
    background: "#15803d",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  // Summary View Styles
  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid #e2e8f0",
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 16,
    marginTop: 12,
  },
  summaryItem: {
    textAlign: "center",
    padding: 16,
    background: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  timelineItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  timelineLabel: {
    fontWeight: 600,
    color: "#475569",
  },
  completedStopCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  secondaryBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "12px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

// Detailed view styles (matching DeliveryDetail component)
const detailStyles = {
  headerCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },  
  iconBox: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    width: 56,
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
  },
  deliveryTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  actionButtons: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  backButton: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  startButton: {
    background: "#15803d",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  continueButton: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  completeButton: {
    background: "#059669",
    color: "#fff",
    border: "none", 
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  infoCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 16,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
  },
  tabsContainer: {
    borderBottom: "1px solid #e2e8f0",
    marginBottom: 24,
  },
  tabBtn: {
    background: "none",
    border: "none",
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 600,
    color: "#64748b",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  },
  activeTabBtn: {
    background: "none",
    border: "none",
    padding: "12px 24px", 
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    cursor: "pointer",
    borderBottom: "2px solid #0f172a",
  },
  tabContentArea: {
    background: "#fff",
    borderRadius: 12, 
    border: "1px solid #e2e8f0",
    padding: 24,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionIconBox: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
};

// Modal styles for Start Delivery
const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999, // Increased z-index to ensure modal shows above everything
    backdropFilter: "blur(2px)", // Add backdrop blur effect
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    maxWidth: 500,
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  titleCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  iconBox: {
    background: "#f1f5f9",
    borderRadius: 12,
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  deliveryNumber: {
    fontSize: 13,
    color: "#64748b",
    margin: 0,
  },
  infoCard: {
    background: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
  },
  locationCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  locationHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
  },
  locationForm: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    background: "#fff",
  },
  locationInputs: {
    display: "flex",
    gap: 12,
  },
  locationButton: {
    background: "#f1f5f9",
    color: "#dc2626",
    border: "1px solid #e2e8f0",
    padding: "10px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  actionButtons: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
  },
  cancelButton: {
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "12px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  startButton: {
    background: "#059669",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}`;