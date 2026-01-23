import React, { useEffect, useState } from "react";
import {
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function PayrollPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [basicSalary, setBasicSalary] = useState(0);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [totalAllowances, setTotalAllowances] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payrollData, setPayrollData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [hasEmployeeSelected, setHasEmployeeSelected] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    workingDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    absentDays: 0,
  });

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch payroll data when month/year changes (only after employee is selected)
  useEffect(() => {
    if (hasEmployeeSelected && selectedEmployee?.id) {
      fetchPayrollData();
      fetchAttendanceStats();
    }
  }, [selectedMonth, selectedYear, hasEmployeeSelected, selectedEmployee?.id]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get("employee-management/employees/");
      const employeeData = response.data?.results || response.data?.data || response.data || [];
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!selectedEmployee?.id) {
        setError("Please select an employee");
        setLoading(false);
        return;
      }

      // Fetch payroll data from backend
      // Try with month name first, then with month number
      const monthName = months.find((m) => m.value === selectedMonth)?.label;

      console.log("Fetching payroll for:", {
        employee_id: selectedEmployee.id,
        month: monthName,
        monthNumber: selectedMonth,
        year: selectedYear,
      });

      let response;
      let payrollList = [];

      // Try fetching with month name
      try {
        response = await api.get(
          `/payroll/payroll/?employee_id=${selectedEmployee.id}&month=${monthName}&year=${selectedYear}`
        );
        payrollList = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
      } catch (err) {
        console.warn("Month name fetch failed, trying with month number");
        // Try with month number if month name fails
        try {
          response = await api.get(
            `/payroll/payroll/?employee_id=${selectedEmployee.id}&month=${selectedMonth}&year=${selectedYear}`
          );
          payrollList = Array.isArray(response.data)
            ? response.data
            : response.data?.results || [];
        } catch (err2) {
          console.warn("Both fetch attempts failed", err, err2);
        }
      }

      console.log("Payroll API Response:", response?.data);

      if (payrollList.length > 0) {
        const data = payrollList[0];
        console.log("=== Processing Payroll Data ===");
        console.log("Selected payroll data:", data);
        
        setPayrollData(data);

        // Only update basic salary if payroll data has a valid non-zero value
        const payrollBasic = parseFloat(data.basic_salary) || parseFloat(data.earned_salary) || parseFloat(data.salary) || null;
        if (payrollBasic && payrollBasic > 0) {
          setBasicSalary(payrollBasic);
          console.log("✓ Updated Basic Salary from payroll:", payrollBasic);
        } else {
          console.log("✓ Keeping existing Basic Salary from employee (payroll has 0 or null)");
        }

        // Parse allowances - use existing allowances if payroll data doesn't have them
        let allowancesList = [];
        if (data.allowance_items && data.allowance_items.length > 0) {
          allowancesList = data.allowance_items.map(item => ({
            name: item.allowance_type || item.name || 'Allowance',
            amount: parseFloat(item.amount) || 0
          }));
          console.log("Found allowance_items in payroll:", allowancesList);
        }
        
        // If payroll has allowances info, update
        if (allowancesList.length > 0) {
          setAllowances(allowancesList);
          const allowTotal = allowancesList.reduce(
            (sum, a) => sum + (parseFloat(a.amount) || 0),
            0
          );
          setTotalAllowances(allowTotal);
          console.log("✓ Updated Allowances from payroll:", allowancesList, "Total:", allowTotal);
        } else {
          console.log("✓ Keeping existing allowances from employee");
        }

        // Parse deductions - these should come from payroll data
        let deductionsList = [];
        if (data.deduction_items && data.deduction_items.length > 0) {
          deductionsList = data.deduction_items.map(item => ({
            name: item.deduction_type || item.name || 'Deduction',
            amount: parseFloat(item.amount) || 0
          }));
          console.log("Found deduction_items in payroll:", deductionsList);
        }
        
        setDeductions(deductionsList);
        const deductTotal = deductionsList.reduce(
          (sum, d) => sum + (parseFloat(d.amount) || 0),
          0
        );
        setTotalDeductions(deductTotal);
        console.log("✓ Set Deductions from payroll:", deductionsList, "Total:", deductTotal);
        console.log("=== Payroll Data Processing Complete ===");
      } else {
        // No payroll data found, keep everything as is
        console.log("No payroll data found for this month/year - keeping existing values");
        setPayrollData(null);
        setDeductions([]);
        setTotalDeductions(0);
        // Keep basic salary, allowances from employee profile (do not touch them)
      }
    } catch (err) {
      console.error("Failed to fetch payroll data:", err);
      setError("Failed to load payroll data. Please try again.");
      // Do NOT reset any salary data on error - keep what was there
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    (emp.full_name || emp.name || emp.employee_id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getEmployeeName = (emp) => {
    return emp?.full_name || emp?.name || emp?.employee_id || "Unknown";
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchTerm("");
    setShowEmployeeDropdown(false);
    setHasEmployeeSelected(true);
    // Fetch employee's allowances and deductions
    fetchEmployeeAllowancesAndDeductions(emp);
  };

  const fetchAttendanceStats = async () => {
    try {
      if (!selectedEmployee?.id) return;
      
      const response = await api.get(
        `hr/attendance/?user_id=${selectedEmployee.id}&month=${selectedMonth}&year=${selectedYear}`
      );
      
      const attendanceRecords = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      // Process attendance data to calculate stats
      const statsObj = {
        workingDays: 0,
        paidLeaveDays: 0,
        unpaidLeaveDays: 0,
        absentDays: 0,
      };
      
      attendanceRecords.forEach(record => {
        const status = record.status?.toLowerCase() || '';
        
        if (status === 'full' || status === 'wfh') {
          statsObj.workingDays += 1;
        } else if (status === 'half') {
          statsObj.workingDays += 0.5;
        } else if (status === 'casual_leave' || status === 'sick_leave' || status === 'special_leave') {
          statsObj.paidLeaveDays += 1;
        } else if (status === 'unpaid_leave') {
          statsObj.unpaidLeaveDays += 1;
        } else if (status === 'absent') {
          statsObj.absentDays += 1;
        }
      });
      
      setAttendanceStats(statsObj);
    } catch (err) {
      console.error("Failed to fetch attendance stats:", err);
      setAttendanceStats({
        workingDays: 0,
        paidLeaveDays: 0,
        unpaidLeaveDays: 0,
        absentDays: 0,
      });
    }
  };

  const fetchEmployeeAllowancesAndDeductions = async (emp) => {
    try {
      setLoading(true);
      console.log("=== Fetching Employee Data ===");
      console.log("Employee from list:", emp);

      // Fetch full employee details to get salary info
      let employeeData = emp;
      let salary = 0;
      
      try {
        const response = await api.get(`employee-management/employees/${emp.id}/`);
        employeeData = response.data;
        console.log("Full Employee details fetched:", employeeData);
        console.log("Basic salary field:", employeeData.basic_salary, "Type:", typeof employeeData.basic_salary);
        
        // Try multiple fields and ensure proper number conversion
        salary = parseFloat(employeeData.basic_salary) || 
                 parseFloat(employeeData.salary) || 
                 parseFloat(emp.basic_salary) || 
                 0;
        
        console.log("Parsed Basic Salary:", salary);
      } catch (err) {
        console.warn("Failed to fetch full employee details, using list data:", err);
        salary = parseFloat(emp.basic_salary) || parseFloat(emp.salary) || 0;
        console.log("Using salary from list:", salary);
      }

      // Set basic salary from employee profile
      setBasicSalary(salary);
      console.log("✓ Basic Salary set to:", salary);

      // Get employee's allowance field
      let allowanceAmount = parseFloat(employeeData.allowances) || 0;
      console.log("Allowance amount from employee:", allowanceAmount);

      // Create allowances list from the total amount
      let allowancesList = [];
      if (allowanceAmount > 0) {
        allowancesList = [{
          name: "Employee Allowances",
          amount: allowanceAmount,
        }];
      }

      setAllowances(allowancesList);
      setTotalAllowances(allowanceAmount);
      console.log("✓ Employee Allowances set:", allowancesList, "Total:", allowanceAmount);

      // For deductions, set to 0 (will be fetched when month/year is selected)
      setDeductions([]);
      setTotalDeductions(0);
      console.log("✓ Deductions initialized to 0");
      console.log("=== Employee Data Fetch Complete ===");

    } catch (err) {
      console.error("❌ Failed to fetch employee allowances/deductions:", err);
      // Set defaults from employee
      const fallbackSalary = parseFloat(emp.basic_salary) || parseFloat(emp.salary) || 0;
      setBasicSalary(fallbackSalary);
      setAllowances([]);
      setDeductions([]);
      setTotalAllowances(parseFloat(emp.allowances) || 0);
      setTotalDeductions(0);
      console.log("Using fallback values - Salary:", fallbackSalary);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    try {
      setLoading(true);
      setError("");

      if (!selectedEmployee) {
        setError("Please select an employee");
        setLoading(false);
        return;
      }

      const monthName = months.find((m) => m.value === selectedMonth)?.label;
      const netSalary = calculatePayroll(allowances, deductions);

      // Save payroll data temporarily in localStorage
      const payrollPayload = {
        employee_id: selectedEmployee.id,
        employee_name: getEmployeeName(selectedEmployee),
        month: monthName,
        month_number: selectedMonth,
        year: selectedYear,
        basic_salary: basicSalary,
        allowances: allowances,
        deductions: deductions,
        total_allowances: totalAllowances,
        total_deductions: totalDeductions,
        net_salary: netSalary,
      };

      console.log("Payroll Payload being sent to PayslipPage:", payrollPayload);
      localStorage.setItem("currentPayroll", JSON.stringify(payrollPayload));

      // Navigate to payslip page
      navigate("/payslip");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to proceed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculatePayroll = (allowList = [], deductList = []) => {
    const basic = parseFloat(basicSalary) || 0;
    
    // Sum allowances from the items list
    const allowanceTotal = Array.isArray(allowList) 
      ? allowList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
      : 0;
    
    // Sum deductions from the items list  
    const deductionTotal = Array.isArray(deductList)
      ? deductList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
      : 0;
    
    console.log("Payroll Calculation:", {
      basic,
      allowanceTotal,
      deductionTotal,
      netSalary: basic + allowanceTotal - deductionTotal
    });
    
    return basic + allowanceTotal - deductionTotal;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Payroll Processing</h1>
        <p style={styles.subtitle}>
          Select employee, month and year to view and manage payroll
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.selectorSection}>
          <h2 style={styles.sectionTitle}>Select Details</h2>

          <div style={styles.selectorGrid}>
            {/* Employee Selector */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Employee</label>
              <div style={styles.employeeSelector}>
                <div
                  style={styles.employeeInput}
                  onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                >
                  <User size={16} style={{ marginRight: "8px" }} />
                  <span>
                    {selectedEmployee ? getEmployeeName(selectedEmployee) : "Select Employee"}
                  </span>
                </div>
                {showEmployeeDropdown && (
                  <div style={styles.dropdown}>
                    <input
                      type="text"
                      placeholder="Search employee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={styles.searchInput}
                      autoFocus
                    />
                    <div style={styles.dropdownList}>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => handleSelectEmployee(emp)}
                            style={styles.dropdownItem}
                          >
                            <div style={styles.employeeName}>
                              {getEmployeeName(emp)}
                            </div>
                            <div style={styles.employeeId}>
                              {emp.employee_id}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={styles.noResults}>No employees found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Month Selector */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={styles.select}
                disabled={!selectedEmployee}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={styles.select}
                disabled={!selectedEmployee}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {selectedEmployee && (
          <>
            {/* Salary Breakdown Section */}
            <div style={styles.breakdownSection}>
              <h2 style={styles.sectionTitle}>Salary Breakdown</h2>

              <div style={styles.breakdownGrid}>
                {/* Basic Salary */}
                <div style={styles.breakdownCard}>
                  <div style={styles.breakdownCardHeader}>
                    <DollarSign
                      size={24}
                      style={{ color: "#0891b2" }}
                    />
                    <h3 style={styles.breakdownCardTitle}>Basic Salary</h3>
                  </div>
                  <div style={styles.breakdownAmount}>
                    {formatCurrency(basicSalary)}
                  </div>
                </div>

                {/* Total Allowances */}
                <div style={styles.breakdownCard}>
                  <div style={styles.breakdownCardHeader}>
                    <TrendingUp
                      size={24}
                      style={{ color: "#16a34a" }}
                    />
                    <h3 style={styles.breakdownCardTitle}>Total Allowances</h3>
                  </div>
                  <div style={styles.breakdownAmount}>
                    {formatCurrency(totalAllowances)}
                  </div>
                </div>

                {/* Total Deductions */}
                <div style={styles.breakdownCard}>
                  <div style={styles.breakdownCardHeader}>
                    <TrendingDown
                      size={24}
                      style={{ color: "#dc2626" }}
                    />
                    <h3 style={styles.breakdownCardTitle}>Total Deductions</h3>
                  </div>
                  <div style={styles.breakdownAmount}>
                    {formatCurrency(totalDeductions)}
                  </div>
                </div>

                {/* Net Salary */}
                <div style={{...styles.breakdownCard, ...styles.netSalaryCard}}>
                  <div style={styles.breakdownCardHeader}>
                    <DollarSign
                      size={24}
                      style={{ color: "#15803d" }}
                    />
                    <h3 style={styles.breakdownCardTitle}>Net Salary</h3>
                  </div>
                  <div style={styles.netSalaryAmount}>
                    {formatCurrency(calculatePayroll(allowances, deductions))}
                  </div>
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div style={styles.calculationBreakdown}>
                <p style={styles.calculationText}>
                  <strong>Calculation:</strong> Basic Salary {formatCurrency(basicSalary)} + Allowances {formatCurrency(totalAllowances)} - Deductions {formatCurrency(totalDeductions)} = Net Salary {formatCurrency(calculatePayroll(allowances, deductions))}
                </p>
              </div>
            </div>

            {/* Attendance Summary */}
            <div style={styles.attendanceSummary}>
              <h3 style={styles.sectionSubtitle}>Attendance Summary</h3>
              <div style={styles.attendanceStatsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Working Days</div>
                  <div style={{...styles.statValue, color: '#166534'}}>{attendanceStats.workingDays}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Paid Leave</div>
                  <div style={{...styles.statValue, color: '#b45309'}}>{attendanceStats.paidLeaveDays}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Unpaid Leave</div>
                  <div style={{...styles.statValue, color: '#4b5563'}}>{attendanceStats.unpaidLeaveDays}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Absent Days</div>
                  <div style={{...styles.statValue, color: '#b91c1c'}}>{attendanceStats.absentDays}</div>
                </div>
              </div>
            </div>

            {/* Allowances & Deductions Section */}
            <div style={styles.detailsWrapper}>
              {/* Allowances Details */}
              <div style={styles.detailsSection}>
                <h3 style={styles.sectionSubtitle}>Allowances</h3>
                <div style={styles.detailsTable}>
                  {allowances.length > 0 ? (
                    allowances.map((allowance, idx) => (
                      <div key={idx} style={styles.detailsRow}>
                        <span style={styles.detailsLabel}>
                          {allowance.name || `Allowance ${idx + 1}`}
                        </span>
                        <span style={styles.detailsValue}>
                          {formatCurrency(allowance.amount || 0)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.detailsRow}>
                      <span style={styles.detailsLabel}>No allowances</span>
                      <span style={styles.detailsValue}>₹0.00</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions Details */}
              <div style={styles.detailsSection}>
                <h3 style={styles.sectionSubtitle}>Deductions</h3>
                <div style={styles.detailsTable}>
                  {deductions.length > 0 ? (
                    deductions.map((deduction, idx) => (
                      <div key={idx} style={styles.detailsRow}>
                        <span style={styles.detailsLabel}>
                          {deduction.name || `Deduction ${idx + 1}`}
                        </span>
                        <span style={styles.detailsValue}>
                          {formatCurrency(deduction.amount || 0)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.detailsRow}>
                      <span style={styles.detailsLabel}>No deductions</span>
                      <span style={styles.detailsValue}>₹0.00</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Proceed Button */}
            <div style={styles.buttonSection}>
              <button
                onClick={handleProceed}
                disabled={loading}
                style={styles.proceedButton}
              >
                <span>Proceed to Payslip</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "20px",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    borderLeft: "4px solid #f87171",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    padding: "24px",
  },
  selectorSection: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "16px",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "8px",
  },
  sectionSubtitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "10px",
  },
  selectorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#1f2937",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "border-color 0.2s",
    outline: "none",
  },
  employeeSelector: {
    position: "relative",
  },
  employeeInput: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#1f2937",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "4px",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    maxHeight: "280px",
    overflowY: "auto",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  dropdownList: {
    maxHeight: "220px",
    overflowY: "auto",
  },
  dropdownItem: {
    padding: "10px 12px",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  employeeName: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1f2937",
  },
  employeeId: {
    fontSize: "12px",
    color: "#6b7280",
  },
  noResults: {
    padding: "16px 12px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "13px",
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    backgroundColor: "#fef2f2",
    borderLeft: "4px solid #ef4444",
    borderRadius: "8px",
    color: "#991b1b",
    marginBottom: "16px",
    fontSize: "13px",
  },
  loadingMessage: {
    textAlign: "center",
    padding: "30px 20px",
    color: "#6b7280",
    fontSize: "13px",
  },
  breakdownSection: {
    marginBottom: "20px",
  },
  breakdownGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  breakdownCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "18px",
    border: "1px solid #f5f5f5",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },
  breakdownCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  breakdownCardTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    margin: "0",
  },
  breakdownAmount: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },
  netSalaryCard: {
    background: "linear-gradient(135deg, #fef2f2 0%, #fde8e8 100%)",
    borderColor: "#fca5a5",
    borderWidth: "2px",
  },
  netSalaryAmount: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#dc2626",
  },
  calculationBreakdown: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  calculationText: {
    margin: "0",
    fontSize: "13px",
    color: "#4b5563",
    fontFamily: "'Monaco', 'Courier New', monospace",
    wordBreak: "break-word",
  },
  attendanceSummary: {
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
  },
  attendanceStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    textAlign: "center",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: "6px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
  },
  detailsWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  detailsSection: {
    marginBottom: "16px",
  },
  detailsTable: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #f0f0f0",
  },
  detailsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f5f5f5",
    fontSize: "13px",
  },
  detailsLabel: {
    color: "#4b5563",
    fontWeight: "500",
  },
  detailsValue: {
    color: "#111827",
    fontWeight: "600",
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "24px",
  },
  proceedButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#f87171",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
