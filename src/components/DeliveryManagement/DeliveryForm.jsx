/**
 * DeliveryForm_Updated.jsx
 *
 * Updated 3-step delivery creation:
 * Step 1: Basic Info (employee, vehicle, route)
 * Step 2: Products (what to load)
 * Step 3: Stops (where to deliver)
 */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function DeliveryFormUpdated() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // ── State ──
  const [form, setForm] = useState({
    employee: "",
    vehicle: "",
    route: "",
    scheduled_date: new Date().toISOString().slice(0, 10),
    scheduled_time: "08:00",
    remarks: "",
  });

  const [productRows, setProductRows] = useState([
    { product: "", loaded_quantity: "", unit_price: "", notes: "" },
  ]);

  const [stopRows, setStopRows] = useState([
    { stop_sequence: 1, customer_name: "", customer_address: "", customer_phone: "", planned_boxes: "", planned_amount: "", estimated_arrival: "" },
  ]);

  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1 = Basic, 2 = Products, 3 = Stops

  // ── Load dropdown data ──
  useEffect(() => {
    Promise.allSettled([
      api.get("/employee-management/employees/"),
      api.get("/vehicle-management/vehicles/"),
      api.get("/target-management/routes/"),
      api.get("/target-management/products/"),
    ]).then(([emp, veh, rte, prod]) => {
      if (emp.status === "fulfilled") setEmployees(emp.value.data?.results || emp.value.data || []);
      if (veh.status === "fulfilled") setVehicles(veh.value.data?.results || veh.value.data || []);
      if (rte.status === "fulfilled") setRoutes(rte.value.data?.results || rte.value.data || []);
      if (prod.status === "fulfilled") setProducts(prod.value.data?.results || prod.value.data || []);
    });
  }, []);

  const handleChange = (field, val) => setForm({ ...form, [field]: val });

  // ── Product row management ──
  const addProductRow = () => {
    setProductRows([...productRows, { product: "", loaded_quantity: "", unit_price: "", notes: "" }]);
  };

  const removeProductRow = (index) => {
    if (productRows.length > 1) {
      setProductRows(productRows.filter((_, i) => i !== index));
    }
  };

  const updateProductRow = (index, field, value) => {
    setProductRows(
      productRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // ── Stop row management ──
  const addStopRow = () => {
    const nextSeq = Math.max(...stopRows.map(s => s.stop_sequence || 0)) + 1;
    setStopRows([...stopRows, { 
      stop_sequence: nextSeq, 
      customer_name: "", 
      customer_address: "", 
      customer_phone: "", 
      planned_boxes: "", 
      planned_amount: "", 
      estimated_arrival: "" 
    }]);
  };

  const removeStopRow = (index) => {
    if (stopRows.length > 1) {
      const newRows = stopRows.filter((_, i) => i !== index);
      // Renumber sequences
      setStopRows(newRows.map((row, i) => ({ ...row, stop_sequence: i + 1 })));
    }
  };

  const updateStopRow = (index, field, value) => {
    setStopRows(
      stopRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // ── Navigation ──
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!form.employee || !form.vehicle || !form.route) {
        setError("Please select employee, vehicle, and route.");
        return;
      }
      setCurrentStep(2);
      setError("");
    } else if (currentStep === 2) {
      // Validate at least one product
      const validProducts = productRows.filter(p => p.product && p.loaded_quantity);
      if (validProducts.length === 0) {
        setError("Please add at least one product with quantity.");
        return;
      }
      setCurrentStep(3);
      setError("");
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/delivery-management/deliveries");
    }
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < 3) {
      goToNextStep();
      return;
    }

    // Final validation
    const validProducts = productRows.filter(p => p.product && p.loaded_quantity);
    if (validProducts.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    const validStops = stopRows.filter(s => s.customer_name && s.customer_address);
    if (validStops.length === 0) {
      setError("Please add at least one delivery stop.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        products: validProducts.map((p) => ({
          product: parseInt(p.product),
          loaded_quantity: parseFloat(p.loaded_quantity),
          unit_price: p.unit_price ? parseFloat(p.unit_price) : null,
          notes: p.notes || "",
        })),
        stops: validStops.map((s) => ({
          stop_sequence: s.stop_sequence,
          customer_name: s.customer_name,
          customer_address: s.customer_address,
          customer_phone: s.customer_phone || "",
          planned_boxes: s.planned_boxes ? parseFloat(s.planned_boxes) : 0,
          planned_amount: s.planned_amount ? parseFloat(s.planned_amount) : 0,
          estimated_arrival: s.estimated_arrival || null,
          notes: s.notes || "",
        })),
      };

      await api.post(`/delivery-management/deliveries/`, payload);
      alert("✅ Delivery created successfully!");
      navigate("/delivery-management/deliveries");
    } catch (err) {
      const detail = err.response?.data;
      setError(typeof detail === "string" ? detail : JSON.stringify(detail) || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return productRows
      .filter((p) => p.loaded_quantity && p.unit_price)
      .reduce((sum, p) => sum + parseFloat(p.loaded_quantity || 0) * parseFloat(p.unit_price || 0), 0);
  };

  const calculateTotalBoxes = () => {
    return productRows
      .filter((p) => p.loaded_quantity)
      .reduce((sum, p) => sum + parseFloat(p.loaded_quantity || 0), 0);
  };

  const calculateTotalPlannedAmount = () => {
    return stopRows
      .filter((s) => s.planned_amount)
      .reduce((sum, s) => sum + parseFloat(s.planned_amount || 0), 0);
  };

  const field = (label, children, required = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div style={page}>
      <style>{FONTS}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Create New Delivery
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          {currentStep === 1 && "Step 1: Enter basic delivery information"}
          {currentStep === 2 && "Step 2: Add products to load on the vehicle"}
          {currentStep === 3 && "Step 3: Add delivery stops (shops/customers)"}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={stepIndicator}>
        <div style={{ ...step, ...(currentStep === 1 ? activeStep : completedStep) }}>
          <div style={stepNumber}>{currentStep > 1 ? "✓" : "1"}</div>
          <span style={stepLabel}>Delivery Info</span>
        </div>
        <div style={stepDivider} />
        <div style={{ ...step, ...(currentStep === 2 ? activeStep : currentStep > 2 ? completedStep : {}) }}>
          <div style={stepNumber}>{currentStep > 2 ? "✓" : "2"}</div>
          <span style={stepLabel}>Products</span>
        </div>
        <div style={stepDivider} />
        <div style={{ ...step, ...(currentStep === 3 ? activeStep : {}) }}>
          <div style={stepNumber}>3</div>
          <span style={stepLabel}>Stops</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={card}>
          {/* ──────── STEP 1: Basic Info ──────── */}
          {currentStep === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              {field(
                "Employee (Driver)",
                <select
                  value={form.employee || ""}
                  onChange={(e) => handleChange("employee", e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">— Select employee —</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} ({e.employee_id})
                    </option>
                  ))}
                </select>,
                true
              )}

              {field(
                "Vehicle",
                <select
                  value={form.vehicle || ""}
                  onChange={(e) => handleChange("vehicle", e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">— Select vehicle —</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} · {v.vehicle_type}
                    </option>
                  ))}
                </select>,
                true
              )}

              {field(
                "Route",
                <select
                  value={form.route || ""}
                  onChange={(e) => handleChange("route", e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">— Select route —</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.route_name} ({r.origin} → {r.destination})
                    </option>
                  ))}
                </select>,
                true
              )}

              {field(
                "Scheduled Date",
                <input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => handleChange("scheduled_date", e.target.value)}
                  style={inputStyle}
                  required
                />,
                true
              )}

              {field(
                "Scheduled Time",
                <input
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => handleChange("scheduled_time", e.target.value)}
                  style={inputStyle}
                  required
                />,
                true
              )}

              <div style={{ gridColumn: "1 / -1" }}>
                {field(
                  "Remarks",
                  <textarea
                    value={form.remarks}
                    onChange={(e) => handleChange("remarks", e.target.value)}
                    style={{ ...inputStyle, minHeight: 80 }}
                    placeholder="Optional notes about this delivery..."
                  />
                )}
              </div>
            </div>
          )}

          {/* ──────── STEP 2: Products ──────── */}
          {currentStep === 2 && (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Loaded Qty</th>
                    <th style={thStyle}>Unit Price</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                    <th style={thStyle}>Notes</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {productRows.map((row, i) => {
                    const rowTotal =
                      row.loaded_quantity && row.unit_price
                        ? parseFloat(row.loaded_quantity) * parseFloat(row.unit_price)
                        : 0;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px" }}>
                          <select
                            value={row.product}
                            onChange={(e) => updateProductRow(i, "product", e.target.value)}
                            style={cellInput}
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.product_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: "8px", width: 120 }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.loaded_quantity}
                            onChange={(e) => updateProductRow(i, "loaded_quantity", e.target.value)}
                            placeholder="0"
                            style={cellInput}
                          />
                        </td>
                        <td style={{ padding: "8px", width: 130 }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.unit_price}
                            onChange={(e) => updateProductRow(i, "unit_price", e.target.value)}
                            placeholder="0.00"
                            style={cellInput}
                          />
                        </td>
                        <td style={{ padding: "8px", width: 130, textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                          {rowTotal > 0 ? `₹${rowTotal.toFixed(2)}` : "—"}
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            value={row.notes}
                            onChange={(e) => updateProductRow(i, "notes", e.target.value)}
                            placeholder="Optional"
                            style={cellInput}
                          />
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {productRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeProductRow(i)}
                              style={removeBtn}
                              title="Remove row"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                    <td colSpan="1" style={{ padding: "10px 8px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      TOTAL BOXES: {calculateTotalBoxes().toFixed(2)}
                    </td>
                    <td colSpan="2" style={{ padding: "10px 8px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      TOTAL INVOICE
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: "#15803d" }}>
                      ₹{calculateTotal().toFixed(2)}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>

              <button type="button" onClick={addProductRow} style={ghostBtn}>
                + Add Product Row
              </button>
            </>
          )}

          {/* ──────── STEP 3: Stops ──────── */}
          {currentStep === 3 && (
            <>
              <div style={{ marginBottom: 16, padding: 12, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d", marginBottom: 4 }}>
                  📦 Total Boxes to Deliver: {calculateTotalBoxes().toFixed(2)}
                </div>
                <div style={{ fontSize: 12, color: "#166534" }}>
                  Add delivery stops in the order the driver should visit them
                </div>
              </div>

              {stopRows.map((row, i) => (
                <div key={i} style={{ 
                  marginBottom: 16, 
                  padding: 16, 
                  background: "#f8fafc", 
                  borderRadius: 8,
                  border: "1px solid #e2e8f0" 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      Stop #{row.stop_sequence}
                    </h4>
                    {stopRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStopRow(i)}
                        style={removeBtn}
                        title="Remove stop"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {field(
                      "Customer/Shop Name",
                      <input
                        value={row.customer_name}
                        onChange={(e) => updateStopRow(i, "customer_name", e.target.value)}
                        placeholder="ABC Store"
                        style={cellInput}
                        required
                      />,
                      true
                    )}

                    {field(
                      "Phone Number",
                      <input
                        value={row.customer_phone}
                        onChange={(e) => updateStopRow(i, "customer_phone", e.target.value)}
                        placeholder="9876543210"
                        style={cellInput}
                      />
                    )}
                  </div>

                  {field(
                    "Address",
                    <textarea
                      value={row.customer_address}
                      onChange={(e) => updateStopRow(i, "customer_address", e.target.value)}
                      placeholder="123 Main Street, Area, City"
                      style={{ ...cellInput, minHeight: 60 }}
                      required
                    />,
                    true
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {field(
                      "Planned Boxes",
                      <input
                        type="number"
                        step="0.01"
                        value={row.planned_boxes}
                        onChange={(e) => updateStopRow(i, "planned_boxes", e.target.value)}
                        placeholder="0"
                        style={cellInput}
                      />
                    )}

                    {field(
                      "Planned Amount (₹)",
                      <input
                        type="number"
                        step="0.01"
                        value={row.planned_amount}
                        onChange={(e) => updateStopRow(i, "planned_amount", e.target.value)}
                        placeholder="0.00"
                        style={cellInput}
                      />
                    )}

                    {field(
                      "Est. Arrival Time",
                      <input
                        type="time"
                        value={row.estimated_arrival}
                        onChange={(e) => updateStopRow(i, "estimated_arrival", e.target.value)}
                        style={cellInput}
                      />
                    )}
                  </div>
                </div>
              ))}

              <button type="button" onClick={addStopRow} style={ghostBtn}>
                + Add Another Stop
              </button>

              {/* Summary */}
              <div style={{ marginTop: 20, padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 8 }}>
                  Delivery Summary:
                </div>
                <div style={{ fontSize: 12, color: "#166534" }}>
                  📍 {stopRows.filter(s => s.customer_name).length} stops planned
                </div>
                <div style={{ fontSize: 12, color: "#166534" }}>
                  💰 Total Planned Amount: ₹{calculateTotalPlannedAmount().toFixed(2)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "space-between" }}>
          <button type="button" onClick={goBack} style={ghostBtn}>
            {currentStep === 1 ? "← Cancel" : "← Back"}
          </button>

          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? "Saving…" : currentStep === 3 ? "Create Delivery" : "Next →"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ──────── Styles ────────
const page = {
  fontFamily: "'Outfit', system-ui, sans-serif",
  padding: 24,
  background: "#f8fafc",
  minHeight: "100vh",
  maxWidth: 1200,
  margin: "0 auto",
};

const card = {
  background: "#ffffff",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
  letterSpacing: 0.4,
  textTransform: "uppercase",
  marginBottom: 5,
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#0f172a",
  boxSizing: "border-box",
  background: "#f8fafc",
  outline: "none",
};

const cellInput = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 6,
  border: "1px solid #e2e8f0",
  fontSize: 13,
  boxSizing: "border-box",
  background: "#fff",
};

const thStyle = {
  textAlign: "left",
  padding: "8px",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  borderBottom: "1px solid #e2e8f0",
};

const primaryBtn = {
  background: "#0f172a",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const ghostBtn = {
  background: "#f1f5f9",
  color: "#475569",
  padding: "10px 18px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  marginTop: 12,
};

const removeBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#ef4444",
  fontSize: 14,
  padding: 4,
  fontWeight: 600,
};

const errorBox = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  padding: "10px 14px",
  borderRadius: 8,
  marginBottom: 14,
  fontSize: 13,
};

const stepIndicator = {
  display: "flex",
  alignItems: "center",
  marginBottom: 24,
  background: "#fff",
  padding: 16,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
};

const step = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flex: 1,
};

const activeStep = {
  color: "#0f172a",
};

const completedStep = {
  color: "#15803d",
};

const stepNumber = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "#cbd5e1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 800,
  color: "#fff",
};

const stepLabel = {
  fontSize: 13,
  fontWeight: 600,
};

const stepDivider = {
  width: 60,
  height: 2,
  background: "#e2e8f0",
  margin: "0 16px",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`;