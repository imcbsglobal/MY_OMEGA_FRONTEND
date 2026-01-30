import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../api/client';

export default function VehicleChallan() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userLevel = user?.user_level || 'User';
  const isAdmin = userLevel === 'Admin' || userLevel === 'Super Admin';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_name: '',
    owner_name: '',
    detail_date: new Date().toISOString().slice(0, 10),
    challan_number: '',
    challan_date: new Date().toISOString().slice(0, 10),
    offence_type: '',
    location: '',
    fine_amount: '',
    remarks: '',
    paid: false,
  });

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // Replace with real API when available
      // const res = await api.get('/vehicle/list/');
      // setVehicles(res.data || []);
      setVehicles([
        { id: 1, date: '20 Nov 2025', number: 'KL 73 D 5309', name: 'BAJAJ BIKE', owner: 'OMEGA', remarks: '—', challan_date: '20-11-2025', challan_number: 'CH-001', offence_type: 'Speeding', location: 'Downtown', fine_amount: '500', paid: false },
        { id: 2, date: '20 Nov 2025', number: 'KL09AS2119', name: 'SWIFT', owner: 'AKSHAY', remarks: '—', challan_date: '20-11-2025', challan_number: 'CH-002', offence_type: 'Parking', location: 'Mall', fine_amount: '250', paid: true },
        { id: 3, date: '20 Nov 2025', number: 'KL12L3234', name: 'SUZUKI ACCESS SCOOTER', owner: 'OMEGA', remarks: '—', challan_date: '20-11-2025', challan_number: 'CH-003', offence_type: 'Red Light', location: 'Junction', fine_amount: '1000', paid: false },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => setView('add');

  const handleCancel = () => {
    setView('list');
    setFormData({ vehicle_number: '', vehicle_name: '', owner_name: '', detail_date: new Date().toISOString().slice(0, 10), challan_number: '', challan_date: new Date().toISOString().slice(0, 10), offence_type: '', location: '', fine_amount: '', remarks: '', paid: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send to API
    const newItem = {
      id: vehicles.length + 1,
      date: formData.detail_date,
      number: formData.vehicle_number || 'N/A',
      name: formData.vehicle_name || '-',
      owner: formData.owner_name || '-',
      remarks: formData.remarks || '—',
      challan_date: formData.challan_date || '',
      challan_number: formData.challan_number || '',
      offence_type: formData.offence_type || '',
      location: formData.location || '',
      fine_amount: formData.fine_amount || '',
      paid: formData.paid || false,
    };
    setVehicles(prev => [newItem, ...prev]);
    setView('list');
  };

  const togglePaid = (id) => setVehicles(prev => prev.map(v => v.id === id ? { ...v, paid: !v.paid } : v));

  if (!isAdmin) return null;

  const renderAddVehicleForm = () => (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.formHeading}>Add Vehicle Detail</h2>
        <div style={styles.breadcrumbs}><a href="/vehicle/challan">Vehicle Details</a> / Add New</div>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.formCol}>
              <label style={styles.label}>Vehicle Number *</label>
              <input value={formData.vehicle_number} onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })} style={styles.input} placeholder="e.g. KL 73 D 5309" required />
              <div style={styles.muted}>Type or paste the vehicle number</div>
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Vehicle Name</label>
              <input value={formData.vehicle_name} onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })} style={styles.input} placeholder="Vehicle model/name" />
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Owner Name</label>
              {
                (() => {
                  const owners = Array.from(new Set(vehicles.map(v => v.owner).filter(Boolean)));
                  const selected = formData.owner_name || '';
                  return (
                    <>
                      <select value={selected} onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__other__') {
                          setFormData({ ...formData, owner_name: '__other__' });
                        } else {
                          setFormData({ ...formData, owner_name: val });
                          setCustomOwner('');
                        }
                      }} style={styles.input}>
                        <option value="">Select owner</option>
                        {owners.map((o) => <option key={o} value={o}>{o}</option>)}
                        <option value="__other__">Other (add new)</option>
                      </select>

                      {formData.owner_name === '__other__' && (
                        <input value={customOwner} onChange={(e) => setCustomOwner(e.target.value)} style={{ ...styles.input, marginTop: '8px' }} placeholder="Enter owner name" />
                      )}
                    </>
                  );
                })()
              }
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Detail Date *</label>
              <input type="date" value={formData.detail_date} onChange={(e) => setFormData({ ...formData, detail_date: e.target.value })} style={styles.input} required />
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Challan Number</label>
              <input value={formData.challan_number} onChange={(e) => setFormData({ ...formData, challan_number: e.target.value })} style={styles.input} placeholder="e.g. CH-001" />
            </div>
            <div style={styles.formCol}>
              <label style={styles.label}>Challan Date</label>
              <input type="date" value={formData.challan_date} onChange={(e) => setFormData({ ...formData, challan_date: e.target.value })} style={styles.input} />
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Offence Type</label>
              <input value={formData.offence_type} onChange={(e) => setFormData({ ...formData, offence_type: e.target.value })} style={styles.input} placeholder="e.g. Speeding" />
            </div>
            <div style={styles.formCol}>
              <label style={styles.label}>Location</label>
              <input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={styles.input} placeholder="Location of offence" />
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Fine Amount (₹)</label>
              <input type="number" value={formData.fine_amount} onChange={(e) => setFormData({ ...formData, fine_amount: e.target.value })} style={styles.input} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Remarks</label>
              <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} rows={3} style={styles.textarea} placeholder="Enter remarks (optional)" />
            </div>
          </div>

          <div style={styles.formActionsRight}>
            <button type="button" onClick={handleCancel} style={styles.cancelButton}>Cancel</button>
            <button type="submit" style={styles.submitButton}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (view === 'add') return renderAddVehicleForm();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Vehicle Details</h2>
        <p style={styles.subtitle}>Manage your vehicle information</p>
        <div style={{ marginLeft: 'auto' }}>
          <button style={styles.addButton} onClick={handleAddClick}>Add Vehicle</button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, width: '110px' }}>DATE</th>
                <th style={{ ...styles.th, width: '130px' }}>VEHICLE NUMBER</th>
                <th style={{ ...styles.th, width: '300px' }}>VEHICLE NAME</th>
                <th style={{ ...styles.th, width: '160px' }}>OWNER</th>
                <th style={{ ...styles.th, width: '90px' }}>REMARKS</th>
                <th style={{ ...styles.th, width: '110px' }}>CHALLAN DATE</th>
                <th style={{ ...styles.th, width: '100px' }}>CHALLAN NO</th>
                <th style={{ ...styles.th, width: '120px' }}>OFFENCE</th>
                <th style={{ ...styles.th, width: '120px' }}>LOCATION</th>
                <th style={{ ...styles.th, width: '90px' }}>FINE</th>
                <th style={{ ...styles.th, width: '90px' }}>PAID</th>
                <th style={{ ...styles.th, width: '140px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" style={styles.noData}>Loading...</td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="12" style={styles.noData}>No vehicles found</td>
                </tr>
              ) : (
                vehicles.map((v, idx) => (
                  <tr key={v.id} style={idx % 2 === 0 ? styles.row : styles.rowAlt}>
                    <td style={{ ...styles.td, width: '110px' }}>{v.date}</td>
                    <td style={{ ...styles.td, width: '130px', textAlign: 'left' }}><span style={styles.badge}>{v.number}</span></td>
                    <td style={{ ...styles.td, width: '300px' }}><strong style={styles.vehicleName}>{v.name}</strong></td>
                    <td style={{ ...styles.td, width: '160px' }}>{v.owner}</td>
                    <td style={{ ...styles.td, width: '90px' }}>{v.remarks || '—'}</td>
                    <td style={{ ...styles.td, width: '110px' }}>{v.challan_date || '—'}</td>
                    <td style={{ ...styles.td, width: '100px' }}>{v.challan_number || '—'}</td>
                    <td style={{ ...styles.td, width: '120px' }}>{v.offence_type || '—'}</td>
                    <td style={{ ...styles.td, width: '120px' }}>{v.location || '—'}</td>
                    <td style={{ ...styles.td, width: '90px', textAlign: 'right' }}>{v.fine_amount ? `₹${v.fine_amount}` : '—'}</td>
                    <td style={{ ...styles.td, width: '90px', textAlign: 'center' }}><button onClick={() => togglePaid(v.id)} style={v.paid ? styles.paidButton : styles.unpaidButton}>{v.paid ? 'Paid' : 'Unpaid'}</button></td>
                    <td style={{ ...styles.td, width: '100px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button style={{ ...styles.deleteButton, display: 'inline-block' }} title="Delete"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' },
  title: { fontSize: '20px', fontWeight: 700, margin: 0, color: '#111827' },
  subtitle: { margin: 0, color: '#6b7280', marginLeft: '8px' },
  addButton: { padding: '8px 14px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  tableContainer: { marginTop: '16px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  tableHeaderRow: { backgroundColor: '#f9fafb' },
  th: { textAlign: 'center', padding: '12px 10px', fontSize: '12px', fontWeight: 700, color: '#111827', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle', whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' },
  td: { padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#374151', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' },
  badge: { backgroundColor: '#ecfeff', padding: '6px 10px', borderRadius: '6px', color: '#0369a1', fontSize: '12px', display: 'inline-block', minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  vehicleName: { fontSize: '15px', textTransform: 'uppercase', color: '#111827', letterSpacing: '0.2px', fontWeight: 800, display: 'block' },
  paidButton: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #10b981', backgroundColor: '#10b981', color: '#ffffff', cursor: 'pointer' },
  unpaidButton: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer' },
  reportButton: { backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer' },
  checkButton: { backgroundColor: '#047857', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer' },
  challanButton: { backgroundColor: '#ffffff', color: '#0369a1', border: '1px solid #0369a1', padding: '6px 10px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer' },
  deleteButton: { backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' },
  formCard: { backgroundColor: '#ffffff', border: '1px solid #fee2e2', borderRadius: '8px', padding: '18px', maxWidth: '900px', margin: '0 auto' },
  formHeading: { fontSize: '20px', fontWeight: 700, margin: 0, color: '#111827' },
  breadcrumbs: { fontSize: '13px', color: '#6b7280', margin: '8px 0 14px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  formCol: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  input: { padding: '10px 12px', fontSize: '14px', border: '1px solid #f5c6c6', borderRadius: '6px', outline: 'none', backgroundColor: '#ffffff' },
  muted: { fontSize: '12px', color: '#9ca3af', marginTop: '6px' },
  textarea: { padding: '10px 12px', fontSize: '14px', border: '1px solid #f5c6c6', borderRadius: '6px', outline: 'none', width: '100%', resize: 'vertical' },
  formActionsRight: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' },
  cancelButton: { padding: '8px 14px', backgroundColor: '#9ca3af', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  submitButton: { padding: '8px 14px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  noData: { padding: '20px', textAlign: 'center', color: '#9ca3af' },
  row: { backgroundColor: '#ffffff' },
  rowAlt: { backgroundColor: '#f3f4f6' },
};
