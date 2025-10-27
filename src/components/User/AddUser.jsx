// AddUser.jsx - FIXED VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddUser.scss';

function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',              // Changed from user_id to email
    password: '',
    user_level: 'User',
    job_role: '',
    phone_number: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://127.0.0.1:8000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, Email and Password are required.');
      setLoading(false);
      return;
    }

    // Build FormData with correct field names matching Django model
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);           // Changed from user_id
    data.append('password', formData.password);
    data.append('user_level', formData.user_level);
    
    // Only append optional fields if they have values
    if (formData.job_role) data.append('job_role', formData.job_role);
    if (formData.phone_number) data.append('phone_number', formData.phone_number);
    if (formData.photo) data.append('photo', formData.photo);

    try {
      const response = await fetch(`${API_BASE}/api/users/`, {
        method: 'POST',
        body: data,
      });

      let body = null;
      try {
        body = await response.json();
      } catch (err) {
        body = { detail: await response.text() };
      }

      if (response.ok) {
        alert('User created successfully!');
        navigate('/user/list');
      } else {
        // Show validation errors
        if (response.status === 400 && body && typeof body === 'object') {
          const errorMessages = Object.entries(body)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          setError(errorMessages);
        } else if (response.status === 401) {
          setError('Unauthorized: please login.');
        } else {
          setError(typeof body === 'string' ? body : JSON.stringify(body));
        }
      }
    } catch (err) {
      setError(`Network error: ${err.message}\n\nMake sure backend is running at ${API_BASE}`);
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-page">
      <div className="page-header">
        <h2>Add New User</h2>
        <button className="back-btn" onClick={() => navigate('/user/list')}>
          ← Back to List
        </button>
      </div>
      
      {error && (
        <div className="error-message" style={{
          background: '#fee',
          border: '1px solid #fcc',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          color: '#c00'
        }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>
        </div>
      )}
      
      <form className="user-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              This will be used as the unique user ID
            </small>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label>User Level *</label>
            <select
              name="user_level"
              value={formData.user_level}
              onChange={handleChange}
              required
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Job Role</label>
            <input
              type="text"
              name="job_role"
              value={formData.job_role}
              onChange={handleChange}
              placeholder="Enter job role (optional)"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1234567890 (optional)"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Format: +1234567890 (7-15 digits)
            </small>
          </div>

          <div className="form-group full-width">
            <label>Photo (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/user/list')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUser;