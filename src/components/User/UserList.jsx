import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { fetchUsers, deleteUser, getUser, clearAuthData } from "../../services/api";
import "./UserList.scss";

function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 10;
  const API_BASE = 'http://127.0.0.1:8000';

  // Get current user
  const currentUser = getUser();

  // Logout and redirect
  const handleLogout = () => {
    clearAuthData();
    navigate('/login', { replace: true });
  };

  // Fetch users from backend
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching users...');
      
      const data = await fetchUsers();
      
      console.log('✅ Users fetched:', data.length);
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      
      if (err.message.includes('Session expired')) {
        setError('Session expired. Redirecting to login...');
        setTimeout(handleLogout, 2000);
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.job_role || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.user_level || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleAdd = () => navigate("/user/add");
  const handleView = (id) => navigate(`/user/view/${id}`);
  const handleEdit = (id) => navigate(`/user/edit/${id}`);
  
  const handleDelete = async (id) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    
    if (window.confirm(`Delete ${u.name}?\n\nThis action cannot be undone.`)) {
      try {
        console.log('🗑️ Deleting user:', id);

        const success = await deleteUser(id);

        if (success) {
          console.log('✅ User deleted successfully');
          setUsers((prev) => prev.filter((x) => x.id !== id));
          
          // Adjust page if needed
          if ((page - 1) * pageSize >= Math.max(0, filtered.length - 1)) {
            setPage(Math.max(1, page - 1));
          }
        } else {
          alert('Failed to delete user. Please try again.');
        }
      } catch (err) {
        console.error('❌ Delete error:', err);
        
        if (err.message.includes('Session expired')) {
          alert('Session expired. Please login again.');
          handleLogout();
        } else {
          alert(err.message || 'Network error while deleting user');
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="user-list-page content-full-width">
        <div className="loading-message" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          fontSize: '18px',
          color: '#666'
        }}>
          <div className="spinner-large"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-page content-full-width">
      <div className="userlist-header">
        <div className="header-left">
          <h1>👥 User Management</h1>
          {currentUser && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span>
                Welcome, <strong>{currentUser.name}</strong>
              </span>
              <span style={{ 
                padding: '4px 12px', 
                backgroundColor: currentUser.user_level === 'Super Admin' ? '#dc3545' :
                                currentUser.user_level === 'Admin' ? '#ffc107' : '#007bff',
                color: 'white', 
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {currentUser.user_level}
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '6px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        <div className="header-right">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name, email, job role, or level"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <button className="add-btn" onClick={handleAdd}>
            ➕ Add New User
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '16px', 
          background: '#fee', 
          color: '#c00', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #fcc',
          fontSize: '15px',
          fontWeight: '500'
        }}>
          ⚠️ <strong>Error:</strong> {error}
        </div>
      )}

      <div className="userlist-container">
        <div className="userlist-table-wrapper">
          <table className="userlist-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>CREATED DATE</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>JOB ROLE</th>
                <th>USER LEVEL</th>
                <th>PHONE NUMBER</th>
                <th>PHOTO</th>
                <th style={{ textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data" style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    fontSize: '16px',
                    color: '#999'
                  }}>
                    {search ? '🔍 No users found matching your search' : '📋 No users available'}
                  </td>
                </tr>
              ) : (
                paged.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{(page - 1) * pageSize + idx + 1}</td>
                    <td>{formatDate(u.created_at)}</td>
                    <td className="name-cell">
                      <NavLink to={`/user/view/${u.id}`} className="link">
                        {u.name}
                      </NavLink>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.job_role || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: 
                          u.user_level === 'Super Admin' ? '#dc3545' :
                          u.user_level === 'Admin' ? '#ffc107' : '#28a745',
                        color: 'white'
                      }}>
                        {u.user_level}
                      </span>
                    </td>
                    <td>{u.phone_number || '-'}</td>
                    <td>
                      {u.photo ? (
                        <img 
                          src={u.photo.startsWith('http') ? u.photo : `${API_BASE}${u.photo}`} 
                          alt={u.name}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            objectFit: 'cover',
                            border: '2px solid #e0e0e0'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          👤
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button 
                        className="action-btn view" 
                        onClick={() => handleView(u.id)}
                        title="View user details"
                      >
                        👁️ View
                      </button>
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEdit(u.id)}
                        title="Edit user"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDelete(u.id)}
                        title="Delete user"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <div className="pagination-info">
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length} users
          </div>
          <div className="pagination-controls">
            <button 
              className="btn-small" 
              onClick={() => setPage(1)} 
              disabled={page === 1}
            >
              « First
            </button>
            <button 
              className="btn-small" 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
            >
              ‹ Prev
            </button>
            <span className="page-indicator">
              Page {page} of {totalPages}
            </span>
            <button 
              className="btn-small" 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
            >
              Next ›
            </button>
            <button 
              className="btn-small" 
              onClick={() => setPage(totalPages)} 
              disabled={page === totalPages}
            >
              Last »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserList;