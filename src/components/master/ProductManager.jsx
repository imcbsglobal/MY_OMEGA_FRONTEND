import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Check, RefreshCw } from "lucide-react";
import tm from "../../api/targetManagement";
import api from "../../api/client";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRoute, setNewRoute] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCode, setEditingCode] = useState("");
  const [editingRoute, setEditingRoute] = useState("");

  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await tm.getProducts();
      const list = Array.isArray(res) ? res : (res?.results ?? res ?? []);
      // normalize backend fields to frontend-friendly keys
      setProducts(list.map(p => ({
        id: p.id ?? p.pk,
        product_name: p.product_name ?? p.name,
        product_code: p.product_code ?? p.code,
        route: p.route ?? null,
        ...p
      })));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load products");
      console.error("Fetch products error:", err);
    } finally { setLoading(false); }
  };

  const fetchRoutes = async () => {
    try {
      const r = await tm.getRoutes();
      const list = Array.isArray(r) ? r : (r?.results ?? r ?? []);
      setRoutes(list.map(x => ({ id: x.id ?? x.pk, name: x.route_name ?? x.name ?? `${x.origin} → ${x.destination}`, ...x })));
    } catch (err) { console.warn(err); }
  };

  useEffect(() => { fetchProducts(); fetchRoutes(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) { setError("Please enter product name"); setTimeout(()=>setError(""),3000); return; }
    setSaving(true);
    try {
      const payload = { product_name: newName.trim(), product_code: newCode.trim() };
      if (newRoute) payload.route = newRoute;
      const res = await tm.createProduct(payload);
      const created = res?.results ? res.results[0] : res || res?.data || res;
      setProducts(prev => [...prev, created]);
      setNewName(""); setNewCode(""); setNewRoute("");
      setSuccess("Product created"); setTimeout(()=>setSuccess(""),3000);
    } catch (err) {
      setError(err.response?.data || err.message || "Create failed");
      console.error("Create product error:", err);
    } finally { setSaving(false); }
  };

  const startEdit = (p) => {
    setEditingId(p.id ?? p.pk);
    setEditingName((p.product_name ?? p.name) || "");
    setEditingCode((p.product_code ?? p.code) || "");
    setEditingRoute(p.route?.id ?? p.route_id ?? p.route ?? "");
    setError("");
  };

  const cancelEdit = () => { setEditingId(null); setEditingName(""); setEditingCode(""); setEditingRoute(""); setError(""); };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) { setError("Product name required"); setTimeout(()=>setError(""),3000); return; }
    setSaving(true);
    try {
      const payload = { product_name: editingName.trim(), product_code: editingCode.trim() };
      if (editingRoute) payload.route = editingRoute;
      const res = await tm.updateProduct(id, payload);
      const updated = res || res?.data || payload;
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
      cancelEdit();
      setSuccess("Product updated"); setTimeout(()=>setSuccess(""),3000);
    } catch (err) {
      setError(err.response?.data || err.message || "Update failed");
      console.error("Update product error:", err);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      setLoading(true);
      await api.delete(`target-management/products/${id}/`);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSuccess("Product deleted"); setTimeout(()=>setSuccess(""),3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Delete failed");
      console.error("Delete product error:", err);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>Product Management</h2>
          <button onClick={fetchProducts} style={styles.refreshButton} disabled={loading}><RefreshCw size={14}/> Refresh</button>
        </div>
      </div>

      {success && (<div style={styles.successMessage}><Check size={18}/> <span>{success}</span> <button onClick={()=>setSuccess("")} style={styles.dismissSuccessButton}>×</button></div>)}
      {error && (<div style={styles.errorMessage}><X size={18}/> <span style={{flex:1}}>{error}</span> <button onClick={()=>setError("")} style={styles.dismissButton}>Dismiss</button></div>)}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}><Plus size={18}/> Add New Product</h3>
        <p style={styles.cardDescription}>Create products and assign them to routes.</p>
        <div style={styles.addSection}>
          <input placeholder="Product name" value={newName} onChange={e=>setNewName(e.target.value)} style={styles.input} disabled={saving} />
          <input placeholder="Product code" value={newCode} onChange={e=>setNewCode(e.target.value)} style={styles.input} disabled={saving} />
          <select value={newRoute} onChange={e=>setNewRoute(e.target.value)} style={{...styles.input,minWidth:160}}>
            <option value="">-- none --</option>
            {routes.map(r=> <option key={r.id ?? r.pk} value={r.id ?? r.pk}>{r.name ?? r.route_name}</option>)}
          </select>
          <button onClick={handleAdd} style={{...styles.addButton, opacity: saving || !newName.trim() ? 0.6 : 1}} disabled={saving || !newName.trim()}><Plus size={16}/> Add</button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}><h3 style={styles.cardTitle}>All Products ({products.length})</h3></div>

        {loading && products.length === 0 ? (
          <div style={styles.loadingState}><div style={styles.spinner}></div><p>Loading products...</p></div>
        ) : products.length === 0 ? (
          <div style={styles.emptyState}><p style={styles.emptyText}>No products found</p><button onClick={fetchProducts} style={styles.retryButton}><RefreshCw size={14}/> Retry</button></div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead><tr style={styles.tableHeader}><th style={{...styles.th,width:'60px'}}>#</th><th style={styles.th}>Product</th><th style={styles.th}>Code</th><th style={{...styles.th,width:200,textAlign:'center'}}>Actions</th></tr></thead>
              <tbody>
                {products.map((p,i)=> (
                  <tr key={p.id ?? p.pk} style={styles.tableRow}>
                    <td style={styles.td}>{i+1}</td>
                    <td style={styles.td}>
                      {editingId === (p.id ?? p.pk) ? (
                        <input value={editingName} onChange={e=>setEditingName(e.target.value)} style={styles.editInput} />
                      ) : (
                        <div style={styles.deptName}>{p.name ?? p.product_name}<span style={styles.deptId}>Route: {p.route?.name ?? p.route_name ?? '-'}</span></div>
                      )}
                    </td>
                    <td style={styles.td}>{editingId === (p.id ?? p.pk) ? (<input value={editingCode} onChange={e=>setEditingCode(e.target.value)} style={styles.editInput} />) : (p.code ?? p.product_code)}</td>
                    <td style={{...styles.td,textAlign:'center'}}>
                      {editingId === (p.id ?? p.pk) ? (
                        <div style={styles.actionButtons}><button onClick={()=>handleUpdate(p.id ?? p.pk)} style={styles.saveButton}><Check size={14}/> Save</button><button onClick={cancelEdit} style={styles.cancelButton}><X size={14}/> Cancel</button></div>
                      ) : (
                                                <div style={styles.actionButtons}>
                          <button onClick={() => startEdit(p)} style={styles.editButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'green'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button onClick={() => handleDelete(p.id ?? p.pk)} style={styles.deleteButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'red'}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
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

      <div style={styles.debugInfo}><details><summary style={{cursor:'pointer',fontWeight:600}}>🔍 Debug Information</summary><div style={styles.debugContent}><div style={styles.debugSection}><strong>API:</strong><div style={styles.debugItem}>target-management/products/</div></div><div style={styles.debugSection}><strong>State:</strong><div style={styles.debugItem}>Products: {products.length}</div></div></div></details></div>
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
  input: { flex:1, minWidth:160, padding:'10px 12px', borderRadius:8, border:'1px solid #e2e8f0' },
  addButton: { padding:'10px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, display:'flex', gap:8, alignItems:'center', fontWeight:600 },
  tableContainer: { overflowX:'auto', borderRadius:8, border:'1px solid #e2e8f0' },
  table: { width:'100%', borderCollapse:'collapse' },
  tableHeader: { background:'#f8fafc' },
  th: { padding:'12px 16px', textAlign:'left', fontSize:13, fontWeight:600, color:'#64748b', borderBottom:'2px solid #e2e8f0' },
  tableRow: { borderBottom:'1px solid #f1f5f9' },
  td: { padding:'14px 16px', fontSize:14, color:'#334155' },
  deptName: { display:'flex', alignItems:'center', gap:8, fontWeight:500 },
  deptId: { marginLeft:8, fontSize:11, color:'#94a3b8', background:'#f1f5f9', padding:'2px 6px', borderRadius:4 },
  editInput: { width:'100%', padding:8, borderRadius:6, border:'2px solid #3b82f6' },
  actionButtons: { display:'flex', gap:8, justifyContent:'center' },
  editButton: { padding:'8px 12px', background:'transparent', color:'#10b981', border:'none', borderRadius:6, display:'flex', gap:6, alignItems:'center' },
  deleteButton: { padding:'8px 12px', background:'transparent', color:'#ef4444', border:'none', borderRadius:6, display:'flex', gap:6, alignItems:'center' },
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

try { const styleSheet = document.styleSheets[0]; if (styleSheet) styleSheet.insertRule(`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`, styleSheet.cssRules.length); } catch (e) {}
