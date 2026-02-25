# Dashboard API Service - Quick Reference

## TL;DR

### Import
```javascript
import * as dashboardAPI from "../api/dashboardAPI";
```

### Usage
```javascript
// Fetch everything at once (Recommended)
const { stats, chartData } = await dashboardAPI.fetchDashboardStats();

// Fetch individual data
const users = await dashboardAPI.fetchAllUsers();
const employees = await dashboardAPI.fetchAllEmployees();
const attendance = await dashboardAPI.fetchAttendanceSummary();
const leaves = await dashboardAPI.fetchPendingLeaves();
```

## Common Patterns

### In useEffect
```javascript
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
```

### Data Structure
```javascript
{
  stats: {
    totalUsers: number,
    totalEmployees: number,
    presentToday: number,
    onLeaveToday: number,
    absentToday: number,
    pendingLeaves: number
  },
  chartData: [
    { month: string, value: number },
    ...
  ],
  rawData: {
    users: array,
    employees: array,
    attendanceSummary: array | object,
    leaves: array
  }
}
```

## Available Functions

| Function | Returns | Purpose |
|----------|---------|---------|
| `fetchDashboardStats()` | Object with stats, chartData, rawData | All dashboard data at once |
| `fetchAllUsers()` | Array | All users in system |
| `fetchAllEmployees()` | Array | All employees |
| `fetchAttendanceSummary()` | Array or Object | Today's attendance summary |
| `fetchPendingLeaves()` | Array | Pending leave requests |
| `fetchAttendanceRecords(params)` | Array | Attendance for month/year |
| `processAttendanceSummary(data)` | Object | Convert raw attendance to counts |
| `buildMonthlyHiringTrend(employees)` | Array | Monthly hiring chart data |
| `normalizeResponse(data)` | Array | Convert any response format to array |

## Response Normalization
Automatically handles:
- `[{...}]` ✅ Array
- `{results: [{...}]}` ✅ Paginated
- `{data: [{...}]}` ✅ Wrapped
- `null/undefined` ✅ Empty array

## Error Handling
All functions throw errors - catch in component:
```javascript
try {
  const data = await dashboardAPI.fetchDashboardStats();
  // Use data
} catch (error) {
  console.error('Error:', error);
  // Use fallback values
}
```

## Performance
- ✅ Parallel data fetching with `Promise.all()`
- ✅ Centralized auth via `src/api/client.js`
- ✅ Consistent error logging
- ✅ Optimized for dashboard use case

## When to Use Each Function

| Scenario | Function |
|----------|----------|
| Display full dashboard | `fetchDashboardStats()` |
| Need just employees | `fetchAllEmployees()` |
| Build hiring trend | `buildMonthlyHiringTrend(employees)` |
| Build attendance chart | `processAttendanceSummary(data)` |
| Need raw API response | `fetchAttendanceRecords(params)` |

---

**File**: `src/api/dashboardAPI.js`  
**Related**: `src/pages/Dashboard.jsx`, `src/api/client.js`
