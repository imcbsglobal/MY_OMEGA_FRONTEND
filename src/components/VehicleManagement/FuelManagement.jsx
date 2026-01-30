import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
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

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
    }
  }, [isAdmin]);

  // Fetch trips data
  useEffect(() => {
    if (isAdmin) {
      fetchTrips();
    }
  }, [isAdmin]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await api.get('/vehicle/fuel-trips/');
      setTrips(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      // Mock data for demonstration
      setTrips([
        {
          id: 1,
          vehicle: 'KL12M9188',
          traveler_name: 'Ajin Ajin',
          client_purpose: '—',
          date: '29-Jan-2026',
          start_time: '10:28 AM',
          end_time: '10:45 AM',
          odo_start: '25342.00',
          odo_end: '25346.00',
          distance: '4.00',
          fuel_cost: '1.00',
          status: 'Completed',
          start_image: true,
          end_image: true
        },
        {
          id: 2,
          vehicle: 'KL 12 L1702',
          traveler_name: 'Elgin Vargu',
          client_purpose: 'Marketing\nMarketing and eat food',
          date: '28-Jan-2026',
          start_time: '02:00 PM',
          end_time: '07:21 PM',
          odo_start: '63375.00',
          odo_end: '63384.00',
          distance: '9.00',
          fuel_cost: '1.00',
          status: 'Completed',
          start_image: true,
          end_image: true
        },
        {
          id: 3,
          vehicle: 'KL 12 Q8130',
          traveler_name: 'Adiladhi',
          client_purpose: 'RR Medicals',
          date: '28-Jan-2026',
          start_time: '02:19 PM',
          end_time: '06:29 PM',
          odo_start: '304.50',
          odo_end: '337.60',
          distance: '33.10',
          fuel_cost: '150.00',
          status: 'Completed',
          start_image: true,
          end_image: true
        },
        {
          id: 4,
          vehicle: 'KL 73 D 5309',
          traveler_name: 'Muhammedsinan PC',
          client_purpose: 'Marketing\nClient visit',
          date: '28-Jan-2026',
          start_time: '02:25 PM',
          end_time: '-',
          odo_start: '58629.00',
          odo_end: '58629.00',
          distance: '-',
          fuel_cost: '100.00',
          status: 'Started',
          start_image: true,
          end_image: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    // Apply filters logic here
    fetchTrips();
  };

  const handleReset = () => {
    setSearchQuery('');
    setTravelerSearch('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('All');
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = searchQuery === '' || 
      trip.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.distance?.toString().includes(searchQuery) ||
      trip.fuel_cost?.toString().includes(searchQuery);
    
    const matchesTraveler = travelerSearch === '' ||
      trip.traveler_name?.toLowerCase().includes(travelerSearch.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;

    return matchesSearch && matchesTraveler && matchesStatus;
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Fuel Management</h1>
      </div>

      {/* Filters */}
      <div style={styles.filterSection}>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Search (Vehicle/Distance/Cost)</label>
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
        {filteredTrips.length} trip(s) found | Showing page 1 of {Math.ceil(filteredTrips.length / 10)}
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
                <td colSpan="15" style={styles.noData}>Loading...</td>
              </tr>
            ) : filteredTrips.length === 0 ? (
              <tr>
                <td colSpan="15" style={styles.noData}>No trips found</td>
              </tr>
            ) : (
              filteredTrips.map((trip, index) => (
                <tr key={trip.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{index + 1}</td>
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
                  <td style={styles.tableCell}>₹{trip.fuel_cost}</td>
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
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button style={styles.iconButton} title="Edit">
                        <Edit size={16} color="#ef4444" />
                      </button>
                      <button style={styles.iconButton} title="Delete">
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtonsColumn}>
                      <button style={styles.approveButton}>Approve</button>
                      <button style={styles.declineButton}>Decline</button>
                    </div>
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
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  filterSection: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
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
  },
  endTripButton: {
    display: 'block',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#f59e0b',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '4px',
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
};
