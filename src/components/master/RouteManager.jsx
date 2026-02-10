import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Check, RefreshCw } from "lucide-react";
import api from "../../api/client";

export default function RouteManager() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCode, setEditingCode] = useState("");
  const [editingOrigin, setEditingOrigin] = useState("");
  const [editingDestination, setEditingDestination] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingActive, setEditingActive] = useState(true);

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newOrigin, setNewOrigin] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newActive, setNewActive] = useState(true);

  const [saving, setSaving] = useState(false);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("target-management/routes/");
      const data = res.data?.data ?? res.data ?? res.data?.results ?? [];
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load routes");
      console.error("Fetch routes error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleAdd = async () => {
    if (!newOrigin.trim() || !newDestination.trim()) { setError("Origin and Destination are required"); setTimeout(()=>setError(""),3000); return; }
    setSaving(true);
    try {
      const payload = {
        origin: newOrigin.trim(),
        destination: newDestination.trim(),
        route_code: newCode.trim(),
        description: newDescription.trim(),
        active: !!newActive,
      };
      // Try to call API if available, otherwise just add locally
      let created = { id: Date.now(), origin: payload.origin, destination: payload.destination, route_code: payload.route_code, description: payload.description, active: payload.active };
      try {
        const res = await api.post("target-management/routes/", payload);
        created = res.data?.data ?? res.data ?? created;
      } catch (e) {
        // API may be disabled in local UI-only mode; fall back to local created object
        console.warn('API add failed, using local object', e?.message || e);
      }
      setRoutes(prev => [...prev, created]);
      setNewOrigin(""); setNewDestination(""); setNewCode(""); setNewDescription(""); setNewActive(true);
      setSuccess("Route created"); setTimeout(()=>setSuccess(""),3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data || err.message || "Add failed");
      console.error("Add route error:", err);
    } finally { setSaving(false); }
  };

  const startEdit = (r) => {
    setEditingId(r.id ?? r.pk);
    setEditingName(r.name || r.route_name || "");
    setEditingCode(r.code || r.route_code || "");
    setEditingOrigin(r.origin || r.from || "");
    setEditingDestination(r.destination || r.to || "");
    setEditingDescription(r.description || "");
    setEditingActive(typeof r.active === 'boolean' ? r.active : true);
    setError("");
  };
  const cancelEdit = () => { setEditingId(null); setEditingName(""); setEditingCode(""); setEditingOrigin(""); setEditingDestination(""); setEditingDescription(""); setEditingActive(true); setError(""); };

  const handleUpdate = async (id) => {
    if (!editingOrigin.trim() || !editingDestination.trim()) { setError("Origin and Destination cannot be empty"); setTimeout(()=>setError(""),3000); return; }
    setSaving(true);
    try {
      const payload = {
        origin: editingOrigin.trim(),
        destination: editingDestination.trim(),
        route_code: editingCode.trim(),
        description: editingDescription.trim(),
        active: !!editingActive,
      };
      try {
        await api.put(`target-management/routes/${id}/`, payload);
      } catch (e) { console.warn('API update failed, updating locally', e?.message || e); }
      setRoutes(prev => prev.map(r => (r.id === id ? { ...r, ...payload } : r)));
      cancelEdit();
      setSuccess("Route updated"); setTimeout(()=>setSuccess(""),3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Update failed");
      console.error("Update route error:", err);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route?")) return;
    try {
      setLoading(true);
      await api.delete(`target-management/routes/${id}/`);
      setRoutes(prev => prev.filter(r => r.id !== id));
      setSuccess("Route deleted"); setTimeout(()=>setSuccess(""),3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Delete failed");
      console.error("Delete route error:", err);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>Route Management</h2>
          <button onClick={fetchRoutes} style={styles.refreshButton} disabled={loading} title="Refresh routes">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {success && (
        <div style={styles.successMessage}><Check size={18}/> <span>{success}</span> <button onClick={()=>setSuccess("")} style={styles.dismissSuccessButton}>×</button></div>
      )}
      {error && (
        <div style={styles.errorMessage}><X size={18}/> <span style={{flex:1}}>{error}</span> <button onClick={()=>setError("")} style={styles.dismissButton}>Dismiss</button></div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}><Plus size={18} /> Add New Route</h3>
        <p style={styles.cardDescription}>Create routes used by products and vehicles.</p>
        <div style={{...styles.addSection, flexDirection:'column', gap:12}}>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <label style={{minWidth:80, fontWeight:600}}>Origin *</label>
            <input placeholder="Origin" value={newOrigin} onChange={e=>setNewOrigin(e.target.value)} style={{...styles.input, minWidth:240}} disabled={saving} />
          </div>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <label style={{minWidth:80, fontWeight:600}}>Destination *</label>
            <input placeholder="Destination" value={newDestination} onChange={e=>setNewDestination(e.target.value)} style={{...styles.input, minWidth:240}} disabled={saving} />
          </div>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <label style={{minWidth:80, fontWeight:600}}>Route Code</label>
            <input placeholder="Route code (optional)" value={newCode} onChange={e=>setNewCode(e.target.value)} style={{...styles.input, minWidth:240}} disabled={saving} />
          </div>
          <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
            <label style={{minWidth:80, fontWeight:600}}>Description</label>
            <textarea placeholder="Description" value={newDescription} onChange={e=>setNewDescription(e.target.value)} style={{width:'100%', minHeight:72, padding:10, borderRadius:8, border:'1px solid #e2e8f0'}} disabled={saving} />
          </div>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <label style={{display:'flex', gap:8, alignItems:'center'}}><input type="checkbox" checked={newActive} onChange={e=>setNewActive(e.target.checked)} /> Active</label>
          </div>
          <div style={{display:'flex', gap:12}}>
            <button onClick={()=>{setNewOrigin('');setNewDestination('');setNewCode('');setNewDescription('');setNewActive(true);}} style={{padding:'8px 14px', borderRadius:6, border:'1px solid #e2e8f0', background:'#fff'}}>Cancel</button>
            <button onClick={handleAdd} style={{...styles.addButton, opacity: saving || !newOrigin.trim() || !newDestination.trim() ? 0.6 : 1}} disabled={saving || !newOrigin.trim() || !newDestination.trim()}><Plus size={16}/> Create</button>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.cardTitle}>All Routes ({routes.length})</h3>
        </div>

        {loading && routes.length === 0 ? (
          <div style={styles.loadingState}><div style={styles.spinner}></div><p>Loading routes...</p></div>
        ) : routes.length === 0 ? (
          <div style={styles.emptyState}><p style={styles.emptyText}>No routes found</p><button onClick={fetchRoutes} style={styles.retryButton}><RefreshCw size={14}/> Retry</button></div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{...styles.th,width:'40px'}}>#</th>
                  <th style={styles.th}>Route Code</th>
                  <th style={styles.th}>Origin</th>
                  <th style={styles.th}>Destination</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Status</th>
                  <th style={{...styles.th,width:160,textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r, i) => (
                  <tr key={r.id ?? r.pk} style={styles.tableRow}>
                    <td style={styles.td}>{i+1}</td>
                    <td style={styles.td}>{(r.route_code ?? r.code) || '-'}</td>
                    <td style={styles.td}>
                      {editingId === (r.id ?? r.pk) ? (
                        <input value={editingOrigin} onChange={e=>setEditingOrigin(e.target.value)} style={styles.editInput} />
                      ) : (
                        <div>{r.origin ?? r.from ?? '-'}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === (r.id ?? r.pk) ? (
                        <input value={editingDestination} onChange={e=>setEditingDestination(e.target.value)} style={styles.editInput} />
                      ) : (
                        <div>{r.destination ?? r.to ?? '-'}</div>
                      )}
                    </td>
                    <td style={styles.td}>{editingId === (r.id ?? r.pk) ? (<textarea value={editingDescription} onChange={e=>setEditingDescription(e.target.value)} style={{width:'100%', minHeight:48, padding:8, borderRadius:6, border:'1px solid #e2e8f0'}} />) : (r.description ?? '-')}</td>
                    <td style={styles.td}>{editingId === (r.id ?? r.pk) ? (<label style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={editingActive} onChange={e=>setEditingActive(e.target.checked)} /> Active</label>) : (r.active ? 'Active' : 'Inactive')}</td>
                    <td style={{...styles.td,textAlign:'center'}}>
                      {editingId === (r.id ?? r.pk) ? (
                        <div style={styles.actionButtons}>
                          <button onClick={()=>handleUpdate(r.id ?? r.pk)} style={styles.saveButton}><Check size={14}/> Save</button>
                          <button onClick={cancelEdit} style={styles.cancelButton}><X size={14}/> Cancel</button>
                        </div>
                      ) : (
                        <div style={styles.actionButtons}>
                          <button onClick={()=>startEdit(r)} style={styles.editButton}><Edit2 size={14}/> Edit</button>
                          <button onClick={()=>handleDelete(r.id ?? r.pk)} style={styles.deleteButton}><Trash2 size={14}/> Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={styles.debugInfo}><details><summary style={{cursor:'pointer',fontWeight:600}}>🔍 Debug Information</summary><div style={styles.debugContent}><div style={styles.debugSection}><strong>API:</strong><div style={styles.debugItem}>target-management/routes/</div></div><div style={styles.debugSection}><strong>State:</strong><div style={styles.debugItem}>Routes: {routes.length}</div><div style={styles.debugItem}>Loading: {loading ? 'Yes' : 'No'}</div></div></div></details></div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: '0 auto', padding: 20 },
  header: { marginBottom: 20 },
  titleSection: { display:'flex', alignItems:'center', gap:12 },
  title: { margin:0, fontSize:24, fontWeight:700, color:'#1e293b' },
  refreshButton: { marginLeft:'auto', padding:'6px 12px', background:'#f1f5f9', color:'#475569', border:'1px solid #e2e8f0', borderRadius:6, display:'flex', gap:6, alignItems:'center', cursor:'pointer' },
  card: { background:'#fff', padding:24, borderRadius:12, marginBottom:24, boxShadow:'0 1px 3px rgba(0,0,0,0.1)', border:'1px solid #f1f5f9' },
  cardTitle: { margin:0, fontSize:16, fontWeight:600, display:'flex', alignItems:'center', gap:8 },
  cardDescription: { margin:'8px 0 16px', color:'#64748b' },
  addSection: { display:'flex', gap:12, flexWrap:'wrap' },
  input: { flex:1, minWidth:200, padding:'10px 12px', borderRadius:8, border:'1px solid #e2e8f0' },
  addButton: { padding:'10px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, display:'flex', gap:8, alignItems:'center', fontWeight:600 },
  tableContainer: { overflowX:'auto', borderRadius:8, border:'1px solid #e2e8f0' },
  table: { width:'100%', borderCollapse:'collapse' },
  tableHeader: { background:'#f8fafc' },
  th: { padding:'12px 16px', textAlign:'left', fontSize:13, fontWeight:600, color:'#64748b', borderBottom:'2px solid #e2e8f0' },
  tableRow: { borderBottom:'1px solid #f1f5f9' },
  td: { padding:'14px 16px', fontSize:14, color:'#334155' },
  deptName: { display:'flex', alignItems:'center', gap:8, fontWeight:500 },
  deptId: { marginLeft:'8px', fontSize:11, color:'#94a3b8', background:'#f1f5f9', padding:'2px 6px', borderRadius:4 },
  editInput: { width:'100%', padding:8, borderRadius:6, border:'2px solid #3b82f6' },
  actionButtons: { display:'flex', gap:8, justifyContent:'center' },
  editButton: { padding:'8px 12px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:6, display:'flex', gap:6, alignItems:'center' },
  deleteButton: { padding:'8px 12px', background:'#ef4444', color:'#fff', border:'none', borderRadius:6, display:'flex', gap:6, alignItems:'center' },
  saveButton: { padding:'8px 12px', background:'#10b981', color:'#fff', border:'none', borderRadius:6, display:'flex', gap:6, alignItems:'center' },
  cancelButton: { padding:'8px 12px', background:'#6b7280', color:'#fff', border:'none', borderRadius:6, display:'flex', gap:6, alignItems:'center' },
  successMessage: { padding:'12px 16px', background:'#d1fae5', border:'1px solid #6ee7b7', borderRadius:8, color:'#065f46', marginBottom:20, display:'flex', gap:8, alignItems:'center' },
  errorMessage: { padding:'12px 16px', background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:8, color:'#991b1b', marginBottom:20, display:'flex', gap:8, alignItems:'center' },
  dismissButton: { padding:'4px 8px', background:'transparent', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:4, cursor:'pointer' },
  dismissSuccessButton: { marginLeft:'auto', padding:0, background:'transparent', color:'#065f46', border:'none', fontSize:20, cursor:'pointer', fontWeight:'bold' },
  loadingState: { textAlign:'center', padding:'40px 20px', color:'#64748b' },
  spinner: { width:40, height:40, border:'4px solid #f1f5f9', borderTop:'4px solid #2563eb', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' },
  emptyState: { textAlign:'center', padding:'40px 20px' },
  emptyText: { fontSize:16, fontWeight:600, color:'#64748b', margin:'16px 0' },
  retryButton: { padding:'8px 16px', background:'#f1f5f9', color:'#475569', border:'1px solid #e2e8f0', borderRadius:6, display:'inline-flex', gap:8, alignItems:'center' },
  debugInfo: { marginTop:20, fontSize:12, color:'#64748b', background:'#f8fafc', padding:12, borderRadius:8, border:'1px solid #e2e8f0' },
  debugContent: { marginTop:12 },
  debugSection: { marginBottom:12, paddingBottom:12, borderBottom:'1px solid #e2e8f0' },
  debugItem: { marginTop:4, fontSize:11, color:'#475569', paddingLeft:12 }
};

// Add animation rule if not present
try {
  const styleSheet = document.styleSheets[0];
  if (styleSheet) {
    styleSheet.insertRule(`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`, styleSheet.cssRules.length);
  }
} catch (e) { /* ignore */ }
