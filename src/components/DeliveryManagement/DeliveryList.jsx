import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    api
      .get("/delivery-management/deliveries/")
      .then((res) => setDeliveries(res.data || []))
      .catch(() => setDeliveries([]));
  }, []);

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2 style={{color: '#1e293b'}}>Delivery Management</h2>
        <Link to="/delivery-management/deliveries/new" style={{background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, textDecoration: 'none'}}>Create Delivery</Link>
      </div>

      <div style={{marginTop: 16, background: '#ffffff', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#fff5f5'}}>
              <th style={th}>ID</th>
              <th style={th}>Reference</th>
              <th style={th}>Status</th>
              <th style={th}>Assigned To</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries && deliveries.length > 0 ? (
              deliveries.map((d) => (
                <tr key={d.id}>
                  <td style={td}>{d.id}</td>
                  <td style={td}>{d.reference || d.code || '-'}</td>
                  <td style={td}>{d.status || '-'}</td>
                  <td style={td}>{d.assigned_to?.name || d.assigned_to || '-'}</td>
                  <td style={td}>
                    <Link to={`/delivery-management/deliveries/${d.id}`} style={linkStyle}>View</Link>
                    <Link to={`/delivery-management/deliveries/${d.id}/edit`} style={linkStyle}>Edit</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{padding: 12, color: '#64748b'}}>No deliveries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {textAlign: 'left', padding: '8px 12px', color: '#7f1d1d'};
const td = {padding: '8px 12px', borderTop: '1px solid #f1f5f9', color: '#0f172a'};
const linkStyle = {marginRight: 12, color: '#dc2626', textDecoration: 'none', fontWeight: 600};
