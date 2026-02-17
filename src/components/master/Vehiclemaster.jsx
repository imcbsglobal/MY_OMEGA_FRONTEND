import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Car } from 'lucide-react';
import api from '../../api/client';

export default function VehicleMaster() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userLevel = user?.user_level || "User";
  const isAdmin = userLevel === "Admin" || userLevel === "Super Admin";

  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    vehicle_name: '',
    company: '',
    registration_number: '',
    vehicle_type: 'car',
    fuel_type: 'petrol',
    color: '',
    manufacturing_year: '',
    seating_capacity: '',
    photo: null,
    owner_name: '',
    insurance_number: '',
    insurance_expiry_date: '',
    last_service_date: '',
    next_service_date: '',
    current_odometer: '0',
    chassis_number: '',
    engine_number: '',
    notes: '',
    is_active: true,
  });

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchVehicles();
    }
  }, [isAdmin]);

  // Populate form when selectedVehicle changes (for edit mode)
  useEffect(() => {
    if (selectedVehicle && view === 'edit') {
      console.log('Setting form data with:', selectedVehicle);
      setFormData({
        vehicle_name: selectedVehicle.vehicle_name || '',
        company: selectedVehicle.company || '',
        registration_number: selectedVehicle.registration_number || '',
        vehicle_type: selectedVehicle.vehicle_type || 'car',
        fuel_type: selectedVehicle.fuel_type || 'petrol',
        color: selectedVehicle.color || '',
        manufacturing_year: selectedVehicle.manufacturing_year || '',
        seating_capacity: selectedVehicle.seating_capacity || '',
        photo: null,
        owner_name: selectedVehicle.owner_name || '',
        insurance_number: selectedVehicle.insurance_number || '',
        insurance_expiry_date: selectedVehicle.insurance_expiry_date || '',
        last_service_date: selectedVehicle.last_service_date || '',
        next_service_date: selectedVehicle.next_service_date || '',
        current_odometer: selectedVehicle.current_odometer || '0',
        chassis_number: selectedVehicle.chassis_number || '',
        engine_number: selectedVehicle.engine_number || '',
        notes: selectedVehicle.notes || '',
        is_active: selectedVehicle.is_active !== undefined ? selectedVehicle.is_active : true,
      });
    }
  }, [selectedVehicle, view]);

  // Fetch vehicles
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (vehicleTypeFilter) params.append('vehicle_type', vehicleTypeFilter);
      if (activeFilter !== 'all') {
        params.append('is_active', activeFilter === 'active' ? 'true' : 'false');
      }

      const response = await api.get(`/vehicle-management/vehicles/?${params.toString()}`);
      const vehiclesData = response.data?.results || response.data || [];
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setErrorMessage('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchVehicles();
  };

  const handleReset = () => {
    setSearchQuery('');
    setVehicleTypeFilter('');
    setActiveFilter('all');
    setTimeout(() => fetchVehicles(), 100);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      vehicle_name: '',
      company: '',
      registration_number: '',
      vehicle_type: 'car',
      fuel_type: 'petrol',
      color: '',
      manufacturing_year: '',
      seating_capacity: '',
      photo: null,
      owner_name: '',
      insurance_number: '',
      insurance_expiry_date: '',
      last_service_date: '',
      next_service_date: '',
      current_odometer: '0',
      chassis_number: '',
      engine_number: '',
      notes: '',
      is_active: true,
    });
    setErrors({});
  };

  // Handle add vehicle
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'photo' && formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          } else if (key !== 'photo') {
            submitData.append(key, formData[key]);
          }
        }
      });

      await api.post('/vehicle-management/vehicles/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Vehicle added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      resetForm();
      setView('list');
      fetchVehicles();
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrorMessage('Failed to add vehicle. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit vehicle
  const handleEditVehicle = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'photo' && formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          } else if (key !== 'photo') {
            submitData.append(key, formData[key]);
          }
        }
      });

      await api.patch(`/vehicle-management/vehicles/${selectedVehicle.id}/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Vehicle updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      resetForm();
      setView('list');
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrorMessage('Failed to update vehicle. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/vehicle-management/vehicles/${vehicleId}/`);
      setSuccessMessage('Vehicle deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      setErrorMessage('Failed to delete vehicle. Please try again.');
    }
  };

  // Open edit form
  const openEditForm = async (vehicle) => {
    console.log('Vehicle data from list:', vehicle);
    setLoading(true);
    try {
      // Fetch complete vehicle details
      const response = await api.get(`/vehicle-management/vehicles/${vehicle.id}/`);
      const fullVehicleData = response.data;
      console.log('Full vehicle data from API:', fullVehicleData);
      setSelectedVehicle(fullVehicleData);
      setView('edit');
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
      setErrorMessage('Failed to load vehicle details. Please try again.');
      // Fallback to using the list data
      setSelectedVehicle(vehicle);
      setView('edit');
    } finally {
      setLoading(false);
    }
  };

  // Render vehicle form
  const renderVehicleForm = () => (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>
            {view === 'edit' ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
        </div>

        {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
        {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
        {errors.general && <div style={styles.errorMessage}>{errors.general}</div>}

        <form onSubmit={view === 'edit' ? handleEditVehicle : handleAddVehicle}>
          {/* Basic Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>BASIC INFORMATION</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle Name *</label>
                <input
                  type="text"
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({...formData, vehicle_name: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.vehicle_name && <span style={styles.errorText}>{errors.vehicle_name}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Company/Brand</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Registration Number *</label>
                <input
                  type="text"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.registration_number && <span style={styles.errorText}>{errors.registration_number}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle Type</label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                  style={styles.select}
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                  <option value="bus">Bus</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Fuel Type</label>
                <select
                  value={formData.fuel_type}
                  onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                  style={styles.select}
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="cng">CNG</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Manufacturing Year</label>
                <input
                  type="number"
                  value={formData.manufacturing_year}
                  onChange={(e) => setFormData({...formData, manufacturing_year: e.target.value})}
                  style={styles.input}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Seating Capacity</label>
                <input
                  type="number"
                  value={formData.seating_capacity}
                  onChange={(e) => setFormData({...formData, seating_capacity: e.target.value})}
                  style={styles.input}
                  min="1"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Vehicle Photo</label>
              <input
                type="file"
                onChange={(e) => setFormData({...formData, photo: e.target.files[0]})}
                style={styles.fileInput}
                accept="image/*"
              />
              {formData.photo && <span style={styles.fileName}>{formData.photo.name}</span>}
            </div>
          </div>

          {/* Ownership & Insurance */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>OWNERSHIP & INSURANCE</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Owner Name</label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Insurance Number</label>
                <input
                  type="text"
                  value={formData.insurance_number}
                  onChange={(e) => setFormData({...formData, insurance_number: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Insurance Expiry Date</label>
                <input
                  type="date"
                  value={formData.insurance_expiry_date}
                  onChange={(e) => setFormData({...formData, insurance_expiry_date: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>MAINTENANCE</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Service Date</label>
                <input
                  type="date"
                  value={formData.last_service_date}
                  onChange={(e) => setFormData({...formData, last_service_date: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Next Service Date</label>
                <input
                  type="date"
                  value={formData.next_service_date}
                  onChange={(e) => setFormData({...formData, next_service_date: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Odometer (KM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_odometer}
                  onChange={(e) => setFormData({...formData, current_odometer: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>TECHNICAL DETAILS</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Chassis Number</label>
                <input
                  type="text"
                  value={formData.chassis_number}
                  onChange={(e) => setFormData({...formData, chassis_number: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Engine Number</label>
                <input
                  type="text"
                  value={formData.engine_number}
                  onChange={(e) => setFormData({...formData, engine_number: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>ADDITIONAL INFORMATION</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                style={styles.textarea}
                rows="4"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  style={styles.checkbox}
                />
                <span style={{ marginLeft: '8px' }}>Active Vehicle</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setView('list');
                resetForm();
                setSelectedVehicle(null);
              }}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : view === 'edit' ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render vehicle list
  const renderVehicleList = () => (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Vehicle Master</h1>
          <p style={styles.pageDescription}>Manage your fleet of vehicles</p>
        </div>
        <button onClick={() => {
          resetForm();
          setSelectedVehicle(null);
          setView('add');
        }} style={styles.addButton}>
          <Plus size={18} />
          Add New Vehicle
        </button>
      </div>

      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}

      {/* Filters */}
      <div style={styles.filterSection}>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Search</label>
            <input
              type="text"
              placeholder="Registration, name, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Vehicle Type</label>
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">All Types</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
              <option value="bus">Bus</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Status</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              style={styles.select}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ ...styles.filterGroup, alignSelf: 'flex-end' }}>
            <button onClick={handleApplyFilters} style={styles.applyButton}>
              Apply Filters
            </button>
          </div>

          <div style={{ ...styles.filterGroup, alignSelf: 'flex-end' }}>
            <button onClick={handleReset} style={styles.resetButton}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={styles.resultsCount}>
        {vehicles.length} vehicle(s) found
      </div>

      {/* Vehicle Grid */}
      <div style={styles.vehicleGrid}>
        {loading ? (
          <div style={styles.noData}>Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div style={styles.noData}>No vehicles found. Add your first vehicle!</div>
        ) : (
          vehicles.map(vehicle => (
            <div key={vehicle.id} style={styles.vehicleCard}>
              <div style={styles.vehicleImageContainer}>
                {vehicle.photo ? (
                  <img src={vehicle.photo_url} alt={vehicle.vehicle_name} style={styles.vehicleImage} />
                ) : (
                  <div style={styles.vehiclePlaceholder}>
                    <Car size={48} color="#9ca3af" />
                  </div>
                )}
                <div style={{
                  ...styles.statusBadge,
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: vehicle.is_active ? '#d1fae5' : '#fee2e2',
                  color: vehicle.is_active ? '#065f46' : '#991b1b'
                }}>
                  {vehicle.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div style={styles.vehicleContent}>
                <h3 style={styles.vehicleTitle}>{vehicle.vehicle_name}</h3>
                <p style={styles.vehicleRegNo}>{vehicle.registration_number}</p>
                
                <div style={styles.vehicleDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Company:</span>
                    <span style={styles.detailValue}>{vehicle.company || 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Type:</span>
                    <span style={styles.detailValue}>{vehicle.vehicle_type || 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Fuel:</span>
                    <span style={styles.detailValue}>{vehicle.fuel_type || 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Odometer:</span>
                    <span style={styles.detailValue}>{parseFloat(vehicle.current_odometer).toFixed(2)} KM</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Total Trips:</span>
                    <span style={styles.detailValue}>{vehicle.total_trips || 0}</span>
                  </div>
                </div>

                <div style={styles.vehicleActions}>
                  <button
                    onClick={() => openEditForm(vehicle)}
                    style={styles.editButton}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (!isAdmin) return null;
  if (view === 'add' || view === 'edit') return renderVehicleForm();
  return renderVehicleList();
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    margin: 0,
    color: '#111827',
  },
  pageDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  successMessage: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e5e7eb',
  },
  filterRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '150px',
    flex: '1',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  fileInput: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
  },
  fileName: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    display: 'block',
  },
  applyButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resetButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resultsCount: {
    backgroundColor: '#ffffff',
    padding: '12px 20px',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  vehicleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
  },
  vehicleImageContainer: {
    position: 'relative',
    height: '200px',
    backgroundColor: '#f9fafb',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  vehiclePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  vehicleContent: {
    padding: '16px',
  },
  vehicleTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: '#111827',
  },
  vehicleRegNo: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 12px 0',
  },
  vehicleDetails: {
    marginBottom: '16px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '13px',
    borderBottom: '1px solid #f3f4f6',
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    color: '#111827',
    fontWeight: '500',
  },
  vehicleActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  noData: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9ca3af',
    fontSize: '16px',
  },
  formWrapper: {
    maxWidth: '900px',
    width: '100%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    margin: '0 auto',
  },
  formHeader: {
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    borderRadius: '8px 8px 0 0',
    borderBottom: '1px solid #e5e7eb',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    marginTop: 0,
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#374151',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  formActions: {
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderRadius: '0 0 8px 8px',
  },
  cancelButton: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};