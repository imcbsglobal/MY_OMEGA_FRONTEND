import React, { useEffect, useState } from "react";
import { 
  Wallet, 
  Search, 
  Calendar,
  User,
  RefreshCw,
  X,
  Check,
  TrendingUp,
  TrendingDown,
  FileText,
  DollarSign
} from "lucide-react";

export default function Payroll() {
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Smith", employee_id: "EMP001", email: "john@example.com", department: "Engineering", designation: "Senior Developer", basic_salary: 75000 },
    { id: 2, name: "Sarah Johnson", employee_id: "EMP002", email: "sarah@example.com", department: "Marketing", designation: "Marketing Manager", basic_salary: 65000 },
    { id: 3, name: "Mike Wilson", employee_id: "EMP003", email: "mike@example.com", department: "Sales", designation: "Sales Executive", basic_salary: 55000 }
  ]);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("December");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  
  // Payroll Data
  const [basicSalary, setBasicSalary] = useState(0);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [netSalary, setNetSalary] = useState(0);
  const [attendance, setAttendance] = useState({
    workingDays: 0,
    weekends: 0,
    holidays: 0,
    casualLeave: 0,
    sickLeave: 0,
    paidLeave: 0,
    absentDays: 0
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Calculate payroll when employee or month changes
  useEffect(() => {
    if (selectedEmployee) {
      calculatePayroll();
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  const calculatePayroll = () => {
    if (!selectedEmployee) return;

    // Set basic salary
    const annualSalary = selectedEmployee.basic_salary;
    const monthlySalary = annualSalary / 12;
    setBasicSalary(monthlySalary);

    // Sample allowances
    const sampleAllowances = [
      { name: "House Rent Allowance", amount: 15000 },
      { name: "Transport Allowance", amount: 5000 },
      { name: "Medical Allowance", amount: 3000 },
      { name: "Special Allowance", amount: 8000 },
      { name: "Performance Bonus", amount: monthlySalary * 0.1, percentage: "10%" }
    ];
    setAllowances(sampleAllowances);

    // Sample deductions
    const sampleDeductions = [
      { name: "Provident Fund", amount: 750, percentage: "12%" },
      { name: "Professional Tax", amount: 200 },
      { name: "Income Tax", amount: monthlySalary * 0.05, percentage: "5%" },
      { name: "Health Insurance", amount: 1500 }
    ];
    setDeductions(sampleDeductions);

    // Sample attendance for December 2025
    const monthAttendance = {
      workingDays: 15,
      weekends: 8,
      holidays: 3,
      casualLeave: 2,
      sickLeave: 1,
      paidLeave: 1,
      absentDays: 1
    };
    setAttendance(monthAttendance);

    // Calculate net salary based on working days
    const totalAllowances = sampleAllowances.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = sampleDeductions.reduce((sum, item) => sum + item.amount, 0);
    const grossSalary = monthlySalary + totalAllowances;
    
    // Calculate based on actual working days (15 scheduled working days)
    const actualWorkingDays = monthAttendance.workingDays;
    const totalScheduledDays = 15; // Assuming 15 working days in December
    const payableAmount = (grossSalary / totalScheduledDays) * actualWorkingDays;
    const finalNetSalary = payableAmount - totalDeductions;
    
    setNetSalary(finalNetSalary);
  };

  // Employee Selection
  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setSearchTerm(employee.name);
    setShowEmployeeDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedEmployee(null);
    setSearchTerm("");
    setBasicSalary(0);
    setAllowances([]);
    setDeductions([]);
    setNetSalary(0);
  };

  const handleGeneratePayslip = () => {
    if (!selectedEmployee || !selectedMonth || !selectedYear) {
      setError("Please select employee and pay period");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSuccess("Payslip generated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Generate calendar for selected month
  const generateCalendar = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
    const firstDay = new Date(selectedYear, monthIndex, 1).getDay();
    
    const calendar = [];
    let day = 1;
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if ((week === 0 && dayOfWeek < firstDay) || day > daysInMonth) {
          weekDays.push(null);
        } else {
          // Determine day type (simplified logic for demo)
          let dayType = "working";
          if (dayOfWeek === 0 || dayOfWeek === 6) dayType = "weekend";
          else if ([15, 26].includes(day)) dayType = "holiday";
          else if ([10].includes(day)) dayType = "sick";
          else if ([22].includes(day)) dayType = "casual";
          else if ([18].includes(day)) dayType = "paid";
          else if ([25].includes(day)) dayType = "absent";
          
          weekDays.push({ day, type: dayType });
          day++;
        }
      }
      if (weekDays.some(d => d !== null)) {
        calendar.push(weekDays);
      }
    }
    
    return calendar;
  };

  const totalAllowances = allowances.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const grossSalary = basicSalary + totalAllowances;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div style={styles.iconWrapper}>
            <Wallet size={28} color="#fff" />
          </div>
          <div>
            <h2 style={styles.title}>Payroll Processing</h2>
            <p style={styles.subtitle}>Generate monthly pay slips for employees</p>
          </div>
          <button 
            onClick={() => setLoading(!loading)}
            style={styles.refreshButton}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={styles.successMessage}>
          <Check size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} style={styles.closeBtn}>×</button>
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          <X size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")} style={styles.closeBtn}>×</button>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.mainCard}>
        {/* Selection Section */}
        <div style={styles.selectionGrid}>
          {/* Employee Search */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={16} />
              Employee Name
            </label>
            <div style={styles.searchContainer}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search employee by name, email or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowEmployeeDropdown(true);
                }}
                onFocus={() => setShowEmployeeDropdown(true)}
                style={styles.searchInput}
              />
              {selectedEmployee && (
                <button onClick={handleClearSelection} style={styles.clearBtn}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Employee Dropdown */}
            {showEmployeeDropdown && searchTerm && !selectedEmployee && (
              <div style={styles.dropdown}>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      style={styles.dropdownItem}
                    >
                      <div style={styles.employeeAvatar}>
                        {emp.name.charAt(0)}
                      </div>
                      <div style={styles.employeeInfo}>
                        <div style={styles.employeeName}>{emp.name}</div>
                        <div style={styles.employeeMeta}>
                          {emp.employee_id} • {emp.designation}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.dropdownEmpty}>No employees found</div>
                )}
              </div>
            )}
          </div>

          {/* Month Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Calendar size={16} />
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.select}
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Calendar size={16} />
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={styles.select}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Details Section */}
        {selectedEmployee ? (
          <>
            {/* Basic Salary Card */}
            <div style={styles.salaryCard}>
              <div style={styles.salaryHeader}>
                <DollarSign size={20} />
                <span>Basic Salary</span>
                <span style={styles.salarySubtext}>Monthly base compensation</span>
              </div>
              <div style={styles.salaryGrid}>
                <div style={styles.salaryItem}>
                  <div style={styles.salaryLabel}>Annual Salary</div>
                  <div style={styles.salaryValue}>₹ {selectedEmployee.basic_salary.toLocaleString('en-IN')}</div>
                </div>
                <div style={styles.salaryItem}>
                  <div style={styles.salaryLabel}>Monthly Salary</div>
                  <div style={styles.salaryValue}>₹ {basicSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {/* Allowances & Deductions */}
            <div style={styles.adGrid}>
              {/* Allowances */}
              <div style={styles.adCard}>
                <div style={styles.adHeader}>
                  <TrendingUp size={18} />
                  <span>Allowances</span>
                  <span style={styles.adSubtext}>Additional earnings</span>
                </div>
                <div style={styles.adList}>
                  {allowances.map((item, index) => (
                    <div key={index} style={styles.adItem}>
                      <div style={styles.adItemLeft}>
                        <div style={styles.adItemIcon}>+</div>
                        <span style={styles.adItemName}>{item.name}</span>
                        {item.percentage && (
                          <span style={styles.adItemPercentage}>{item.percentage}</span>
                        )}
                      </div>
                      <span style={styles.adItemAmount}>+₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                  <div style={styles.adTotal}>
                    <span>Total Allowances</span>
                    <span>+₹{totalAllowances.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div style={styles.adCard}>
                <div style={{...styles.adHeader, ...styles.deductionHeader}}>
                  <TrendingDown size={18} />
                  <span>Deductions</span>
                  <span style={styles.adSubtext}>Mandatory deductions</span>
                </div>
                <div style={styles.adList}>
                  {deductions.map((item, index) => (
                    <div key={index} style={styles.adItem}>
                      <div style={styles.adItemLeft}>
                        <div style={{...styles.adItemIcon, ...styles.deductionIcon}}>−</div>
                        <span style={styles.adItemName}>{item.name}</span>
                        {item.percentage && (
                          <span style={{...styles.adItemPercentage, ...styles.deductionPercentage}}>{item.percentage}</span>
                        )}
                      </div>
                      <span style={{...styles.adItemAmount, ...styles.deductionAmount}}>-₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                  <div style={{...styles.adTotal, ...styles.deductionTotal}}>
                    <span>Total Deductions</span>
                    <span>-₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Calendar */}
            <div style={styles.attendanceCard}>
              <div style={styles.attendanceHeader}>
                <Calendar size={20} />
                <span>Attendance Calendar</span>
                <span style={styles.attendanceSubtext}>{selectedMonth} {selectedYear}</span>
              </div>

              {/* Legend */}
              <div style={styles.legend}>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#10b981'}}></div>
                  <span>Working Days: {attendance.workingDays}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#fbbf24'}}></div>
                  <span>Weekends: {attendance.weekends}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#c084fc'}}></div>
                  <span>Holidays: {attendance.holidays}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#60a5fa'}}></div>
                  <span>Casual Leave: {attendance.casualLeave}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#f87171'}}></div>
                  <span>Sick Leave: {attendance.sickLeave}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#94a3b8'}}></div>
                  <span>Paid Leave: {attendance.paidLeave}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#ffffff', border: '2px solid #e2e8f0'}}></div>
                  <span>Absent: {attendance.absentDays}</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div style={styles.calendarGrid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} style={styles.calendarHeader}>{day}</div>
                ))}
                {generateCalendar().map((week, weekIndex) => (
                  <React.Fragment key={weekIndex}>
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        style={{
                          ...styles.calendarDay,
                          ...(day ? styles[`calendarDay_${day.type}`] : styles.calendarDay_empty)
                        }}
                      >
                        {day && <span>{day.day}</span>}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              {/* Summary Stats */}
              <div style={styles.attendanceStats}>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>31</div>
                  <div style={styles.statLabel}>Total Days</div>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statValue, color: '#10b981'}}>{attendance.workingDays}</div>
                  <div style={styles.statLabel}>Working Days</div>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statValue, color: '#60a5fa'}}>{attendance.casualLeave + attendance.sickLeave + attendance.paidLeave}</div>
                  <div style={styles.statLabel}>Total Leaves</div>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statValue, color: '#c084fc'}}>{attendance.holidays}</div>
                  <div style={styles.statLabel}>Holidays</div>
                </div>
              </div>
            </div>

            {/* Net Salary Summary */}
            <div style={styles.netSalaryCard}>
              <div style={styles.netSalaryHeader}>
                <FileText size={24} />
                <span>Net Salary Summary</span>
                <span style={styles.netSalarySubtext}>Final calculation for the month</span>
              </div>
              
              <div style={styles.netSalaryBreakdown}>
                <div style={styles.breakdownItem}>
                  <FileText size={16} />
                  <span>Basic Salary</span>
                  <span style={styles.breakdownAmount}>₹{basicSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div style={styles.breakdownItem}>
                  <TrendingUp size={16} color="#10b981" />
                  <span>Allowances</span>
                  <span style={styles.breakdownAmount}>+₹{totalAllowances.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={styles.breakdownItem}>
                  <TrendingDown size={16} color="#ef4444" />
                  <span>Deductions</span>
                  <span style={{...styles.breakdownAmount, color: '#ef4444'}}>-₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={styles.breakdownItem}>
                  <span style={styles.breakdownLabel}>Gross Salary</span>
                  <span style={styles.breakdownAmount}>₹{grossSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div style={styles.netPayableSection}>
                <div style={styles.netPayableLabel}>Net Payable Amount</div>
                <div style={styles.netPayableNote}>Based on {attendance.workingDays} working days of 15 scheduled days</div>
                <div style={styles.netPayableAmount}>₹ {netSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              </div>

              <button onClick={handleGeneratePayslip} style={styles.generateBtn}>
                <FileText size={18} />
                Generate Payslip
              </button>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <User size={64} color="#fca5a5" />
            <h3 style={styles.emptyTitle}>Select an employee to view payroll details</h3>
            <p style={styles.emptyText}>Search and select an employee from the dropdown above</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#fef2f2',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: '24px',
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: '#fff',
    padding: '20px 24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  refreshButton: {
    marginLeft: 'auto',
    padding: '10px 16px',
    background: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  successMessage: {
    padding: '14px 18px',
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: '10px',
    color: '#065f46',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
  },
  errorMessage: {
    padding: '14px 18px',
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '10px',
    color: '#991b1b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
  },
  closeBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  mainCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  selectionGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '16px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    width: '85%',
    padding: '12px 40px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  clearBtn: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '6px',
    background: '#fef2f2',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
    color: '#374151',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  dropdownItem: {
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid #fef2f2',
    transition: 'all 0.2s',
  },
  employeeAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  },
  employeeMeta: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  dropdownEmpty: {
    padding: '20px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  salaryCard: {
    background: 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)',
    padding: '18px',
    borderRadius: '12px',
    border: '1px solid #fecaca',
    marginBottom: '16px',
  },
  salaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '600',
  },
  salarySubtext: {
    marginLeft: 'auto',
    fontSize: '10px',
    color: '#9ca3af',
    fontWeight: '400',
  },
  salaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  salaryItem: {
    background: '#fff',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
  },
  salaryLabel: {
    fontSize: '11px',
    color: '#6b7280',
    marginBottom: '6px',
    fontWeight: '500',
  },
  salaryValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
  },
  adGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  adCard: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  adHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '600',
  },
  deductionHeader: {
    color: '#ef4444',
  },
  adSubtext: {
    marginLeft: 'auto',
    fontSize: '9px',
    color: '#9ca3af',
    fontWeight: '400',
  },
  adList: {
    background: '#fff',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  adItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  adItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  adItemIcon: {
    width: '20px',
    height: '20px',
    background: '#d1fae5',
    color: '#10b981',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
  },
  deductionIcon: {
    background: '#fee2e2',
    color: '#ef4444',
  },
  adItemName: {
    fontSize: '12px',
    color: '#374151',
    fontWeight: '500',
  },
  adItemPercentage: {
    fontSize: '9px',
    color: '#10b981',
    background: '#d1fae5',
    padding: '2px 6px',
    borderRadius: '3px',
    fontWeight: '600',
  },
  deductionPercentage: {
    color: '#ef4444',
    background: '#fee2e2',
  },
  adItemAmount: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#10b981',
  },
  deductionAmount: {
    color: '#ef4444',
  },
  adTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0 0 0',
    marginTop: '6px',
    borderTop: '2px solid #10b981',
    fontSize: '13px',
    fontWeight: '700',
    color: '#10b981',
  },
  deductionTotal: {
    borderTopColor: '#ef4444',
    color: '#ef4444',
  },
  attendanceCard: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  attendanceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
    color: '#374151',
    fontSize: '13px',
    fontWeight: '600',
  },
  attendanceSubtext: {
    marginLeft: 'auto',
    fontSize: '10px',
    color: '#6b7280',
    fontWeight: '500',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '10px',
    background: '#fff',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '9px',
    color: '#6b7280',
    fontWeight: '500',
  },
  legendDot: {
    width: '6px',
    height: '6px',
    borderRadius: '2px',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '3px',
    marginBottom: '10px',
    maxWidth: '280px',
  },
  calendarHeader: {
    textAlign: 'center',
    fontSize: '8px',
    fontWeight: '700',
    color: '#6b7280',
    padding: '2px',
  },
  calendarDay: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '600',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  calendarDay_empty: {
    background: 'transparent',
  },
  calendarDay_working: {
    background: '#d1fae5',
    color: '#065f46',
    borderColor: '#10b981',
  },
  calendarDay_weekend: {
    background: '#fef3c7',
    color: '#92400e',
    borderColor: '#fbbf24',
  },
  calendarDay_holiday: {
    background: '#e9d5ff',
    color: '#6b21a8',
    borderColor: '#c084fc',
  },
  calendarDay_casual: {
    background: '#dbeafe',
    color: '#1e40af',
    borderColor: '#60a5fa',
  },
  calendarDay_sick: {
    background: '#fee2e2',
    color: '#991b1b',
    borderColor: '#f87171',
  },
  calendarDay_paid: {
    background: '#e2e8f0',
    color: '#475569',
    borderColor: '#94a3b8',
  },
  calendarDay_absent: {
    background: '#fff',
    color: '#9ca3af',
    borderColor: '#e5e7eb',
  },
  attendanceStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
    background: '#fff',
    padding: '10px',
    borderRadius: '6px',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '2px',
  },
  statLabel: {
    fontSize: '9px',
    color: '#6b7280',
    fontWeight: '500',
  },
  netSalaryCard: {
    background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)',
    padding: '20px',
    borderRadius: '12px',
    color: '#fff',
  },
  netSalaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
    fontSize: '15px',
    fontWeight: '700',
  },
  netSalarySubtext: {
    marginLeft: 'auto',
    fontSize: '10px',
    opacity: 0.9,
    fontWeight: '400',
  },
  netSalaryBreakdown: {
    background: 'rgba(255,255,255,0.15)',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '14px',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 0',
    fontSize: '12px',
    fontWeight: '500',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
  },
  breakdownLabel: {
    fontWeight: '600',
    fontSize: '13px',
  },
  breakdownAmount: {
    marginLeft: 'auto',
    fontSize: '13px',
    fontWeight: '700',
  },
  netPayableSection: {
    background: 'rgba(255,255,255,0.2)',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '14px',
  },
  netPayableLabel: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '6px',
    opacity: 0.9,
  },
  netPayableNote: {
    fontSize: '10px',
    opacity: 0.8,
    marginBottom: '10px',
  },
  netPayableAmount: {
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-1px',
  },
  generateBtn: {
    width: '100%',
    padding: '12px',
    background: '#fff',
    color: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    margin: '20px 0 8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
}