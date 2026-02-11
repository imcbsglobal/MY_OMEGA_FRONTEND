import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";

export default function DeliveryStops() {
  const { id } = useParams();
  const [stops, setStops] = useState([]);

  useEffect(() => {
    if (id) {
      api.get(`/delivery-management/deliveries/${id}/stops/`).then((res) => setStops(res.data || [])).catch(() => setStops([]));
    }
  }, [id]);

  return (
    <div>
      <h3 style={{color: '#1e293b'}}>Stops for Delivery #{id}</h3>
      <div style={{marginTop:12, background:'#ffffff', padding:12, borderRadius:8}}>
        <table style={{width:'100%'}}>
          <thead>
            <tr style={{background:'#fff5f5'}}>
              <th style={{padding:8, textAlign:'left', color:'#7f1d1d'}}>ID</th>
              <th style={{padding:8, textAlign:'left'}}>Address</th>
              <th style={{padding:8, textAlign:'left'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stops.length ? stops.map(s=> (
              <tr key={s.id}>
                <td style={{padding:8}}>{s.id}</td>
                <td style={{padding:8}}>{s.address || s.location || '-'}</td>
                <td style={{padding:8}}>{s.status || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} style={{padding:12, color:'#64748b'}}>No stops found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
