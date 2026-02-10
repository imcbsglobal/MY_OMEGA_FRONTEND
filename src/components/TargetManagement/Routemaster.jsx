// src/components/TargetManagement/RouteMaster.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from "../../api/client";
import "./targetManagement.css";

const RouteMaster = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    route_code: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/target-management/routes/');
      console.log('Routes response:', response.data);
      setRoutes(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load routes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const trimmedOrigin = formData.origin.trim();
    const trimmedDestination = formData.destination.trim();
    
    if (!trimmedOrigin || !trimmedDestination) {
      toast.error('Origin and destination are required');
      return;
    }
    
    if (trimmedOrigin.toLowerCase() === trimmedDestination.toLowerCase()) {
      toast.error('Origin and destination must be different');
      return;
    }
    
    // Check for duplicate route (only for new routes)
    if (!editingRoute) {
      const existingRoute = routes.find(
        r => r.origin.toLowerCase() === trimmedOrigin.toLowerCase() && 
             r.destination.toLowerCase() === trimmedDestination.toLowerCase()
      );
      
      if (existingRoute) {
        toast.error(`Route from ${trimmedOrigin} to ${trimmedDestination} already exists!`);
        return;
      }
      
      // Check for duplicate route code if provided
      if (formData.route_code && formData.route_code.trim()) {
        const existingCode = routes.find(
          r => r.route_code && r.route_code.toLowerCase() === formData.route_code.trim().toLowerCase()
        );
        
        if (existingCode) {
          toast.error(`Route code "${formData.route_code}" already exists!`);
          return;
        }
      }
    }
    
    try {
      if (editingRoute) {
        await api.put(`/target-management/routes/${editingRoute.id}/`, formData);
        toast.success('Route updated successfully');
      } else {
        await api.post('/target-management/routes/', formData);
        toast.success('Route created successfully');
      }
      
      setShowModal(false);
      setEditingRoute(null);
      setFormData({
        origin: '',
        destination: '',
        route_code: '',
        description: '',
        is_active: true
      });
      fetchRoutes();
    } catch (error) {
      // Enhanced error handling
      let errorMsg = 'Operation failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle specific field errors
        if (errorData.origin) {
          errorMsg = Array.isArray(errorData.origin) 
            ? errorData.origin[0] 
            : errorData.origin;
        } else if (errorData.destination) {
          errorMsg = Array.isArray(errorData.destination) 
            ? errorData.destination[0] 
            : errorData.destination;
        } else if (errorData.route_code) {
          errorMsg = Array.isArray(errorData.route_code) 
            ? errorData.route_code[0] 
            : errorData.route_code;
        } else if (errorData.non_field_errors) {
          errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else {
          // Try to extract any error message from the response
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && errorData[firstKey]) {
            const errorValue = errorData[firstKey];
            errorMsg = Array.isArray(errorValue) ? errorValue[0] : errorValue;
          }
        }
      }
      
      toast.error(errorMsg);
      console.error('Full error details:', error.response?.data || error);
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      origin: route.origin,
      destination: route.destination,
      route_code: route.route_code || '',
      description: route.description || '',
      is_active: route.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      await api.delete(`/target-management/routes/${id}/`);
      toast.success('Route deleted successfully');
      fetchRoutes();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message ||
                       'Failed to delete route';
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoute(null);
    setFormData({
      origin: '',
      destination: '',
      route_code: '',
      description: '',
      is_active: true
    });
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Loading routes...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header pb-0">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="mb-0">Route Master</h6>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  + Add New Route
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Route Code</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Origin</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Destination</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Description</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                      <th className="text-secondary opacity-7">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No routes found. Click "Add New Route" to create one.</td>
                      </tr>
                    ) : (
                      routes.map(route => (
                        <tr key={route.id}>
                          <td><p className="text-sm font-weight-bold mb-0">{route.route_code || '-'}</p></td>
                          <td><p className="text-sm text-secondary mb-0">{route.origin}</p></td>
                          <td><p className="text-sm text-secondary mb-0">{route.destination}</p></td>
                          <td><p className="text-xs text-secondary mb-0">{route.description || '-'}</p></td>
                          <td className="align-middle text-center">
                            <span className={`badge badge-sm ${route.is_active ? 'bg-gradient-success' : 'bg-gradient-secondary'}`}>{route.is_active ? 'Active' : 'Inactive'}</span>
                          </td>
                          <td className="align-middle">
                            <button className="btn btn-link text-secondary mb-0" onClick={() => handleEdit(route)}><i className="fas fa-edit"></i></button>
                            <button className="btn btn-link text-danger mb-0" onClick={() => handleDelete(route.id)}><i className="fas fa-trash"></i></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-custom-backdrop" onClick={handleCloseModal} />
          <div className="modal-custom" role="dialog" aria-modal="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingRoute ? 'Edit Route' : 'Add New Route'}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Origin *</label>
                      <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} className="form-control" required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Destination *</label>
                      <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} className="form-control" required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Route Code</label>
                      <input type="text" name="route_code" value={formData.route_code} onChange={handleInputChange} className="form-control" />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="form-control" />
                    </div>

                    <div className="form-check">
                      <input type="checkbox" name="is_active" className="form-check-input" checked={formData.is_active} onChange={handleInputChange} id="isActiveCheckRoute" />
                      <label className="form-check-label" htmlFor="isActiveCheckRoute">Active</label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editingRoute ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RouteMaster;