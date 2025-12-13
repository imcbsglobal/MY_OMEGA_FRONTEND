import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import api from '../../api/client';

export default function LeaveTypeManagement() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newLeaveType, setNewLeaveType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Fetch leave types
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/master/leave-types/');
      setLeaveTypes(response.data || []);
    } catch (err) {
      setError('Unable to load leave types');
      console.error('Error fetching leave types:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new leave type
  const handleAddLeaveType = async () => {
    if (!newLeaveType.trim()) {
      setError('Please enter a leave type name');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await api.post('/master/leave-types/', {
        name: newLeaveType.trim()
      });
      
      setLeaveTypes([...leaveTypes, response.data]);
      setNewLeaveType('');
      setSuccess('Leave type added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add leave type');
      console.error('Error adding leave type:', err);
    }
  };

  // Start editing
  const handleStartEdit = (leaveType) => {
    setEditingId(leaveType.id);
    setEditingName(leaveType.name);
    setError('');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  // Save edit
  const handleSaveEdit = async (id) => {
    if (!editingName.trim()) {
      setError('Leave type name cannot be empty');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await api.put(`/master/leave-types/${id}/`, {
        name: editingName.trim()
      });
      
      setLeaveTypes(leaveTypes.map(lt => 
        lt.id === id ? response.data : lt
      ));
      setEditingId(null);
      setEditingName('');
      setSuccess('Leave type updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave type');
      console.error('Error updating leave type:', err);
    }
  };

  // Delete leave type
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await api.delete(`/master/leave-types/${id}/`);
      setLeaveTypes(leaveTypes.filter(lt => lt.id !== id));
      setSuccess('Leave type deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete leave type');
      console.error('Error deleting leave type:', err);
    }
  };

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
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '24px',
      marginBottom: '24px',
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
    inputGroup: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#dc2626',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s',
      whiteSpace: 'nowrap',
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
    },
    iconButton: {
      padding: '8px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      backgroundColor: 'transparent',
    },
    editButton: {
      color: '#2563eb',
    },
    deleteButton: {
      color: '#dc2626',
    },
    saveButton: {
      color: '#16a34a',
    },
    cancelButton: {
      color: '#64748b',
    },
    editInput: {
      width: '100%',
      padding: '8px 12px',
      border: '2px solid #2563eb',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Building2 size={32} color="#dc2626" />
        <h1 style={styles.title}>Leave Type Management</h1>
      </div>

      {error && (
        <div style={{...styles.alert, ...styles.errorAlert}}>
          <X size={18} />
          {error}
        </div>
      )}

      {success && (
        <div style={{...styles.alert, ...styles.successAlert}}>
          <Check size={18} />
          {success}
        </div>
      )}

      {/* Add New Leave Type */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Plus size={20} color="#dc2626" />
          <h2 style={styles.cardTitle}>Add New Leave Type</h2>
        </div>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter leave type (e.g., Sick Leave, Annual Leave, Casual Leave)"
            value={newLeaveType}
            onChange={(e) => setNewLeaveType(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLeaveType()}
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#dc2626'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          <button
            style={styles.button}
            onClick={handleAddLeaveType}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            <Plus size={18} />
            Add Leave Type
          </button>
        </div>
      </div>

      {/* All Leave Types */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Building2 size={20} color="#dc2626" />
          <h2 style={styles.cardTitle}>
            All Leave Types ({leaveTypes.length})
          </h2>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Loading leave types...</div>
          </div>
        ) : leaveTypes.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Building2 size={64} />
            </div>
            <div style={styles.emptyTitle}>No leave types added yet</div>
            <div style={styles.emptyText}>Add your first leave type using the form above</div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '60px'}}>#</th>
                <th style={styles.th}>Leave Type Name</th>
                <th style={{...styles.th, width: '150px', textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((leaveType, index) => (
                <tr key={leaveType.id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    {editingId === leaveType.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        style={styles.editInput}
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(leaveType.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                    ) : (
                      <span style={{ fontWeight: '500' }}>{leaveType.name}</span>
                    )}
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      {editingId === leaveType.id ? (
                        <>
                          <button
                            style={{...styles.iconButton, ...styles.saveButton}}
                            onClick={() => handleSaveEdit(leaveType.id)}
                            title="Save"
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            style={{...styles.iconButton, ...styles.cancelButton}}
                            onClick={handleCancelEdit}
                            title="Cancel"
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={{...styles.iconButton, ...styles.editButton}}
                            onClick={() => handleStartEdit(leaveType)}
                            title="Edit"
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            style={{...styles.iconButton, ...styles.deleteButton}}
                            onClick={() => handleDelete(leaveType.id)}
                            title="Delete"
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
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