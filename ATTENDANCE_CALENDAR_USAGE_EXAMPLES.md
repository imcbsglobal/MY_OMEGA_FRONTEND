# Attendance Calendar - Usage Examples

## Basic Usage

### 1. View Attendance for Current Month

```
1. Navigate to Payroll Page
2. Select an employee from the dropdown
3. Current month and year are pre-selected
4. Calendar automatically loads showing:
   - Color-coded days based on attendance
   - Statistics cards with key metrics
   - Legend and summary table
```

### 2. View Attendance for Specific Month/Year

```
1. Select employee
2. Change Month selector to desired month
3. Change Year selector to desired year
4. Calendar updates automatically
5. New statistics calculated for selected period
```

### 3. Analyze Leave Patterns

```
Example: Checking leave usage
1. Select employee
2. Review calendar for month
3. Count colored blocks:
   - Orange blocks = Casual leave taken
   - Purple blocks = Sick leave taken
   - Gray blocks = Unpaid leave taken
4. Check "Paid Leave" and "Unpaid Leave" cards
5. Calculate impact on salary based on unpaid days
```

## Real-World Scenarios

### Scenario 1: January 2026 Full Month View

```
Calendar Display:
┌─────────────────────────────────┐
│ Sun Mon Tue Wed Thu Fri Sat     │
│     🟢  🟢  🟢  🟢  🟢  ⬜      │  Week 1
│ ⬜  🟢  🟢  🟢  🟢  🟢  ⬜      │  Week 2
│ ⬜  🟢  🟠  🟠  🟢  🟢  ⬜      │  Week 3
│ ⬜  🟢  🟢  🟢  🟢  🔴  ⬜      │  Week 4
│ ⬜  🟢  🟣  🟢  ⬜  ⬜  ⬜      │  Week 5

Legend:
🟢 = Full Day (Present)
🟠 = Casual Leave (Paid)
🟣 = Sick Leave (Paid)
🔴 = Absent
⬜ = Sunday/Weekend

Statistics:
✓ Working Days: 17
✓ Paid Leave: 3
✓ Unpaid Leave: 0
✓ Absent Days: 1
✓ Holidays: 4
```

### Scenario 2: Employee with Mixed Leave

```
Month: March 2026
Employee: John Doe

Days 1-5: Regular working (🟢)
Days 6-7: Weekend (⬜)
Days 8-10: Casual Leave (🟠) - Planned vacation
Days 11-12: Weekend (⬜)
Days 13-17: Regular working (🟢)
Days 18: Sick Leave (🟣) - Unplanned
Days 19-21: Weekend (⬜)
Days 22-31: Regular working (🟢)

Salary Impact Calculation:
- Working Days: 16 days
- Paid Leave: 4 days (included in salary)
- Unpaid Leave: 0 days
- Net Salary: Full basic + allowances
  (No deductions for leave)
```

### Scenario 3: Employee with Unpaid Leave

```
Month: February 2026
Employee: Jane Smith

Days 1-14: Regular working (🟢)
Days 15-18: Personal Issues - Unpaid Leave (⬜)
Days 19-28: Regular working (🟢)

Salary Calculation:
- Total Calendar Days: 28
- Working Days: 21
- Paid Leave: 0
- Unpaid Leave: 4 days (DEDUCTED)
- Net Salary: 
  Basic = 50,000
  Unpaid Leave Deduction = 50,000 × (4/28) = 7,142.86
  Final = 50,000 - 7,142.86 = 42,857.14
```

### Scenario 4: Holidays Month

```
Month: October 2026 (Diwali, Festival Season)
Employee: Any Employee

Days 1-14: Regular working (🟢)
Days 15-16: Mandatory Holiday (🟢 Dark Green)
  - Diwali Festival (Paid, counts as holiday)
Days 17-20: Regular working (🟢)
Days 21-22: Special Holiday (🔷 Cyan)
  - Company Holiday (Paid)
Days 23-24: Weekend (⬜)
Days 25-31: Regular working (🟢)

Statistics:
- Working Days: 18
- Paid Leave: 0 (holidays don't count as leave)
- Holidays: 4
- Net Salary: Full salary + allowances
  (No salary deduction, holidays are paid)
```

## Interactive Features

### 1. Hover Over Day

```
When you hover over a day in the calendar:
- Cell becomes more opaque (opacity: 1)
- Box shadow appears for depth effect
- Shows that it's interactive
- Tooltip shows the status label
```

### 2. Read Legend

```
Click/view the Legend section to understand:
- What each color means
- All possible attendance statuses
- What impacts salary calculation
```

### 3. Compare Statistics Cards

```
Quick Comparison of Cards:
┌──────────────────────┐  ┌──────────────────────┐
│ Working Days: 18 🟢 │  │ Paid Leave: 4 🟠     │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ Unpaid Leave: 0 ⬜   │  │ Absent Days: 1 🔴    │
└──────────────────────┘  └──────────────────────┘

This tells you at a glance:
- How many days you worked
- How much paid leave was taken
- How much will be deducted from salary
- Any absences to address
```

## Data Interpretation Guide

### Working Days (Green)
```
When to see this:
✓ Regular office days with punch in/out
✓ Days worked from home (WFH)
✓ Partial days (half days)

What it means for salary:
→ You get paid for these days
→ Used to calculate daily rate
→ No salary deduction

Calculation:
If Monthly Salary = 50,000
Working Days = 20
Daily Rate = 50,000 / 20 = 2,500 per day
```

### Paid Leave (Orange, Purple, Pink, Dark Green, Cyan)
```
Includes:
- Casual Leave (planned vacation)
- Sick Leave (unexpected illness)
- Special Leave (personal reasons)
- Mandatory Holidays (national holidays)
- Special Holidays (company holidays)

What it means for salary:
→ You get paid for these days
→ Deducted from your leave balance
→ No additional salary deduction

Example:
If you have 12 casual leaves/year
And use 2 in January
Balance = 10 casual leaves remaining
Salary: FULL (no deduction for leave days)
```

### Unpaid Leave (Gray)
```
When it appears:
- When leave balance is exhausted
- Extended personal absences
- Unauthorized absences (if approved as unpaid)

What it means for salary:
→ You DO NOT get paid for these days
→ Deducted from your monthly salary
→ Impacts net salary significantly

Calculation Example:
Basic Salary = 50,000
Working Days in Month = 20
Unpaid Leave Days = 2
Daily Rate = 50,000 / 20 = 2,500

Unpaid Leave Deduction = 2 × 2,500 = 5,000
Net Salary = 50,000 - 5,000 = 45,000
```

### Absent (Red)
```
When it appears:
- Unexplained absence
- No leave approved
- Without informing management

What it means for salary:
→ Typically NOT paid for these days
→ May result in salary deduction
→ Can lead to disciplinary action
→ More serious than unpaid leave

Impact:
Similar to unpaid leave in salary terms
Additional: May affect performance record
```

## Common Questions

### Q: Why are weekends showing on calendar?
```
A: To give complete monthly view
   - Sundays typically shown as holidays (💜)
   - Saturdays may vary by company
   - Helps track working days accurately
   - Can be toggled off if needed (future feature)
```

### Q: How is working days calculated?
```
A: Formula = Full Days + (Half Days × 0.5) + WFH Days

Example for January 2026:
- Full Days: 16 ✓
- Half Days: 2 = 1.0
- Work From Home: 1 = 1.0
- Working Days = 16 + 1.0 + 1.0 = 18 days
```

### Q: What's the difference between Paid Leave and Holiday?
```
A: Paid Leave:
   - Deducted from your leave balance
   - Limited per year
   - Must be approved
   
   Holiday:
   - Not deducted from balance
   - Decided by company
   - Automatically given
```

### Q: Will unpaid leave affect my performance rating?
```
A: This depends on company policy
   - Occasional unpaid leave: Usually acceptable
   - Frequent unpaid leave: May impact rating
   - Discuss with HR for specific impact
```

### Q: Can I change a day's status after it's recorded?
```
A: This depends on employee level and permissions
   - Employees: Can request correction to HR
   - Managers: May have edit permissions
   - HR: Full edit access
   
   To change: Submit request to HR/Manager
```

## Troubleshooting

### Issue: Calendar shows all days as absent
```
Causes:
- API not returning data
- Data not synced from punch system
- Wrong employee selected
- Future dates selected

Solution:
1. Check if employee has punch records
2. Verify punch in/out happened
3. Ask HR to verify attendance data
4. Check with manager about missing records
```

### Issue: Statistics don't match visual count
```
Causes:
- Half days counted as 0.5
- Weekend counting variation
- Holiday vs working day confusion

Solution:
1. Read legend carefully
2. Count full days separately
3. Note half days = 0.5 each
4. Ask HR to clarify discrepancy
```

### Issue: Paid leave showing but didn't take leave
```
Causes:
- Holiday marked on calendar
- Work from home day
- Company-wide closure
- Adjusted by HR

Solution:
1. Check the specific color
2. Verify it's holiday or WFH
3. Ask HR if marked incorrectly
4. Request correction if needed
```

## Best Practices

### 1. Review Monthly
```
✓ Check your calendar every month
✓ Verify all days are correctly recorded
✓ Report discrepancies to HR immediately
✓ Plan leave usage accordingly
```

### 2. Plan Leaves Ahead
```
✓ Know your leave balance
✓ Check paid vs unpaid leaves
✓ Plan around holidays
✓ Inform manager in advance
```

### 3. Understand Salary Impact
```
✓ Know how unpaid leave affects salary
✓ Calculate net salary impact before taking leave
✓ Discuss with HR if needed
✓ Plan finances accordingly
```

### 4. Maintain Regular Attendance
```
✓ Minimize absent days
✓ Use leaves wisely
✓ Punch in/out regularly
✓ Keep records accurate
```

## Integration with Payroll Process

```
1. Attendance Calendar Created
   ↓
2. Manager Reviews Attendance
   ↓
3. HR Verifies Records
   ↓
4. Approved Attendance Used for:
   - Salary Calculation
   - Performance Review
   - Bonus/Incentive Calculation
   ↓
5. Payslip Generated
   ↓
6. Salary Credited
```

## Access Rights

```
Employee:
- Can view: Own attendance only
- Can do: Request corrections
- Cannot do: Edit records

Manager:
- Can view: Team member attendance
- Can do: Review and verify
- May have: Limited edit access

HR:
- Can view: All employee attendance
- Can do: Full management
- Can edit: Correct records, approve leaves
```
