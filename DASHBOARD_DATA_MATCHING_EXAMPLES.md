# Dashboard Data Matching Guide - Implementation Examples

## Overview
This guide shows how the Dashboard component now matches and aligns data across different API endpoints and other components.

## Problem Solved

### Before (Inconsistent Data Fetching)
```javascript
// Dashboard had inline API calls with duplicate logic from other components
const usersData = await apiFetch("/user-controll/admin/users/");
const allUsers = Array.isArray(usersData) ? usersData : (usersData?.results || []);

// Similar logic repeated in LeaveManagement.jsx, AttendanceManagement.jsx, etc.
const leaveRes = await api.get("/hr/leave/");
const allLeave = Array.isArray(leaveRes.data) ? leaveRes.data : (leaveRes.data?.results || []);

// Inconsistent handling made it hard to maintain
```

### After (Consistent Data Matching)
```javascript
// Dashboard imports centralized service
import * as dashboardAPI from "../api/dashboardAPI";

// All components use same normalized data
const users = await dashboardAPI.fetchAllUsers();
const employees = await dashboardAPI.fetchAllEmployees();
const attendances = await dashboardAPI.fetchAttendanceSummary();
```

## Data Matching Architecture

### 1. User Data Alignment

**Multiple Sources**:
- `GET /user-controll/admin/users/` → User list
- `GET /users/` → Alternative user endpoint
- `GET /employee-management/employees/` → Employee with linked user

**Dashboard Mapping**:
```javascript
export const fetchAllUsers = async () => {
  try {
    const response = await api.get('/user-controll/admin/users/');
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};
```

**Data Structure**:
```javascript
{
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  is_active: true,
  // ... other user fields
}
```

### 2. Employee Data Alignment

**Source**: `GET /employee-management/employees/`

**Dashboard Extraction**:
```javascript
const employees = await dashboardAPI.fetchAllEmployees();
// Returns normalized employee list

// Used by other components:
// - PayrollPage.jsx: fetchEmployees()
// - EmployeeDashboard.jsx: employee list
// - Routetargetassign.jsx: employee options
```

**Key Matching Fields**:
```javascript
{
  id: 1,
  name: "John Doe",
  full_name: "John Doe",
  user_id: 1,
  email: "john@example.com",
  date_of_joining: "2024-01-15",
  joining_date: "2024-01-15",  // Fallback field
  job_info: {
    date_of_joining: "2024-01-15"  // Another fallback
  },
  department: "Sales",
  status: "active"
}
```

### 3. Attendance Data Alignment

**Source**: `GET /hr/attendance/summary-all/`

**Multiple Response Formats Handled**:

#### Format 1: Array with Status-Count
```javascript
// Response from API
[
  { status: "present", count: 5 },
  { status: "on_leave", count: 2 },
  { status: "absent", count: 3 }
]

// Dashboard processes it
const { presentToday, onLeaveToday, absentToday } = 
  dashboardAPI.processAttendanceSummary(rawData);
// Result: { presentToday: 5, onLeaveToday: 2, absentToday: 3 }
```

#### Format 2: Object with Direct Counts
```javascript
// Alternative response format
{
  present: 5,
  present_count: 5,     // Fallback field
  present_today: 5,     // Another fallback
  leave_count: 2,
  on_leave: 2,
  absent_count: 3,
  absent: 3
}

// Dashboard handles all variations automatically
```

**Status Mappings**:
```javascript
// Present statuses:
"present" | "full" | "half_day" → presentToday

// Leave statuses (all these map to onLeaveToday):
"leave" | "casual_leave" | "earned_leave" | 
"sick_leave" | "on_leave"

// Absent statuses:
"absent" → absentToday
```

### 4. Leave Data Alignment

**Source**: `GET /hr/leave/?status=pending`

**Used Across Components**:
```javascript
// Dashboard shows pending count
const leaves = await dashboardAPI.fetchPendingLeaves();

// LeaveManagement.jsx also fetches similar data
const leaveRes = await api.get("/hr/leave/");

// RequestLeave.jsx shows available leave types
const response = await api.get("/hr/leave-masters/active-leaves/");
```

## Data Flow Examples

### Example 1: Complete Dashboard Data Fetch
```
fetchDashboardStats()
├─ fetchAllUsers() → [11 users]
├─ fetchAllEmployees() → [4 employees]  
├─ fetchAttendanceSummary() → {present: 2, on_leave: 0, absent: 4}
└─ fetchPendingLeaves() → [1 pending leave]
    ↓
    Process & Structure
    ↓
{
  stats: {
    totalUsers: 11,
    totalEmployees: 4,
    presentToday: 2,
    onLeaveToday: 0,
    absentToday: 4,
    pendingLeaves: 1
  },
  chartData: [{ month: 'Jan', value: 2 }, ...],
  rawData: { ... }
}
```

