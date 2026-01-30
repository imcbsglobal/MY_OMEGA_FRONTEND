# Attendance Calendar - Implementation Guide

## Quick Start

The Attendance Calendar has been successfully integrated into the Payroll page. No additional setup is needed.

## How It Works

### User Journey
1. Navigate to **Payroll Page**
2. **Select an Employee** from the dropdown
3. **Select Month and Year**
4. **Attendance Calendar** automatically loads below the Salary Breakdown section
5. View:
   - Calendar grid with color-coded days
   - Statistics cards (Working Days, Paid Leave, Unpaid Leave, Absent Days)
   - Detailed legend
   - Summary table

### Behind the Scenes
1. When employee is selected, the calendar is initialized
2. When month/year changes, it fetches fresh data from backend
3. Backend API query: `GET /api/hr/attendance/?user_id={id}&month={m}&year={y}`
4. Data is processed and displayed with statistics
5. If API fails, empty calendar is shown (graceful degradation)

## Component Files

### Main Component
**Location:** `my_omega_newfrontend/src/components/Payroll/AttendanceCalendar.jsx`
- 546 lines
- Self-contained with all styling
- Handles loading and error states
- Responsive design

### Integration Point
**Location:** `my_omega_newfrontend/src/components/Payroll/PayrollPage.jsx`
- Import added at line 14
- Component rendered at lines 544-550
- Passes props: `employeeId`, `month`, `year`

## Color Coding System

| Status | Color | Hex | Meaning |
|--------|-------|-----|---------|
| Present | Green | #10B981 | Full day presence |
| Half Day | Blue | #3B82F6 | Partial day work |
| Casual Leave | Orange | #F59E0B | Paid casual leave |
| Sick Leave | Purple | #8B5CF6 | Paid sick leave |
| Special Leave | Pink | #EC4899 | Paid special leave |
| Unpaid Leave | Gray | #6B7280 | Non-paid leave |
| Mandatory Holiday | Dark Green | #059669 | Paid mandatory holiday |
| Special Holiday | Cyan | #0891B2 | Paid special holiday |
| Sunday | Magenta | #D946EF | Weekend |
| Work From Home | Light Cyan | #06B6D4 | Remote work |
| Absent | Red | #EF4444 | Absence |
| Weekend | Light Gray | #E5E7EB | Non-working day |

## Statistics Shown

### Cards Display
1. **Working Days**: Count of days with active work
   - Formula: Full Days + Half Days + Work From Home
   - Impact: Used for salary calculation

2. **Paid Leave**: All paid leave days
   - Includes: Casual, Sick, Special, Mandatory, Special Holiday, Sunday
   - Impact: Counted as paid days

3. **Unpaid Leave**: Non-paid leave days
   - Impact: Deducted from salary

4. **Absent Days**: Unmarked absences
   - Impact: May result in salary deduction

### Summary Table
Shows detailed breakdown:
- Total Working Days (decimal precision)
- Paid Leave count
- Unpaid Leave count
- Holidays count
- Total Absent Days

## Features Included

✅ **Color-Coded Calendar**
- Visual representation of attendance status
- Easy pattern recognition
- 7-day week layout

✅ **Statistics Cards**
- Quick overview of key metrics
- Color-matched to calendar
- Card-based layout for clarity

✅ **Interactive Legend**
- All status types explained
- Color reference guide
- Responsive grid layout

✅ **Summary Table**
- Detailed metrics breakdown
- Bold colored numbers
- Professional styling

✅ **Responsive Design**
- Works on desktop and tablet
- Mobile-friendly grid
- Adaptive card layout

✅ **Error Handling**
- Graceful degradation if API fails
- Shows empty calendar instead of error message
- Console logging for debugging

✅ **Loading State**
- Spinning indicator
- Loading message
- Prevents user confusion

## Backend Requirements

### API Endpoint
```
GET /api/hr/attendance/
```

### Query Parameters
- `user_id` (required): Employee ID
- `month` (required): Month number (1-12)
- `year` (required): Year (YYYY)

### Response Format
```json
[
  {
    "id": 1,
    "user": 1,
    "date": "2026-01-15",
    "status": "full",
    "is_paid_leave": false,
    "leave_type": null
  },
  {
    "id": 2,
    "user": 1,
    "date": "2026-01-16",
    "status": "casual_leave",
    "is_paid_leave": true,
    "leave_type": "casual_leave"
  }
]
```

### Supported Status Values
- `full` - Full day present
- `half` - Half day
- `absent` - Absent
- `casual_leave` - Casual leave
- `sick_leave` - Sick leave
- `special_leave` - Special leave
- `unpaid_leave` - Unpaid leave
- `mandatory_holiday` - Mandatory holiday
- `special_holiday` - Special holiday
- `sunday` - Sunday
- `wfh` - Work from home

## Testing

### Test Scenarios

1. **Employee with Full Month Data**
   - Select employee with complete attendance data
   - Verify calendar shows all days
   - Check statistics match visual count

2. **Employee with Partial Data**
   - Select employee with some missing days
   - Verify missing days show as absent
   - Check statistics handle gaps

3. **Month/Year Change**
   - Select different months
   - Verify data updates automatically
   - Check statistics recalculate

4. **No Attendance Data**
   - Select employee/month with no data
   - Verify empty calendar shows gracefully
   - Check statistics show zero

5. **API Failure**
   - Simulate API error
   - Verify no crash or error shown
   - Check console has error logs

6. **Mobile Responsiveness**
   - Test on various screen sizes
   - Verify calendar remains readable
   - Check cards stack properly

## Customization Options

### Change Colors
Modify the `statusColors` object in `AttendanceCalendar.jsx`:
```jsx
const statusColors = {
  full: { bg: "#10B981", label: "Present", hex: "#10B981" },
  // ... more colors
};
```

### Change Card Layout
Modify grid columns (line ~260):
```jsx
gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
```

### Change Calendar Gap
Modify gap size (line ~335):
```jsx
gap: "4px", // Increase for more spacing
```

## Performance Considerations

- Component fetches data only when props change
- Uses React hooks efficiently
- Processes up to 31 days of data (one month)
- Minimal DOM nodes
- Inline styles instead of external CSS for better bundling

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Known Limitations

1. **One Month View**: Shows only one month at a time
2. **No Drag/Drop**: Days cannot be rearranged
3. **No Editing**: Calendar is read-only
4. **No Export**: Cannot export to PDF/image directly

## Future Enhancement Ideas

1. **Multi-Month View**: Side-by-side comparison
2. **Trend Analysis**: Color intensity based on patterns
3. **Notes Display**: Hover to see day notes
4. **Export Feature**: Download as image or PDF
5. **Filters**: Show only specific status types
6. **Comparison**: Compare months side-by-side

## Troubleshooting

### Calendar Not Showing
- Check browser console for API errors
- Verify employee is selected
- Check network tab for API call

### Wrong Data Displayed
- Verify month/year selection
- Check backend data for accuracy
- Clear browser cache and refresh

### Colors Not Showing
- Verify inline styles are rendering
- Check browser dev tools for style conflicts
- Clear browser cache

### Statistics Don't Match
- Verify backend data status values
- Check processAttendanceData logic
- Review status mapping in statusColors

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify backend API is returning data
3. Check network requests in browser dev tools
4. Review data format matches expected structure
