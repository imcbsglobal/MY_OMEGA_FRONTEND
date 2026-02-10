# API Endpoints Documentation & File Mapping

This document maps all API endpoints to their corresponding frontend files and service modules.

## Overview

The frontend uses a modular API structure with service files located in `src/api/`:
- `client.js` - Axios instance configuration and interceptors
- `vehicleManagement.js` - Vehicle, Trip, and Challan APIs
- `hrManagement.js` - Office Locations and Geofence APIs
- `whatsappService.js` - WhatsApp and Location Capture APIs

---

## 1. VEHICLE MANAGEMENT APIs

### Base URL: `http://127.0.0.1:8000/api/vehicle-management/`

#### 1.1 List Vehicles
- **Endpoint:** `GET /vehicle-management/vehicles/`
- **Service Function:** `vehicleManagement.listVehicles(params)`
- **Usage File:** `src/components/VehicleManagement/Travel.jsx`
- **Code:**
  ```javascript
  import { listVehicles } from '../../api/vehicleManagement';
  
  const vehicles = await listVehicles({ status: 'active' });
  ```

#### 1.2 Add/Create Vehicle
- **Endpoint:** `POST /vehicle-management/vehicles/`
- **Service Function:** `vehicleManagement.createVehicle(vehicleData)`
- **Usage File:** `src/components/VehicleManagement/Travel.jsx`
- **Code:**
  ```javascript
  import { createVehicle } from '../../api/vehicleManagement';
  
  const newVehicle = await createVehicle({
    registration_number: 'ABC123',
    vehicle_name: 'Maruti Swift',
    vehicle_type: 'SUV'
  });
  ```

#### 1.3 Get Vehicle Details
- **Endpoint:** `GET /vehicle-management/vehicles/{id}/`
- **Service Function:** `vehicleManagement.getVehicleDetails(vehicleId)`
- **Usage File:** `src/components/VehicleManagement/Travel.jsx`
- **Code:**
  ```javascript
  import { getVehicleDetails } from '../../api/vehicleManagement';
  
  const vehicle = await getVehicleDetails(1);
  ```

#### 1.4 Get Vehicles Dropdown
- **Endpoint:** `GET /vehicle-management/vehicles/dropdown/`
- **Service Function:** `vehicleManagement.getVehiclesDropdown()`
- **Usage File:** `src/components/VehicleManagement/Travel.jsx`, `FuelManagement.jsx`
- **Code:**
  ```javascript
  import { getVehiclesDropdown } from '../../api/vehicleManagement';
  
  const vehicles = await getVehiclesDropdown();
  ```

---

## 2. TRIP MANAGEMENT APIs

### Base URL: `http://127.0.0.1:8000/api/vehicle-management/`

#### 2.1 List All Trips
- **Endpoint:** `GET /vehicle-management/trips/`
- **Service Function:** `vehicleManagement.listTrips(params)`
- **Usage File:** `src/components/VehicleManagement/FuelManagement.jsx`
- **Code:**
  ```javascript
  import { listTrips } from '../../api/vehicleManagement';
  
  const trips = await listTrips({
    vehicle: 1,
    status: 'completed',
    start_date: '2026-01-01'
  });
  ```

#### 2.2 Get User's Trips
- **Endpoint:** `GET /vehicle-management/trips/my-trips/`
- **Service Function:** `vehicleManagement.getMyTrips(params)`
- **Usage File:** `src/components/VehicleManagement/Travel.jsx`
- **Code:**
  ```javascript
  import { getMyTrips } from '../../api/vehicleManagement';
  
  const myTrips = await getMyTrips();
  ```

#### 2.3 Start New Trip
- **Endpoint:** `POST /vehicle-management/trips/start/`
- **Service Function:** `vehicleManagement.startTrip(tripData)`
- **Usage File:** `src/components/VehicleManagement/Travel.jsx`
- **Code:**
  ```javascript
  import { startTrip } from '../../api/vehicleManagement';
  
  const newTrip = await startTrip({
    vehicle: 1,
    employee: 5,
    date: '2026-02-03',
    start_time: '09:00',
    client_name: 'ABC Corp',
    purpose: 'Client Meeting',
    odometer_start: 50000,
    odometer_start_image: formData // Include image if needed
  });
  ```

#### 2.4 Get Trip Details
- **Endpoint:** `GET /vehicle-management/trips/{id}/`
- **Service Function:** `vehicleManagement.getTripDetails(tripId)`
- **Usage File:** `src/components/VehicleManagement/Travel.jsx`
- **Code:**
  ```javascript
  import { getTripDetails } from '../../api/vehicleManagement';
  
  const trip = await getTripDetails(2);
  ```

