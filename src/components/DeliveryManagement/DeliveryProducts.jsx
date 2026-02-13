/**
 * DeliveryProducts.jsx
 *
 * Three modes controlled by props:
 *  1. wizardMode=true  → product row editor (no deliveryId needed)
 *  2. deliveryId + status="in_progress" → editable delivered quantities
 *  3. deliveryId + status="completed"   → read-only summary table
 */
import React, { useEffect, useState } from "react";
import api from "../../api/client";

export default function DeliveryProducts({
  // ── View/active mode ──
  deliveryId,
  deliveryStatus,

  // ── Wizard mode ──
  wizardMode = false,
  productRows,
  onProductRowsChange,
  availableProducts: wizardProducts,
}) {
  // ── View/active mode state ──
  const [products, setProducts]             = useState([]);
  const [availableProducts, setAvailable]   = useState([]);
  const [loading, setLoading]               = useState(false);
  const [saved, setSaved]                   = useState(null); // id of last saved

  // ── Wizard mode uses parent state ──
  const rows     = wizardMode ? (productRows || [])         : products;
  const setRows  = wizardMode ? onProductRowsChange          : setProducts;

  // ── Load available products list (view/active mode) ──
  useEffect(() => {
    if (wizardMode) return;
    api.get("/target-management/products/")
      .then(r => setAvailable(r.data?.results || r.data || []))
      .catch(() => {});
  }, [wizardMode]);

  // ── Load delivery products (view/active mode) ──
  const fetchProducts = () => {
    if (!deliveryId || wizardMode) return;
    api.get(`/delivery-management/deliveries/${deliveryId}/products/`)
      .then(r => setProducts(r.data?.results || r.data || []))
      .catch(() => setProducts([]));
  };
  useEffect(() => { fetchProducts(); }, [deliveryId, wizardMode]);

  // ── Wizard helpers ──
  const addRow    = () => onProductRowsChange([...productRows, { product: "", loaded_quantity: "", unit_price: "", notes: "" }]);
  const removeRow = (i) => onProductRowsChange(productRows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => onProductRowsChange(productRows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  // ── Active mode: update single product delivered qty ──
  const handleUpdateSingle = async (productId, delivered_quantity) => {
    setLoading(true);
    try {
      await api.patch(`/delivery-management/delivery-products/${productId}/`, { delivered_quantity });
      setSaved(productId);
      setTimeout(() => setSaved(null), 2000);
      fetchProducts();
    } catch { alert("Failed to update product."); }
    finally { setLoading(false); }
  };

  // ── Active mode: change qty in local state ──
  const handleQtyChange = (productId, newQty) => {
    setProducts(p => p.map(x => x.id === productId ? { ...x, delivered_quantity: newQty } : x));
  };

  // ── Active mode: bulk update ──
  const handleBulkUpdate = async () => {
    setLoading(true);
    try {
      const payload = products.map(({ id, product, delivered_quantity }) => ({
        id, product_id: product, delivered_quantity: parseFloat(delivered_quantity || 0)
      }));
      await api.post(`/delivery-management/deliveries/${deliveryId}/products/bulk-update/`, { products: payload });
      setSaved("bulk");
      setTimeout(() => setSaved(null), 2000);
      fetchProducts();
    } catch { alert("Bulk update failed."); }
    finally { setLoading(false); }
  };

  const fmt = (n) => parseFloat(n || 0).toFixed(2);
  const isActive    = deliveryStatus === "in_progress";
  const isCompleted = deliveryStatus === "completed";

  // ─── WIZARD MODE ──────────────────────────────────────────────────────────────
  if (wizardMode) {
    const productList = wizardProducts || [];
    return (
      <div>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
          Add every product the van will carry. Quantities and prices can be updated later.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Product", "Loaded Qty", "Unit Price (₹)", "Notes", ""].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productRows.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "6px 8px", minWidth: 180 }}>
                  <select value={row.product} onChange={e => updateRow(i, "product", e.target.value)} style={cellInput}>
                    <option value="">Select product</option>
                    {productList.map(p => (
                      <option key={p.id} value={p.id}>{p.product_name}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: "6px 8px", width: 110 }}>
                  <input type="number" min="0" value={row.loaded_quantity}
                    onChange={e => updateRow(i, "loaded_quantity", e.target.value)}
                    placeholder="0" style={cellInput} />
                </td>
                <td style={{ padding: "6px 8px", width: 130 }}>
                  <input type="number" min="0" step="0.01" value={row.unit_price}
                    onChange={e => updateRow(i, "unit_price", e.target.value)}
                    placeholder="0.00" style={cellInput} />
                </td>
                <td style={{ padding: "6px 8px" }}>
                  <input value={row.notes} onChange={e => updateRow(i, "notes", e.target.value)}
                    placeholder="Optional" style={cellInput} />
                </td>
                <td style={{ padding: "6px 8px", width: 36, textAlign: "center" }}>
                  {productRows.length > 1 && (
                    <button onClick={() => removeRow(i)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}>
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 10 }}>
          <button onClick={addRow} style={ghostBtn}>+ Add Product</button>
        </div>
      </div>
    );
  }

  // ─── VIEW / ACTIVE MODE ───────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ color: "#1e293b", margin: 0, fontSize: 15, fontWeight: 700 }}>Products</h3>
        {isActive && (
          <button onClick={handleBulkUpdate} disabled={loading} style={primaryBtn}>
            {saved === "bulk" ? "✓ Saved!" : loading ? "Saving…" : "Bulk Update"}
          </button>
        )}
      </div>

      <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={thStyle}>Product</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Loaded</th>
              {(isActive || isCompleted) && (
                <>
                  <th style={{ ...thStyle, textAlign: "right" }}>Delivered</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Balance</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Unit Price</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                </>
              )}
              {isActive && <th style={thStyle}></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 16, color: "#94a3b8", textAlign: "center", fontSize: 13 }}>No products found.</td></tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "9px 12px", fontSize: 13, color: "#0f172a", fontWeight: 500 }}>
                    {p.product_name || p.product}
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: 13, color: "#475569", textAlign: "right", fontFamily: "monospace" }}>
                    {p.loaded_quantity}
                  </td>
                  {(isActive || isCompleted) && (
                    <>
                      <td style={{ padding: "9px 12px", textAlign: "right" }}>
                        {isActive ? (
                          <input type="number" min="0" max={p.loaded_quantity}
                            value={p.delivered_quantity || ""}
                            onChange={e => handleQtyChange(p.id, e.target.value)}
                            style={{ width: 70, padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0", textAlign: "right", fontFamily: "monospace", fontSize: 13 }} />
                        ) : (
                          <span style={{ fontSize: 13, color: "#15803d", fontFamily: "monospace", fontWeight: 600 }}>
                            {fmt(p.delivered_quantity)}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "9px 12px", fontSize: 13, textAlign: "right", fontFamily: "monospace",
                        color: parseFloat(p.balance_quantity) > 0 ? "#a16207" : "#15803d" }}>
                        {fmt(p.balance_quantity)}
                      </td>
                      <td style={{ padding: "9px 12px", fontSize: 13, color: "#64748b", textAlign: "right", fontFamily: "monospace" }}>
                        {p.unit_price ? `₹${fmt(p.unit_price)}` : "—"}
                      </td>
                      <td style={{ padding: "9px 12px", fontSize: 13, color: "#0f172a", fontWeight: 600, textAlign: "right", fontFamily: "monospace" }}>
                        {p.total_amount ? `₹${fmt(p.total_amount)}` : "—"}
                      </td>
                    </>
                  )}
                  {isActive && (
                    <td style={{ padding: "9px 12px", textAlign: "right" }}>
                      <button
                        onClick={() => handleUpdateSingle(p.id, p.delivered_quantity)}
                        style={{ ...updateBtn, background: saved === p.id ? "#dcfce7" : "#f0fdf4", color: saved === p.id ? "#15803d" : "#16a34a" }}>
                        {saved === p.id ? "✓" : "Save"}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {(isActive || isCompleted) && rows.length > 0 && (
            <tfoot>
              <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>TOTAL</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>
                  {fmt(rows.reduce((a, p) => a + parseFloat(p.loaded_quantity || 0), 0))}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#15803d" }}>
                  {fmt(rows.reduce((a, p) => a + parseFloat(p.delivered_quantity || 0), 0))}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>
                  {fmt(rows.reduce((a, p) => a + parseFloat(p.balance_quantity || 0), 0))}
                </td>
                <td></td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#15803d" }}>
                  ₹{fmt(rows.reduce((a, p) => a + parseFloat(p.total_amount || 0), 0))}
                </td>
                {isActive && <td></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left", padding: "8px 12px", fontSize: 11,
  fontWeight: 700, color: "#64748b", textTransform: "uppercase",
  letterSpacing: .4, borderBottom: "1px solid #e2e8f0"
};
const cellInput = {
  width: "100%", padding: "7px 10px", borderRadius: 6,
  border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box", background: "#fff"
};
const ghostBtn = {
  background: "#f1f5f9", color: "#475569", padding: "7px 14px",
  borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", fontSize: 13, fontWeight: 600
};
const primaryBtn = {
  background: "#0f172a", color: "#fff", padding: "7px 16px",
  borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600
};
const updateBtn = {
  padding: "4px 10px", borderRadius: 6, border: "1px solid #bbf7d0",
  cursor: "pointer", fontSize: 12, fontWeight: 600
};