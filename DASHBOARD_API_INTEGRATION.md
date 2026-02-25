# Dashboard Data Integration Guide

## Overview
The Dashboard component has been refactored to use a centralized **Dashboard APIService** (`dashboardAPI.js`). This ensures consistent data handling across the application and makes dashboard data fetching reusable by other components.

## Key Changes

### Before (Inline API Calls)
```javascript
// Old way - inconsistent data handling
const usersData = await apiFetch("/user-controll/admin/users/");
const allUsers = Array.isArray(usersData) ? usersData : (usersData?.results || []);
// Duplicate logic in multiple components
```

### After (Centralized Service)
```javascript
// New way - clean, centralized, consistent
import * as dashboardAPI from "../api/dashboardAPI";

const dashboardData = await dashboardAPI.fetchDashboardStats();
const { stats, chartData } = dashboardData;
```

## API Service Architecture

### File Location
- **Service**: `src/api/dashboardAPI.js`
- **Dashboard**: `src/pages/Dashboard.jsx`
- **Base Client**: `src/api/client.js` (Axios instance with auth interceptors)

### Core Functions

#### 1. **fetchDashboardStats()** - Main Function
Fetches all dashboard statistics in a single optimized call.
```javascript
const dashboardData = await dashboardAPI.fetchDashboardStats();

// Returns:
{
  stats: {
    totalUsers: 11,
    totalEmployees: 4,
    presentToday: 2,
    onLeaveToday: 0,
    absentToday: 4,
    pendingLeaves: 1
  },
  chartData: [
    { month: 'Jan', value: 2 },
    { month: 'Feb', value: 1 },
    ...
  ],
  rawData: {
    users: [...],
    employees: [...],
    attendanceSummary: [...],
    leaves: [...]
  }
}
```

#### 2. **fetchAllUsers()**
Fetches all registered users from the system.
```javascript
const users = await dashboardAPI.fetchAllUsers();
```

#### 3. **fetchAllEmployees()**
Fetches all employees.
```javascript
const employees = await dashboardAPI.fetchAllEmployees();
```

#### 4. **fetchAttendanceSummary()**
Fetches attendance summary data for today.
```javascript
const attendanceSummary = await dashboardAPI.fetchAttendanceSummary();
```

#### 5. **fetchPendingLeaves()**
Fetches all pending leave requests.
```javascript
const pendingLeaves = await dashboardAPI.fetchPendingLeaves();
```

#### 6. **processAttendanceSummary(data)**
Converts raw attendance summary into organized format.
```javascript
const { presentToday, onLeaveToday, absentToday } = 
  dashboardAPI.processAttendanceSummary(rawData);
```

#### 7. **buildMonthlyHiringTrend(employees)**
Builds monthly hiring trend data from employee list.
```javascript
const chartData = dashboardAPI.buildMonthlyHiringTrend(employees);
// Returns: [{ month: 'Jan', value: 5 }, ...]
```

#### 8. **normalizeResponse(data)**
Helper to handle different API response formats.
```javascript
const normalized = dashboardAPI.normalizeResponse(data);
// Handles: Array, {results: []}, {data: []}, null
```

## API Response Handling

### Response Format Normalization
The service automatically handles three common response formats:

| Format | Handled By | Example |
|--------|-----------|---------|
| Array | Direct | `[{id: 1}, {id: 2}]` |
| Paginated | results key | `{results: [{id: 1}], count: 100}` |
| Data wrapped | data key | `{data: [{id: 1}], success: true}` |

```javascript
// All these are normalized to: [{id: 1}, {id: 2}]
normalizeResponse([{id: 1}, {id: 2}])
normalizeResponse({results: [{id: 1}, {id: 2}]})
normalizeResponse({data: [{id: 1}, {id: 2}]})
```

## Attendance Data Processing

### Processing Logic
The `processAttendanceSummary()` function intelligently processes attendance data:

```javascript
// Handles these status variations:
- Present: "present", "full", "half_day"
- Leave: "leave", "casual_leave", "earned_leave", "sick_leave", "on_leave"
- Absent: "absent"

// Extracts from both:
- Array format: [{status: "present", count: 5}, ...]
- Object format: {present: 5, leave: 2, absent: 3}
```

## Monthly Hiring Trend

### Data Source
Extracts joining dates from employees to build monthly hiring trends:

```javascript
// Looks for joining date in:
- employee.date_of_joining
- employee.joining_date
- employee.job_info.date_of_joining

// Returns last 12 months of data:
[
  { month: 'Jan', value: 2 },
  { month: 'Feb', value: 1 },
  ...
]
```

## Using in Components

### Example 1: Dashboard Component
```javascript
import * as dashboardAPI from "../api/dashboardAPI";

export default function Dashboard() {
  const [stats, setStats] = useState({...});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await dashboardAPI.fetchDashboardStats();
        setStats(data.stats);
        setChartData(data.chartData);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Use stats and chartData...
}
```

### Example 2: Individual Data Fetching
```javascript
import * as dashboardAPI from "../api/dashboardAPI";

// Fetch specific data when needed
const employees = await dashboardAPI.fetchAllEmployees();
const chartData = dashboardAPI.buildMonthlyHiringTrend(employees);

// Process specific data
const summary = dashboardAPI.fetchAttendanceSummary();
const counts = dashboardAPI.processAttendanceSummary(summary);
```

### Example 3: Reusing Raw Data
```javascript
const dashboardData = await dashboardAPI.fetchDashboardStats();

// Access raw data if needed for other purposes
const allEmployees = dashboardData.rawData.employees;
const allLeaves = dashboardData.rawData.leaves;
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/user-controll/admin/users/` | GET | Fetch all users |
| `/employee-management/employees/` | GET | Fetch all employees |
| `/hr/attendance/summary-all/` | GET | Get attendance summary |
| `/hr/leave/?status=pending` | GET | Get pending leaves |
| `/hr/attendance/` | GET | Get attendance records (optional) |

## Error Handling

### Try-Catch Pattern
```javascript
try {
  const data = await dashboardAPI.fetchDashboardStats();
  // Use data
} catch (error) {
  console.error('❌ API Error:', error);
  // Fallback to default values
  setStats({
    totalUsers: 0,
    totalEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
  });
}
```

### Individual Function Errors
Each function logs errors and throws them for caller to handle:
```javascript
export const fetchAllUsers = async () => {
  try {
    const response = await api.get('/user-controll/admin/users/');
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;  // Propagate for component handling
  }
};
```

## Benefits of This Approach

✅ **Consistency**: All components handle data the same way  
✅ **Reusability**: Other components can import and use these functions  
✅ **Maintainability**: Centralized logic is easier to update  
✅ **Testability**: Functions are pure and easy to test  
✅ **Performance**: Parallel data fetching with Promise.all()  
✅ **Type Safety**: Clear input/output documentation  
✅ **Error Handling**: Centralized error logging and messages  

## Data Flow Diagram

```
Dashboard.jsx
    ↓
fetchDashboardStats()
    ↓
Promise.all([
  fetchAllUsers(),
  fetchAllEmployees(),
  fetchAttendanceSummary(),
  fetchPendingLeaves()
])
    ↓
Data Processing:
  - normalizeResponse()
  - processAttendanceSummary()
  - buildMonthlyHiringTrend()
    ↓
Return structured data:
  { stats, chartData, rawData }
    ↓
Dashboard component updates state
```

## Adding New Dashboard Metrics

To add a new dashboard metric:

1. **Create a new fetch function** in `dashboardAPI.js`:
```javascript
export const fetchMetricX = async () => {
  try {
    const response = await api.get('/endpoint/for/metric/');
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching metric X:', error);
    throw error;
  }
};
```

2. **Add to fetchDashboardStats()**:
```javascript
const [metricData] = await Promise.all([
  // ... existing fetches
  fetchMetricX().catch(err => {
    console.error('Error:', err);
    return [];
  })
]);
```

3. **Process and include in return**:
```javascript
return {
  stats: {
    // ... existing stats
    newMetric: processMetricData(metricData)
  },
  // ...
};
```

## Testing the Integration

### Browser Console
```javascript
// Test the API service directly
import * as dashboardAPI from './api/dashboardAPI';

// Fetch all data
const data = await dashboardAPI.fetchDashboardStats();
console.log(data);

// Test individual functions
const users = await dashboardAPI.fetchAllUsers();
console.log('Users:', users);

const emps = await dashboardAPI.fetchAllEmployees();
const trending = dashboardAPI.buildMonthlyHiringTrend(emps);
console.log('Trend:', trending);
```

## Migration Guide for Other Components

If you want to apply this pattern to other API modules:

1. Extract common functions to a dedicated service file
2. Use `api` client from `src/api/client.js`
3. Add `normalizeResponse()` helper
4. Export individual functions + composite function
5. Import and use in components

**Example** - See `src/api/hrManagement.js` for existing pattern

---

**Last Updated**: February 2026  
**Service Version**: 1.0  
**Maintainer**: Development Team