### Example 2: Monthly Hiring Trend
```
buildMonthlyHiringTrend(employees)

Input: 
[
  { id: 1, name: "Alice", date_of_joining: "2025-01-15" },
  { id: 2, name: "Bob", date_of_joining: "2025-01-20" },
  { id: 3, name: "Carol", date_of_joining: "2025-02-10" }
]

Processing:
- Extract joining dates
- Group by month/year
- Generate last 12 months

Output:
[
  { month: 'Jan', value: 2 },
  { month: 'Feb', value: 1 },
  { month: 'Mar', value: 0 },
  ...
]
```

### Example 3: Attendance Processing
```
processAttendanceSummary(attendanceSummary)

Input (Format 1):
[
  { status: "present", count: 10 },
  { status: "half_day", count: 2 },
  { status: "casual_leave", count: 3 },
  { status: "sick_leave", count: 1 },
  { status: "absent", count: 4 }
]

Processing:
- Group present-like statuses (present + half_day) → presentToday: 12
- Group leave statuses (casual_leave + sick_leave + ...) → onLeaveToday: 4
- Group absent statuses → absentToday: 4

Output:
{
  presentToday: 12,
  onLeaveToday: 4,
  absentToday: 4
}
```

## Component Integration Examples

### Example: AttendanceManagement.jsx
**Before** (Inconsistent):
```javascript
const employeesResponse = await api.get("/users/", { 
  params: { is_active: true } 
});
let employeesList = employeesResponse.data;

if (!Array.isArray(employeesList)) {
  employeesList = employeesList.results || employeesList.data || [];
}
```

**After** (Using dashboard API):
```javascript
import * as dashboardAPI from "../api/dashboardAPI";

// Get employees - automatically normalized
const employees = await dashboardAPI.fetchAllEmployees();
// All logic centralized, consistent with Dashboard
```

### Example: PayrollPage.jsx
**Before** (Duplicate logic):
```javascript
const response = await api.get("employee-management/employees/");
const employeeData = response.data?.results || response.data?.data || response.data || [];
setEmployees(Array.isArray(employeeData) ? employeeData : []);
```

**After** (Centralized):
```javascript
import * as dashboardAPI from "../api/dashboardAPI";

const employees = await dashboardAPI.fetchAllEmployees();
setEmployees(employees);
```

### Example: Custom Hiring Analytics Component
```javascript
import * as dashboardAPI from "../api/dashboardAPI";

export function HiringAnalytics() {
  useEffect(() => {
    (async () => {
      // Fetch employees
      const employees = await dashboardAPI.fetchAllEmployees();
      
      // Build trending
      const trendData = dashboardAPI.buildMonthlyHiringTrend(employees);
      
      // Use for charts
      setChartData(trendData);
    })();
  }, []);
  
  // Component rendering...
}
```

## Benefits of Data Matching

| Benefit | Implementation |
|---------|---------------|
| **Consistency** | All components use `normalizeResponse()` |
| **DRY Code** | Shared functions in one place |
| **Maintainability** | Update logic once, affects everywhere |
| **Type Safety** | Clear input/output contracts |
| **Performance** | Parallel fetching with `Promise.all()` |
| **Debugging** | Centralized logging |
| **Testing** | Pure functions easier to test |

## Handling Edge Cases

### Missing Data Fields
```javascript
// Dashboard handles multiple field name variations

// User might have different name fields:
const name = emp.name || emp.full_name || emp.username;

// Joining date might be in different locations:
const doj = emp.date_of_joining || 
            emp.joining_date ||
            emp.job_info?.date_of_joining;

// Normalized with fallbacks
```

### Null/Undefined Responses
```javascript
// normalizeResponse handles all edge cases
normalizeResponse(null) → []
normalizeResponse(undefined) → []
normalizeResponse({}) → []
normalizeResponse({results: null}) → []
```

### No Attendance for Absent
```javascript
// Dashboard automatically calculates:
presentToday = 2
onLeaveToday = 1
totalEmployees = 10
absent = Math.max(0, 10 - 2 - 1) = 7
```

## Migration Checklist

If you want to apply this pattern to another module:

- [ ] Create new service file (e.g., `src/api/vendorAPI.js`)
- [ ] Import `api` from `src/api/client.js`
- [ ] Add `normalizeResponse()` helper
- [ ] Create individual fetch functions
- [ ] Create composite function (like `fetchDashboardStats()`)
- [ ] Add error handling with meaningful logs
- [ ] Export everything in default export
- [ ] Create usage documentation
- [ ] Update components to import and use
- [ ] Test thoroughly with real API

## Testing Checklist

- [ ] Different response formats (array, paginated, wrapped)
- [ ] Null/empty responses
- [ ] Field name variations
- [ ] Error scenarios (401, 404, 500, network)
- [ ] Parallel Promise.all() handling
- [ ] Fallback values when APIs fail
- [ ] Data consistency across components

---

**Related Files**:
- Service: `src/api/dashboardAPI.js`
- Component: `src/pages/Dashboard.jsx`
- Base Client: `src/api/client.js`
- Integration Guide: `DASHBOARD_API_INTEGRATION.md`
- Quick Reference: `DASHBOARD_API_QUICK_REFERENCE.md`
