// OfficeSetup.jsx - FULLY FIXED VERSION with comprehensive error handling
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/client'; // Using centralized api client


console.log('OfficeSetup component loaded');

// Configure API base URL - REMOVED, handled by client
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// console.log('API Base URL:', API_BASE_URL);

// Import Leaflet marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom office marker icon
const officeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to recenter map
function RecenterMap({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect, enabled }) {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onLocationSelect(e.latlng);
      }
    },
  });
  return null;
}

export default function OfficeSetup() {
  // State management
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Location data
  const [location, setLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [address, setAddress] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [radius, setRadius] = useState(50);
  const [notes, setNotes] = useState('');
  
  // Map interaction
  const [mapClickEnabled, setMapClickEnabled] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState('gps');
  
  // Existing offices - ALWAYS initialize as array
  const [existingOffices, setExistingOffices] = useState([]);
  const [activeOffice, setActiveOffice] = useState(null);

  const mapRef = useRef(null);

  // Load existing offices on mount
  useEffect(() => {
    loadExistingOffices();
  }, []);

  const loadExistingOffices = async () => {
    try {
      const response = await api.get('hr/office-locations/');

      
      // Handle different response formats
      console.log('API Response:', response.data);
      
      let offices = [];
      if (Array.isArray(response.data)) {
        offices = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        offices = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        offices = response.data.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        offices = [];
      }
      
      setExistingOffices(offices);
      
      const active = offices.find(o => o.is_active);
      setActiveOffice(active);
    } catch (err) {
      console.error('Failed to load offices:', err);
      setExistingOffices([]); // Set empty array on error
    }
  };

  // Step 1: Detect current GPS location
  const detectMyLocation = () => {
  setLoading(true);
  setError(null);
  
  if (!navigator.geolocation) {
    setError('Geolocation is not supported by your browser');
    setLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy: gpsAccuracy } = position.coords;
      
      // ✅ FIX: Round coordinates to 7 decimal places immediately
      const roundedLat = Number(latitude.toFixed(7));
      const roundedLng = Number(longitude.toFixed(7));
      
      console.log('📍 GPS Location detected:');
      console.log('  Original:', { lat: latitude, lng: longitude });
      console.log('  Rounded:', { lat: roundedLat, lng: roundedLng });
      console.log('  Accuracy:', gpsAccuracy, 'meters');
      
      setLocation({ lat: roundedLat, lng: roundedLng });
      setAccuracy(gpsAccuracy);
      setDetectionMethod('gps');
      
      // Get address for these coordinates
      reverseGeocode(roundedLat, roundedLng);
      
      setLoading(false);
      setStep(2); // Move to map adjustment step
    },
    (error) => {
      setLoading(false);
      let errorMessage = 'Failed to get your location. ';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Please allow location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Request timeout. Please try again.';
          break;
        default:
          errorMessage += error.message;
      }
      
      setError(errorMessage);
    },
    { 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 0 
    }
  );
};

  // Reverse geocode to get human-readable address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await api.get('hr/reverse-geocode/', {
        params: { latitude: lat, longitude: lng },
      });
      if (response.data.address) {
        setAddress(response.data.address);
      }
    } catch (err) {
      console.error('Reverse geocode failed:', err);
    }
  };

  // Step 2: Manual fine-tuning on map
  const handleMapClick = (latlng) => {
    setLocation(latlng);
    setDetectionMethod('map');
    reverseGeocode(latlng.lat, latlng.lng);
  };

  // Step 3: Configure radius
  const handleRadiusChange = (e) => {
    setRadius(parseInt(e.target.value));
  };

  // Get radius recommendation label
  const getRadiusLabel = () => {
    if (radius <= 30) return { text: 'Very Tight', color: '#dc3545' };
    if (radius <= 50) return { text: 'Tight (Recommended for small offices)', color: '#ffc107' };
    if (radius <= 100) return { text: 'Standard (Recommended)', color: '#28a745' };
    if (radius <= 200) return { text: 'Wide (For large campuses)', color: '#17a2b8' };
    return { text: 'Very Wide (May cause issues)', color: '#dc3545' };
  };

  // Test location
  const testLocation = async () => {
    if (!location) {
      setError('❌ Please configure a location first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // First ensure configuration is saved
      if (!activeOffice) {
        await saveConfiguration();
      }
      
      // Get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          const token = localStorage.getItem('accessToken');
          const officeId = activeOffice?.id;
          
          if (!officeId) {
            setError('❌ No active office found. Please save configuration first.');
            setLoading(false);
            return;
          }
          
          try {
            const response = await api.post(
              `hr/office-locations/${officeId}/test-location/`,
              { latitude, longitude }
            );
            
            const result = response.data.test_results;
            
            if (result.allowed) {
              setSuccess(`✅ Test PASSED! You're ${result.distance_meters.toFixed(0)}m from office. Buffer: ${result.buffer_remaining.toFixed(0)}m remaining.`);
            } else {
              setError(`❌ Test FAILED! You're ${result.distance_meters.toFixed(0)}m away (${result.excess_distance.toFixed(0)}m over limit).`);
            }
            setLoading(false);
          } catch (apiErr) {
            console.error('Test API error:', apiErr);
            setError('❌ Test failed: ' + (apiErr.response?.data?.error || apiErr.message));
            setLoading(false);
          }
        },
        (gpsErr) => {
          setError('❌ Could not get your current location for testing');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (err) {
      console.error('Test error:', err);
      setError('❌ Test failed: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  // Delete office location
  const deleteOffice = async (officeId) => {
    if (!confirm('Are you sure you want to delete this office location? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(
        `hr/office-locations/${officeId}/`
      );
      
      setSuccess('✅ Office location deleted successfully!');
      
      // Reload the office list
      await loadExistingOffices();
      
      setLoading(false);
    } catch (err) {
      console.error('Delete error:', err);
      setError('❌ Failed to delete office: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  // Save configuration
  const saveConfiguration = async () => {
    if (!location) {
      setError('❌ Please detect or select a location first');
      return;
    }

    if (!officeName.trim()) {
      setError('❌ Please enter an office name');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: officeName,
        address: address || 'Office Location',
        latitude: location.lat,
        longitude: location.lng,
        geofence_radius_meters: radius,
        detection_method: detectionMethod,
        gps_accuracy_meters: accuracy,
        notes: notes,
        is_active: true
      };

      console.log('Saving payload:', payload);

      const response = await api.post(
        'hr/office-locations/',
        payload
      );

      console.log('Save response:', response.data);
      
      // Handle different response formats
      let savedOffice = null;
      if (response.data.data) {
        savedOffice = response.data.data;
      } else if (response.data.office) {
        savedOffice = response.data.office;
      } else {
        savedOffice = response.data;
      }

      setSuccess('✅ Office location configured successfully!');
      setActiveOffice(savedOffice);
      setStep(5);
      await loadExistingOffices(); // Reload the list
      setLoading(false);
    } catch (err) {
      console.error('Save error:', err);
      const errorMsg = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Unknown error';
      setError('❌ Failed to save: ' + errorMsg);
      setLoading(false);
    }
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="setup-step">
            <h2>🏢 Step 1: Detect Office Location</h2>
            <p>Click the button below to detect your current GPS location. Make sure you're at the office entrance or main gate.</p>
            
            <div className="action-buttons">
              <button 
                className="btn btn-primary btn-lg"
                onClick={detectMyLocation}
                disabled={loading}
              >
                {loading ? '📡 Detecting...' : '📍 Detect My Location'}
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setStep(2);
                  setMapClickEnabled(true);
                  setDetectionMethod('manual');
                  // Set default location (India center)
                  setLocation({ lat: 20.5937, lng: 78.9629 });
                }}
              >
                📝 Enter Manually
              </button>
            </div>

            {existingOffices && existingOffices.length > 0 && (
              <div className="existing-offices">
                <h3>Existing Configurations</h3>
                <div className="office-list">
                  {existingOffices.map(office => (
                    <div key={office.id} className={`office-card ${office.is_active ? 'active' : ''}`}>
                      {office.is_active && <span className="active-badge">ACTIVE</span>}
                      <h4>{office.name}</h4>
                      <p>{office.address}</p>
                      <span className="radius-badge">{office.geofence_radius_meters}m radius</span>
                      
                      {!office.is_active && (
                        <button 
                          className="btn-delete" 
                          onClick={() => deleteOffice(office.id)}
                          disabled={loading}
                          title="Delete this office location"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="setup-step">
            <h2>📍 Step 2: Confirm Location</h2>
            <p>Click on the map to adjust the exact office location if needed.</p>
            
            {location && (
              <div className="location-info">
                <p><strong>Coordinates:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                {accuracy && <p><strong>GPS Accuracy:</strong> ±{Math.round(accuracy)}m</p>}
                {address && <p><strong>Address:</strong> {address}</p>}
              </div>
            )}

            <div className="map-container" style={{ height: '400px', marginTop: '20px' }}>
              <MapContainer
                center={location || { lat: 20.5937, lng: 78.9629 }}
                zoom={18}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapClickHandler 
                  onLocationSelect={handleMapClick} 
                  enabled={mapClickEnabled}
                />
                {location && (
                  <>
                    <Marker position={[location.lat, location.lng]} icon={officeIcon} />
                    <Circle
                      center={[location.lat, location.lng]}
                      radius={radius}
                      pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                    />
                  </>
                )}
                <RecenterMap center={location} />
              </MapContainer>
            </div>

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setStep(3)}
                disabled={!location}
              >
                Next: Configure Radius →
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="setup-step">
            <h2>⭕ Step 3: Configure Geofence Radius</h2>
            <p>Set the allowed distance from the office for attendance punching.</p>

            <div className="radius-config">
              <div className="radius-display">
                <div className="radius-value" style={{ color: getRadiusLabel().color }}>
                  {radius}m
                </div>
                <div className="radius-label" style={{ color: getRadiusLabel().color }}>
                  {getRadiusLabel().text}
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="300"
                value={radius}
                onChange={handleRadiusChange}
                className="radius-slider"
              />

              <div className="radius-presets">
                <button className="preset-btn" onClick={() => setRadius(30)}>30m - Tight</button>
                <button className="preset-btn" onClick={() => setRadius(50)}>50m - Small Office</button>
                <button className="preset-btn" onClick={() => setRadius(100)}>100m - Standard</button>
                <button className="preset-btn" onClick={() => setRadius(200)}>200m - Large Campus</button>
              </div>

              <div className="radius-recommendations">
                <h4>📋 Recommendations:</h4>
                <ul>
                  <li><strong>30-50m:</strong> Small offices, single building</li>
                  <li><strong>50-100m:</strong> Standard offices (Recommended)</li>
                  <li><strong>100-200m:</strong> Large office complexes or campuses</li>
                  <li><strong>&gt;200m:</strong> May allow punching from outside premises</li>
                </ul>
              </div>
            </div>

            {location && (
              <div className="map-preview" style={{ height: '300px', marginTop: '20px' }}>
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={17}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.lat, location.lng]} icon={officeIcon} />
                  <Circle
                    center={[location.lat, location.lng]}
                    radius={radius}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                  />
                </MapContainer>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>
                Next: Add Details →
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="setup-step">
            <h2>📝 Step 4: Office Details</h2>
            <p>Provide information about this office location.</p>

            <div className="form-group">
              <label>Office Name *</label>
              <input
                type="text"
                className="form-control"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="e.g., Main Office, Branch Office"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Complete office address"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this location"
                rows="2"
              />
            </div>

            <div className="summary-box">
              <h4>📊 Configuration Summary:</h4>
              <ul>
                <li><strong>Location:</strong> {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}</li>
                <li><strong>Geofence Radius:</strong> {radius}m</li>
                <li><strong>Detection Method:</strong> {detectionMethod}</li>
                {accuracy && <li><strong>GPS Accuracy:</strong> ±{Math.round(accuracy)}m</li>}
              </ul>
            </div>

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button 
                className="btn btn-success btn-lg" 
                onClick={saveConfiguration}
                disabled={loading || !officeName.trim()}
              >
                {loading ? '💾 Saving...' : '✅ Save Configuration'}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="setup-step success-step">
            <div className="success-icon">✅</div>
            <h2>Success!</h2>
            <p>Office location has been configured successfully.</p>

            {activeOffice && (
              <div className="office-summary">
                <h3>{activeOffice.name}</h3>
                <p>{activeOffice.address}</p>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Geofence Radius</span>
                    <span className="stat-value">{activeOffice.geofence_radius_meters}m</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Detection Method</span>
                    <span className="stat-value">{activeOffice.detection_method}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={testLocation}
                disabled={loading}
              >
                {loading ? '🧪 Testing...' : '🧪 Test Geofence'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setStep(1);
                  setLocation(null);
                  setOfficeName('');
                  setAddress('');
                  setNotes('');
                  setRadius(50);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Configure New Office
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="office-setup-container">
      <div className="setup-header">
        <h1>🏢 Office Location Setup</h1>
        <p>Configure your office location and geofence for attendance tracking</p>
        
        <div className="step-indicator">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`step ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button className="close-btn" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {renderStep()}

      <style>{`
        .office-setup-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }

        .step {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          transition: all 0.3s;
        }

        .step.active {
          background: #007bff;
          color: white;
          transform: scale(1.2);
        }

        .step.completed {
          background: #28a745;
          color: white;
        }

        .setup-step {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 30px;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-lg {
          padding: 15px 40px;
          font-size: 18px;
        }

        .map-container, .map-preview {
          margin: 20px 0;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .location-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }

        .radius-config {
          padding: 20px 0;
        }

        .radius-display {
          text-align: center;
          margin-bottom: 20px;
        }

        .radius-value {
          font-size: 48px;
          font-weight: bold;
        }

        .radius-label {
          font-size: 18px;
          margin-top: 10px;
        }

        .radius-slider {
          width: 100%;
          height: 8px;
          margin: 20px 0;
        }

        .radius-presets {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        .preset-btn {
          padding: 8px 16px;
          background: #e9ecef;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .preset-btn:hover {
          background: #dee2e6;
        }

        .radius-recommendations {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .summary-box {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #007bff;
          margin: 20px 0;
        }

        .success-step {
          text-align: center;
        }

        .success-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .office-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }

        .summary-stats {
          display: flex;
          gap: 30px;
          justify-content: center;
          margin-top: 15px;
          flex-wrap: wrap;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          color: #6c757d;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
        }

        .alert {
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          position: relative;
        }

        .alert-danger {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .close-btn {
          position: absolute;
          right: 10px;
          top: 10px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }

        .existing-offices {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 2px solid #dee2e6;
        }

        .office-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .office-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 2px solid transparent;
          position: relative;
        }

        .office-card.active {
          border-color: #28a745;
          background: #d4edda;
        }

        .active-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #28a745;
          color: white;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: bold;
        }

        .radius-badge {
          display: inline-block;
          background: #007bff;
          color: white;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
          margin-top: 10px;
        }

        .btn-delete {
          width: 100%;
          margin-top: 15px;
          padding: 8px 12px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-delete:hover:not(:disabled) {
          background: #c82333;
          transform: translateY(-2px);
        }

        .btn-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}