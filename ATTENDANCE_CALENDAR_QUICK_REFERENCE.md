# Attendance Calendar - Quick Reference Card

## 🎯 At a Glance

| Item | Details |
|------|---------|
| **Feature** | Interactive attendance calendar with color-coded statuses |
| **Location** | Payroll Page (after Salary Breakdown) |
| **Display** | Calendar grid + Statistics + Legend + Summary Table |
| **Data Source** | Backend HR API (`/api/hr/attendance/`) |
| **Update Trigger** | Employee selection, month/year change |
| **Color Codes** | 11 different statuses (see below) |
| **Statistics** | Working days, paid leave, unpaid leave, absent days |

## 🎨 Color Quick Reference

```
🟢 Full Day      (#10B981)  - Working day
🔵 Half Day      (#3B82F6)  - Partial day
🟠 Casual Leave  (#F59E0B)  - Planned paid leave
🟣 Sick Leave    (#8B5CF6)  - Health leave (paid)
💗 Special Leave (#EC4899)  - Special paid leave
⬜ Unpaid Leave  (#6B7280)  - Non-paid leave
🟩 Mandatory     (#059669)  - Mandatory holiday (paid)
🔷 Special       (#0891B2)  - Special holiday (paid)
💜 Sunday        (#D946EF)  - Weekend
🔵‍♂️ Work From Home (#06B6D4)  - Remote work
🔴 Absent        (#EF4444)  - Absence
```

## 📊 Statistics Cards

| Card | Color | Meaning | Salary Impact |
|------|-------|---------|----------------|
| Working Days | 🟢 | Actively worked | ✅ Counted |
| Paid Leave | 🟠 | Leave with salary | ✅ Counted |
| Unpaid Leave | ⬜ | Leave without salary | ❌ Deducted |
| Absent Days | 🔴 | Unexplained absence | ❌ Deducted |

## 💰 Salary Impact

```
Gross Salary = Basic + Allowances

Deductions = Fixed Deductions + (Unpaid Days × Daily Rate)

Net Salary = Gross - Deductions

Formula for Unpaid Deduction:
Daily Rate = Basic Salary / Total Working Days
Unpaid Deduction = Unpaid Leave Days × Daily Rate
```

## 🔄 Data Flow

```
1. Select Employee
   ↓
2. Select Month/Year
   ↓
3. API Fetches: GET /api/hr/attendance/
   Query: user_id, month, year
   ↓
4. Data Processing:
   - Map status to colors
   - Calculate statistics
   - Build calendar grid
   ↓
5. Display Calendar
   - Grid (7 columns)
   - Statistics cards
   - Legend
   - Summary table
```

## 📱 Responsive Layout

| Device | Columns | Layout |
|--------|---------|--------|
| Desktop | 4 | Full width |
| Tablet | 2×2 | Responsive |
| Mobile | 1 | Stacked |

## 🔧 Component Props

```jsx
<AttendanceCalendar 
  employeeId={selectedEmployee.id}  // Employee ID
  month={selectedMonth}              // 1-12
  year={selectedYear}                // YYYY
/>
```

## 📋 Status Types & Meanings

| Status | Type | Paid | Notes |
|--------|------|------|-------|
| full | Work | ✅ | Complete working day |
| half | Work | ✅ | Partial working day |
| casual_leave | Leave | ✅ | Planned vacation |
| sick_leave | Leave | ✅ | Health emergency |
| special_leave | Leave | ✅ | Special circumstance |
| unpaid_leave | Leave | ❌ | Extended absence |
| mandatory_holiday | Holiday | ✅ | National holiday |
| special_holiday | Holiday | ✅ | Company holiday |
| sunday | Holiday | ✅ | Weekend |
| wfh | Work | ✅ | Remote work |
| absent | Absence | ❌ | Unexplained |

## 🎯 Usage Steps

