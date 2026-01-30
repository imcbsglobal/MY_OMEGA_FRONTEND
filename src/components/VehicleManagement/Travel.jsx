import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../api/client';

export default function Travel() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userLevel = user?.user_level || "User";
  const userName = user?.name || "";

  const [view, setView] = useState('list'); // 'list', 'add', 'end'
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Form states for Start Trip
  const [formData, setFormData] = useState({
    vehicle: '',
    date: '',
    start_time: '',
    client_name: '',
    purpose: '',
    fuel_cost: '',
    odo_start: '',
    start_image: null,
  });

  // Form states for End Trip
  const [endFormData, setEndFormData] = useState({
    odo_end: '',
    end_time: '',
    end_image: null,
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicle/travel-trips/');
      setTrips(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      // Mock data
      setTrips([
        {
          id: 1,
          vehicle: 'KL 12 Q8130',
          traveler_name: 'ajinaijn003@gmail.com',
          client_purpose: 'IDBI\nADM activation',
          date: '29-Jan-2026',
          start_time: '11:21 AM',
          end_time: '-',
          odo_start: '338.00',
          odo_end: '338.00',
          distance: '-',
          fuel_cost: '₹1.00',
          status: 'Started',
          start_image: true,
          end_image: false
        },
        {
          id: 2,
          vehicle: 'KL12M9188',
          traveler_name: 'ajinaijn003@gmail.com',
          client_purpose: '—',
          date: '29-Jan-2026',
          start_time: '10:28 AM',
          end_time: '10:45 AM',
          odo_start: '25342.00',
          odo_end: '25346.00',
          distance: '4.00',
          fuel_cost: '₹1.00',
          status: 'Completed',
          start_image: true,
          end_image: true
        },
        {
          id: 3,
          vehicle: 'KL 12 L1702',
          traveler_name: 'elginvargu@gmail.com',
          client_purpose: 'Marketing\nMarketing and eat food',
          date: '28-Jan-2026',
          start_time: '02:00 PM',
          end_time: '07:21 PM',
          odo_start: '63375.00',
          odo_end: '63384.00',
          distance: '9.00',
          fuel_cost: '₹1.00',
          status: 'Completed',
          start_image: true,
          end_image: true
        },
        {
          id: 4,
          vehicle: 'KL 12 Q8130',
          traveler_name: 'adiladhi03@gmail.com',
          client_purpose: 'RR Medicals',
          date: '28-Jan-2026',
          start_time: '02:19 PM',
          end_time: '06:29 PM',
          odo_start: '304.50',
          odo_end: '337.60',
          distance: '33.10',
          fuel_cost: '₹150.00',
          status: 'Completed',
          start_image: true,
          end_image: true
        },
        {
          id: 5,
          vehicle: 'KL 73 D 5309',
          traveler_name: 'muhammedsinanpc6947@gmail.com',
          client_purpose: 'Marketing\nClient visit',
          date: '28-Jan-2026',
          start_time: '02:25 PM',
          end_time: '-',
          odo_start: '58629.00',
          odo_end: '58629.00',
          distance: '-',
          fuel_cost: '₹100.00',
          status: 'Started',
          start_image: true,
          end_image: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async (e) => {
    e.preventDefault();
    try {
      // API call to start trip
      // await api.post('/vehicle/travel-trips/', formData);
      console.log('Starting trip:', formData);
      setView('list');
      fetchTrips();
    } catch (error) {
      console.error('Failed to start trip:', error);
    }
  };

  const handleEndTrip = async (e) => {
    e.preventDefault();
    try {
      // API call to end trip
      // await api.patch(`/vehicle/travel-trips/${selectedTrip.id}/`, endFormData);
      console.log('Ending trip:', endFormData);
      setView('list');
      setSelectedTrip(null);
      fetchTrips();
    } catch (error) {
      console.error('Failed to end trip:', error);
    }
  };

  const openEndTripForm = (trip) => {
    setSelectedTrip(trip);
    setEndFormData({
      odo_end: '',
      end_time: '',
      end_image: null,
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

      <form onSubmit={handleStartTrip}>
        {/* TRIP BASICS */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>TRIP BASICS</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vehicle</label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                style={styles.select}
                required
              >
                <option value="">Select vehicle</option>
                <option value="KL12M9188">KL12M9188</option>
                <option value="KL 12 L1702">KL 12 L1702</option>
                <option value="KL 12 Q8130">KL 12 Q8130</option>
                <option value="KL 73 D 5309">KL 73 D 5309</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Client Name</label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
              placeholder="Type to search client or en"
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
                value={formData.fuel_cost}
                onChange={(e) => setFormData({...formData, fuel_cost: e.target.value})}
                placeholder="0"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Odometer Start</label>
              <input
                type="number"
                value={formData.odo_start}
                onChange={(e) => setFormData({...formData, odo_start: e.target.value})}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Odometer Start Image</label>
            <input
              type="file"
              onChange={(e) => setFormData({...formData, start_image: e.target.files[0]})}
              style={styles.fileInput}
              accept="image/*"
            />
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              After you start, you'll be taken back to <strong>Fuel Management</strong>. Use the <em>End Trip</em> button in the list when the trip is finished.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div style={styles.formActions}>
          <button
            type="button"
            onClick={() => setView('list')}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button type="submit" style={styles.submitButton}>
            Start Trip
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
        <h2 style={styles.formTitle}>End Trip — {selectedTrip?.vehicle}</h2>
        <p style={styles.formSubtitle}>Logged in as {userName}</p>
      </div>

      <form onSubmit={handleEndTrip}>
        {/* TRIP COMPLETION */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>TRIP COMPLETION</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Odometer Start</label>
              <input
                type="text"
                value={selectedTrip?.odo_start || ''}
                style={styles.inputDisabled}
                disabled
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Odometer End</label>
              <input
                type="number"
                value={endFormData.odo_end}
                onChange={(e) => setEndFormData({...endFormData, odo_end: e.target.value})}
                placeholder="Enter end reading"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>End Time</label>
              <input
                type="time"
                value={endFormData.end_time}
                onChange={(e) => setEndFormData({...endFormData, end_time: e.target.value})}
                style={styles.input}
                required
              />
            </div>
          </div>
        </div>

        {/* ODOMETER PROOF */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>ODOMETER PROOF</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Odometer End Image</label>
            <input
              type="file"
              onChange={(e) => setEndFormData({...endFormData, end_image: e.target.files[0]})}
              style={styles.fileInput}
              accept="image/*"
              required
            />
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              Ensure the end odometer reading is correct. Once submitted, this trip will be marked as completed in <strong>Fuel Management</strong>.
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
            }}
            style={styles.cancelButton}
          >
            Back
          </button>
          <button type="submit" style={styles.submitButton}>
            Complete Trip
          </button>
        </div>
      </form>
      </div>
    </div>
  );

  // Render Trip List
  const renderTripList = () => (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.pageTitle}>Travel Management</h1>
            <p style={styles.pageDescription}>Track and manage employee travels</p>
          </div>
        </div>
        <button onClick={() => setView('add')} style={styles.addButton}>
          <Plus size={20} />
          Add New Trip
        </button>
      </div>

      {/* Results Count */}
      <div style={styles.resultsCount}>
        {trips.length} trip(s) found | Showing page 1 of {Math.ceil(trips.length / 10)}
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>#</th>
                <th style={styles.tableHeader}>STATUS / ACTION</th>
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="14" style={styles.noData}>Loading...</td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="14" style={styles.noData}>No trips found</td>
                </tr>
              ) : (
                trips.map((trip, index) => (
                  <tr key={trip.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: trip.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                          color: trip.status === 'Completed' ? '#166534' : '#92400e'
                        }}>
                          {trip.status}
                        </span>
                        {trip.status === 'Started' && (
                          <button
                            onClick={() => openEndTripForm(trip)}
                            style={styles.endTripButton}
                          >
                            End Trip
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={styles.tableCell}>{trip.vehicle}</td>
                    <td style={styles.tableCell}>{trip.traveler_name}</td>
                    <td style={styles.tableCell}>
                      {trip.client_purpose ? (
                        <>
                          <div style={styles.clientName}>{trip.client_purpose.split('\n')[0]}</div>
                          <div style={styles.clientPurpose}>{trip.client_purpose.split('\n')[1]}</div>
                        </>
                      ) : '—'}
                    </td>
                    <td style={styles.tableCell}>{trip.date}</td>
                    <td style={styles.tableCell}>{trip.start_time}</td>
                    <td style={styles.tableCell}>{trip.end_time || '-'}</td>
                    <td style={styles.tableCell}>{trip.odo_start}</td>
                    <td style={styles.tableCell}>{trip.odo_end}</td>
                    <td style={styles.tableCell}>{trip.distance}</td>
                    <td style={styles.tableCell}>{trip.fuel_cost}</td>
                    <td style={styles.tableCell}>
                      {trip.start_image ? (
                        <button style={styles.viewButton}>View</button>
                      ) : '-'}
                    </td>
                    <td style={styles.tableCell}>
                      {trip.end_image ? (
                        <button style={styles.viewButton}>View</button>
                      ) : 'No Image'}
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
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#203548',
    color: '#ffffff',
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
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
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
    backgroundColor: '#9ca3af',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  submitButton: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#7f1d1d',
    backgroundColor: '#fca5a5',
    border: 'none',
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
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  formWrapper: {
    maxWidth: '550px',
    width: '100%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    margin: '0 auto',
  },
};
