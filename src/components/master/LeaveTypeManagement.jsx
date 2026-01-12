import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit2, X, Check, RefreshCw } from 'lucide-react';
import api from '../../api/client';

export default function LeaveTypeManagement() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [filterYear, setFilterYear] = useState('2026');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    leave_name: '',
    date: '',
    category: 'casual',
    payment_status: 'paid',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/master/leaves/');
      
      console.log('API Response:', response.data);
      
      const data = response.data?.data || response.data || [];
      
      setLeaveTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching leave types:', err);
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.detail || 
                      err.response?.data?.errors ||
                      err.message ||
                      'Unable to load leave types. Please check API configuration.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (editingId) {
      setEditingData({ ...editingData, [field]: value });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleAddLeaveType = async () => {
    if (!formData.leave_name.trim()) {
      setError('Please enter a leave/holiday name');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await api.post('/master/leaves/', {
        leave_name: formData.leave_name.trim(),
        leave_date: formData.date || null,
        category: formData.category,
        payment_status: formData.payment_status,
        is_active: formData.is_active
      });
      
      console.log('Create Response:', response.data);
      
      const newType = response.data?.data || response.data;
      setLeaveTypes([...leaveTypes, newType]);
      setFormData({
        leave_name: '',
        date: '',
        category: 'casual',
        payment_status: 'paid',
        is_active: true
      });
      setSuccess(response.data?.message || 'Leave type added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding leave type:', err);
      
      let errorMsg = 'Failed to add leave type';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleStartEdit = (leaveType) => {
    setEditingId(leaveType.id);
    setEditingData({
      leave_name: leaveType.leave_name,
      date: leaveType.date || '',
      category: leaveType.category || 'casual',
      payment_status: leaveType.payment_status || 'paid',
      is_active: leaveType.is_active !== undefined ? leaveType.is_active : true
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editingData.leave_name.trim()) {
      setError('Leave type name cannot be empty');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await api.put(`/master/leaves/${id}/`, {
        leave_name: editingData.leave_name.trim(),
        leave_date: editingData.date || null,
        category: editingData.category,
        payment_status: editingData.payment_status,
        is_active: editingData.is_active
      });
      
      console.log('Update Response:', response.data);
      
      const updatedType = response.data?.data || response.data;
      setLeaveTypes(leaveTypes.map(lt => 
        lt.id === id ? updatedType : lt
      ));
      setEditingId(null);
      setEditingData(null);
      setSuccess(response.data?.message || 'Leave type updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating leave type:', err);
      
      let errorMsg = 'Failed to update leave type';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await api.delete(`/master/leaves/${id}/`);
      
      console.log('Delete Response:', response.data);
      
      setLeaveTypes(leaveTypes.filter(lt => lt.id !== id));
      setSuccess(response.data?.message || 'Leave type deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting leave type:', err);
      
      let errorMsg = 'Failed to delete leave type';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRefresh = () => {
    setError('');
    setSuccess('');
    fetchLeaveTypes();
  };

  // Filter leave types based on year and category
  const filteredLeaveTypes = leaveTypes.filter(leaveType => {
    // Filter by year if date exists
    const yearMatch = !leaveType.date || 
                     new Date(leaveType.date).getFullYear().toString() === filterYear;
    
    // Filter by category
    const categoryMatch = !filterCategory || 
                         (leaveType.category || 'casual') === filterCategory;
    
    return yearMatch && categoryMatch;
  });

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
    },
    refreshButton: {
      marginLeft: 'auto',
      padding: '8px 16px',
      background: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s',
    },
    alert: {
      padding: '14px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      fontWeight: '500',
    },
    errorAlert: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    successAlert: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0',
    },
    dismissButton: {
      marginLeft: 'auto',
      background: 'transparent',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '0 4px',
      lineHeight: 1,
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid #f1f5f9',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '2px solid #f1f5f9',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0,
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#475569',
    },
    required: {
      color: '#dc2626',
      marginLeft: '2px',
    },
    input: {
      padding: '10px 14px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
    },
    select: {
      padding: '10px 14px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#dc2626',
    },
    helperText: {
      fontSize: '12px',
      color: '#94a3b8',
      marginTop: '4px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px',
    },
    button: {
      padding: '10px 24px',
      backgroundColor: '#dc2626',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s',
      whiteSpace: 'nowrap',
    },
    cancelButtonStyle: {
      backgroundColor: '#6b7280',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      backgroundColor: '#f8fafc',
      color: '#475569',
      fontSize: '13px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #e2e8f0',
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
      color: '#334155',
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
    },
    iconButton: {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      fontSize: '12px',
      fontWeight: '500',
    },
    editButton: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },
    saveButton: {
      backgroundColor: '#10b981',
      color: '#ffffff',
    },
    cancelButton: {
      backgroundColor: '#6b7280',
      color: '#ffffff',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
    },
    casualBadge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    paidBadge: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    unpaidBadge: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    activeBadge: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    inactiveBadge: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
    },
    loadingState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#64748b',
    },
    spinner: {
      width: 40,
      height: 40,
      border: '4px solid #f1f5f9',
      borderTop: '4px solid #dc2626',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#94a3b8',
    },
    emptyIcon: {
      marginBottom: '16px',
      color: '#cbd5e1',
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#64748b',
      marginBottom: '8px',
    },
    emptyText: {
      fontSize: '14px',
      color: '#94a3b8',
    },
    filterSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid #f1f5f9',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      minWidth: '160px',
    },
    totalCount: {
      marginLeft: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '4px',
    },
    totalLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
    },
    totalNumber: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#2563eb',
    },
  };

  const currentData = editingId ? editingData : formData;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Building2 size={32} color="#dc2626" />
        <h1 style={styles.title}>Leave Type Management</h1>
        <button
          onClick={handleRefresh}
          style={styles.refreshButton}
          disabled={loading}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{...styles.alert, ...styles.errorAlert}}>
          <X size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError('')} style={styles.dismissButton}>×</button>
        </div>
      )}

      {success && (
        <div style={{...styles.alert, ...styles.successAlert}}>
          <Check size={18} />
          <span style={{ flex: 1 }}>{success}</span>
          <button onClick={() => setSuccess('')} style={styles.dismissButton}>×</button>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Plus size={20} color="#dc2626" />
          <h2 style={styles.cardTitle}>Add New Leave/Holiday</h2>
        </div>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Leave/Holiday Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., New Year's Day, Annual Leave"
              value={currentData?.leave_name || ''}
              onChange={(e) => handleInputChange('leave_name', e.target.value.toUpperCase())}
              style={{...styles.input, textTransform: 'uppercase'}}
              onFocus={(e) => e.target.style.border = '1px solid #dc2626'}
              onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Date <span style={styles.helperText}>(Optional - for ongoing allowances)</span>
            </label>
            <input
              type="date"
              value={currentData?.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              style={styles.input}
              onFocus={(e) => e.target.style.border = '1px solid #dc2626'}
              onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
            />
            <span style={styles.helperText}>Leave date optional for Casual Leave (ongoing allowance)</span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Category <span style={styles.required}>*</span>
            </label>
            <select
              value={currentData?.category || 'casual'}
              onChange={(e) => handleInputChange('category', e.target.value)}
              style={styles.select}
              onFocus={(e) => e.target.style.border = '1px solid #dc2626'}
              onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="special">Special Leave</option>
              <option value="mandatory_holiday">Mandatory Holiday</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Payment Status <span style={styles.required}>*</span>
            </label>
            <select
              value={currentData?.payment_status || 'paid'}
              onChange={(e) => handleInputChange('payment_status', e.target.value)}
              style={styles.select}
              onFocus={(e) => e.target.style.border = '1px solid #dc2626'}
              onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div style={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="active"
            checked={currentData?.is_active !== undefined ? currentData.is_active : true}
            onChange={(e) => handleInputChange('is_active', e.target.checked)}
            style={styles.checkbox}
          />
          <label htmlFor="active" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
            Active
          </label>
        </div>

        <div style={styles.buttonGroup}>
          {editingId && (
            <button
              style={{...styles.button, ...styles.cancelButtonStyle}}
              onClick={handleCancelEdit}
            >
              <X size={18} />
              Cancel
            </button>
          )}
          <button
            style={styles.button}
            onClick={editingId ? () => handleSaveEdit(editingId) : handleAddLeaveType}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            {editingId ? (
              <>
                <Check size={18} />
                Update
              </>
            ) : (
              <>
                <Plus size={18} />
                Create
              </>
            )}
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Building2 size={20} color="#dc2626" />
          <h2 style={styles.cardTitle}>
            All Leave Types
          </h2>
        </div>

        <div style={styles.filterSection}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Categories</option>
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="holiday">Holiday</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={styles.totalCount}>
            <span style={styles.totalLabel}>Total:</span>
            <span style={styles.totalNumber}>{filteredLeaveTypes.length} leaves</span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading leave types...</p>
          </div>
        ) : filteredLeaveTypes.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Building2 size={64} />
            </div>
            <div style={styles.emptyTitle}>No leave types found</div>
            <div style={styles.emptyText}>
              {leaveTypes.length === 0 
                ? 'Add your first leave type using the form above'
                : 'No leave types match the selected filters'}
            </div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '50px'}}>#</th>
                <th style={styles.th}>Leave/Holiday Name</th>
                <th style={{...styles.th, width: '120px'}}>Date</th>
                <th style={{...styles.th, width: '130px'}}>Category</th>
                <th style={{...styles.th, width: '130px'}}>Payment Status</th>
                <th style={{...styles.th, width: '100px', textAlign: 'center'}}>Status</th>
                <th style={{...styles.th, width: '180px', textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaveTypes.map((leaveType, index) => (
                <tr key={leaveType.id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '500' }}>{leaveType.leave_name}</span>
                  </td>
                  <td style={styles.td}>
                    {leaveType.date ? new Date(leaveType.date).toLocaleDateString() : '-'}
                  </td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, ...styles.casualBadge}}>
                      {(leaveType.category || 'Casual').charAt(0).toUpperCase() + (leaveType.category || 'Casual').slice(1)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge, 
                      ...(leaveType.payment_status === 'paid' ? styles.paidBadge : styles.unpaidBadge)
                    }}>
                      {(leaveType.payment_status || 'Paid').charAt(0).toUpperCase() + (leaveType.payment_status || 'Paid').slice(1)}
                    </span>
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <span style={{
                      ...styles.badge,
                      ...(leaveType.is_active ? styles.activeBadge : styles.inactiveBadge)
                    }}>
                      {leaveType.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      <button
                        style={{...styles.iconButton, ...styles.editButton}}
                        onClick={() => handleStartEdit(leaveType)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        style={{...styles.iconButton, ...styles.deleteButton}}
                        onClick={() => handleDelete(leaveType.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {
    console.log("Animation already exists");
  }
}