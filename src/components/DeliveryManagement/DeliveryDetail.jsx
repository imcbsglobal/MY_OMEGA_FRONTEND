import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";

export default function DeliveryDetail() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);

  useEffect(() => {
    if (id) {
      api.get(`/delivery-management/deliveries/${id}/`).then((res) => setDelivery(res.data)).catch(() => setDelivery(null));
    }
  }, [id]);

  if (!delivery) return <div>Loading...</div>;

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{color: '#1e293b'}}>Delivery #{delivery.id}</h2>
        <div>
          <Link to={`/delivery-management/deliveries/${id}/edit`} style={{marginRight:12, color:'#dc2626'}}>Edit</Link>
          <Link to={`/delivery-management/deliveries/${id}/stops`} style={{background: '#fee2e2', color:'#dc2626', padding: '6px 10px', borderRadius:6, textDecoration:'none'}}>Stops</Link>
        </div>
      </div>

      <div style={{marginTop:12, background:'#ffffff', padding:12, borderRadius:8}}>
        <div><strong>Reference:</strong> {delivery.reference || '-'}</div>
        <div><strong>Status:</strong> {delivery.status || '-'}</div>
        <div><strong>Assigned To:</strong> {delivery.assigned_to?.name || delivery.assigned_to || '-'}</div>
      </div>
    </div>
  );
}
