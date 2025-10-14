import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./UserList.scss";

function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 10;

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/api/users/', {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setError(null);
      } else if (response.status === 401) {
        setError('Session expired. Please login again.');
        // Optionally redirect to login
        // navigate('/login');
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Fetch error:', err);
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
      (u.user_id || "").toLowerCase().includes(q) ||
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
    
    if (window.confirm(`Delete ${u.name}?`)) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:8000/api/users/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        if (response.ok || response.status === 204) {
          setUsers((prev) => prev.filter((x) => x.id !== id));
          if ((page - 1) * pageSize >= Math.max(0, filtered.length - 1)) {
            setPage(Math.max(1, page - 1));
          }
        } else if (response.status === 401) {
          alert('Session expired. Please login again.');
        } else {
          alert('Failed to delete user');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Network error while deleting user');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="user-list-page content-full-width">
        <div className="loading-message">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-list-page content-full-width">
      <div className="userlist-header">
        <div className="header-left">
          <h1>User Management</h1>
        </div>

        <div className="header-right">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, job role, user ID, or level"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <button className="add-btn" onClick={handleAdd}>+ Add New</button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          padding: '12px', 
          background: '#fee', 
          color: '#c00', 
          borderRadius: '4px',
          marginBottom: '16px' 
        }}>
          {error}
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
                <th>USER ID</th>
                <th>JOB ROLE</th>
                <th>USER LEVEL</th>
                <th>PHONE NUMBER</th>
                <th>PHOTO</th>
                <th style={{ textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan="9" className="no-data">No records found</td></tr>
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
                    <td>{u.user_id}</td>
                    <td>{u.job_role}</td>
                    <td>{u.user_level}</td>
                    <td>{u.phone_number}</td>
                    <td>
                      {u.photo && (
                        <img 
                          src={u.photo} 
                          alt={u.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button className="action-btn view" onClick={() => handleView(u.id)}>View</button>
                      <button className="action-btn edit" onClick={() => handleEdit(u.id)}>Edit</button>
                      <button className="action-btn delete" onClick={() => handleDelete(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <div className="pagination-info">
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </div>
          <div className="pagination-controls">
            <button className="btn-small" onClick={() => setPage(1)} disabled={page === 1}>« First</button>
            <button className="btn-small" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
            <span className="page-indicator">Page {page} of {totalPages}</span>
            <button className="btn-small" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</button>
            <button className="btn-small" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last »</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserList;