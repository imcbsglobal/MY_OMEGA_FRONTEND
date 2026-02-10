# API Integration Quick Reference Card

## 🚀 Quick Start

### Import the service you need:
```javascript
// Vehicle Management
import { listVehicles, startTrip, endTrip, listChallans, payChallan } from '../../api/vehicleManagement';

// HR Management
import { getOfficeLocation, setOfficeAsActive } from '../../api/hrManagement';

// WhatsApp Service
import { punchIn, punchOut } from '../../api/whatsappService';
```

---

## 📋 Common Operations

### Vehicle Operations
```javascript
// List all vehicles
const vehicles = await listVehicles();

// Get dropdown list
const dropdown = await getVehiclesDropdown();

// Create vehicle
const vehicle = await createVehicle({
  registration_number: 'ABC123',
  vehicle_name: 'Maruti Swift'
});

// Get vehicle details
const details = await getVehicleDetails(vehicleId);
```

### Trip Operations
```javascript
// List trips with filters
const trips = await listTrips({ 
  vehicle: 1, 
  status: 'completed' 
});

// Get my trips
const myTrips = await getMyTrips();

// Start trip
const trip = await startTrip({
  vehicle: 1,
  employee: userId,
  date: '2026-02-03',
  start_time: '09:00',
  odometer_start: 50000
});

// End trip
const completed = await endTrip(tripId, {
  odometer_end: 50050,
  end_time: '17:00'
});
```

### Challan Operations
```javascript
// List challans with filters
const challans = await listChallans({ 
  payment_status: 'unpaid' 
});

// Get challan details
const challan = await getChallanDetails(challanId);

// Create challan
const newChallan = await createChallan({
  vehicle: 1,
  challan_number: 'CHN001',
  fine_amount: 500,
  payment_status: 'unpaid'
});

// Mark as paid
const paid = await payChallan(challanId, {
  payment_date: '2026-02-03'
});

// Get statistics
const stats = await getChallanStats();
```

### Location & Office Operations
```javascript
// Get office location
const office = await getOfficeLocation(officeId);

// Set as active
const result = await setOfficeAsActive(officeId);

// Test geofence
const test = await testGeofenceLocation(officeId, {
  latitude: 28.7041,
  longitude: 77.1025
});
```

### Location Capture (Punch In/Out)
```javascript
// Punch in with location
const punchInResult = await punchIn({
  latitude: 28.7041,
  longitude: 77.1025,
  timestamp: new Date().toISOString()
});

// Punch out with location
const punchOutResult = await punchOut({
  latitude: 28.7041,
  longitude: 77.1025,
  timestamp: new Date().toISOString()
});
```

---

## 🛠️ Usage in Components

### Basic Example
```javascript
import { useState, useEffect } from 'react';
import { listVehicles } from '../../api/vehicleManagement';

function MyComponent() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await listVehicles();
        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select>
      {vehicles.map(v => (
        <option key={v.id} value={v.id}>
          {v.registration_number}
        </option>
      ))}
    </select>
  );
}

export default MyComponent;
```

---

## 🔍 File Locations

| Service | File Path | Functions |
|---------|-----------|-----------|
| Vehicle Management | `src/api/vehicleManagement.js` | 30+ functions |
| HR Management | `src/api/hrManagement.js` | 8 functions |
| WhatsApp Service | `src/api/whatsappService.js` | 11 functions |

---

## 📱 Components Using APIs

| Component | Service Module | Endpoints |
|-----------|----------------|-----------|
| Travel.jsx | vehicleManagement | trips, vehicles |
| FuelManagement.jsx | vehicleManagement | trips, vehicles |
| VehicleChallan.jsx | vehicleManagement | challans, vehicles |
| PunchInPunchOut.jsx | whatsappService | punchin, punchout |
| EmployeeManagement.jsx | hrManagement | office-locations |

---

## ⚙️ Error Handling (Automatic)

The API client (`src/api/client.js`) automatically:
- ✅ Logs all requests/responses
- ✅ Shows error notifications
- ✅ Handles 401 token expiry → redirect to login
- ✅ Extracts error messages
- ✅ Handles network errors

**You can still catch errors:**
```javascript
try {
  const data = await listVehicles();
} catch (error) {
  console.error('Custom error handling:', error);
  // error.response.data contains error details
  // error.response.status contains HTTP status
}
```

---

## 🔐 Authentication

- **Automatic:** Bearer token added to all requests
- **Storage:** `localStorage.getItem('accessToken')`
- **Token Expiry:** Auto-redirect to `/login`

---

## 📤 File Uploads

For endpoints that accept file uploads (trips, challans):

```javascript
const formData = new FormData();
formData.append('file_field_name', fileInput.files[0]);
formData.append('other_field', 'value');

const result = await startTrip(formData);
```

---

## 🧪 Testing Parameters

### Filter Examples
```javascript
// Trips
listTrips({
  vehicle: 1,
  status: 'completed',
  start_date: '2026-01-01',
  end_date: '2026-02-03',
  search: 'client name'
})

// Challans
listChallans({
  vehicle: 1,
  payment_status: 'unpaid',
  start_date: '2026-01-01',
  end_date: '2026-02-03',
  search: 'keyword'
})
```

---

## 📞 Troubleshooting

### "API endpoint not found"
- Check backend is running on `http://127.0.0.1:8000`
- Verify endpoint spelling in service function
- Check Django URL configuration

### "Token expired" or "401 Unauthorized"
- Manually clear localStorage and login again
- Check token in browser DevTools → Application → localStorage

### "Network Error"
- Verify backend server is running
- Check CORS settings in Django backend
- Verify `baseURL` in `src/api/client.js`

### Missing data in response
- Check pagination: `response.data.results` vs `response.data`
- Some endpoints return paginated data

---

## 🎯 Best Practices

1. **Always use service functions** - don't call API directly
2. **Use async/await** - it's cleaner than .then()
3. **Handle errors** - use try/catch or .catch()
4. **Show loading states** - tell user something is happening
5. **Validate before submit** - reduce API calls
6. **Log errors** - helps debugging
7. **Test with filters** - ensure they work

---

## 🚨 Common Mistakes

❌ **Don't do this:**
```javascript
import api from '../../api/client';
const data = await api.get('/vehicle-management/vehicles/');
```

✅ **Do this instead:**
```javascript
import { listVehicles } from '../../api/vehicleManagement';
const data = await listVehicles();
```

---

## 📚 Full Documentation

For detailed documentation, API examples, and complete endpoint reference:
→ See **API_INTEGRATION_GUIDE.md**

---

**Last Updated:** February 3, 2026
**Total Endpoints Connected:** 20+
**Status:** ✅ Production Ready