#### 2.5 End Trip
- **Endpoint:** `PATCH /vehicle-management/trips/{id}/end/`
- **Service Function:** `vehicleManagement.endTrip(tripId, endData)`
- **Usage File:** `src/components/VehicleManagement/Travel.jsx`
- **Code:**
  ```javascript
  import { endTrip } from '../../api/vehicleManagement';
  
  const completedTrip = await endTrip(2, {
    odometer_end: 50050,
    end_time: '17:00',
    odometer_end_image: formData // Include image if needed
  });
  ```

---

## 3. CHALLAN MANAGEMENT APIs

### Base URL: `http://127.0.0.1:8000/api/vehicle-management/`

#### 3.1 List Challans
- **Endpoint:** `GET /vehicle-management/challans/`
- **Service Function:** `vehicleManagement.listChallans(params)`
- **Usage File:** `src/components/VehicleManagement/VehicleChallan.jsx`
- **Code:**
  ```javascript
  import { listChallans } from '../../api/vehicleManagement';
  
  const challans = await listChallans({
    vehicle: 1,
    payment_status: 'unpaid',
    start_date: '2026-01-01'
  });
  ```

#### 3.2 Create Challan
- **Endpoint:** `POST /vehicle-management/challans/`
- **Service Function:** `vehicleManagement.createChallan(challanData)`
- **Usage File:** `src/components/VehicleManagement/VehicleChallan.jsx`
- **Code:**
  ```javascript
  import { createChallan } from '../../api/vehicleManagement';
  
  const newChallan = await createChallan({
    vehicle: 1,
    challan_number: 'CHN-001',
    challan_date: '2026-02-03',
    offence_type: 'Speeding',
    fine_amount: 500,
    location: 'Main Road',
    payment_status: 'unpaid'
  });
  ```

#### 3.3 Get Challan Details
- **Endpoint:** `GET /vehicle-management/challans/{id}/`
- **Service Function:** `vehicleManagement.getChallanDetails(challanId)`
- **Usage File:** `src/components/VehicleManagement/VehicleChallan.jsx`
- **Code:**
  ```javascript
  import { getChallanDetails } from '../../api/vehicleManagement';
  
  const challan = await getChallanDetails(2);
  ```

#### 3.4 Mark Challan as Paid
- **Endpoint:** `PATCH /vehicle-management/challans/{id}/pay/`
- **Service Function:** `vehicleManagement.payChallan(challanId, paymentData)`
- **Usage File:** `src/components/VehicleManagement/VehicleChallan.jsx`
- **Code:**
  ```javascript
  import { payChallan } from '../../api/vehicleManagement';
  
  const paidChallan = await payChallan(2, {
    payment_date: '2026-02-03',
    payment_receipt: formData // Include receipt if needed
  });
  ```

#### 3.5 Get Challan Statistics
- **Endpoint:** `GET /vehicle-management/challans/stats/`
- **Service Function:** `vehicleManagement.getChallanStats()`
- **Usage File:** `src/components/VehicleManagement/VehicleChallan.jsx`
- **Code:**
  ```javascript
  import { getChallanStats } from '../../api/vehicleManagement';
  
  const stats = await getChallanStats();
  ```

---

## 4. HR OFFICE LOCATION APIs

### Base URL: `http://127.0.0.1:8000/api/hr/`

#### 4.1 Get Specific Office Location
- **Endpoint:** `GET /hr/office-locations/{id}/`
- **Service Function:** `hrManagement.getOfficeLocation(officeId)`
- **Usage File:** `src/components/HR/EmployeeManagement.jsx`
- **Code:**
  ```javascript
  import { getOfficeLocation } from '../../api/hrManagement';
  
  const office = await getOfficeLocation(5);
  ```

#### 4.2 List All Office Locations
- **Endpoint:** `GET /hr/office-locations/`
- **Service Function:** `hrManagement.listOfficeLocations(params)`
- **Usage File:** `src/components/HR/EmployeeManagement.jsx`
- **Code:**
  ```javascript
  import { listOfficeLocations } from '../../api/hrManagement';
  
  const offices = await listOfficeLocations();
  ```

#### 4.3 Create Office Location
- **Endpoint:** `POST /hr/office-locations/`
- **Service Function:** `hrManagement.createOfficeLocation(locationData)`
- **Usage File:** `src/components/HR/EmployeeManagement.jsx`
- **Code:**
  ```javascript
  import { createOfficeLocation } from '../../api/hrManagement';
  
  const newOffice = await createOfficeLocation({
    name: 'Delhi Office',
    latitude: 28.7041,
    longitude: 77.1025,
    radius: 500
  });
  ```

#### 4.4 Set Office as Active
- **Endpoint:** `POST /hr/office-locations/{id}/set-active/`
- **Service Function:** `hrManagement.setOfficeAsActive(officeId)`
- **Usage File:** `src/components/HR/EmployeeManagement.jsx`
- **Code:**
  ```javascript
  import { setOfficeAsActive } from '../../api/hrManagement';
  
  const result = await setOfficeAsActive(5);
  ```

#### 4.5 Test Geofence Location (Admin Debug)
- **Endpoint:** `POST /hr/office-locations/{id}/test-location/`
- **Service Function:** `hrManagement.testGeofenceLocation(officeId, locationData)`
- **Usage File:** `src/components/HR/EmployeeManagement.jsx`
- **Code:**
  ```javascript
  import { testGeofenceLocation } from '../../api/hrManagement';
  
  const testResult = await testGeofenceLocation(5, {
    latitude: 28.7041,
    longitude: 77.1025
  });
  ```

---

## 5. WHATSAPP SERVICE APIs

### Base URL: `http://127.0.0.1:8000/api/whatsapp/`

#### 5.1 Location Capture - Punch In
- **Endpoint:** `POST /whatsapp/punchin/`
- **Service Function:** `whatsappService.punchIn(locationData)`
- **Usage File:** `src/components/HR/PunchInPunchOut.jsx`
- **Code:**
  ```javascript
  import { punchIn } from '../../api/whatsappService';
  
  const punchInResult = await punchIn({
    latitude: 28.7041,
    longitude: 77.1025,
    timestamp: new Date().toISOString()
  });
  ```

#### 5.2 Location Capture - Punch Out
- **Endpoint:** `POST /whatsapp/punchout/`
- **Service Function:** `whatsappService.punchOut(locationData)`
- **Usage File:** `src/components/HR/PunchInPunchOut.jsx`
- **Code:**
  ```javascript
  import { punchOut } from '../../api/whatsappService';
  
  const punchOutResult = await punchOut({
    latitude: 28.7041,
    longitude: 77.1025,
    timestamp: new Date().toISOString()
  });
  ```

#### 5.3 WhatsApp Configuration - List
- **Endpoint:** `GET /whatsapp/admin/configurations/`
- **Service Function:** `whatsappService.listWhatsAppConfigurations(params)`
- **Usage File:** `src/components/Admin/WhatsAppConfig.jsx` (Create if needed)
- **Code:**
  ```javascript
  import { listWhatsAppConfigurations } from '../../api/whatsappService';
  
  const configs = await listWhatsAppConfigurations();
  ```

#### 5.4 WhatsApp Configuration - Create
- **Endpoint:** `POST /whatsapp/admin/configurations/`
- **Service Function:** `whatsappService.createWhatsAppConfiguration(configData)`
- **Usage File:** `src/components/Admin/WhatsAppConfig.jsx`
- **Code:**
  ```javascript
  import { createWhatsAppConfiguration } from '../../api/whatsappService';
  
  const config = await createWhatsAppConfiguration({
    name: 'Main Config',
    webhook_url: 'https://example.com/webhook',
    api_key: 'xxxx'
  });
  ```

#### 5.5 WhatsApp Configuration - Activate
- **Endpoint:** `POST /whatsapp/admin/configurations/{id}/activate/`
- **Service Function:** `whatsappService.activateWhatsAppConfiguration(configId)`
- **Usage File:** `src/components/Admin/WhatsAppConfig.jsx`
- **Code:**
  ```javascript
  import { activateWhatsAppConfiguration } from '../../api/whatsappService';
  
  const result = await activateWhatsAppConfiguration(3);
  ```

#### 5.6 WhatsApp Configuration - Deactivate
- **Endpoint:** `POST /whatsapp/admin/configurations/{id}/deactivate/`
- **Service Function:** `whatsappService.deactivateWhatsAppConfiguration(configId)`
- **Usage File:** `src/components/Admin/WhatsAppConfig.jsx`
- **Code:**
  ```javascript
  import { deactivateWhatsAppConfiguration } from '../../api/whatsappService';
  
  const result = await deactivateWhatsAppConfiguration(3);
  ```

#### 5.7 Generate WhatsApp Request
- **Endpoint:** `POST /whatsapp/request/`
- **Service Function:** `whatsappService.generateWhatsAppRequest(requestData)`
- **Usage File:** `src/components/HR/PunchInPunchOut.jsx`
- **Code:**
  ```javascript
  import { generateWhatsAppRequest } from '../../api/whatsappService';
  
  const request = await generateWhatsAppRequest({
    user: 1,
    type: 'punch_in_out',
    data: { latitude: 28.7041, longitude: 77.1025 }
  });
  ```

#### 5.8 List WhatsApp Requests
- **Endpoint:** `GET /whatsapp/request/`
- **Service Function:** `whatsappService.listWhatsAppRequests(params)`
- **Usage File:** `src/components/Admin/WhatsAppRequests.jsx` (Create if needed)
- **Code:**
  ```javascript
  import { listWhatsAppRequests } from '../../api/whatsappService';
  
  const requests = await listWhatsAppRequests();
  ```

