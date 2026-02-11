import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";

export default function DeliveryProducts() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (id) {
      api.get(`/delivery-management/deliveries/${id}/products/`).then((res)=>setProducts(res.data || [])).catch(()=>setProducts([]));
    }
  }, [id]);

  return (
    <div>
      <h3 style={{color: '#1e293b'}}>Products for Delivery #{id}</h3>
      <div style={{marginTop:12, background:'#ffffff', padding:12, borderRadius:8}}>
        <table style={{width:'100%'}}>
          <thead>
            <tr style={{background:'#fff5f5'}}>
              <th style={{padding:8, textAlign:'left', color:'#7f1d1d'}}>ID</th>
              <th style={{padding:8, textAlign:'left'}}>Name</th>
              <th style={{padding:8, textAlign:'left'}}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.length ? products.map(p=> (
              <tr key={p.id}>
                <td style={{padding:8}}>{p.id}</td>
                <td style={{padding:8}}>{p.name || p.product || '-'}</td>
                <td style={{padding:8}}>{p.quantity || p.qty || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} style={{padding:12, color:'#64748b'}}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
