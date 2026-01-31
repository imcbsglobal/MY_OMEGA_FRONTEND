import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../api/client';

export default function Travel() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userLevel = user?.user_level || "User";
  const userName = user?.name || "";
  const userId = user?.id || null;

  const [view, setView] = useState('list'); // 'list', 'add', 'end'
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Form states for Start Trip
  const [formData, setFormData] = useState({
    vehicle: '',
    employee: userId,
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    time_period: 'AM',
    client_name: '',
    purpose: '',
    fuel_cost: '0',
    odometer_start: '',
    odometer_start_image: null,
  });

  // Form states for End Trip
  const [endFormData, setEndFormData] = useState({
    odometer_end: '',
    end_time: '',
    odometer_end_image: null,
  });

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
  }, []);

  // Fetch active vehicles for dropdown
  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicle-management/vehicles/dropdown/');
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setErrors({ fetch: 'Failed to load vehicles. Please refresh the page.' });
    }
  };

  // Fetch user's trips
  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicle-management/trips/my-trips/');
      const formattedTrips = formatTripsData(response.data || []);
      setTrips(formattedTrips);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      setErrors({ fetch: 'Failed to load trips. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Format trips data for display
  const formatTripsData = (data) => {
    return data.map(trip => ({
      id: trip.id,
      vehicle: trip.vehicle_info?.registration_number || 'N/A',
      vehicle_name: trip.vehicle_info?.vehicle_name || '',
      traveler_name: trip.employee_info?.full_name || trip.employee_info?.email || 'N/A',
      client_purpose: trip.client_name && trip.purpose 
        ? `${trip.client_name}\n${trip.purpose}` 
        : trip.purpose || '—',
      date: formatDate(trip.date),
      start_time: formatTime(trip.start_time, trip.time_period),
      end_time: trip.end_time ? formatTime(trip.end_time, trip.time_period) : '—',
      odo_start: parseFloat(trip.odometer_start || 0).toFixed(2),
      odo_end: trip.odometer_end ? parseFloat(trip.odometer_end).toFixed(2) : '—',
      distance: trip.distance_km ? parseFloat(trip.distance_km).toFixed(2) : '—',
      fuel_cost: `₹${parseFloat(trip.fuel_cost || 0).toFixed(2)}`,
      status: trip.status.charAt(0).toUpperCase() + trip.status.slice(1),
      start_image: !!trip.odometer_start_url,
      end_image: !!trip.odometer_end_url,
      start_image_url: trip.odometer_start_url,
      end_image_url: trip.odometer_end_url,
      raw_data: trip
    }));
  };

  // Format date to DD-MMM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format time to 12-hour format
  const formatTime = (timeString, period) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours);
    const ampm = period || (hour >= 12 ? 'PM' : 'AM');
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Handle vehicle selection and auto-fill odometer
  const handleVehicleChange = (vehicleId) => {
    const selectedVehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    setFormData({
      ...formData,
      vehicle: vehicleId,
      odometer_start: selectedVehicle ? selectedVehicle.current_odometer.toString() : ''
    });
  };

  // Handle start trip form submission
  const handleStartTrip = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('vehicle', formData.vehicle);
      submitData.append('employee', userId);
      submitData.append('date', formData.date);
      submitData.append('start_time', formData.start_time);
      submitData.append('time_period', formData.time_period);
      submitData.append('client_name', formData.client_name || '');
      submitData.append('purpose', formData.purpose || '');
      submitData.append('fuel_cost', formData.fuel_cost || '0');
      submitData.append('odometer_start', formData.odometer_start);
      
      if (formData.odometer_start_image) {
        submitData.append('odometer_start_image', formData.odometer_start_image);
      }

      const response = await api.post('/vehicle-management/trips/start/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Trip started successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setFormData({
        vehicle: '',
        employee: userId,
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        time_period: 'AM',
        client_name: '',
        purpose: '',
        fuel_cost: '0',
        odometer_start: '',
        odometer_start_image: null,
      });
      
      setView('list');
      fetchTrips();
    } catch (error) {
      console.error('Failed to start trip:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to start trip. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle end trip form submission
  const handleEndTrip = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('end_time', endFormData.end_time);
      submitData.append('odometer_end', endFormData.odometer_end);
      
      if (endFormData.odometer_end_image) {
        submitData.append('odometer_end_image', endFormData.odometer_end_image);
      }

      const response = await api.patch(
        `/vehicle-management/trips/${selectedTrip.id}/end/`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccessMessage('Trip completed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setView('list');
      setSelectedTrip(null);
      setEndFormData({
        odometer_end: '',
        end_time: '',
        odometer_end_image: null,
      });
      fetchTrips();
    } catch (error) {
      console.error('Failed to end trip:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to complete trip. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const openEndTripForm = (trip) => {
    setSelectedTrip(trip.raw_data);
    setEndFormData({
      odometer_end: '',
      end_time: '',
      odometer_end_image: null,
    });
    setView('end');
  };

  // Render Start Trip Form
  const renderStartTripForm = () => (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>Start Trip</h2>
          <p style={styles.formSubtitle}>Logged in as {userName}</p>
        </div>

        {successMessage && (
          <div style={styles.successMessage}>{successMessage}</div>
        )}

        {errors.general && (
          <div style={styles.errorMessage}>{errors.general}</div>
        )}

        <form onSubmit={handleStartTrip}>
          {/* TRIP BASICS */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>TRIP BASICS</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle *</label>
                <select
                  value={formData.vehicle}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration_number} - {vehicle.vehicle_name}
                    </option>
                  ))}
                </select>
                {errors.vehicle && <span style={styles.errorText}>{errors.vehicle}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.date && <span style={styles.errorText}>{errors.date}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Time *</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.start_time && <span style={styles.errorText}>{errors.start_time}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Time Period *</label>
                <select
                  value={formData.time_period}
                  onChange={(e) => setFormData({...formData, time_period: e.target.value})}
                  style={styles.select}
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                placeholder="Enter client name (optional)"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Purpose of Trip</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                placeholder="Enter the purpose of this trip..."
                style={styles.textarea}
                rows="4"
              />
              {errors.purpose && <span style={styles.errorText}>{errors.purpose}</span>}
            </div>
          </div>

          {/* FUEL & ODOMETER */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>FUEL & ODOMETER</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Fuel Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fuel_cost}
                  onChange={(e) => setFormData({...formData, fuel_cost: e.target.value})}
                  placeholder="0.00"
                  style={styles.input}
                />
                {errors.fuel_cost && <span style={styles.errorText}>{errors.fuel_cost}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Odometer Start (KM) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.odometer_start}
                  onChange={(e) => setFormData({...formData, odometer_start: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.odometer_start && <span style={styles.errorText}>{errors.odometer_start}</span>}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Odometer Start Image</label>
              <input
                type="file"
                onChange={(e) => setFormData({...formData, odometer_start_image: e.target.files[0]})}
                style={styles.fileInput}
                accept="image/*"
              />
              {formData.odometer_start_image && (
                <span style={styles.fileName}>{formData.odometer_start_image.name}</span>
              )}
            </div>

            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                After you start, you'll be taken back to <strong>Travel Management</strong>. Use the <em>End Trip</em> button in the list when the trip is finished.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setView('list');
                setErrors({});
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
              {loading ? 'Starting Trip...' : 'Start Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render End Trip Form
  const renderEndTripForm = () => (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>End Trip</h2>
          <p style={styles.formSubtitle}>
            Vehicle: {selectedTrip?.vehicle_info?.registration_number || 'N/A'}
          </p>
        </div>

        {successMessage && (
          <div style={styles.successMessage}>{successMessage}</div>
        )}

        {errors.general && (
          <div style={styles.errorMessage}>{errors.general}</div>
        )}

        {errors.error && (
          <div style={styles.errorMessage}>{errors.error}</div>
        )}

        <form onSubmit={handleEndTrip}>
          {/* Trip Start Info (Read-only) */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>TRIP START INFO</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="text"
                  value={formatDate(selectedTrip?.date)}
                  style={styles.inputDisabled}
                  disabled
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Time</label>
                <input
                  type="text"
                  value={formatTime(selectedTrip?.start_time, selectedTrip?.time_period)}
                  style={styles.inputDisabled}
                  disabled
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Odometer Start</label>
                <input
                  type="text"
                  value={selectedTrip?.odometer_start || '0'}
                  style={styles.inputDisabled}
                  disabled
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Fuel Cost</label>
                <input
                  type="text"
                  value={`₹${parseFloat(selectedTrip?.fuel_cost || 0).toFixed(2)}`}
                  style={styles.inputDisabled}
                  disabled
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Purpose</label>
              <textarea
                value={selectedTrip?.purpose || 'N/A'}
                style={styles.inputDisabled}
                rows="3"
                disabled
              />
            </div>
          </div>

          {/* Trip End Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>TRIP END DETAILS</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>End Time *</label>
                <input
                  type="time"
                  value={endFormData.end_time}
                  onChange={(e) => setEndFormData({...endFormData, end_time: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.end_time && <span style={styles.errorText}>{errors.end_time}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Odometer End (KM) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={endFormData.odometer_end}
                  onChange={(e) => setEndFormData({...endFormData, odometer_end: e.target.value})}
                  style={styles.input}
                  placeholder={`Must be ≥ ${selectedTrip?.odometer_start || 0}`}
                  required
                />
                {errors.odometer_end && <span style={styles.errorText}>{errors.odometer_end}</span>}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Odometer End Image</label>
              <input
                type="file"
                onChange={(e) => setEndFormData({...endFormData, odometer_end_image: e.target.files[0]})}
                style={styles.fileInput}
                accept="image/*"
              />
              {endFormData.odometer_end_image && (
                <span style={styles.fileName}>{endFormData.odometer_end_image.name}</span>
              )}
            </div>

            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                Once you complete the trip, it will be sent for admin approval. The distance will be automatically calculated.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setView('list');
                setSelectedTrip(null);
                setErrors({});
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
              {loading ? 'Completing Trip...' : 'Complete Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render Trip List
  const renderTripList = () => (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.pageTitle}>Travel Management</h1>
            <p style={styles.pageDescription}>Track and manage your trips</p>
          </div>
        </div>
        <button onClick={() => setView('add')} style={styles.addButton}>
          <Plus size={18} />
          Start New Trip
        </button>
      </div>

      {successMessage && (
        <div style={styles.successMessage}>{successMessage}</div>
      )}

      {errors.fetch && (
        <div style={styles.errorMessage}>{errors.fetch}</div>
      )}

      {/* Results Count */}
      <div style={styles.resultsCount}>
        {trips.length} trip(s) found
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>#</th>
                <th style={styles.tableHeader}>VEHICLE</th>
                <th style={styles.tableHeader}>TRAVELED BY</th>
                <th style={styles.tableHeader}>CLIENT & PURPOSE</th>
                <th style={styles.tableHeader}>DATE</th>
                <th style={styles.tableHeader}>START TIME</th>
                <th style={styles.tableHeader}>END TIME</th>
                <th style={styles.tableHeader}>ODO START</th>
                <th style={styles.tableHeader}>ODO END</th>
                <th style={styles.tableHeader}>DISTANCE (KM)</th>
                <th style={styles.tableHeader}>FUEL COST</th>
                <th style={styles.tableHeader}>START IMAGE</th>
                <th style={styles.tableHeader}>END IMAGE</th>
                <th style={styles.tableHeader}>STATUS / ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="14" style={styles.noData}>Loading trips...</td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="14" style={styles.noData}>No trips found. Start your first trip!</td>
                </tr>
              ) : (
                trips.map((trip, index) => (
                  <tr key={trip.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>
                      <div>{trip.vehicle}</div>
                      {trip.vehicle_name && (
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                          {trip.vehicle_name}
                        </div>
                      )}
                    </td>
                    <td style={styles.tableCell}>{trip.traveler_name}</td>
                    <td style={styles.tableCell}>
                      {trip.client_purpose.includes('\n') ? (
                        <>
                          <div style={styles.clientName}>
                            {trip.client_purpose.split('\n')[0]}
                          </div>
                          <div style={styles.clientPurpose}>
                            {trip.client_purpose.split('\n')[1]}
                          </div>
                        </>
                      ) : (
                        trip.client_purpose
                      )}
                    </td>
                    <td style={styles.tableCell}>{trip.date}</td>
                    <td style={styles.tableCell}>{trip.start_time}</td>
                    <td style={styles.tableCell}>{trip.end_time}</td>
                    <td style={styles.tableCell}>{trip.odo_start}</td>
                    <td style={styles.tableCell}>{trip.odo_end}</td>
                    <td style={styles.tableCell}>{trip.distance}</td>
                    <td style={styles.tableCell}>{trip.fuel_cost}</td>
                    <td style={styles.tableCell}>
                      {trip.start_image ? (
                        <a
                          href={trip.start_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.viewButton}
                        >
                          View
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {trip.end_image ? (
                        <a
                          href={trip.end_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.viewButton}
                        >
                          View
                        </a>
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <div
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            trip.status === 'Started'
                              ? '#fef3c7'
                              : trip.status === 'Completed'
                              ? '#dbeafe'
                              : trip.status === 'Approved'
                              ? '#d1fae5'
                              : '#fee2e2',
                          color:
                            trip.status === 'Started'
                              ? '#92400e'
                              : trip.status === 'Completed'
                              ? '#1e40af'
                              : trip.status === 'Approved'
                              ? '#065f46'
                              : '#991b1b',
                        }}
                      >
                        {trip.status}
                      </div>
                      {trip.status === 'Started' && (
                        <button
                          onClick={() => openEndTripForm(trip)}
                          style={styles.endTripButton}
                        >
                          End Trip
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Main render
  if (view === 'add') return renderStartTripForm();
  if (view === 'end') return renderEndTripForm();
  return renderTripList();
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
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
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
  formHeader: {
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    borderRadius: '8px 8px 0 0',
    marginBottom: '0',
    borderBottom: '1px solid #e5e7eb',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  formSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
  },
  inputDisabled: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    outline: 'none',
  },
  select: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  textarea: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  fileInput: {
    padding: '8px 10px',
    fontSize: '13px',
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
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: '10px 12px',
    borderRadius: '6px',
    marginTop: '12px',
  },
  infoText: {
    fontSize: '13px',
    color: '#1e40af',
    margin: 0,
    lineHeight: '1.5',
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
    transition: 'background-color 0.2s',
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
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
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
  tableContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'visible',
    marginBottom: '24px',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    overflowY: 'visible',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'auto',
  },
  tableHeaderRow: {
    backgroundColor: '#f9fafb',
  },
  tableHeader: {
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.15s',
  },
  tableCell: {
    padding: '10px 8px',
    fontSize: '12px',
    color: '#374151',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    borderRight: '1px solid #e5e7eb',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '11px',
    fontWeight: '600',
  },
  endTripButton: {
    display: 'block',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#f59e0b',
    border: 'none',
    borderRadius: '20px',
    marginTop: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%',
  },
  clientName: {
    fontWeight: '600',
    color: '#111827',
  },
  clientPurpose: {
    fontSize: '11px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  viewButton: {
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textDecoration: 'none',
    display: 'inline-block',
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  formWrapper: {
    maxWidth: '700px',
    width: '100%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    margin: '0 auto',
  },
};