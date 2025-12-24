// src/components/Payroll/Payroll.jsx
import React, { useEffect, useState } from "react";
import { 
  Wallet, 
  Plus, 
  Search, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  User,
  RefreshCw,
  X,
  Check,
  Download
} from "lucide-react";
import api from "../../api/client";

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  /* ===============================
     Fetch Employees
  ================================ */
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get("cv-management/employees/");
      const empData = response.data.data || response.data.results || response.data || [];
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (err) {
      console.error("Fetch employees error:", err);
      setError("Unable to load employees");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Calculate Payroll
  ================================ */
  useEffect(() => {
    if (selectedEmployee) {
      calculatePayroll();
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  const calculatePayroll = async () => {
    if (!selectedEmployee || !selectedMonth) return;

    try {
      setLoading(true);
      
      // Fetch employee contract details
      const contractResponse = await api.get(`cv-management/employees/${selectedEmployee.id}/contract/`);
      const contract = contractResponse.data.data || contractResponse.data;
      
      setBasicSalary(contract.basic_salary || 0);

      // Fetch allowances
      const allowancesResponse = await api.get(`cv-management/employees/${selectedEmployee.id}/allowances/`);
      const allowancesData = allowancesResponse.data.data || allowancesResponse.data || [];
      setAllowances(Array.isArray(allowancesData) ? allowancesData : []);

      // Fetch deductions
      const deductionsResponse = await api.get(`cv-management/employees/${selectedEmployee.id}/deductions/`);
      const deductionsData = deductionsResponse.data.data || deductionsResponse.data || [];
      setDeductions(Array.isArray(deductionsData) ? deductionsData : []);

      // Calculate net salary
      const totalAllowances = allowancesData.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalDeductions = deductionsData.reduce((sum, item) => sum + (item.amount || 0), 0);
      const calculatedNetSalary = (contract.basic_salary || 0) + totalAllowances - totalDeductions;
      
      setNetSalary(calculatedNetSalary);
      
    } catch (err) {
      console.error("Calculate payroll error:", err);
      // Set default values if API fails
      setBasicSalary(selectedEmployee.basic_salary || 0);
      setAllowances([]);
      setDeductions([]);
      setNetSalary(selectedEmployee.basic_salary || 0);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Generate Pay Slip
  ================================ */
  const handleGeneratePaySlip = async () => {
    if (!selectedEmployee || !selectedMonth || !selectedYear) {
      setError("Please select employee and pay period");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payrollData = {
        employee_id: selectedEmployee.id,
        month: selectedMonth,
        year: selectedYear,
        basic_salary: basicSalary,
        allowances: allowances,
        deductions: deductions,
        net_salary: netSalary,
      };

      const response = await api.post("cv-management/payroll/generate/", payrollData);
      
      setSuccess("Pay slip generated successfully!");
      setTimeout(() => setSuccess(""), 3000);

      // Download pay slip if URL provided
      if (response.data.pay_slip_url) {
        window.open(response.data.pay_slip_url, '_blank');
      }
      
    } catch (err) {
      console.error("Generate pay slip error:", err);
      setError(err.response?.data?.detail || "Unable to generate pay slip");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Employee Selection
  ================================ */
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

  /* ===============================
     Calculations
  ================================ */
  const totalAllowances = allowances.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <Wallet size={28} color="#dc2626" />
          <h2 style={styles.title}>Payroll Processing</h2>
          <button 
            onClick={fetchEmployees}
            style={{
              ...styles.refreshButton,
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
        <p style={styles.subtitle}>
          Generate monthly pay slips for employees
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={styles.successMessage}>
          <Check size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} style={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          <X size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError("")} style={styles.dismissButton}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Card */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus size={20} />
          Add New Payroll
        </h3>

        {/* Selection Section */}
        <div style={styles.selectionSection}>
          {/* Employee Search */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={16} />
              Employee Name
            </label>
            <div style={styles.searchContainer}>
              <Search size={16} color="#94a3b8" style={styles.searchIcon} />
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
                disabled={loading}
              />
              {selectedEmployee && (
                <button
                  onClick={handleClearSelection}
                  style={styles.clearButton}
                  title="Clear selection"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {showEmployeeDropdown && searchTerm && !selectedEmployee && (
              <div style={styles.dropdown}>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      style={styles.dropdownItem}
                    >
                      <User size={14} color="#64748b" />
                      <div style={styles.dropdownItemContent}>
                        <div style={styles.dropdownItemName}>{emp.name}</div>
                        <div style={styles.dropdownItemMeta}>
                          {emp.employee_id} • {emp.email}
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
              disabled={loading}
            >
              <option value="">Select Month</option>
              {months.map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
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
              onChange={(e) => setSelectedYear(e.target.value)}
              style={styles.select}
              disabled={loading}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payroll Details */}
        {selectedEmployee && (
          <>
            <div style={styles.divider}></div>

            {/* Earnings and Deductions Grid */}
            <div style={styles.payrollGrid}>
              {/* Earnings Section */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  <TrendingUp size={18} color="#10b981" />
                  Earnings
                </h4>

                <div style={styles.salaryCard}>
                  <div style={styles.salaryLabel}>Basic Salary</div>
                  <div style={styles.salaryAmount}>
                    ${basicSalary.toFixed(2)}
                  </div>
                </div>

                {allowances.length > 0 && (
                  <div style={styles.itemsList}>
                    <div style={styles.itemsHeader}>Allowances</div>
                    {allowances.map((allowance, index) => (
                      <div key={index} style={styles.item}>
                        <span style={styles.itemName}>{allowance.name}</span>
                        <span style={styles.itemAmount}>
                          ${allowance.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div style={styles.itemTotal}>
                      <span>Total Allowances</span>
                      <span>${totalAllowances.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Deductions Section */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  <TrendingDown size={18} color="#ef4444" />
                  Deductions
                </h4>

                {deductions.length > 0 ? (
                  <div style={styles.itemsList}>
                    <div style={styles.itemsHeader}>Deductions</div>
                    {deductions.map((deduction, index) => (
                      <div key={index} style={styles.item}>
                        <span style={styles.itemName}>{deduction.name}</span>
                        <span style={styles.itemAmount}>
                          ${deduction.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div style={styles.itemTotal}>
                      <span>Total Deductions</span>
                      <span>${totalDeductions.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div style={styles.noItems}>No deductions</div>
                )}
              </div>
            </div>

            {/* Net Salary Summary */}
            <div style={styles.summarySection}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>
                  <DollarSign size={20} />
                  Total Net Salary
                </div>
                <div style={styles.summaryAmount}>
                  ${netSalary.toFixed(2)}
                </div>
                <div style={styles.summaryBreakdown}>
                  ${basicSalary.toFixed(2)} + ${totalAllowances.toFixed(2)} - ${totalDeductions.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div style={styles.actionSection}>
              <button
                onClick={handleGeneratePaySlip}
                style={{
                  ...styles.generateButton,
                  opacity: loading || !selectedMonth ? 0.5 : 1,
                  cursor: loading || !selectedMonth ? "not-allowed" : "pointer",
                }}
                disabled={loading || !selectedMonth}
                title={!selectedMonth ? "Please select a month first" : "Generate pay slip"}
              >
                <FileText size={18} />
                {loading ? "Generating..." : "Generate & Print Pay Slip"}
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!selectedEmployee && (
          <div style={styles.emptyState}>
            <User size={48} color="#cbd5e1" />
            <p style={styles.emptyText}>Select an employee to view payroll details</p>
            <p style={styles.emptySubtext}>
              Search and select an employee from the dropdown above
            </p>
          </div>
        )}
      </div>

      {/* Recent Payrolls */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <FileText size={20} />
          Recent Payrolls
        </h3>
        <div style={styles.recentPayrolls}>
          <div style={styles.emptyState}>
            <FileText size={48} color="#cbd5e1" />
            <p style={styles.emptyText}>No recent payrolls</p>
            <p style={styles.emptySubtext}>
              Generated pay slips will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   Styles
=============================== */
const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    marginBottom: 30,
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.5,
  },
  refreshButton: {
    marginLeft: "auto",
    padding: "6px 12px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #f1f5f9",
  },
  cardTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  successMessage: {
    padding: "12px 16px",
    background: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: 8,
    color: "#065f46",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "14px",
    fontWeight: "500",
  },
  errorMessage: {
    padding: "12px 16px",
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    color: "#991b1b",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "14px",
    fontWeight: "500",
  },
  dismissButton: {
    marginLeft: "auto",
    padding: "0",
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    lineHeight: 1,
  },
  selectionSection: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 16,
    marginBottom: 24,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    position: "relative",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  searchContainer: {
    position: "relative",
  },
  searchInput: {
    width: "100%",
    padding: "10px 40px 10px 40px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  clearButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    padding: "4px",
    background: "#f1f5f9",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#64748b",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    background: "#fff",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 300,
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  dropdownItem: {
    padding: "12px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    transition: "all 0.2s",
    borderBottom: "1px solid #f1f5f9",
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
  },
  dropdownItemMeta: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: 2,
  },
  dropdownEmpty: {
    padding: "20px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
  },
  divider: {
    height: 1,
    background: "#e2e8f0",
    margin: "24px 0",
  },
  payrollGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginBottom: 24,
  },
  section: {
    background: "#f8fafc",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  salaryCard: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    marginBottom: 16,
  },
  salaryLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "500",
  },
  salaryAmount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
  },
  itemsList: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  itemsHeader: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid #f1f5f9",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
    color: "#475569",
  },
  itemName: {
    fontWeight: "400",
  },
  itemAmount: {
    fontWeight: "600",
    color: "#1e293b",
  },
  itemTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0 0 0",
    marginTop: 8,
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    borderTop: "2px solid #e2e8f0",
  },
  noItems: {
    textAlign: "center",
    padding: "20px",
    color: "#94a3b8",
    fontSize: "14px",
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    padding: 24,
    borderRadius: 12,
    textAlign: "center",
    color: "#fff",
  },
  summaryLabel: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.9,
  },
  summaryAmount: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: 8,
  },
  summaryBreakdown: {
    fontSize: "13px",
    opacity: 0.8,
  },
  actionSection: {
    display: "flex",
    justifyContent: "center",
  },
  generateButton: {
    padding: "14px 32px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "15px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#64748b",
    margin: "16px 0 8px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0,
  },
  recentPayrolls: {
    marginTop: 16,
  },
};

// Add hover effects via CSS
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @media (hover: hover) {
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {
    console.log("CSS rule already exists");
  }
}