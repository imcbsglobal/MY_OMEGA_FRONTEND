/**
 * EmployeeDeliveryView_Updated.jsx
 * 
 * Updated for new workflow:
 * - Uses /deliveries/my-assigned/ endpoint
 * - Uses /deliveries/{id}/next-stop/ for sequential stops
 * - Shows balance_boxes and pending_amount
 * - Real-time delivery summary after each stop
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const fmt = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_META = {
  scheduled: { bg: "#dbeafe", color: "#1d4ed8", icon: "📅", label: "Scheduled" },
  in_progress: { bg: "#fef9c3", color: "#a16207", icon: "🚚", label: "In Progress" },
  completed: { bg: "#dcfce7", color: "#15803d", icon: "✅", label: "Completed" },
  cancelled: { bg: "#fee2e2", color: "#b91c1c", icon: "❌", label: "Cancelled" },
};

const STOP_STATUS = {
  pending: { bg: "#f1f5f9", color: "#475569", label: "⏳ Pending" },
  delivered: { bg: "#dcfce7", color: "#15803d", label: "✅ Delivered" },
  partial: { bg: "#fef9c3", color: "#a16207", label: "⚠️ Partial" },
  failed: { bg: "#fee2e2", color: "#b91c1c", label: "❌ Failed" },
  skipped: { bg: "#f3e8ff", color: "#7e22ce", label: "⏭️ Skipped" },
};

export default function EmployeeDeliveryView() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [currentStop, setCurrentStop] = useState(null);
  const [deliverySummary, setDeliverySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list"); // list, stop_detail, all_stops, summary

  // Stop update form
  const [stopForm, setStopForm] = useState({
    delivered_boxes: "",
    collected_amount: "",
    status: "delivered",
    notes: "",
  });

  useEffect(() => {
    fetchMyDeliveries();
  }, []);

  // NEW: Use my-assigned endpoint
  const fetchMyDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/delivery-management/deliveries/my-assigned/");
      setDeliveries(res.data || []);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const selectDelivery = async (delivery) => {
    setLoading(true);
    try {
      const res = await api.get(`/delivery-management/deliveries/${delivery.id}/`);
      setSelectedDelivery(res.data);
      
      // If delivery is in progress, get next stop
      if (res.data.status === "in_progress") {
        loadNextStop(delivery.id);
      } else {
        setView("all_stops");
      }
    } catch (err) {
      alert("Failed to load delivery details");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Load next pending stop
  const loadNextStop = async (deliveryId) => {
    try {
      const res = await api.get(`/delivery-management/deliveries/${deliveryId}/next-stop/`);
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
    const odometer = prompt("Enter starting odometer reading (km):");
    if (!odometer) return;

    const fuel = prompt("Enter starting fuel level (liters) - optional:");
    
    setLoading(true);
    try {
      await api.post(`/delivery-management/deliveries/${deliveryId}/start/`, {
        odometer_reading: parseFloat(odometer),
        fuel_level: fuel ? parseFloat(fuel) : null,
        notes: "Started delivery",
      });
      alert("✅ Delivery started successfully!");
      fetchMyDeliveries();
    } catch (err) {
      alert("Failed to start delivery: " + (err.response?.data?.error || "Unknown error"));
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
      const res = await api.patch(`/delivery-management/delivery-stops/${currentStop.id}/`, {
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

    const odometer = prompt("Enter ending odometer reading (km):");
    if (!odometer) return;

    const fuel = prompt("Enter ending fuel level (liters) - optional:");

    setLoading(true);
    try {
      // Get product quantities
      const products = selectedDelivery.products.map(p => ({
        product_id: p.product,
        delivered_quantity: p.delivered_quantity || 0,
      }));

      await api.post(`/delivery-management/deliveries/${selectedDelivery.id}/complete/`, {
        odometer_reading: parseFloat(odometer),
        fuel_level: fuel ? parseFloat(fuel) : null,
        notes: "Delivery completed",
        products: products,
      });

      alert("✅ Delivery completed successfully!");
      setView("list");
      setSelectedDelivery(null);
      fetchMyDeliveries();
    } catch (err) {
      alert("Failed to complete delivery: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
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
          <button onClick={() => fetchMyDeliveries()} style={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </div>

        {deliveries.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p>No deliveries assigned</p>
          </div>
        ) : (
          <div style={styles.deliveryList}>
            {deliveries.map((delivery) => {
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
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`;