---

## Integration Guide

### Step 1: Import the Service Module
```javascript
// Option 1: Import specific functions
import { listVehicles, startTrip } from '../../api/vehicleManagement';

// Option 2: Import entire module
import vehicleManagement from '../../api/vehicleManagement';
// Usage: vehicleManagement.listVehicles()
```

### Step 2: Use in Component
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await listVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Step 3: Handle Errors and Loading States
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// The API client (client.js) automatically shows notifications for success/error
// Check your notification system in src/utils/notification.js
```

---

## Error Handling

All API calls use the centralized error handler in `src/api/client.js`. The client automatically:

1. **Logs requests and responses** in console
2. **Shows notifications** for errors and success messages
3. **Handles token expiry** - redirects to login if 401
4. **Extracts error messages** from various response formats
5. **Handles network errors** with helpful messages

---

## File Structure Summary

```
src/
├── api/
│   ├── client.js                    # Axios configuration & interceptors
│   ├── vehicleManagement.js         # Vehicle, Trip, Challan APIs
│   ├── hrManagement.js              # Office Location & Geofence APIs
│   ├── whatsappService.js           # WhatsApp & Location Capture APIs
│   ├── cv.js                        # (Existing)
│   └── interview.js                 # (Existing)
├── components/
│   ├── VehicleManagement/
│   │   ├── Travel.jsx               # Trip management (Uses vehicleManagement.js)
│   │   ├── FuelManagement.jsx        # Fuel/Trip admin view (Uses vehicleManagement.js)
│   │   └── VehicleChallan.jsx        # Challan management (Uses vehicleManagement.js)
│   └── HR/
│       ├── PunchInPunchOut.jsx       # Punch In/Out (Uses whatsappService.js)
│       └── EmployeeManagement.jsx    # (Uses hrManagement.js)
└── utils/
    └── notification.js              # Notification system (used by client.js)
```

---

## Quick Reference Table

| Feature | Endpoint | HTTP Method | Service File | Component |
|---------|----------|------------|--------------|-----------|
| List Vehicles | /vehicle-management/vehicles/ | GET | vehicleManagement.js | Travel.jsx |
| Create Vehicle | /vehicle-management/vehicles/ | POST | vehicleManagement.js | Travel.jsx |
| Vehicle Details | /vehicle-management/vehicles/{id}/ | GET | vehicleManagement.js | Travel.jsx |
| Start Trip | /vehicle-management/trips/start/ | POST | vehicleManagement.js | Travel.jsx |
| End Trip | /vehicle-management/trips/{id}/end/ | PATCH | vehicleManagement.js | Travel.jsx |
| List Trips | /vehicle-management/trips/ | GET | vehicleManagement.js | FuelManagement.jsx |
| My Trips | /vehicle-management/trips/my-trips/ | GET | vehicleManagement.js | Travel.jsx |
| Create Challan | /vehicle-management/challans/ | POST | vehicleManagement.js | VehicleChallan.jsx |
| List Challans | /vehicle-management/challans/ | GET | vehicleManagement.js | VehicleChallan.jsx |
| Challan Details | /vehicle-management/challans/{id}/ | GET | vehicleManagement.js | VehicleChallan.jsx |
| Pay Challan | /vehicle-management/challans/{id}/pay/ | PATCH | vehicleManagement.js | VehicleChallan.jsx |
| Office Location | /hr/office-locations/{id}/ | GET | hrManagement.js | EmployeeManagement.jsx |
| Set Office Active | /hr/office-locations/{id}/set-active/ | POST | hrManagement.js | EmployeeManagement.jsx |
| Test Geofence | /hr/office-locations/{id}/test-location/ | POST | hrManagement.js | EmployeeManagement.jsx |
| Punch In | /whatsapp/punchin/ | POST | whatsappService.js | PunchInPunchOut.jsx |
| Punch Out | /whatsapp/punchout/ | POST | whatsappService.js | PunchInPunchOut.jsx |
| WhatsApp Config | /whatsapp/admin/configurations/{id}/ | GET/POST/PATCH | whatsappService.js | (Create WhatsAppConfig.jsx) |
| Activate Config | /whatsapp/admin/configurations/{id}/activate/ | POST | whatsappService.js | (Create WhatsAppConfig.jsx) |
| Generate Request | /whatsapp/request/ | POST | whatsappService.js | PunchInPunchOut.jsx |

---

## Notes

- All endpoints use authentication via Bearer token (handled by client.js interceptors)
- Base URL: `http://127.0.0.1:8000/api`
- All requests include `Content-Type: application/json`
- Image uploads should be sent as FormData
- Timestamps should be in ISO format (YYYY-MM-DDTHH:mm:ss)
- Error handling is centralized - components receive notifications automatically

