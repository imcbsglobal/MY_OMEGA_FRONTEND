// src/components/TargetManagement/RouteMaster.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from "../../api/client";

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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading routes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Route Master</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Route
        </button>
      </div>

      {/* Routes Table */}
      <div className="bg-white shadow-md rounded overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No routes found. Click "Add New Route" to create one.
                </td>
              </tr>
            ) : (
              routes.map((route) => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {route.route_code || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {route.origin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {route.destination}
                  </td>
                  <td className="px-6 py-4">
                    {route.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      route.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {route.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(route)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Origin *
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Route Code
                </label>
                <input
                  type="text"
                  name="route_code"
                  value={formData.route_code}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm font-bold">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {editingRoute ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMaster;