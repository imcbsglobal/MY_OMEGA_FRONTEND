# Attendance Calendar - Color Reference Guide

## Visual Color Scheme

### Working Days (Green Shades)
- **Full Day** 🟢 `#10B981` - Complete working day with presence
- **Half Day** 🔵 `#3B82F6` - Half day work (or partial presence)
- **Work From Home** 🔵‍♂️ `#06B6D4` - Remote working from home

### Leave Days (Warm Colors)
- **Casual Leave** 🟠 `#F59E0B` - Paid casual leave (typically 1 per month)
- **Sick Leave** 🟣 `#8B5CF6` - Paid sick leave
- **Special Leave** 💗 `#EC4899` - Paid special leave
- **Unpaid Leave** ⬜ `#6B7280` - Non-paid leave (deducted from salary)

### Holidays (Dark/Celebration Colors)
- **Mandatory Holiday** 🟢 `#059669` - Paid mandatory/national holiday
- **Special Holiday** 🔷 `#0891B2` - Paid special holiday
- **Sunday** 💜 `#D946EF` - Weekend (paid)

### Other Status
- **Absent** 🔴 `#EF4444` - Marked as absent
- **Weekend** ⬜ `#E5E7EB` - Saturday/Sunday (when not marked as holiday)

## Attendance Categories

### Paid Days (Counted in Salary)
✅ Full Day
✅ Half Day  
✅ Casual Leave
✅ Sick Leave
✅ Special Leave
✅ Mandatory Holiday
✅ Special Holiday
✅ Sunday
✅ Work From Home

### Non-Paid Days (Deducted from Salary)
❌ Unpaid Leave
❌ Absent

### Statistics Breakdown

**Working Days** = Full Days + Half Days + Work From Home
- These are productive days counted for salary calculation

**Paid Leave** = Casual + Sick + Special + Mandatory Holiday + Special Holiday + Sunday
- These are paid days but not active work days

**Unpaid Leave** = Days marked as unpaid leave
- These are deducted from salary

**Absent Days** = Unmarked absences
- These are non-paid and may have salary deduction

## Example Calendar View

```
    Sun  Mon  Tue  Wed  Thu  Fri  Sat
            🟢   🟢   🟢   🟢   🟢   ⬜
     ⬜   🟢   🟢   🟢   🟢   🟢   ⬜
     ⬜   🟢   🟠   🟠   🟢   🟢   ⬜
     ⬜   🟢   🟢   🟢   🟢   🔴   ⬜
     ⬜   🟢   🟣   🟢   💜   🟢   ⬜

Legend:
🟢 = Present (Full Day)        🟠 = Casual Leave
⬜ = Absent/Weekend            🟣 = Sick Leave
💜 = Sunday (Holiday)          🔴 = Absent
```

## Stats Summary Example

| Metric | Count | Color |
|--------|-------|-------|
| Working Days | 18.5 | 🟢 Green |
| Paid Leave | 5 | 🟠 Orange |
| Unpaid Leave | 2 | ⬜ Gray |
| Holidays | 4 | 💚 Dark Green |
| Absent Days | 1 | 🔴 Red |
| **Total Days** | **30** | - |

## How to Read the Calendar

1. **Each colored box** represents one day
2. **Color indicates status** - see legend above
3. **Numbers inside** show the day of month
4. **Gray boxes** represent days before/after month
5. **Statistics cards** show quick totals
6. **Summary table** provides detailed breakdown

## Salary Impact

When calculating salary for the month:
- **Full/Half Days + Paid Leave** = Counted as working days
- **Unpaid Leave** = Deducted from salary calculation
- **Absent Days** = May be deducted depending on company policy
- **Holidays** = Typically paid (don't affect salary calculation)

## Integration with Payroll

The attendance calendar helps in payroll calculation by:
1. **Clear visibility** of actual working days
2. **Automatic leave type** identification
3. **Salary adjustment basis** (paid vs unpaid leaves)
4. **Dispute resolution** through historical records
5. **Month-to-month comparison** capability
