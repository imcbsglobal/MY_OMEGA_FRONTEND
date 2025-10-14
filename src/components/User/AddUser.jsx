import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddUser.scss';

function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    password: '',
    user_level: 'User',
    job_role: '',
    phone_number: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      // Create preview
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

    // Get the correct token key from localStorage (same as LoginPage uses)
    const token = localStorage.getItem('accessToken');
    
    // Create FormData for file upload
    const data = new FormData();
    data.append('name', formData.name);
    data.append('user_id', formData.user_id);
    data.append('password', formData.password);
    data.append('user_level', formData.user_level);
    data.append('job_role', formData.job_role);
    data.append('phone_number', formData.phone_number);
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: data,
      });

      if (response.ok) {
        alert('User created successfully!');
        navigate('/user/list');
      } else {
        const errorData = await response.json();
        // Format error messages nicely
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError(JSON.stringify(errorData));
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
        <div className="error-message">
          <pre>{error}</pre>
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
            <label>User ID *</label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              placeholder="Enter unique user ID"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
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
            <label>Job Role *</label>
            <input
              type="text"
              name="job_role"
              value={formData.job_role}
              onChange={handleChange}
              placeholder="Enter job role"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Photo *</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              required
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