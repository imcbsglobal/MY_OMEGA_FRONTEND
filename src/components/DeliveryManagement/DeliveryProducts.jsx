import React, { useEffect, useState } from "react";
import api from "../../api/client";

export default function DeliveryProducts({ deliveryId }) {
  const [products, setProducts] = useState([]);

  const fetchProducts = () => {
    if (deliveryId) {
      api
        .get(`/delivery-management/deliveries/${deliveryId}/products/`)
        .then((res) => setProducts(res.data || []))
        .catch(() => setProducts([]));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [deliveryId]);

  const handleQuantityChange = (productId, newQuantity) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  const handleUpdateSingleProduct = (productId, quantity) => {
    api
      .patch(`/delivery-management/delivery-products/${productId}/`, { quantity })
      .then(() => {
        alert("Product updated successfully!");
        fetchProducts();
      })
      .catch(() => alert("Failed to update product."));
  };

  const handleBulkUpdate = () => {
    const updatedProducts = products.map(({ id, quantity }) => ({ id, quantity }));
    api
      .post(
        `/delivery-management/deliveries/${deliveryId}/products/bulk-update/`,
        { products: updatedProducts }
      )
      .then(() => {
        alert("Bulk update successful!");
        fetchProducts();
      })
      .catch(() => alert("Bulk update failed."));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ color: "#1e293b" }}>Products for Delivery #{deliveryId}</h3>
        <button onClick={handleBulkUpdate} style={buttonStyle}>
          Bulk Update
        </button>
      </div>
      <div style={{ marginTop: 12, background: "#ffffff", padding: 12, borderRadius: 8 }}>
        <table style={{ width: "100%" }}>
          <thead>
            <tr style={{ background: "#fff5f5" }}>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Quantity</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length ? (
              products.map((p) => (
                <tr key={p.id}>
                  <td style={td}>{p.id}</td>
                  <td style={td}>{p.name || p.product || "-"}</td>
                  <td style={td}>
                    <input
                      type="number"
                      value={p.quantity || p.qty || ""}
                      onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => handleUpdateSingleProduct(p.id, p.quantity)}
                      style={updateButtonStyle}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: 12, color: "#64748b" }}>
                  No products found.
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
const inputStyle = {
  padding: "4px 8px",
  borderRadius: 4,
  border: "1px solid #cbd5e1",
  width: "60px",
};
const buttonStyle = {
  background: "#fee2e2",
  color: "#dc2626",
  padding: "8px 12px",
  borderRadius: 8,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
};
const updateButtonStyle = {
  background: "#dcfce7",
  color: "#16a34a",
  padding: "4px 8px",
  borderRadius: 4,
  border: "none",
  cursor: "pointer",
};
