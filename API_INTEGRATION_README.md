# 🔗 API Integration - README

Welcome to the MY_OMEGA API Integration documentation. This guide will help you understand and use the integrated APIs in your frontend application.

---

## 🚀 Quick Start (5 minutes)

### 1. Choose Your Document
- **New to the project?** → Read [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- **Need complete docs?** → Read [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md)
- **Specific API help?** → Check [API_INTEGRATION_INDEX.md](API_INTEGRATION_INDEX.md)

### 2. Import & Use
```javascript
// Import what you need
import { listVehicles } from '../../api/vehicleManagement';

// Use it
const vehicles = await listVehicles();
```

### 3. Handle Results
```javascript
try {
  const data = await listVehicles();
  setVehicles(data);
} catch (error) {
  console.error('Error:', error);
  // User already notified via toast/notification
}
```

---

## 📦 What's Included

### 3 Service Modules
- **vehicleManagement.js** - Vehicle, Trip, Challan operations
- **hrManagement.js** - Office locations & geofencing
- **whatsappService.js** - WhatsApp configs & location capture

### 49+ API Functions
- All properly documented
- All with error handling
- All with TypeScript-like JSDoc comments

### 4 Ready-to-Use Components
- Travel.jsx - Trip management
- FuelManagement.jsx - Trip admin view
- VehicleChallan.jsx - Challan management
- PunchInPunchOut.jsx - Location capture

### 5 Documentation Files
- Complete reference guide
- Quick reference for developers
- Implementation summary
- Navigation index
- Verification report

---

## 📍 File Locations

```
my_omega_newfrontend/
├── 📄 API_QUICK_REFERENCE.md          ← Start here!
├── 📄 API_INTEGRATION_GUIDE.md         ← Complete docs
├── 📄 API_INTEGRATION_SUMMARY.md       ← What changed
├── 📄 API_INTEGRATION_INDEX.md         ← File map
├── 📄 API_INTEGRATION_VERIFICATION.md  ← Status report
├── 📄 API_INTEGRATION_README.md        ← This file
│
└── src/api/
    ├── vehicleManagement.js   ← 30 functions
    ├── hrManagement.js        ← 8 functions
    ├── whatsappService.js     ← 11 functions
    ├── client.js              ← Axios config
    └── ...
```

---

## 🎯 Common Tasks

### Load Vehicle Dropdown
```javascript
import { getVehiclesDropdown } from '../../api/vehicleManagement';

const vehicles = await getVehiclesDropdown();
// Returns: [{ id: 1, registration_number: 'ABC123', ... }, ...]
```

### Start a Trip
```javascript
import { startTrip } from '../../api/vehicleManagement';

const trip = await startTrip({
  vehicle: 1,
  employee: userId,
  date: '2026-02-03',
  start_time: '09:00',
  odometer_start: 50000
});
```

### List Trips with Filters
```javascript
import { listTrips } from '../../api/vehicleManagement';

const trips = await listTrips({
  vehicle: 1,
  status: 'completed',
  start_date: '2026-01-01',
  end_date: '2026-02-03'
});
```

### Mark Challan as Paid
```javascript
import { payChallan } from '../../api/vehicleManagement';

const paid = await payChallan(challanId, {
  payment_date: '2026-02-03'
});
```

### Punch In with Location
```javascript
import { punchIn } from '../../api/whatsappService';

const result = await punchIn({
  latitude: 28.7041,
  longitude: 77.1025,
  timestamp: new Date().toISOString()
});
```

---

## 🔄 Component Integration Examples

### In a React Component
```javascript
import { useState, useEffect } from 'react';
import { listVehicles } from '../../api/vehicleManagement';

function VehicleSelector() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVehicles = async () => {
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

    loadVehicles();
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

export default VehicleSelector;
```

---

## ⚠️ Important Notes

### Backend Must Be Running
```bash
cd MY_OMEGA_BACKEND
python manage.py runserver
# Should run on http://127.0.0.1:8000
```

### Authentication Required
- Login to get `accessToken`
- Token automatically added to requests
- 401 error → redirect to login (automatic)

### File Uploads
Use FormData for endpoints with file fields:
```javascript
const formData = new FormData();
formData.append('file_field', fileInput.files[0]);
formData.append('other_field', 'value');

await startTrip(formData);
```

### Error Handling (Automatic)
- Errors shown as notifications (toast)
- Check console for detailed error logs
- Catch errors in components for custom handling

---

## 🐛 Troubleshooting

### "Cannot find module"
Check import path - should be relative to current file
```javascript
// From: src/components/VehicleManagement/Travel.jsx
import { ... } from '../../api/vehicleManagement';  // ✅ Correct

// From: src/components/HR/PunchInPunchOut.jsx
import { ... } from '../../api/whatsappService';   // ✅ Correct
```

### "API returns 404"
- Backend not running
- Wrong endpoint path
- Check function exports in service file

### "401 Unauthorized"
- Login again
- Check token in localStorage:
  ```javascript
  console.log(localStorage.getItem('accessToken'));
  ```

### Network errors
- Ensure backend is running on `http://127.0.0.1:8000`
- Check CORS in Django settings
- Check browser DevTools Network tab

---

## 📚 Full Documentation

- **Complete API Reference:** [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md)
- **Quick Examples:** [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- **File Structure:** [API_INTEGRATION_INDEX.md](API_INTEGRATION_INDEX.md)
- **Implementation Details:** [API_INTEGRATION_SUMMARY.md](API_INTEGRATION_SUMMARY.md)
- **Status Verification:** [API_INTEGRATION_VERIFICATION.md](API_INTEGRATION_VERIFICATION.md)

---

## 🔐 API Endpoints at a Glance

### Vehicle Management
- **List:** `GET /vehicle-management/vehicles/`
- **Create:** `POST /vehicle-management/vehicles/`
- **Details:** `GET /vehicle-management/vehicles/{id}/`

### Trips
- **Start:** `POST /vehicle-management/trips/start/`
- **End:** `PATCH /vehicle-management/trips/{id}/end/`
- **List:** `GET /vehicle-management/trips/`
- **My Trips:** `GET /vehicle-management/trips/my-trips/`

### Challans
- **List:** `GET /vehicle-management/challans/`
- **Create:** `POST /vehicle-management/challans/`
- **Pay:** `PATCH /vehicle-management/challans/{id}/pay/`
- **Stats:** `GET /vehicle-management/challans/stats/`

### Office Locations
- **List:** `GET /hr/office-locations/`
- **Get:** `GET /hr/office-locations/{id}/`
- **Set Active:** `POST /hr/office-locations/{id}/set-active/`
- **Test Geofence:** `POST /hr/office-locations/{id}/test-location/`

### WhatsApp
- **Punch In:** `POST /whatsapp/punchin/`
- **Punch Out:** `POST /whatsapp/punchout/`
- **Configs:** `GET/POST/PATCH /whatsapp/admin/configurations/`

---

## 🚀 Integration Status

✅ **All 38+ endpoints integrated and ready to use**

Status Details:
- ✅ 3 service modules created
- ✅ 4 components updated
- ✅ 49+ functions available
- ✅ 5 documentation files
- ✅ Error handling complete
- ✅ Authentication configured
- ✅ Production ready

---

## 💡 Pro Tips

1. **Use the services, not direct API calls**
   - Services have better error handling
   - Easier to maintain and test
   - Consistent across app

2. **Always handle loading state**
   - Shows user something is happening
   - Prevents duplicate requests
   - Better UX

3. **Catch errors in components**
   - For custom handling
   - Errors already show as notifications
   - Check console for details

4. **Use filter parameters**
   - Reduces data transfer
   - Faster app performance
   - Less server load

5. **Read the JSDoc comments**
   - Hover over function name in IDE
   - Shows parameter descriptions
   - Shows return values

---

## 📞 Need Help?

1. **Quick questions?** → [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
2. **Implementation details?** → [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md)
3. **File structure?** → [API_INTEGRATION_INDEX.md](API_INTEGRATION_INDEX.md)
4. **Troubleshooting?** → Check "Troubleshooting" section above
5. **Check component examples:** Look at Travel.jsx, FuelManagement.jsx, etc.

---

## ✅ Verification

Before using APIs:
- [ ] Backend is running on `http://127.0.0.1:8000`
- [ ] Frontend is running (`npm run dev`)
- [ ] You're logged in (have valid token)
- [ ] No CORS errors in console
- [ ] You can see API requests in DevTools Network tab

---

## 🎉 You're Ready!

You now have everything you need to work with the MY_OMEGA APIs:

1. ✅ Service functions for all endpoints
2. ✅ Working examples in updated components
3. ✅ Comprehensive documentation
4. ✅ Error handling configured
5. ✅ Authentication working

**Start with [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) and happy coding! 🚀**

---

## 📝 Additional Resources

### Learning Resources
- React Hooks: https://react.dev/reference/react/hooks
- Axios: https://axios-http.com/
- async/await: https://javascript.info/async-await

### Project Documentation
- Backend API: See `MY_OMEGA_BACKEND/doc/` folder
- Frontend Setup: `my_omega_newfrontend/README.md`

### Getting Help
- Check console for detailed error messages
- Use DevTools Network tab to inspect requests
- Review JSDoc comments in service files
- Check component implementations for examples

---

**Last Updated:** February 3, 2026  
**Version:** 1.0 - Production Ready  
**Status:** ✅ All Systems Go

