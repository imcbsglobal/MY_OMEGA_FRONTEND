/**
 * DeliveryWorkflow.jsx
 *
 * Full delivery lifecycle orchestrator.
 * Imports and composes: DeliveryForm · DeliveryProducts · DeliveryStops
 *
 * Routes:
 *   /delivery-management/deliveries/new   → 3-step create wizard
 *   /delivery-management/deliveries/:id   → manage / run / complete a delivery
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

import DeliveryForm     from "./DeliveryForm";
import DeliveryProducts from "./DeliveryProducts";
import DeliveryStops    from "./DeliveryStops";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_META = {
  scheduled:   { bg: "#dbeafe", color: "#1d4ed8", label: "Scheduled" },
  in_progress: { bg: "#fef9c3", color: "#a16207", label: "In Progress" },
  completed:   { bg: "#dcfce7", color: "#15803d", label: "Completed" },
  cancelled:   { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
};

// ─── Reusable UI atoms ─────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const s = STATUS_META[status] || { bg: "#f1f5f9", color: "#475569", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 11px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, ...style }}>
    {children}
  </div>
);

const Btn = ({ children, variant = "primary", style = {}, ...p }) => {
  const v = {
    primary: { background: "#0f172a", color: "#fff", border: "none" },
    amber:   { background: "#f59e0b", color: "#fff", border: "none" },
    green:   { background: "#10b981", color: "#fff", border: "none" },
    ghost:   { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
  };
  return (
    <button style={{ ...v[variant], padding: "9px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, ...style }} {...p}>
      {children}
    </button>
  );
};

const StatBox = ({ label, value, color = "#0f172a" }) => (
  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "13px 15px", border: "1px solid #e2e8f0" }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .5 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color, marginTop: 5, fontFamily: "monospace" }}>{value}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
    <span style={{ color: "#64748b" }}>{label}</span>
    <span style={{ color: "#0f172a", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, marginBottom: 14 }}>
    {children}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const ModalInput = ({ label, ...p }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: .4, marginBottom: 5 }}>{label}</label>
    <input style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", background: "#f8fafc", outline: "none" }} {...p} />
  </div>
);

// ─── Wizard step bar ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Delivery Info" },
  { id: 2, label: "Products"      },
  { id: 3, label: "Stops"         },
];

const StepBar = ({ current }) => (
  <div style={{ display: "flex", marginBottom: 24, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
    {STEPS.map((s, i) => {
      const done   = current > s.id;
      const active = current === s.id;
      return (
        <div key={s.id} style={{
          flex: 1, padding: "12px 16px",
          background: active ? "#0f172a" : done ? "#f0fdf4" : "#f8fafc",
          display: "flex", alignItems: "center", gap: 8,
          borderRight: i < 2 ? "1px solid #e2e8f0" : "none",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            background: active ? "#f59e0b" : done ? "#10b981" : "#cbd5e1",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "#fff",
          }}>
            {done ? "✓" : s.id}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : done ? "#15803d" : "#94a3b8" }}>
            {s.label}
          </span>
        </div>
      );
    })}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
export default function DeliveryWorkflow() {
  const { id }   = useParams();
  const navigate = useNavigate();

  // ── State ──
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  // ── Dropdown data (wizard only) ──
  const [employees,      setEmployees]  = useState([]);
  const [vehicles,       setVehicles]   = useState([]);
  const [routes,         setRoutes]     = useState([]);
  const [availProds,     setAvailProds] = useState([]);

  // ── Wizard state ──
  const [wizardStep, setWizardStep]   = useState(1);
  const [basicForm, setBasicForm]     = useState({
    employee: "", vehicle: "", route: "",
    scheduled_date: new Date().toISOString().slice(0, 10),
    scheduled_time: "08:00",
    remarks: "",
  });
  const [productRows, setProductRows] = useState([
    { product: "", loaded_quantity: "", unit_price: "", notes: "" },
  ]);
  const [stopRows, setStopRows]       = useState([
    { stop_sequence: 1, customer_name: "", customer_address: "", customer_phone: "", planned_boxes: "", planned_amount: "", estimated_arrival: "", notes: "" },
  ]);

  // ── Action modal state ──
  const [showStartModal,    setShowStartModal]    = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [startForm,    setStartForm]    = useState({ odometer_reading: "", fuel_level: "", notes: "" });
  const [completeForm, setCompleteForm] = useState({ odometer_reading: "", fuel_level: "", notes: "" });

  // ── Load dropdown data (create wizard only) ──
  useEffect(() => {
    if (id) return;
    Promise.allSettled([
      api.get("/employee-management/employees/"),
      api.get("/vehicle-management/vehicles/"),
      api.get("/target-management/routes/"),
      api.get("/target-management/products/"),
    ]).then(([emp, veh, rte, prod]) => {
      if (emp.status  === "fulfilled") setEmployees(emp.value.data?.results   || emp.value.data  || []);
      if (veh.status  === "fulfilled") setVehicles(veh.value.data?.results    || veh.value.data  || []);
      if (rte.status  === "fulfilled") setRoutes(rte.value.data?.results      || rte.value.data  || []);
      if (prod.status === "fulfilled") setAvailProds(prod.value.data?.results || prod.value.data || []);
    });
  }, [id]);

  // ── Load existing delivery ──
  const fetchDelivery = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/delivery-management/deliveries/${id}/`);
      setDelivery(res.data);
    } catch { setError("Failed to load delivery."); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDelivery(); }, [fetchDelivery]);

  // ── Flash messages ──
  const flash = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  };

  const FlashBanner = () => (
    <>
      {error   && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b",  padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d",  padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{success}</div>}
    </>
  );

  // ── Create delivery ──
  const handleCreateDelivery = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...basicForm,
        products: productRows
          .filter(p => p.product && p.loaded_quantity)
          .map(p => ({
            product:          parseInt(p.product),
            loaded_quantity:  parseFloat(p.loaded_quantity),
            unit_price:       p.unit_price ? parseFloat(p.unit_price) : null,
            notes:            p.notes || "",
          })),
        stops: stopRows
          .filter(s => s.customer_name)
          .map(s => ({
            stop_sequence:    s.stop_sequence,
            customer_name:    s.customer_name,
            customer_address: s.customer_address,
            customer_phone:   s.customer_phone || "",
            planned_boxes:    s.planned_boxes  ? parseFloat(s.planned_boxes)  : 0,
            planned_amount:   s.planned_amount ? parseFloat(s.planned_amount) : 0,
            estimated_arrival: s.estimated_arrival || null,
            notes:            s.notes || "",
          })),
      };
      const res = await api.post("/delivery-management/deliveries/", payload);
      flash("Delivery created successfully!");
      navigate(`/delivery-management/deliveries/${res.data.id}`);
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : JSON.stringify(d) || "Failed to create delivery.");
    } finally { setLoading(false); }
  };

  // ── Start delivery ──
  const handleStartDelivery = async () => {
    setLoading(true);
    try {
      await api.post(`/delivery-management/deliveries/${id}/start/`, {
        odometer_reading: startForm.odometer_reading || null,
        fuel_level:       startForm.fuel_level       || null,
        notes:            startForm.notes,
      });
      setShowStartModal(false);
      flash("Delivery started — van is on the route!");
      fetchDelivery();
    } catch (e) { flash(e.response?.data?.error || "Failed to start.", true); }
    finally { setLoading(false); }
  };

  // ── Complete delivery ──
  const handleCompleteDelivery = async () => {
    setLoading(true);
    try {
      const products = (delivery?.products || []).map(p => ({
        product_id:         p.product,
        delivered_quantity: parseFloat(p.delivered_quantity || 0),
      }));
      await api.post(`/delivery-management/deliveries/${id}/complete/`, {
        odometer_reading: completeForm.odometer_reading || null,
        fuel_level:       completeForm.fuel_level       || null,
        notes:            completeForm.notes,
        products,
      });
      setShowCompleteModal(false);
      flash("Delivery completed! All totals updated.");
      fetchDelivery();
    } catch (e) { flash(e.response?.data?.error || "Failed to complete.", true); }
    finally { setLoading(false); }
  };

  // ── Cancel delivery ──
  const handleCancelDelivery = async () => {
    if (!window.confirm("Cancel this delivery?")) return;
    try {
      await api.post(`/delivery-management/deliveries/${id}/cancel/`, { reason: "Cancelled by admin" });
      flash("Delivery cancelled.");
      fetchDelivery();
    } catch (e) { flash(e.response?.data?.error || "Failed to cancel.", true); }
  };

  // ── Live totals (derived from stops) ──
  const liveTotals = delivery ? (() => {
    const stops     = delivery.stops  || [];
    const done      = stops.filter(s => s.status !== "pending");
    const totalDel  = done.reduce((a, s) => a + parseFloat(s.delivered_boxes  || 0), 0);
    const totalCol  = done.reduce((a, s) => a + parseFloat(s.collected_amount || 0), 0);
    const totalPlan = stops.reduce((a, s) => a + parseFloat(s.planned_amount  || 0), 0);
    return {
      totalDelivered: totalDel,
      balanceBoxes:   parseFloat(delivery.total_loaded_boxes || 0) - totalDel,
      totalCollected: totalCol,
      balanceCash:    totalPlan - totalCol,
      completedCount: done.length,
      totalCount:     stops.length,
    };
  })() : null;

  // ══════════════════════════════════════════════════════════════════════════════
  //  WIZARD (create)
  // ══════════════════════════════════════════════════════════════════════════════
  if (!id) {
    return (
      <div style={page}>
        <style>{FONTS}</style>
        <div style={pageHeader}>
          <div>
            <h1 style={h1}>New Delivery</h1>
            <p style={sub}>Set up route, load products and plan stops</p>
          </div>
          <Btn variant="ghost" onClick={() => navigate("/delivery-management/deliveries")}>← Back</Btn>
        </div>
        <FlashBanner />
        <StepBar current={wizardStep} />

        {/* STEP 1 — uses DeliveryForm in wizard mode */}
        {wizardStep === 1 && (
          <Card>
            <SectionTitle>Step 1: Delivery Information</SectionTitle>
            <DeliveryForm
              isWizard
              wizardForm={basicForm}
              onWizardChange={setBasicForm}
              wizardEmployees={employees}
              wizardVehicles={vehicles}
              wizardRoutes={routes}
            />
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <Btn onClick={() => {
                if (!basicForm.employee || !basicForm.vehicle || !basicForm.route) {
                  setError("Please select employee, vehicle, and route."); return;
                }
                setError(""); setWizardStep(2);
              }}>
                Next: Products →
              </Btn>
            </div>
          </Card>
        )}

        {/* STEP 2 — uses DeliveryProducts in wizard mode */}
        {wizardStep === 2 && (
          <Card>
            <SectionTitle>Step 2: Products to Load</SectionTitle>
            <DeliveryProducts
              wizardMode
              productRows={productRows}
              onProductRowsChange={setProductRows}
              availableProducts={availProds}
            />
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
              <Btn variant="ghost" onClick={() => setWizardStep(1)}>← Back</Btn>
              <Btn onClick={() => {
                if (!productRows.some(r => r.product && r.loaded_quantity)) {
                  setError("Add at least one product with a quantity."); return;
                }
                setError(""); setWizardStep(3);
              }}>
                Next: Stops →
              </Btn>
            </div>
          </Card>
        )}

        {/* STEP 3 — uses DeliveryStops in wizard mode */}
        {wizardStep === 3 && (
          <Card>
            <SectionTitle>Step 3: Delivery Stops</SectionTitle>
            <DeliveryStops
              wizardMode
              stopRows={stopRows}
              onStopRowsChange={setStopRows}
            />
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
              <Btn variant="ghost" onClick={() => setWizardStep(2)}>← Back</Btn>
              <Btn variant="green" onClick={handleCreateDelivery} disabled={loading} style={{ minWidth: 160 }}>
                {loading ? "Creating…" : "✓ Create Delivery"}
              </Btn>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  LOADING / NOT FOUND
  // ══════════════════════════════════════════════════════════════════════════════
  if (loading && !delivery) {
    return <div style={{ ...page, paddingTop: 60, textAlign: "center", color: "#94a3b8" }}>Loading delivery…</div>;
  }
  if (!delivery) {
    return <div style={{ ...page, paddingTop: 60, textAlign: "center", color: "#ef4444" }}>Delivery not found.</div>;
  }

  const isScheduled = delivery.status === "scheduled";
  const isActive    = delivery.status === "in_progress";
  const isCompleted = delivery.status === "completed";

  // ══════════════════════════════════════════════════════════════════════════════
  //  DETAIL / MANAGE PAGE
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div style={page}>
      <style>{FONTS}</style>

      {/* Page header */}
      <div style={pageHeader}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <h1 style={{ ...h1, margin: 0 }}>{delivery.delivery_number}</h1>
            <Badge status={delivery.status} />
          </div>
          <p style={{ ...sub, margin: 0 }}>
            {delivery.route_name}  &nbsp;·&nbsp;
            {delivery.vehicle_number} &nbsp;·&nbsp;
            {delivery.employee_name}  &nbsp;·&nbsp;
            📅 {delivery.scheduled_date} @ {delivery.scheduled_time}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {isScheduled && <>
            <Btn variant="amber" onClick={() => setShowStartModal(true)}>▶ Start Delivery</Btn>
            <Btn variant="ghost" style={{ color: "#ef4444" }} onClick={handleCancelDelivery}>Cancel</Btn>
          </>}
          {isActive && <Btn variant="green" onClick={() => setShowCompleteModal(true)}>🏁 End Delivery</Btn>}
          <Btn variant="ghost" onClick={() => navigate("/delivery-management/deliveries")}>← List</Btn>
        </div>
      </div>

      <FlashBanner />

      {/* Live stats strip */}
      {(isActive || isCompleted) && liveTotals && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 20 }}>
          <StatBox label="Loaded Boxes"   value={delivery.total_loaded_boxes} />
          <StatBox label="Delivered"      value={fmt(isCompleted ? delivery.total_delivered_boxes : liveTotals.totalDelivered)}  color="#15803d" />
          <StatBox label="Balance Boxes"  value={fmt(isCompleted ? delivery.total_balance_boxes   : liveTotals.balanceBoxes)}    color={liveTotals.balanceBoxes > 0 ? "#a16207" : "#15803d"} />
          <StatBox label="Total Invoice"  value={`₹${fmt(delivery.total_amount)}`} />
          <StatBox label="Cash Collected" value={`₹${fmt(isCompleted ? delivery.collected_amount : liveTotals.totalCollected)}`} color="#15803d" />
          <StatBox label="Balance Cash"   value={`₹${fmt(liveTotals.balanceCash)}`}  color={liveTotals.balanceCash > 0 ? "#b91c1c" : "#15803d"} />
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start" }}>

        {/* LEFT: Stops — uses DeliveryStops component */}
        <Card style={{ padding: 16 }}>
          <DeliveryStops
            deliveryId={parseInt(id)}
            deliveryStatus={delivery.status}
            onStopsUpdated={fetchDelivery}
          />
        </Card>

        {/* RIGHT: Info + Products */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Delivery info card */}
          <Card>
            <SectionTitle>Delivery Details</SectionTitle>
            <InfoRow label="Employee"  value={delivery.employee_name} />
            <InfoRow label="Vehicle"   value={delivery.vehicle_number} />
            <InfoRow label="Route"     value={delivery.route_name} />
            <InfoRow label="Date"      value={delivery.scheduled_date} />
            <InfoRow label="Time"      value={delivery.scheduled_time} />
            {delivery.start_datetime    && <InfoRow label="Started"     value={new Date(delivery.start_datetime).toLocaleString()} />}
            {delivery.end_datetime      && <InfoRow label="Ended"       value={new Date(delivery.end_datetime).toLocaleString()} />}
            {delivery.odometer_start    && <InfoRow label="Odo Start"   value={`${delivery.odometer_start} km`} />}
            {delivery.odometer_end      && <InfoRow label="Odo End"     value={`${delivery.odometer_end} km`} />}
            {delivery.distance_traveled && <InfoRow label="Distance"    value={`${delivery.distance_traveled} km`} />}
            {delivery.fuel_consumed     && <InfoRow label="Fuel Used"   value={`${delivery.fuel_consumed} L`} />}
            {delivery.delivery_efficiency != null && <InfoRow label="Efficiency" value={`${parseFloat(delivery.delivery_efficiency).toFixed(1)}%`} />}
            {delivery.remarks           && <InfoRow label="Remarks"     value={delivery.remarks} />}
          </Card>

          {/* Products — uses DeliveryProducts component */}
          <Card style={{ padding: 16 }}>
            <DeliveryProducts
              deliveryId={parseInt(id)}
              deliveryStatus={delivery.status}
            />
          </Card>

          {/* Final summary (completed only) */}
          {isCompleted && (
            <Card style={{ borderColor: "#bbf7d0", background: "#f0fdf4" }}>
              <SectionTitle>Final Summary</SectionTitle>
              <InfoRow label="Boxes Loaded"    value={`${delivery.total_loaded_boxes}`} />
              <InfoRow label="Boxes Delivered" value={<b style={{ color: "#15803d" }}>{delivery.total_delivered_boxes}</b>} />
              <InfoRow label="Balance Boxes"   value={`${delivery.total_balance_boxes}`} />
              <div style={{ borderTop: "1px solid #bbf7d0", margin: "6px 0" }} />
              <InfoRow label="Total Invoice"   value={`₹${fmt(delivery.total_amount)}`} />
              <InfoRow label="Cash Collected"  value={<b style={{ color: "#15803d" }}>₹{fmt(delivery.collected_amount)}</b>} />
              <InfoRow label="Balance Cash"    value={`₹${fmt(parseFloat(delivery.total_amount) - parseFloat(delivery.collected_amount))}`} />
              <InfoRow label="Efficiency"      value={`${parseFloat(delivery.delivery_efficiency || 0).toFixed(1)}%`} />
            </Card>
          )}
        </div>
      </div>

      {/* START MODAL */}
      {showStartModal && (
        <Modal title="▶ Start Delivery" onClose={() => setShowStartModal(false)}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>Record van details before it leaves the depot.</p>
          <ModalInput label="Odometer Reading (km)" type="number" value={startForm.odometer_reading} onChange={e => setStartForm(f => ({ ...f, odometer_reading: e.target.value }))} placeholder="e.g. 12450" />
          <ModalInput label="Fuel Level (L)"        type="number" value={startForm.fuel_level}       onChange={e => setStartForm(f => ({ ...f, fuel_level: e.target.value }))}       placeholder="e.g. 45" />
          <ModalInput label="Start Notes"                        value={startForm.notes}             onChange={e => setStartForm(f => ({ ...f, notes: e.target.value }))}             placeholder="Optional" />
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowStartModal(false)}>Cancel</Btn>
            <Btn variant="amber" onClick={handleStartDelivery} disabled={loading}>{loading ? "Starting…" : "▶ Start"}</Btn>
          </div>
        </Modal>
      )}

      {/* COMPLETE MODAL */}
      {showCompleteModal && (
        <Modal title="🏁 End Delivery" onClose={() => setShowCompleteModal(false)}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>Record final readings to close this delivery.</p>
          <ModalInput label="Final Odometer (km)"  type="number" value={completeForm.odometer_reading} onChange={e => setCompleteForm(f => ({ ...f, odometer_reading: e.target.value }))} placeholder="e.g. 12550" />
          <ModalInput label="Final Fuel Level (L)" type="number" value={completeForm.fuel_level}       onChange={e => setCompleteForm(f => ({ ...f, fuel_level: e.target.value }))}       placeholder="e.g. 30" />
          <ModalInput label="End Notes"                         value={completeForm.notes}            onChange={e => setCompleteForm(f => ({ ...f, notes: e.target.value }))}             placeholder="Optional" />
          {/* Preview */}
          {liveTotals && (
            <div style={{ marginTop: 12, padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Summary Preview</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 10px", fontSize: 13 }}>
                <span style={{ color: "#64748b" }}>Loaded</span>        <span style={{ fontWeight: 700 }}>{delivery.total_loaded_boxes} boxes</span>
                <span style={{ color: "#64748b" }}>Delivered</span>     <span style={{ color: "#15803d", fontWeight: 700 }}>{liveTotals.totalDelivered} boxes</span>
                <span style={{ color: "#64748b" }}>Balance Boxes</span> <span style={{ fontWeight: 700 }}>{liveTotals.balanceBoxes.toFixed(2)}</span>
                <span style={{ color: "#64748b" }}>Cash Collected</span><span style={{ color: "#15803d", fontWeight: 700 }}>₹{fmt(liveTotals.totalCollected)}</span>
                <span style={{ color: "#64748b" }}>Balance Cash</span>  <span style={{ color: liveTotals.balanceCash > 0 ? "#b91c1c" : "#15803d", fontWeight: 700 }}>₹{fmt(liveTotals.balanceCash)}</span>
                <span style={{ color: "#64748b" }}>Stops Done</span>    <span style={{ fontWeight: 700 }}>{liveTotals.completedCount}/{liveTotals.totalCount}</span>
              </div>
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowCompleteModal(false)}>Cancel</Btn>
            <Btn variant="green" onClick={handleCompleteDelivery} disabled={loading}>{loading ? "Completing…" : "🏁 Complete Delivery"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

const page       = { fontFamily: "'Outfit', system-ui, sans-serif", padding: 24, background: "#f8fafc", minHeight: "100vh" };
const pageHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 };
const h1         = { fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 };
const sub        = { fontSize: 13, color: "#64748b", margin: "4px 0 0" };
const FONTS      = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`;