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
    // total_delivered and collected_amount removed per UI request
  });

  const [productRows, setProductRows] = useState([
    { bill_number: "", loaded_quantity: "", amount: "", notes: "" },
  ]);

  // Stops removed from this form — individual delivery stops are not collected here

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

  // ── Prefill when editing ──
  useEffect(() => {
    if (!isEdit) return;
    const loadExisting = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/delivery-management/deliveries/${id}/`);
        const d = res.data || {};

        // Map base form fields (robustly handling possible id keys)
        const employeeId = d.employee ?? d.employee_id ?? d.employee_details?.id ?? "";
        const vehicleId  = d.vehicle  ?? d.vehicle_id  ?? d.vehicle_details?.id  ?? "";
        const routeId    = d.route    ?? d.route_id    ?? d.route_details?.id    ?? "";

        setForm({
          employee: String(employeeId || ""),
          vehicle: String(vehicleId || ""),
          route: String(routeId || ""),
          scheduled_date: d.scheduled_date || new Date().toISOString().slice(0,10),
          scheduled_time: d.scheduled_time || "08:00",
          remarks: d.remarks || "",
        });

        // Products
        const pRows = (d.products || []).map(p => ({
          bill_number: p.bill_number || '',
          loaded_quantity: p.loaded_quantity != null ? String(p.loaded_quantity) : "",
          amount: p.total_amount != null ? String(p.total_amount) : "",
          notes: p.notes || "",
        }));
        setProductRows(pRows.length ? pRows : [{ bill_number: "", loaded_quantity: "", amount: "", notes: "" }]);
        // Stops removed — not loaded into this form

        setCurrentStep(1);
      } catch (e) {
        setError(e.response?.data?.detail || "Could not load existing delivery.");
      } finally {
        setLoading(false);
      }
    };
    loadExisting();
  }, [isEdit, id]);

  // ── Product row management ──
  const addProductRow = () => {
    setProductRows([...productRows, { bill_number: "", loaded_quantity: "", amount: "", notes: "" }]);
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

  // Stop row management removed

  // ── Navigation ──
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!form.employee || !form.vehicle || !form.route) {
        setError("Please select employee, vehicle, and route.");
        return;
      }
      setCurrentStep(2);
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

    if (currentStep < 2) {
      goToNextStep();
      return;
    }

    // Final validation
    const validProducts = productRows.filter(p => p.loaded_quantity);
    if (validProducts.length === 0) {
      setError("Please add at least one product row with boxes filled.");
      return;
    }

    // Stops removed — no stops validation required here

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        employee: form.employee ? parseInt(form.employee) : null,
        vehicle:  form.vehicle  ? parseInt(form.vehicle)  : null,
        route:    form.route    ? parseInt(form.route)    : null,
        products: validProducts.map((p) => ({
          bill_number: p.bill_number || "",
          product: null,
          loaded_quantity: parseFloat(p.loaded_quantity),
          total_amount: p.amount ? parseFloat(p.amount) : 0,
          notes: p.notes || "",
        })),
        // stops omitted — backend will handle stops separately if needed
      };

      if (isEdit) {
        await api.put(`/delivery-management/deliveries/${id}/`, payload);
        alert("✅ Delivery updated successfully!");
      } else {
        await api.post(`/delivery-management/deliveries/`, payload);
        alert("✅ Delivery created successfully!");
      }
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
      .filter((p) => p.amount)
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const calculateTotalBoxes = () => {
    return productRows
      .filter((p) => p.loaded_quantity)
      .reduce((sum, p) => sum + parseFloat(p.loaded_quantity || 0), 0);
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
          {isEdit ? "Edit Delivery" : "Create New Delivery"}
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          {currentStep === 1 && "Step 1: Enter basic delivery information"}
          {currentStep === 2 && "Step 2: Add products to load on the vehicle"}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={stepIndicator}>
        <div style={{ ...step, ...(currentStep === 1 ? activeStep : completedStep) }}>
          <div style={stepNumber}>{currentStep > 1 ? "✓" : "1"}</div>
          <span style={stepLabel}>Delivery Info</span>
        </div>
        <div style={stepDivider} />
        <div style={{ ...step, ...(currentStep === 2 ? activeStep : {}) }}>
          <div style={stepNumber}>{currentStep === 2 ? "2" : "2"}</div>
          <span style={stepLabel}>Products</span>
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
                    <th style={thStyle}>No. of Bills</th>
                    <th style={thStyle}>No. of Boxes</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Avg Box Value</th>
                    <th style={thStyle}>Notes</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {productRows.map((row, i) => {
                    const avgBoxValue =
                      row.amount && row.loaded_quantity && parseFloat(row.loaded_quantity) > 0
                        ? parseFloat(row.amount) / parseFloat(row.loaded_quantity)
                        : null;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="text"
                            value={row.bill_number}
                            onChange={(e) => updateProductRow(i, "bill_number", e.target.value)}
                            placeholder="Enter bill no."
                            style={cellInput}
                          />
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
                        <td style={{ padding: "8px", width: 140 }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.amount}
                            onChange={(e) => updateProductRow(i, "amount", e.target.value)}
                            placeholder="0.00"
                            style={cellInput}
                          />
                        </td>
                        <td style={{ padding: "8px", width: 130, textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: "#0369a1" }}>
                          {avgBoxValue != null ? `₹${avgBoxValue.toFixed(2)}` : "—"}
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

              {/* Total Delivered and Collected inputs removed */}
            </>
          )}

          {/* Step 3 (Stops) removed from this form */}
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "space-between" }}>
          <button type="button" onClick={goBack} style={ghostBtn}>
            {currentStep === 1 ? "← Cancel" : "← Back"}
          </button>

          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? "Saving…" : currentStep === 2 ? "Create Delivery" : "Next →"}
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