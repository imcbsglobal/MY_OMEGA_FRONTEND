// src/components/TargetManagement/RouteTargetAssign.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/client";

const RouteTargetAssign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [formData, setFormData] = useState({
    employee: '',
    start_date: '',
    end_date: '',
    route: '',
    target_boxes: '',
    target_amount: '',
    notes: '',
    is_active: true,
    product_details: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingData(true);
    setDataError(null);
    
    try {
      console.log('Starting to fetch data...');
      
      // Fetch employees
      const empRes = await api.get('/employee-management/employees/');
      console.log('Employee response:', empRes);
      console.log('Employee data:', empRes.data);
      
      // Handle different response formats
      let employeeData = [];
      if (empRes.data) {
        if (Array.isArray(empRes.data)) {
          employeeData = empRes.data;
        } else if (empRes.data.results && Array.isArray(empRes.data.results)) {
          employeeData = empRes.data.results;
        } else if (empRes.data.data && Array.isArray(empRes.data.data)) {
          employeeData = empRes.data.data;
        }
      }
      
      console.log('Processed employee data:', employeeData);
      setEmployees(employeeData);

      // Fetch routes
      const routeRes = await api.get('/target-management/routes/');
      console.log('Route response:', routeRes);
      
      let routeData = [];
      if (routeRes.data) {
        if (Array.isArray(routeRes.data)) {
          routeData = routeRes.data;
        } else if (routeRes.data.results && Array.isArray(routeRes.data.results)) {
          routeData = routeRes.data.results;
        } else if (routeRes.data.data && Array.isArray(routeRes.data.data)) {
          routeData = routeRes.data.data;
        }
      }
      
      console.log('Processed route data:', routeData);
      setRoutes(routeData);

      // Fetch products
      const productRes = await api.get('/target-management/products/');
      console.log('Product response:', productRes);
      
      let productData = [];
      if (productRes.data) {
        if (Array.isArray(productRes.data)) {
          productData = productRes.data;
        } else if (productRes.data.results && Array.isArray(productRes.data.results)) {
          productData = productRes.data.results;
        } else if (productRes.data.data && Array.isArray(productRes.data.data)) {
          productData = productRes.data.data;
        }
      }
      
      console.log('Processed product data:', productData);
      setProducts(productData);

      // Show notifications
      if (employeeData.length === 0) {
        toast.warning('No employees found. Please add employees in Employee Management first.');
      } else {
        console.log(`✓ Loaded ${employeeData.length} employees`);
      }
      
      if (routeData.length === 0) {
        toast.warning('No routes found. Please add routes in Route Master first.');
      } else {
        console.log(`✓ Loaded ${routeData.length} routes`);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', error.response);
      setDataError(error.message || 'Failed to load data');
      toast.error('Failed to load initial data. Please check console for details.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addProductRow = () => {
    setFormData(prev => ({
      ...prev,
      product_details: [
        ...prev.product_details,
        { product: '', target_quantity: '', achieved_quantity: 0, unit_price: '' }
      ]
    }));
  };

  const updateProductRow = (index, field, value) => {
    const updated = [...formData.product_details];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, product_details: updated }));
  };

  const removeProductRow = (index) => {
    const updated = formData.product_details.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, product_details: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        toast.error('End date must be after start date');
        return;
      }
    }

    setLoading(true);

    try {
      console.log('Submitting form data:', formData);
      const response = await api.post('/target-management/route-targets/', formData);
      console.log('Submit response:', response);
      toast.success('Route target assigned successfully!');
      navigate('/target/route/list');
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message ||
                       error.response?.data?.error ||
                       'Failed to assign route target';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get Monday of current week
  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Helper function to get Sunday of current week
  const getSundayOfWeek = (date) => {
    const monday = getMondayOfWeek(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday;
  };

  // Preset week selection
  const selectCurrentWeek = () => {
    const monday = getMondayOfWeek(new Date());
    const sunday = getSundayOfWeek(new Date());
    
    setFormData(prev => ({
      ...prev,
      start_date: monday.toISOString().split('T')[0],
      end_date: sunday.toISOString().split('T')[0]
    }));
  };

  const selectNextWeek = () => {
    const nextMonday = getMondayOfWeek(new Date());
    nextMonday.setDate(nextMonday.getDate() + 7);
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    
    setFormData(prev => ({
      ...prev,
      start_date: nextMonday.toISOString().split('T')[0],
      end_date: nextSunday.toISOString().split('T')[0]
    }));
  };

  const selectCustomWeek = () => {
    setFormData(prev => ({
      ...prev,
      start_date: '',
      end_date: ''
    }));
  };

  // Get employee display name - handles multiple formats
  const getEmployeeDisplayName = (emp) => {
    if (!emp) return '';
    
    // Try to get employee ID
    const empId = emp.employee_id || emp.id || '';
    
    // Try to get full name from different possible fields
    const fullName = emp.full_name || 
                     emp.name || 
                     emp.user_name ||
                     (emp.job_info && emp.job_info.user_name) ||
                     emp.user_email ||
                     '';
    
    // Try to get designation
    const designation = emp.designation || 
                       (emp.job_info && emp.job_info.designation) || 
                       '';
    
    // Try to get department
    const department = emp.department || 
                      (emp.job_info && emp.job_info.department) || 
                      '';
    
    // Build display name
    let displayName = '';
    
    if (empId) {
      displayName = empId;
    }
    
    if (fullName) {
      displayName += (displayName ? ' - ' : '') + fullName;
    }
    
    if (designation || department) {
      displayName += ' (';
      if (designation) {
        displayName += designation;
        if (department) {
          displayName += ' - ' + department;
        }
      } else if (department) {
        displayName += department;
      }
      displayName += ')';
    }
    
    // Fallback if nothing is available
    if (!displayName && emp.id) {
      displayName = `Employee #${emp.id}`;
    }
    
    return displayName || 'Unknown Employee';
  };

  // Get route display name
  const getRouteDisplayName = (route) => {
    if (!route) return '';
    
    if (route.route_name) {
      return route.route_name;
    }
    if (route.origin && route.destination) {
      return `${route.origin} → ${route.destination}`;
    }
    if (route.route_code) {
      return route.route_code;
    }
    return route.id ? `Route #${route.id}` : 'Unknown Route';
  };

  if (loadingData) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Loading Data...</h5>
                <p className="text-muted">Fetching employees, routes, and products...</p>
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
                <div>
                  <h6 className="mb-0">Assign Route Target</h6>
                  <small className="text-muted">
                    Employees: {employees.length} | Routes: {routes.length} | Products: {products.length}
                  </small>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => navigate('/target/route/list')}
                >
                  ← Back to List
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Data Error Message */}
              {dataError && (
                <div className="alert alert-danger mb-4">
                  <h6 className="alert-heading">Error Loading Data</h6>
                  <p className="mb-0">{dataError}</p>
                  <button 
                    className="btn btn-sm btn-outline-danger mt-2"
                    onClick={fetchInitialData}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Missing Data Warning */}
              {(employees.length === 0 || routes.length === 0) && !dataError && (
                <div className="alert alert-warning mb-4">
                  <h6 className="alert-heading">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Missing Data
                  </h6>
                  <ul className="mb-2">
                    {employees.length === 0 && (
                      <li>
                        <strong>No employees found.</strong> Please add employees in Employee Management first.
                        <br />
                        <small className="text-muted">
                          Check if the API endpoint <code>/employee-management/employees/</code> is working correctly.
                        </small>
                      </li>
                    )}
                    {routes.length === 0 && (
                      <li>
                        <strong>No routes found.</strong> Please add routes in Route Master first.
                        <br />
                        <small className="text-muted">
                          Check if the API endpoint <code>/target-management/routes/</code> is working correctly.
                        </small>
                      </li>
                    )}
                  </ul>
                  <button 
                    className="btn btn-sm btn-outline-warning"
                    onClick={fetchInitialData}
                  >
                    <i className="fas fa-sync me-1"></i>
                    Refresh Data
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Employee Selection */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Employee *
                    </label>
                    <select
                      name="employee"
                      className="form-select"
                      value={formData.employee}
                      onChange={handleInputChange}
                      required
                      disabled={employees.length === 0}
                    >
                      <option value="">
                        {employees.length === 0 ? 'No employees available' : `Select Employee (${employees.length} available)`}
                      </option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {getEmployeeDisplayName(emp)}
                        </option>
                      ))}
                    </select>
                    {formData.employee && employees.length > 0 && (
                      <small className="text-success d-block mt-1">
                        <i className="fas fa-check-circle me-1"></i>
                        Selected: {getEmployeeDisplayName(
                          employees.find(e => e.id === parseInt(formData.employee))
                        )}
                      </small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Route *
                    </label>
                    <select
                      name="route"
                      className="form-select"
                      value={formData.route}
                      onChange={handleInputChange}
                      required
                      disabled={routes.length === 0}
                    >
                      <option value="">
                        {routes.length === 0 ? 'No routes available' : `Select Route (${routes.length} available)`}
                      </option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>
                          {getRouteDisplayName(route)}
                        </option>
                      ))}
                    </select>
                    {formData.route && routes.length > 0 && (
                      <small className="text-success d-block mt-1">
                        <i className="fas fa-check-circle me-1"></i>
                        Selected: {getRouteDisplayName(
                          routes.find(r => r.id === parseInt(formData.route))
                        )}
                      </small>
                    )}
                  </div>
                </div>

                {/* Period Selection */}
                <div className="mb-3">
                  <label className="form-label d-block">Quick Period Selection</label>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={selectCurrentWeek}
                    >
                      Current Week
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={selectNextWeek}
                    >
                      Next Week
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={selectCustomWeek}
                    >
                      Custom Period
                    </button>
                  </div>
                </div>

                {/* Date Range */}
                <div className="mb-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        name="start_date"
                        className="form-control"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                      />
                      {formData.start_date && (
                        <small className="text-muted">
                          {new Date(formData.start_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </small>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">End Date *</label>
                      <input
                        type="date"
                        name="end_date"
                        className="form-control"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                      />
                      {formData.end_date && (
                        <small className="text-muted">
                          {new Date(formData.end_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Period Summary */}
                  {formData.start_date && formData.end_date && (
                    <div className="alert alert-info">
                      <strong>Period Summary:</strong> {' '}
                      {new Date(formData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(formData.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' ('}
                      {Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24)) + 1} days
                      {')'}
                    </div>
                  )}
                </div>

                {/* Target Boxes & Amount */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Target Boxes *</label>
                    <input
                      type="number"
                      name="target_boxes"
                      className="form-control"
                      value={formData.target_boxes}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      placeholder="Enter target boxes"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Target Amount (₹) *</label>
                    <input
                      type="number"
                      name="target_amount"
                      className="form-control"
                      value={formData.target_amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      placeholder="Enter target amount"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0">
                      Product Details (Optional)
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={addProductRow}
                      disabled={products.length === 0}
                    >
                      + Add Product
                    </button>
                  </div>

                  {formData.product_details.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-bordered table-sm">
                        <thead className="table-light">
                          <tr>
                            <th width="40%">Product</th>
                            <th width="20%">Target Quantity</th>
                            <th width="20%">Unit Price (₹)</th>
                            <th width="20%">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.product_details.map((row, index) => (
                            <tr key={index}>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={row.product}
                                  onChange={(e) => updateProductRow(index, 'product', e.target.value)}
                                  required
                                >
                                  <option value="">Select Product</option>
                                  {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                      {product.product_name} ({product.product_code || 'N/A'})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={row.target_quantity}
                                  onChange={(e) => updateProductRow(index, 'target_quantity', e.target.value)}
                                  step="0.01"
                                  min="0"
                                  required
                                  placeholder="Qty"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={row.unit_price}
                                  onChange={(e) => updateProductRow(index, 'unit_price', e.target.value)}
                                  step="0.01"
                                  min="0"
                                  placeholder="Price"
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeProductRow(index)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {formData.product_details.length === 0 && (
                    <div className="text-center text-muted py-3 border rounded bg-light">
                      <i className="fas fa-box-open fa-2x mb-2 opacity-50"></i>
                      <p className="mb-0">
                        {products.length === 0 
                          ? 'No products available. Add products in Product Master first.'
                          : 'No products added. Click "Add Product" to add product-wise targets.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Optional notes about this target assignment..."
                  />
                </div>

                {/* Active Status */}
                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="form-check-input"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    id="isActiveCheck"
                  />
                  <label className="form-check-label" htmlFor="isActiveCheck">
                    <strong>Active Target</strong>
                    <small className="d-block text-muted">
                      Active targets are included in reports and dashboards
                    </small>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/target/route/list')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || employees.length === 0 || routes.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Assign Target
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteTargetAssign;