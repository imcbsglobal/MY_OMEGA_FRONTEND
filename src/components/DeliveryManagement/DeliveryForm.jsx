import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function DeliveryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ reference: "", assigned_to: "", status: "pending" });

  useEffect(() => {
    if (id) {
      api.get(`/delivery-management/deliveries/${id}/`).then((res) => setForm(res.data || {})).catch(() => {});
    }
  }, [id]);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.patch(`/delivery-management/deliveries/${id}/`, form);
      } else {
        await api.post(`/delivery-management/deliveries/`, form);
      }
      navigate(`/delivery-management/deliveries`);
    } catch (err) {}
  };

  return (
    <div>
      <h2 style={{color: '#1e293b'}}>{id ? 'Edit Delivery' : 'Create Delivery'}</h2>
      <form onSubmit={save} style={{background: '#ffffff', padding: 12, borderRadius: 8, marginTop: 12}}>
        <div style={{marginBottom:8}}>
          <label>Reference</label>
          <input value={form.reference || ''} onChange={(e)=>setForm({...form, reference: e.target.value})} style={inputStyle} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Assigned To</label>
          <input value={form.assigned_to || ''} onChange={(e)=>setForm({...form, assigned_to: e.target.value})} style={inputStyle} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Status</label>
          <select value={form.status || ''} onChange={(e)=>setForm({...form, status: e.target.value})} style={inputStyle}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <button type="submit" style={{background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 6, border: 'none'}}>Save</button>
        </div>
      </form>
    </div>
  )
}

const inputStyle = {width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e6e6e6', marginTop: 6};
