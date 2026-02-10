import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createCallTarget, updateCallTarget } from "../../api/targetManagement";
import "./targetManagement.css";

export default function CallTargets() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employee: "", date: "", end_date: "" });
  const [updateId, setUpdateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCallTarget(form);
      toast.success("Call target created");
      setForm({ employee: "", date: "", end_date: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create call target");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateId) return toast.warn("Provide ID to update");
    setLoading(true);
    try {
      await updateCallTarget(updateId, form);
      toast.success("Call target updated");
      setUpdateId("");
      setForm({ employee: "", date: "", end_date: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update call target");
    } finally {
      setLoading(false);
    }
  };

  const selectedBtnStyle = {
    background: '#ef4444', color: '#fff', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: 8
  };
  const unselectedBtnStyle = {
    background: '#fff', color: '#111827', border: '1px solid #e6e6e6', padding: '6px 12px', borderRadius: 8
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="assign-header" style={{background:'#fff5f5', padding:'12px 16px', borderBottom:'1px solid #fdeaea', borderTopLeftRadius:8, borderTopRightRadius:8}}>
              <div className="d-flex align-items-center">
                <div className="assign-header-icon" style={{background:'#fee2e2', padding:8, borderRadius:8, display:'inline-flex'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2H15C16.1046 2 17 2.89543 17 4V20C17 21.1046 16.1046 22 15 22H9C7.89543 22 7 21.1046 7 20V4C7 2.89543 7.89543 2 9 2Z" fill="#fff"/>
                    <path d="M8 7H16" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 11H16" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h6 className="mb-0 ms-2">Assign Call Target</h6>
              </div>
              <button className="btn btn-sm btn-link back-link" onClick={() => navigate(-1)} style={{color:'#6b7280'}}>
                ← Back to List
              </button>
            </div>

            <div className="card-body">
              <form onSubmit={handleCreate}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Employee *</label>
                    <input name="employee" value={form.employee} onChange={handleChange} className="form-control" placeholder="Select Employee" />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Select Target Period *</label>
                    <div style={{display:'flex', gap:8, marginTop:8}}>
                      <button type="button" onClick={() => setSelectedPeriod('current')} style={selectedPeriod === 'current' ? selectedBtnStyle : unselectedBtnStyle}>Current Week</button>
                      <button type="button" onClick={() => setSelectedPeriod('next')} style={selectedPeriod === 'next' ? selectedBtnStyle : unselectedBtnStyle}>Next Week</button>
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Start Date *</label>
                    <input name="date" type="date" value={form.date} onChange={handleChange} className="form-control" />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">End Date *</label>
                    <input name="end_date" type="date" value={form.end_date || ''} onChange={(e) => setForm(s => ({ ...s, end_date: e.target.value }))} className="form-control" />
                  </div>
                </div>

                <div style={{background:'#fff5f5', border:'1px solid #fdeaea', borderRadius:8, padding:12, display:'flex', alignItems:'center', gap:10}} className="mb-3">
                  <input className="form-check-input" type="checkbox" id="autoGenerate" checked={false} readOnly />
                  <label className="form-check-label ms-2" htmlFor="autoGenerate" style={{margin:0}}>Auto-generate daily targets for the selected period</label>
                </div>

                <div className="mb-3">
                  <label className="form-label">General Notes</label>
                  <textarea name="notes" className="form-control" placeholder="Optional notes about this call target assignment" style={{minHeight:100, borderRadius:8}} />
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="isActive" checked readOnly />
                  <label className="form-check-label ms-2" htmlFor="isActive">Active</label>
                </div>

                <div className="form-actions-left" style={{display:'flex', gap:12}}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)} style={{borderRadius:8, padding:'8px 14px'}}>Cancel</button>
                  <button type="submit" className="btn btn-danger" disabled={loading} style={{borderRadius:8, padding:'8px 14px'}}>{loading ? 'Saving...' : 'Assign Call Target'}</button>
                </div>
              </form>

              <div className="mt-4" style={{ borderTop: '1px solid #fdeaea', paddingTop: 12 }}>
                <form className="d-flex gap-2 align-items-center" onSubmit={handleUpdate}>
                  <input placeholder="ID to update" value={updateId} onChange={(e) => setUpdateId(e.target.value)} className="form-control" style={{ maxWidth: 240 }} />
                  <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Updating...' : 'Update Call Target'}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