1. **Navigate** → Payroll Page
2. **Select** → Employee from dropdown
3. **Choose** → Month & Year (auto-loads)
4. **View** → Calendar displays automatically
5. **Analyze** → Statistics and details

## 📈 Key Metrics

### Working Days Calculation
```
Working Days = Full Days + (Half Days × 0.5) + WFH Days

Example:
Full Days: 16
Half Days: 2 (= 1.0)
WFH Days: 1
Total = 18 working days
```

### Unpaid Leave Impact
```
Daily Rate = Basic Salary / Working Days
Unpaid Deduction = Unpaid Days × Daily Rate

Example:
Basic = 50,000
Working Days = 20
Daily Rate = 2,500

Unpaid Days = 2
Deduction = 2 × 2,500 = 5,000
Net = 50,000 - 5,000 = 45,000
```

## ⚠️ Important Notes

- ✓ Calendar updates automatically on selection change
- ✓ Shows data for selected month only
- ✓ Read-only view (no editing from calendar)
- ✓ Reflects data as of current date (future dates gray)
- ✓ Weekends shown for context
- ✓ Holidays marked as paid by default
- ✓ Empty days default to "Absent"

## 🔍 How to Read Calendar

```
Grid Layout (7 columns per week):
Sun | Mon | Tue | Wed | Thu | Fri | Sat
 1  |  2  |  3  |  4  |  5  |  6  |  7
 8  |  9  | 10  | 11  | 12  | 13  | 14
...

Each cell shows:
- Date number (1-31)
- Color based on status
- Clickable for details (optional)
```

## 💡 Tips & Tricks

1. **Hover over days** to see status tooltip
2. **Check cards first** for quick overview
3. **Read legend** to understand colors
4. **Review table** for exact numbers
5. **Compare months** to track patterns
6. **Plan ahead** knowing leave impact

## 🐛 If Issues Occur

| Issue | Solution |
|-------|----------|
| No calendar shown | Check if employee selected |
| All days gray | Verify API is running |
| Wrong data | Refresh page/check date |
| Colors off | Clear browser cache |
| Numbers wrong | Verify backend data |

## 📞 Quick Support

- **Documentation**: See README_ATTENDANCE_CALENDAR.md
- **Architecture**: See ATTENDANCE_CALENDAR_ARCHITECTURE.md
- **Examples**: See ATTENDANCE_CALENDAR_USAGE_EXAMPLES.md
- **Colors**: See ATTENDANCE_CALENDAR_COLOR_GUIDE.md
- **Setup**: See ATTENDANCE_CALENDAR_SETUP_GUIDE.md

## 📍 File Locations

| File | Purpose |
|------|---------|
| `src/components/Payroll/AttendanceCalendar.jsx` | Main component |
| `src/components/Payroll/PayrollPage.jsx` | Integration point |
| Multiple `.md` files | Documentation |

## ✅ Verification

- [x] Component created and tested
- [x] Integrated into PayrollPage
- [x] API connection working
- [x] Colors properly assigned
- [x] Statistics calculating correctly
- [x] Responsive design implemented
- [x] Error handling in place
- [x] Documentation complete

## 🚀 Ready to Use

The Attendance Calendar is fully implemented, tested, and ready for production use.

**Status**: ✅ **COMPLETE AND OPERATIONAL**

---

## 📚 Documentation Map

```
README_ATTENDANCE_CALENDAR.md ← START HERE
    ↓
ATTENDANCE_CALENDAR_SETUP_GUIDE.md ← How to set up
    ↓
ATTENDANCE_CALENDAR_COLOR_GUIDE.md ← Colors explained
    ↓
ATTENDANCE_CALENDAR_ARCHITECTURE.md ← Technical details
    ↓
ATTENDANCE_CALENDAR_USAGE_EXAMPLES.md ← Real scenarios
    ↓
ATTENDANCE_CALENDAR_IMPLEMENTATION.md ← Full specs
```

---

**Last Updated**: January 21, 2026
**Version**: 1.0
**Status**: Production Ready ✅
