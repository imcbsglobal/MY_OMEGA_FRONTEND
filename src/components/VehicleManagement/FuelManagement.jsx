import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import api from '../../api/client';

export default function FuelManagement() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userLevel = user?.user_level || "User";
  const isAdmin = userLevel === "Admin" || userLevel === "Super Admin";

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [travelerSearch, setTravelerSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imageModal, setImageModal] = useState({ show: false, url: '', title: '' });

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
    }
  }, [isAdmin]);

  // Fetch trips and vehicles data
  useEffect(() => {
    if (isAdmin) {
      fetchTrips();
      fetchVehicles();
    }
  }, [isAdmin]);

  // Fetch all vehicles for filter dropdown
  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicle-management/vehicles/dropdown/');
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  // Fetch trips data with filters
  const fetchTrips = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Build query params
      const params = new URLSearchParams();
      
      if (statusFilter && statusFilter !== 'All') {
        params.append('status', statusFilter.toLowerCase());
      }
      if (vehicleFilter) {
        params.append('vehicle', vehicleFilter);
      }
      if (dateFrom) {
        params.append('start_date', dateFrom);
      }
      if (dateTo) {
        params.append('end_date', dateTo);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }


      const response = await api.get(`/vehicle-management/trips/?${params.toString()}`);
      // Handle paginated response - extract the results array
      const tripsData = response.data?.results || response.data || [];
      const formattedTrips = formatTripsData(tripsData);
      setTrips(formattedTrips);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      setErrorMessage('Failed to load trips. Please try again.');
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
      traveler_email: trip.employee_info?.email || '',
      client_name: trip.client_name || '—',
      purpose: trip.purpose || '',
      client_purpose: trip.client_name && trip.purpose 
        ? `${trip.client_name}\n${trip.purpose}` 
        : trip.purpose || '—',
      date: formatDate(trip.date),
      start_time: formatTime(trip.start_time, trip.time_period),
      end_time: trip.end_time ? formatTime(trip.end_time, trip.time_period) : '—',
      odo_start: parseFloat(trip.odometer_start || 0).toFixed(2),
      odo_end: trip.odometer_end ? parseFloat(trip.odometer_end).toFixed(2) : '—',
      distance: trip.distance_km ? parseFloat(trip.distance_km).toFixed(2) : '—',
      fuel_cost: parseFloat(trip.fuel_cost || 0).toFixed(2),
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

  const handleApplyFilters = () => {
    fetchTrips();
  };

  const handleReset = () => {
    setSearchQuery('');
    setTravelerSearch('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('All');
    setVehicleFilter('');
    
    // Fetch all trips without filters
    setTimeout(() => {
      fetchTrips();
    }, 100);
  };

  // Approve trip
  const handleApprove = async (tripId) => {
    if (!window.confirm('Are you sure you want to approve this trip?')) {
      return;
    }

    try {
      await api.patch(`/vehicle-management/trips/${tripId}/approve/`, {
        status: 'approved',
        admin_notes: ''
      });

      setSuccessMessage('Trip approved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchTrips();
    } catch (error) {
      console.error('Failed to approve trip:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to approve trip. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Reject trip
  const handleReject = async (tripId) => {
    const notes = window.prompt('Please enter rejection reason (optional):');
    if (notes === null) return; // User cancelled

    try {
      await api.patch(`/vehicle-management/trips/${tripId}/approve/`, {
        status: 'rejected',
        admin_notes: notes || 'Rejected by admin'
      });

      setSuccessMessage('Trip rejected successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchTrips();
    } catch (error) {
      console.error('Failed to reject trip:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to reject trip. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Delete trip
  const handleDelete = async (tripId, tripStatus) => {
    // Check if trip can be deleted
    if (tripStatus === 'Completed' || tripStatus === 'Approved') {
      setErrorMessage('Cannot delete completed or approved trips.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/vehicle-management/trips/${tripId}/delete/`);
      
      setSuccessMessage('Trip deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchTrips();
    } catch (error) {
      console.error('Failed to delete trip:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to delete trip. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // View image in modal
  const handleViewImage = (url, title) => {
    setImageModal({ show: true, url, title });
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModal({ show: false, url: '', title: '' });
  };

  // Filter trips on client side for traveler search
  const filteredTrips = trips.filter(trip => {
    const matchesTraveler = travelerSearch === '' ||
      trip.traveler_name?.toLowerCase().includes(travelerSearch.toLowerCase()) ||
      trip.traveler_email?.toLowerCase().includes(travelerSearch.toLowerCase());
    
    return matchesTraveler;
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Fuel Management</h1>
        <p style={styles.pageDescription}>Review and approve employee trips</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div style={styles.successMessage}>{successMessage}</div>
      )}

      {errorMessage && (
        <div style={styles.errorMessage}>{errorMessage}</div>
      )}

      {/* Filters */}
      <div style={styles.filterSection}>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Search (Vehicle/Client/Purpose)</label>
            <input
              type="text"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Search by Traveler</label>
            <input
              type="text"
              placeholder="Enter traveler name..."
              value={travelerSearch}
              onChange={(e) => setTravelerSearch(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Vehicle</label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration_number}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              <option value="All">All Status</option>
              <option value="Started">Started</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={styles.input}
            />
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
        {filteredTrips.length} trip(s) found
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
                <th style={styles.tableHeader}>FUEL COST (₹)</th>
                <th style={styles.tableHeader}>START IMAGE</th>
                <th style={styles.tableHeader}>END IMAGE</th>
                <th style={styles.tableHeader}>MORE</th>
                <th style={styles.tableHeader}>STATUS / ACTION</th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr>
                <td colSpan="15" style={styles.noData}>Loading trips...</td>
              </tr>
            ) : filteredTrips.length === 0 ? (
              <tr>
                <td colSpan="15" style={styles.noData}>No trips found</td>
              </tr>
            ) : (
              filteredTrips.map((trip, index) => (
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
                  <td style={styles.tableCell}>
                    <div>{trip.traveler_name}</div>
                    {trip.traveler_email && (
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>
                        {trip.traveler_email}
                      </div>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {trip.client_purpose.includes('\n') ? (
                      <>
                        <div style={styles.clientName}>{trip.client_purpose.split('\n')[0]}</div>
                        <div style={styles.clientPurpose}>{trip.client_purpose.split('\n')[1]}</div>
                      </>
                    ) : (
                      <div style={styles.clientPurpose}>{trip.client_purpose}</div>
                    )}
                  </td>
                  <td style={styles.tableCell}>{trip.date}</td>
                  <td style={styles.tableCell}>{trip.start_time}</td>
                  <td style={styles.tableCell}>{trip.end_time}</td>
                  <td style={styles.tableCell}>{trip.odo_start}</td>
                  <td style={styles.tableCell}>{trip.odo_end}</td>
                  <td style={styles.tableCell}>{trip.distance}</td>
                  <td style={styles.tableCell}>₹{trip.fuel_cost}</td>
                  <td style={styles.tableCell}>
                    {trip.start_image ? (
                      <button 
                        style={styles.viewButton}
                        onClick={() => handleViewImage(trip.start_image_url, 'Odometer Start Image')}
                      >
                        View
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {trip.end_image ? (
                      <button 
                        style={styles.viewButton}
                        onClick={() => handleViewImage(trip.end_image_url, 'Odometer End Image')}
                      >
                        View
                      </button>
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.iconButton} 
                        title="Delete"
                        onClick={() => handleDelete(trip.id, trip.status)}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
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
                    {trip.status === 'Completed' && (
                      <div style={styles.actionButtonsColumn}>
                        <button 
                          style={styles.approveButton}
                          onClick={() => handleApprove(trip.id)}
                        >
                          <Check size={14} style={{ marginRight: '4px' }} />
                          Approve
                        </button>
                        <button 
                          style={styles.declineButton}
                          onClick={() => handleReject(trip.id)}
                        >
                          <X size={14} style={{ marginRight: '4px' }} />
                          Decline
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.show && (
        <div style={styles.modalOverlay} onClick={closeImageModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{imageModal.title}</h3>
              <button style={styles.modalCloseButton} onClick={closeImageModal}>
                <X size={24} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <img 
                src={imageModal.url} 
                alt={imageModal.title}
                style={styles.modalImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  pageHeader: {
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  pageDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
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
    marginBottom: '12px',
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
    backgroundColor: '#ffffff',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: '#ffffff',
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
    transition: 'background-color 0.2s',
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
    transition: 'background-color 0.2s',
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
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  actionButtonsColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
  },
  approveButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    maxWidth: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'color 0.2s',
  },
  modalBody: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '70vh',
    objectFit: 'contain',
  },
};