import React, { useEffect, useState } from 'react';
import { Trash2, Edit2, Eye, Download, Upload, Search, Filter, X } from 'lucide-react';
import api from '../../api/client';

export default function VehicleChallan() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userLevel = user?.user_level || 'User';
  const isAdmin = userLevel === 'Admin' || userLevel === 'Super Admin';

  // State management
  const [challans, setChallans] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'add', 'edit', 'detail'
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    payment_status: '',
    vehicle: '',
    start_date: '',
    end_date: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    vehicle: '',
    owner: user?.id || '',
    detail_date: new Date().toISOString().slice(0, 10),
    challan_number: '',
    challan_date: new Date().toISOString().slice(0, 10),
    offence_type: '',
    location: '',
    fine_amount: '',
    payment_status: 'unpaid',
    payment_date: '',
    remarks: '',
    challan_document: null,
    payment_receipt: null,
  });

  const [errors, setErrors] = useState({});

  // Allow non-admin users to view challans without redirecting
  useEffect(() => {
    // No redirect here; access is read-only for non-admins
  }, [isAdmin]);

  useEffect(() => {
    // Fetch challans and vehicles for all users
    fetchChallans();
    fetchVehicles();
    // Stats may be admin-only; fetch conditionally
    if (isAdmin) fetchStats();
  }, [filters, isAdmin]);

  // Fetch challans from API
  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.vehicle) params.append('vehicle', filters.vehicle);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const res = await api.get(`/vehicle-management/challans/?${params.toString()}`);
      // Handle paginated response - check if data has 'results' property
      const challanData = res.data?.results || res.data || [];
      setChallans(Array.isArray(challanData) ? challanData : []);
    } catch (err) {
      console.error('Error fetching challans:', err);
      setChallans([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles dropdown
  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicle-management/vehicles/dropdown/');
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const res = await api.get('/vehicle-management/challans/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicle) newErrors.vehicle = 'Vehicle is required';
    if (!formData.challan_number) newErrors.challan_number = 'Challan number is required';
    if (!formData.detail_date) newErrors.detail_date = 'Detail date is required';
    if (!formData.challan_date) newErrors.challan_date = 'Challan date is required';
    if (!formData.offence_type) newErrors.offence_type = 'Offence type is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.fine_amount) newErrors.fine_amount = 'Fine amount is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'challan_document' || key === 'payment_receipt') {
            if (formData[key] instanceof File) {
              submitData.append(key, formData[key]);
            }
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      if (view === 'edit' && selectedChallan) {
        // Update existing challan
        await api.patch(`/vehicle-management/challans/${selectedChallan.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new challan
        await api.post('/vehicle-management/challans/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await fetchChallans();
      await fetchStats();
      handleCancel();
    } catch (err) {
      console.error('Error submitting challan:', err);
      if (err.response?.data) {
        setErrors(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete challan
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this challan?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/vehicle-management/challans/${id}/`);
      await fetchChallans();
      await fetchStats();
    } catch (err) {
      console.error('Error deleting challan:', err);
      alert('Failed to delete challan');
    } finally {
      setLoading(false);
    }
  };

  // Mark challan as paid
  const handleMarkPaid = async (challan) => {
    setLoading(true);
    try {
      const paymentData = new FormData();
      paymentData.append('payment_status', 'paid');
      paymentData.append('payment_date', new Date().toISOString().slice(0, 10));

      await api.patch(`/vehicle-management/challans/${challan.id}/pay/`, paymentData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchChallans();
      await fetchStats();
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert(err.response?.data?.error || 'Failed to mark as paid');
    } finally {
      setLoading(false);
    }
  };

  // View challan details
  const handleViewDetails = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/vehicle-management/challans/${id}/`);
      setSelectedChallan(res.data);
      setView('detail');
    } catch (err) {
      console.error('Error fetching challan details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit challan
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/vehicle-management/challans/${id}/`);
      setSelectedChallan(res.data);
      setFormData({
        vehicle: res.data.vehicle,
        owner: res.data.owner,
        detail_date: res.data.detail_date,
        challan_number: res.data.challan_number,
        challan_date: res.data.challan_date,
        offence_type: res.data.offence_type,
        location: res.data.location,
        fine_amount: res.data.fine_amount,
        payment_status: res.data.payment_status,
        payment_date: res.data.payment_date || '',
        remarks: res.data.remarks || '',
        challan_document: null,
        payment_receipt: null,
      });
      setView('edit');
    } catch (err) {
      console.error('Error fetching challan for edit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setView('list');
    setSelectedChallan(null);
    setFormData({
      vehicle: '',
      owner: user?.id || '',
      detail_date: new Date().toISOString().slice(0, 10),
      challan_number: '',
      challan_date: new Date().toISOString().slice(0, 10),
      offence_type: '',
      location: '',
      fine_amount: '',
      payment_status: 'unpaid',
      payment_date: '',
      remarks: '',
      challan_document: null,
      payment_receipt: null,
    });
    setErrors({});
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      payment_status: '',
      vehicle: '',
      start_date: '',
      end_date: '',
    });
  };

  // Render page for all users; actions are gated by isAdmin

  // Render form (Add/Edit)
  const renderForm = () => (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.formHeading}>
          {view === 'edit' ? 'Edit Vehicle Challan' : 'Add Vehicle Challan'}
        </h2>
        <div style={styles.breadcrumbs}>
          <a href="#" onClick={(e) => { e.preventDefault(); handleCancel(); }}>
            Vehicle Challans
          </a> / {view === 'edit' ? 'Edit' : 'Add New'}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            {/* Vehicle Selection */}
            <div style={styles.formCol}>
              <label style={styles.label}>Vehicle *</label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                style={errors.vehicle ? styles.inputError : styles.input}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registration_number} - {v.vehicle_name}
                  </option>
                ))}
              </select>
              {errors.vehicle && <div style={styles.errorText}>{errors.vehicle}</div>}
            </div>

            {/* Detail Date */}
            <div style={styles.formCol}>
              <label style={styles.label}>Detail Date (Violation Date) *</label>
              <input
                type="date"
                name="detail_date"
                value={formData.detail_date}
                onChange={handleInputChange}
                style={errors.detail_date ? styles.inputError : styles.input}
                required
              />
              {errors.detail_date && <div style={styles.errorText}>{errors.detail_date}</div>}
            </div>

            {/* Challan Number */}
            <div style={styles.formCol}>
              <label style={styles.label}>Challan Number *</label>
              <input
                type="text"
                name="challan_number"
                value={formData.challan_number}
                onChange={handleInputChange}
                style={errors.challan_number ? styles.inputError : styles.input}
                placeholder="e.g., CH-2024-001"
                required
              />
              {errors.challan_number && <div style={styles.errorText}>{errors.challan_number}</div>}
            </div>

            {/* Challan Date */}
            <div style={styles.formCol}>
              <label style={styles.label}>Challan Date *</label>
              <input
                type="date"
                name="challan_date"
                value={formData.challan_date}
                onChange={handleInputChange}
                style={errors.challan_date ? styles.inputError : styles.input}
                required
              />
              {errors.challan_date && <div style={styles.errorText}>{errors.challan_date}</div>}
            </div>

            {/* Offence Type */}
            <div style={styles.formCol}>
              <label style={styles.label}>Offence Type *</label>
              <input
                type="text"
                name="offence_type"
                value={formData.offence_type}
                onChange={handleInputChange}
                style={errors.offence_type ? styles.inputError : styles.input}
                placeholder="e.g., Speeding, Parking Violation, Red Light"
                required
              />
              {errors.offence_type && <div style={styles.errorText}>{errors.offence_type}</div>}
            </div>

            {/* Location */}
            <div style={styles.formCol}>
              <label style={styles.label}>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                style={errors.location ? styles.inputError : styles.input}
                placeholder="Location of offence"
                required
              />
              {errors.location && <div style={styles.errorText}>{errors.location}</div>}
            </div>

            {/* Fine Amount */}
            <div style={styles.formCol}>
              <label style={styles.label}>Fine Amount (₹) *</label>
              <input
                type="number"
                name="fine_amount"
                value={formData.fine_amount}
                onChange={handleInputChange}
                style={errors.fine_amount ? styles.inputError : styles.input}
                min="0"
                step="0.01"
                required
              />
              {errors.fine_amount && <div style={styles.errorText}>{errors.fine_amount}</div>}
            </div>

            {/* Payment Status */}
            <div style={styles.formCol}>
              <label style={styles.label}>Payment Status</label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleInputChange}
                style={styles.input}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Payment Date (show if paid) */}
            {formData.payment_status === 'paid' && (
              <div style={styles.formCol}>
                <label style={styles.label}>Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            )}

            {/* Challan Document */}
            <div style={styles.formCol}>
              <label style={styles.label}>Challan Document</label>
              <input
                type="file"
                name="challan_document"
                onChange={handleInputChange}
                style={styles.input}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div style={styles.muted}>Upload challan receipt/document (PDF, JPG, PNG)</div>
            </div>

            {/* Payment Receipt */}
            <div style={styles.formCol}>
              <label style={styles.label}>Payment Receipt</label>
              <input
                type="file"
                name="payment_receipt"
                onChange={handleInputChange}
                style={styles.input}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div style={styles.muted}>Upload payment receipt if paid</div>
            </div>

            {/* Remarks */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={3}
                style={styles.textarea}
                placeholder="Enter any additional notes or remarks (optional)"
              />
            </div>
          </div>

          <div style={styles.formActionsRight}>
            <button type="button" onClick={handleCancel} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Submitting...' : (view === 'edit' ? 'Update' : 'Submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render details view
  const renderDetails = () => {
    if (!selectedChallan) return null;

    return (
      <div style={styles.container}>
        <div style={styles.formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={styles.formHeading}>Challan Details</h2>
            <button onClick={handleCancel} style={styles.cancelButton}>
              <X size={16} /> Close
            </button>
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Challan Number:</label>
              <span style={styles.detailValue}>{selectedChallan.challan_number}</span>
            </div>

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Vehicle:</label>
              <span style={styles.detailValue}>
                {selectedChallan.vehicle_info?.registration_number} - {selectedChallan.vehicle_info?.vehicle_name}
              </span>
            </div>

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Owner:</label>
              <span style={styles.detailValue}>{selectedChallan.owner_info?.full_name || selectedChallan.owner_info?.email}</span>
            </div>

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Detail Date:</label>
              <span style={styles.detailValue}>{new Date(selectedChallan.detail_date).toLocaleDateString()}</span>
            </div>

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Challan Date:</label>
              <span style={styles.detailValue}>{new Date(selectedChallan.challan_date).toLocaleDateString()}</span>
            </div>

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Offence Type:</label>
              <span style={styles.detailValue}>{selectedChallan.offence_type}</span>
            </div>

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Location:</label>
              <span style={styles.detailValue}>{selectedChallan.location}</span>
            </div>

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Fine Amount:</label>
              <span style={styles.detailValue}>₹{selectedChallan.fine_amount}</span>
            </div>

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Payment Status:</label>
              <span style={selectedChallan.payment_status === 'paid' ? styles.paidBadge : styles.unpaidBadge}>
                {selectedChallan.payment_status.toUpperCase()}
              </span>
            </div>

            {selectedChallan.payment_date && (
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Payment Date:</label>
                <span style={styles.detailValue}>{new Date(selectedChallan.payment_date).toLocaleDateString()}</span>
              </div>
            )}

            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Days Since Challan:</label>
              <span style={styles.detailValue}>{selectedChallan.days_since_challan} days</span>
            </div>

            {selectedChallan.remarks && (
              <div style={{ ...styles.detailItem, gridColumn: '1 / -1' }}>
                <label style={styles.detailLabel}>Remarks:</label>
                <span style={styles.detailValue}>{selectedChallan.remarks}</span>
              </div>
            )}

            {selectedChallan.challan_document_url && (
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Challan Document:</label>
                <a href={selectedChallan.challan_document_url} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
                  <Download size={16} /> Download
                </a>
              </div>
            )}

            {selectedChallan.payment_receipt_url && (
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Payment Receipt:</label>
                <a href={selectedChallan.payment_receipt_url} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
                  <Download size={16} /> Download
                </a>
              </div>
            )}
          </div>

          <div style={styles.formActionsRight}>
            {isAdmin && selectedChallan.payment_status === 'unpaid' && (
              <button
                onClick={() => handleMarkPaid(selectedChallan)}
                style={styles.submitButton}
                disabled={loading}
              >
                Mark as Paid
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleEdit(selectedChallan.id)}
                style={styles.editButton}
              >
                <Edit2 size={14} /> Edit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render list view
  if (view === 'add' || view === 'edit') return renderForm();
  if (view === 'detail') return renderDetails();

  return (
    <div style={styles.container}>
      {/* Header with Stats */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Vehicle Challans</h2>
          <p style={styles.subtitle}>Manage traffic violations and fines</p>
        </div>
        {isAdmin && (
          <button style={styles.addButton} onClick={() => setView('add')}>
            Add Challan
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      {isAdmin && stats && (
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Challans</div>
            <div style={styles.statValue}>{stats.total_challans}</div>
          </div>
          <div style={{ ...styles.statCard, borderColor: '#10b981' }}>
            <div style={styles.statLabel}>Paid</div>
            <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.paid_challans}</div>
            <div style={styles.statAmount}>₹{stats.paid_amount.toLocaleString()}</div>
          </div>
          <div style={{ ...styles.statCard, borderColor: '#ef4444' }}>
            <div style={styles.statLabel}>Unpaid</div>
            <div style={{ ...styles.statValue, color: '#ef4444' }}>{stats.unpaid_challans}</div>
            <div style={styles.statAmount}>₹{stats.unpaid_amount.toLocaleString()}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Fine Amount</div>
            <div style={styles.statValue}>₹{stats.total_fine_amount.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filterContainer}>
        <div style={styles.filterHeader}>
          <button
            style={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} /> Filters
          </button>
          {(filters.search || filters.payment_status || filters.vehicle || filters.start_date || filters.end_date) && (
            <button style={styles.clearFilterButton} onClick={clearFilters}>
              <X size={16} /> Clear Filters
            </button>
          )}
        </div>

        {showFilters && (
          <div style={styles.filterGrid}>
            <input
              type="text"
              placeholder="Search by challan number, vehicle, offence..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={styles.filterInput}
            />
            <select
              value={filters.payment_status}
              onChange={(e) => handleFilterChange('payment_status', e.target.value)}
              style={styles.filterInput}
            >
              <option value="">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            <select
              value={filters.vehicle}
              onChange={(e) => handleFilterChange('vehicle', e.target.value)}
              style={styles.filterInput}
            >
              <option value="">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registration_number}</option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Start Date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              style={styles.filterInput}
            />
            <input
              type="date"
              placeholder="End Date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              style={styles.filterInput}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>CHALLAN NO</th>
                <th style={styles.th}>VEHICLE</th>
                <th style={styles.th}>OWNER</th>
                <th style={styles.th}>DETAIL DATE</th>
                <th style={styles.th}>CHALLAN DATE</th>
                <th style={styles.th}>OFFENCE</th>
                <th style={styles.th}>LOCATION</th>
                <th style={styles.th}>FINE (₹)</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>DAYS</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={styles.noData}>Loading...</td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan="11" style={styles.noData}>No challans found</td>
                </tr>
              ) : (
                challans.map((challan, idx) => (
                  <tr key={challan.id} style={idx % 2 === 0 ? styles.row : styles.rowAlt}>
                    <td style={styles.td}>
                      <span style={styles.badge}>{challan.challan_number}</span>
                    </td>
                    <td style={styles.td}>
                      <strong>{challan.vehicle_info?.registration_number}</strong>
                      <div style={styles.subText}>{challan.vehicle_info?.vehicle_name}</div>
                    </td>
                    <td style={styles.td}>
                      {challan.owner_info?.full_name || challan.owner_info?.email}
                    </td>
                    <td style={styles.td}>
                      {new Date(challan.detail_date).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      {new Date(challan.challan_date).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>{challan.offence_type}</td>
                    <td style={styles.td}>{challan.location}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>
                      ₹{parseFloat(challan.fine_amount).toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {challan.payment_status === 'paid' ? (
                        <span style={styles.paidBadge}>PAID</span>
                      ) : (
                        isAdmin ? (
                          <button
                            onClick={() => handleMarkPaid(challan)}
                            style={styles.unpaidButton}
                            disabled={loading}
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span style={styles.unpaidButton}>UNPAID</span>
                        )
                      )}
                    </td>
                    <td style={styles.td}>{challan.days_since_challan}</td>
                    <td style={{ ...styles.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleViewDetails(challan.id)}
                        style={styles.viewButton}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(challan.id)}
                            style={styles.editButtonSmall}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(challan.id)}
                            style={styles.deleteButton}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px' },
  title: { fontSize: '24px', fontWeight: 700, margin: 0, color: '#111827' },
  subtitle: { margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' },
  addButton: { padding: '10px 16px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  
  // Statistics
  statsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' },
  statCard: { backgroundColor: '#ffffff', border: '2px solid #e5e7eb', borderRadius: '8px', padding: '16px' },
  statLabel: { fontSize: '13px', color: '#6b7280', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#111827' },
  statAmount: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  
  // Filters
  filterContainer: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
  filterHeader: { display: 'flex', gap: '10px', marginBottom: '12px' },
  filterButton: { padding: '8px 14px', backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  clearFilterButton: { padding: '8px 14px', backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  filterInput: { padding: '8px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none' },
  
  // Table
  tableContainer: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeaderRow: { backgroundColor: '#f9fafb' },
  th: { textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 700, color: '#111827', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' },
  td: { padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: '14px' },
  row: { backgroundColor: '#ffffff' },
  rowAlt: { backgroundColor: '#f9fafb' },
  noData: { padding: '40px', textAlign: 'center', color: '#9ca3af' },
  
  // Badges
  badge: { backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '4px', color: '#1e40af', fontSize: '13px', fontWeight: '600', display: 'inline-block' },
  paidBadge: { backgroundColor: '#d1fae5', padding: '4px 12px', borderRadius: '4px', color: '#065f46', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  unpaidButton: { padding: '4px 12px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
  subText: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  
  // Action Buttons
  viewButton: { backgroundColor: '#ffffff', color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' },
  editButtonSmall: { backgroundColor: '#ffffff', color: '#f59e0b', border: '1px solid #f59e0b', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' },
  deleteButton: { backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' },
  
  // Form
  formCard: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', maxWidth: '900px', margin: '0 auto' },
  formHeading: { fontSize: '22px', fontWeight: 700, margin: 0, color: '#111827' },
  breadcrumbs: { fontSize: '13px', color: '#6b7280', margin: '8px 0 20px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  formCol: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  input: { padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', backgroundColor: '#ffffff' },
  inputError: { padding: '10px 12px', fontSize: '14px', border: '2px solid #ef4444', borderRadius: '6px', outline: 'none', backgroundColor: '#ffffff' },
  textarea: { padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', width: '100%', resize: 'vertical', fontFamily: 'inherit' },
  muted: { fontSize: '12px', color: '#9ca3af', marginTop: '4px' },
  errorText: { fontSize: '12px', color: '#ef4444', marginTop: '4px' },
  formActionsRight: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  cancelButton: { padding: '10px 20px', backgroundColor: '#6b7280', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },
  submitButton: { padding: '10px 20px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  editButton: { padding: '10px 20px', backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },
  
  // Details View
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '20px' },
  detailItem: { display: 'flex', flexDirection: 'column' },
  detailLabel: { fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' },
  detailValue: { fontSize: '15px', color: '#111827', fontWeight: '500' },
  downloadLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
};