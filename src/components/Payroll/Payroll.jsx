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
import Payslip from "./Payslip";
import api from "../../api/client";

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("November");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);
  
  // Payroll Data
  const [basicSalary, setBasicSalary] = useState(0);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [otherComponents, setOtherComponents] = useState([]);
  const [netSalary, setNetSalary] = useState(0);
  const [salaryCalculation, setSalaryCalculation] = useState(null);
  const [fixedNetLocked, setFixedNetLocked] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [attendance, setAttendance] = useState({
    workingDays: 0,
    weekends: 0,
    holidays: 0,
    casualLeave: 0,
    sickLeave: 0,
    paidLeave: 0,
    absentDays: 0
  });
  const [attendanceList, setAttendanceList] = useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch employee payroll when employee is selected
  useEffect(() => {
    if (selectedEmployee?.id) {
      fetchEmployeePayroll(selectedEmployee.id);
      fetchEmployeePayrollsList(selectedEmployee.id);
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  // Fetch list of payroll records for selected employee (to show payslip history)
  const fetchEmployeePayrollsList = async (employeeId) => {
    try {
      const res = await api.get(`/payroll/payroll/?employee_id=${employeeId}`);
      // normalize paginated or plain-list responses
      const raw = res.data || {};
      const list = Array.isArray(raw)
        ? raw
        : (raw.results || raw.data || raw || []);

      // ensure we only keep records belonging to the requested employee
      const filtered = (Array.isArray(list) ? list : []).filter(p => {
        if (!p) return false;
        // try several possible employee id fields
        return (
          Number(p.employee_id) === Number(employeeId) ||
          (p.employee && (Number(p.employee.id) === Number(employeeId)))
        );
      });

      setPayrollRecords(filtered);
    } catch (err) {
      console.warn('Failed to fetch payroll records list', err);
      setPayrollRecords([]);
    }
  };

  // Fetch all employees
  const fetchEmployees = async () => {
  try {
    setLoading(true);
    const res = await api.get("employee-management/employees/");
    const employeeData = res.data?.results || res.data?.data || res.data || [];
    setEmployees(Array.isArray(employeeData) ? employeeData : []);
  } catch (err) {
    console.error("Failed to fetch employees:", err);
    setError("Failed to load employees");
  } finally {
    setLoading(false);
  }
};

  // Fetch full employee details (to get basic salary if not present in list)
  const fetchEmployeeDetail = async (employeeId) => {
    try {
      const res = await api.get(`employee-management/employees/${employeeId}/`);
      const data = res.data || res.data?.data || res.data?.results || {};
      // merge into selectedEmployee
      setSelectedEmployee(prev => ({ ...(prev || {}), ...data }));
      // set basic salary if available
      const empBasic = getEmployeeMonthlyBasic(data);
      if (empBasic && empBasic > 0) setBasicSalary(empBasic);
      return data;
    } catch (err) {
      console.warn('Failed to fetch employee detail', err);
      return null;
    }
  };


  // Fetch employee payroll details
  const fetchEmployeePayroll = async (employeeId) => {
    try {
      // when fetching a new payroll unlock net so it can be set by incoming data
      setFixedNetLocked(false);
      setLoading(true);
      setError("");

      // Request the detailed payroll for the selected month/year
      const res = await api.get(
        `/payroll/payroll/?employee_id=${employeeId}&month=${selectedMonth}&year=${selectedYear}`
      );

      // backend returns an array of payrolls; take the most recent (first) item
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || res.data || []);
      console.debug('Payroll list response:', res.data, 'parsed list:', list);
      const data = list[0] || {};

      // If a saved payroll exists use it, otherwise call preview endpoint
      if (data && Object.keys(data).length > 0) {
        // Prefer employee's stored basic salary if available, else use payroll values
        const empStoredBasic = getEmployeeMonthlyBasic(selectedEmployee);
        setBasicSalary(empStoredBasic && empStoredBasic > 0 ? empStoredBasic : (data.earned_salary ?? data.salary ?? 0));
        const allowanceItems = data.allowance_items || [];
        const deductionItems = data.deduction_items || [];
        setAllowances(allowanceItems);
        setDeductions(deductionItems);
        setOtherComponents(data.other_components || []);

        const attendanceSource = data.attendance || {
          workingDays: data.working_days ?? 0,
          weekends: 0,
          holidays: 0,
          casualLeave: data.casual_leave_days ?? 0,
          sickLeave: data.sick_leave_days ?? 0,
          paidLeave: data.total_paid_days ?? 0,
          absentDays: data.days_to_deduct ?? 0
        };
        setAttendance(attendanceSource);

        // build attendance item list from available fields
        const attList = [];
        if (data.effective_paid_days !== undefined) attList.push({ label: 'Effective Paid Days', value: data.effective_paid_days });
        if (data.working_days !== undefined) attList.push({ label: 'Working Days', value: data.working_days });
        if (data.total_working_days !== undefined) attList.push({ label: 'Total Working Days', value: data.total_working_days });
        if (data.full_days_worked !== undefined) attList.push({ label: 'Full Days Worked', value: data.full_days_worked });
        if (data.half_days_worked !== undefined) attList.push({ label: 'Half Days Worked', value: data.half_days_worked });
        if (data.casual_leave_days !== undefined) attList.push({ label: 'Casual Leave', value: data.casual_leave_days });
        if (data.sick_leave_days !== undefined) attList.push({ label: 'Sick Leave', value: data.sick_leave_days });
        if (data.special_leave_days !== undefined) attList.push({ label: 'Special Leave', value: data.special_leave_days });
        if (attList.length === 0) {
          // fallback to our attendanceSource
          attList.push({ label: 'Working Days', value: attendanceSource.workingDays });
          attList.push({ label: 'Casual Leave', value: attendanceSource.casualLeave });
          attList.push({ label: 'Sick Leave', value: attendanceSource.sickLeave });
        }
        setAttendanceList(attList);

        // store salary calculation if provided by backend, and net pay
        const sc = data.salary_calculation || { monthly_basic: data.monthly_basic ?? data.earned_salary ?? 0, net_pay: data.net_pay ?? data.net_salary ?? 0 };
        setSalaryCalculation(sc);
        // compute local totals as fallback
        const usedBasic = empStoredBasic && empStoredBasic > 0 ? empStoredBasic : (data.earned_salary ?? data.salary ?? 0);
        const localAllowances = (allowanceItems || []).reduce((s, a) => s + (Math.abs(Number(a.amount)) || 0), 0);
        const localDeductions = (deductionItems || []).reduce((s, d) => s + (Math.abs(Number(d.amount)) || 0), 0);
        const computedNetFallback = Number(usedBasic || 0) + Number(localAllowances || 0) - Number(localDeductions || 0);
        const finalNet = (sc && (sc.net_pay !== undefined && sc.net_pay !== null) ? Number(sc.net_pay) : computedNetFallback) || 0;
        setNetSalary(finalNet);
        setFixedNetLocked(true);
      } else {
        // No saved payroll found — request a preview to populate the UI
        try {
          const previewRes = await api.post('/payroll/payroll/calculate_payroll_preview/', {
            employee_id: employeeId,
            month: selectedMonth,
            year: selectedYear,
            allowance_items: allowances.map(a => ({ allowance_type: a.allowance_type || a.name || a.type || '', amount: a.amount || 0 })),
            deduction_items: deductions.map(d => ({ deduction_type: d.deduction_type || d.name || d.type || '', amount: d.amount || 0 })),
          });

          console.debug('Payroll preview response:', previewRes.data);

            const preview = previewRes.data || {};
            const salaryCalc = preview.salary_calculation || {};
            setSalaryCalculation(salaryCalc);
            // Prefer explicit monthly basic if provided, otherwise fallback
            // Do not overwrite employee-stored basic salary if present
            const empStoredBasic2 = getEmployeeMonthlyBasic(selectedEmployee);
            setBasicSalary(empStoredBasic2 && empStoredBasic2 > 0 ? empStoredBasic2 : (salaryCalc.monthly_basic ?? salaryCalc.base_salary ?? salaryCalc.earned_salary ?? 0));

            // fallback: compute net from preview/basic + any known allowances/deductions
            const usedBasic2 = empStoredBasic2 && empStoredBasic2 > 0 ? empStoredBasic2 : (salaryCalc.monthly_basic ?? salaryCalc.base_salary ?? salaryCalc.earned_salary ?? 0);
            const localAllowances2 = 0; // preview may return itemized lists below
            const localDeductions2 = 0;
            const computedNetPreviewFallback = Number(usedBasic2 || 0) + Number(localAllowances2 || 0) - Number(localDeductions2 || 0);
            const finalNetPreview = (salaryCalc && (salaryCalc.net_pay !== undefined && salaryCalc.net_pay !== null) ? Number(salaryCalc.net_pay) : computedNetPreviewFallback) || 0;
            setNetSalary(finalNetPreview);
            setFixedNetLocked(true);

          const attendanceB = preview.attendance_breakdown || {};
          // preview provides totals (numbers) not itemized lists
            // if preview returned itemized lists, use them to populate the UI
            setAllowances(preview.allowance_items || []);
            setDeductions(preview.deduction_items || []);
          setOtherComponents([]);

          setAttendance({
            workingDays: attendanceB.total_working_days ?? 0,
            weekends: attendanceB.sundays ?? 0,
            holidays: attendanceB.total_paid_holidays ?? 0,
            casualLeave: attendanceB.casual_leave_days ?? 0,
            sickLeave: attendanceB.sick_leave_days ?? 0,
            paidLeave: attendanceB.total_paid_days ?? 0,
            absentDays: attendanceB.days_to_deduct ?? 0,
          });

          // build attendance list from attendance_breakdown
          const attList = [];
          if (attendanceB.total_working_days !== undefined) attList.push({ label: 'Total Working Days', value: attendanceB.total_working_days });
          if (attendanceB.total_paid_days !== undefined) attList.push({ label: 'Total Paid Days', value: attendanceB.total_paid_days });
          if (attendanceB.effective_paid_days !== undefined) attList.push({ label: 'Effective Paid Days', value: attendanceB.effective_paid_days });
          if (attendanceB.full_days_worked !== undefined) attList.push({ label: 'Full Days Worked', value: attendanceB.full_days_worked });
          if (attendanceB.half_days_worked !== undefined) attList.push({ label: 'Half Days Worked', value: attendanceB.half_days_worked });
          if (attendanceB.casual_leave_days !== undefined) attList.push({ label: 'Casual Leave', value: attendanceB.casual_leave_days });
          if (attendanceB.sick_leave_days !== undefined) attList.push({ label: 'Sick Leave', value: attendanceB.sick_leave_days });
          if (attendanceB.special_leave_days !== undefined) attList.push({ label: 'Special Leave', value: attendanceB.special_leave_days });
          setAttendanceList(attList);

          setNetSalary(salaryCalc.net_pay ?? 0);
          setFixedNetLocked(true);
        } catch (pe) {
          console.error('Preview fetch failed:', pe);
        }
      }

    } catch (err) {
      console.error("Payroll fetch failed:", err);
      setError("Failed to load payroll details");
      // Reset payroll data on error
      setBasicSalary(0);
      setAllowances([]);
      setDeductions([]);
      setOtherComponents([]);
      setNetSalary(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate payroll
  const calculatePayroll = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee first");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/payroll/payroll/", {
        employee_id: selectedEmployee.id,
        month: selectedMonth,
        year: selectedYear,
      });

      setBasicSalary(res.data.basic_salary || 0);
      setAllowances(res.data.allowances || []);
      setDeductions(res.data.deductions || []);
      setOtherComponents(res.data.other_components || []);
      setAttendance(res.data.attendance || {});
      setNetSalary(res.data.net_salary || 0);

      setSuccess("Payroll calculated successfully");

    } catch (err) {
      console.error("Payroll calculation failed:", err);
      setError("Failed to calculate payroll");
    } finally {
      setLoading(false);
    }
  };

  // Employee Selection
  const filteredEmployees = employees.filter(emp => {
    const name = (emp.full_name || emp.employee_name || emp.name || "").toString().toLowerCase();
    const empId = (emp.employee_id || "").toString().toLowerCase();
    const designation = (emp.designation || "").toString().toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || empId.includes(term) || designation.includes(term);
  });


  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setSearchTerm((employee.full_name || employee.employee_name || employee.name || employee.employee_id || "").toString());
    setShowEmployeeDropdown(false);
    // Fetch full employee detail to obtain salary fields if not included in list
    const empBasic = getEmployeeMonthlyBasic(employee);
    if (empBasic && empBasic > 0) {
      setBasicSalary(empBasic);
    } else {
      fetchEmployeeDetail(employee.id);
    }
  };

  // Helper: robustly extract monthly basic salary from employee object
  const getEmployeeMonthlyBasic = (emp) => {
    if (!emp) return 0;
    // direct field
    if (emp.basic_salary && !isNaN(Number(emp.basic_salary))) return Number(emp.basic_salary);
    // nested job_info
    if (emp.job_info) {
      const ji = emp.job_info;
      if (ji.basic_salary && !isNaN(Number(ji.basic_salary))) return Number(ji.basic_salary);
      if (ji.salary && !isNaN(Number(ji.salary))) return Number(ji.salary);
      if (ji.base_salary && !isNaN(Number(ji.base_salary))) return Number(ji.base_salary);
    }
    // fallback to 0
    return 0;
  };

  const handleClearSelection = () => {
    setSelectedEmployee(null);
    setSearchTerm("");
    setBasicSalary(0);
    setAllowances([]);
    setDeductions([]);
    setOtherComponents([]);
    setNetSalary(0);
    setFixedNetLocked(false);
    setPayrollRecords([]);
  };

  const handleGeneratePayslip = async () => {
    if (!selectedEmployee) {
      setError("Select employee first");
      return;
    }

    try {
      setLoading(true);
      setError("");
      // First, request a payroll preview and show the modal with details
      const previewRes = await api.post('/payroll/payroll/calculate_payroll_preview/', {
        employee_id: selectedEmployee.id,
        month: selectedMonth,
        year: selectedYear,
        allowance_items: allowances.map(a => ({ allowance_type: a.allowance_type || a.name || a.type || '', amount: a.amount || 0 })),
        deduction_items: deductions.map(d => ({ deduction_type: d.deduction_type || d.name || d.type || '', amount: d.amount || 0 })),
      });

      const preview = previewRes.data || {};
      const salaryCalc = preview.salary_calculation || {};

      setSalaryCalculation(salaryCalc);

      // populate UI state from preview
      setBasicSalary(salaryCalc.monthly_basic ?? salaryCalc.base_salary ?? salaryCalc.earned_salary ?? basicSalary);
      setNetSalary(salaryCalc.net_pay ?? netSalary);
      setFixedNetLocked(true);

      // apply returned item lists so top UI shows them
      setAllowances(preview.allowance_items || []);
      setDeductions(preview.deduction_items || []);

      // show modal payslip with preview data
      setShowPayslip(true);
      setSuccess('Payslip preview generated');

      // Then trigger PDF download in background (best-effort)
      try {
        const payload = {
          employee_id: selectedEmployee.id,
          month: selectedMonth,
          year: selectedYear,
          allowances: totalAllowances,
          deductions: totalDeductions,
          allowance_items: allowances.map(a => ({ allowance_type: a.allowance_type || a.name || a.type || '', amount: a.amount || 0 })),
          deduction_items: deductions.map(d => ({ deduction_type: d.deduction_type || d.name || d.type || '', amount: d.amount || 0 })),
        };

        const pdfRes = await api.post('/payroll/generate_preview_payslip/', payload, { responseType: 'blob' });
        const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${selectedEmployee.id}_${selectedMonth}_${selectedYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (pdfErr) {
        console.warn('PDF download failed (preview shown):', pdfErr);
      }

    } catch (err) {
      console.error("Payslip generation failed:", err);
      // If server returned JSON error blob, try to extract it for debugging
      try {
        if (err.response && err.response.data && err.response.data instanceof Blob) {
          const text = await err.response.data.text();
          try {
            const json = JSON.parse(text);
            console.error('Server error JSON:', json);
            setError(json.error || json.detail || 'Server error generating payslip');
          } catch (e) {
            setError(text || 'Server error generating payslip');
          }
        } else if (err.response && err.response.data) {
          setError(err.response.data.error || err.response.data.detail || 'Server error generating payslip');
        } else {
          setError('Failed to generate payslip');
        }
      } catch (parseErr) {
        console.error('Error parsing payslip error response', parseErr);
        setError('Failed to generate payslip');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClosePayslip = () => {
    setShowPayslip(false);
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
          else if ([15].includes(day)) dayType = "holiday";
          else if ([10, 20].includes(day)) dayType = "casual";
          
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

  // Normalize amounts: some backends return negative values for deductions — use absolute values
  const totalDeductions = deductions.reduce((sum, item) => sum + (Math.abs(Number(item.amount)) || 0), 0);
  const totalAllowances = allowances.reduce((sum, item) => sum + (Math.abs(Number(item.amount)) || 0), 0);
  const totalSalary = (Number(basicSalary) || 0) + totalAllowances;
  const computedNetLocal = (Number(basicSalary) || 0) + (Number(totalAllowances) || 0) - (Number(totalDeductions) || 0);
  // Display the total calculation (basic + allowances - deductions)
  const displayNet = Number(computedNetLocal) || 0;

  // Recompute net pay whenever basic, allowances or deductions change
  useEffect(() => {
    // If net has been locked by a preview or saved payroll, do not auto-recompute
    if (fixedNetLocked) return;
    // Prefer backend-provided salaryCalculation.net_pay when available
    if (salaryCalculation && (salaryCalculation.net_pay !== undefined && salaryCalculation.net_pay !== null)) {
      const val = Number(salaryCalculation.net_pay) || 0;
      setNetSalary(val);
      return;
    }

    const computedNet = (Number(basicSalary) || 0) + (Number(totalAllowances) || 0) - (Number(totalDeductions) || 0);
    setNetSalary(Number(computedNet));
  }, [basicSalary, totalAllowances, totalDeductions, salaryCalculation]);

  return (
    <div style={styles.container}>
      {/* Payslip Modal */}
      {showPayslip && selectedEmployee && (
        (() => {
          // Normalize data shapes expected by Payslip.jsx
          const earningsForPayslip = {
            basicPay: Number(basicSalary) || 0,
            otherAllowance: Number(totalAllowances) || 0,
            teaAllowance: 0,
            spIncentive: 0,
            avgPay: 0,
          };

          // Map deductions array to a simple deductions object for display
          const deductionsTotal = Number(totalDeductions) || 0;
          const deductionsForPayslip = {
            leaveDeduction: 0,
            latePunchDeduction: 0,
            punchMissCd: 0,
            purchase: 0,
            advance: 0,
            healthInsurance: 0,
            reimbursement: 0,
            // provide total as well
            total: deductionsTotal,
          };

          // If we have itemized deductions/allowances try to populate some fields
          if (allowances && allowances.length > 0) {
            // put first allowance amount into otherAllowance for visibility
            earningsForPayslip.otherAllowance = allowances.reduce((s, a) => s + (Number(a.amount) || 0), 0);
          }
          if (deductions && deductions.length > 0) {
            deductionsForPayslip.advance = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
          }

          const attendanceForPayslip = {
            workingDays: attendance.workingDays || 0,
            casualLeave: attendance.casualLeave || 0,
            sickDays: attendance.sickLeave || 0,
            totalLeave: (attendance.casualLeave || 0) + (attendance.sickLeave || 0) || 0,
            workedDays: attendance.workingDays || 0,
            punchMiss: attendance.punchMiss || 0,
            latePunch: attendance.latePunch || 0,
          };

          return (
            <Payslip
              employee={selectedEmployee}
              month={selectedMonth}
              year={selectedYear}
              earnings={earningsForPayslip}
              deductions={deductionsForPayslip}
              attendance={attendanceForPayslip}
              onClose={handleClosePayslip}
            />
          );
        })()
      )}

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
            onClick={fetchEmployees}
            style={styles.refreshButton}
            disabled={loading}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
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
              {/* Clear button intentionally removed for Employee Name field */}
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
                        {emp.name?.charAt(0) || '?'}
                      </div>
                      <div style={styles.employeeInfo}>
                        <div style={styles.employeeName}>{emp.name}</div>
                        <div style={styles.employeeMeta}>
                          {emp.employee_id} • {emp.designation || 'N/A'}
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
                  {allowances.length > 0 ? (
                    allowances.map((item, index) => (
                      <div key={index} style={styles.adItem}>
                        <div style={styles.adItemLeft}>
                          <div style={styles.adItemIcon}>+</div>
                          <span style={styles.adItemName}>{item.allowance_type || item.name || item.type}</span>
                        </div>
                        <span style={styles.adItemAmount}>+₹{(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyText}>No allowances</div>
                  )}
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
                  <span style={styles.adSubtext}>Salary deductions</span>
                </div>
                <div style={styles.adList}>
                  {deductions.length > 0 ? (
                    deductions.map((item, index) => (
                      <div key={index} style={styles.adItem}>
                        <div style={styles.adItemLeft}>
                          <div style={{...styles.adItemIcon, ...styles.deductionIcon}}>−</div>
                          <span style={styles.adItemName}>{item.deduction_type || item.name || item.type}</span>
                        </div>
                        <span style={{...styles.adItemAmount, ...styles.deductionAmount}}>-₹{(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyText}>No deductions</div>
                  )}
                  <div style={{...styles.adTotal, ...styles.deductionTotal}}>
                    <span>Total Deductions</span>
                    <span>-₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Components */}
            {otherComponents.length > 0 && (
              <div style={styles.componentsCard}>
                <div style={styles.componentsHeader}>
                  <FileText size={18} />
                  <span>Attendance & Other Details</span>
                </div>
                <div style={styles.componentsGrid}>
                  {otherComponents.map((item, index) => (
                    <div key={index} style={styles.componentItem}>
                      <span style={styles.componentLabel}>{item.name}</span>
                      <span style={styles.componentValue}>{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  <span>Working Days: {attendance.workingDays || 0}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#fbbf24'}}></div>
                  <span>Weekends: {attendance.weekends || 0}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#c084fc'}}></div>
                  <span>Holidays: {attendance.holidays || 0}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: '#60a5fa'}}></div>
                  <span>Casual Leave: {attendance.casualLeave || 0}</span>
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
                  <div style={styles.statValue}>30</div>
                  <div style={styles.statLabel}>Total Days</div>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statValue, color: '#10b981'}}>{attendance.workingDays || 0}</div>
                  <div style={styles.statLabel}>Working Days</div>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statValue, color: '#60a5fa'}}>{attendance.casualLeave || 0}</div>
                  <div style={styles.statLabel}>Leaves Taken</div>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statValue, color: '#c084fc'}}>{attendance.holidays || 0}</div>
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
                {/* show allowance items */}
                {allowances && allowances.length > 0 && (
                  <div style={{ padding: '6px 12px 10px 44px' }}>
                    {allowances.map((a, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#065f46' }}>{(a.allowance_type || a.name || a.type || 'Allowance')} : ₹{(Number(a.amount) || 0).toLocaleString('en-IN')}</div>
                    ))}
                  </div>
                )}
                <div style={styles.breakdownItem}>
                  <span style={styles.breakdownLabel}>Total Salary</span>
                  <span style={styles.breakdownAmount}>₹{totalSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div style={styles.breakdownItem}>
                  <TrendingDown size={16} color="#ef4444" />
                  <span>Deductions</span>
                  <span style={{...styles.breakdownAmount, color: '#ef4444'}}>-₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                {deductions && deductions.length > 0 && (
                  <div style={{ padding: '6px 12px 10px 44px' }}>
                    {deductions.map((d, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#991B1B' }}>{(d.deduction_type || d.name || d.type || 'Deduction')} : -₹{(Number(d.amount) || 0).toLocaleString('en-IN')}</div>
                    ))}
                  </div>
                )}
                
              </div>

              <div style={styles.netPayableSection}>
                <div style={styles.netPayableLabel}>Net Payable Amount</div>
                <div style={styles.netPayableNote}>Based on {attendance.workingDays || 0} working days</div>
                <div style={styles.netPayableAmount}>₹ {displayNet.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              </div>
              {attendanceList && attendanceList.length > 0 && (
                <div style={{ padding: '12px 18px', background: '#fff7f7', borderRadius: 8, marginTop: 12 }}>
                  <strong style={{ display: 'block', marginBottom: 8 }}>Attendance Breakdown</strong>
                  {attendanceList.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '2px 0' }}>
                      <div style={{ color: '#6b7280' }}>{it.label}</div>
                      <div style={{ color: '#111827' }}>{it.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={handleGeneratePayslip} style={styles.generateBtn} disabled={loading}>
                <FileText size={18} />
                {loading ? 'Generating...' : 'Generate Payslip'}
              </button>
            </div>
            {/* Payslip history table */}
            <div style={{ marginTop: 18 }}>
              <h4 style={{ margin: '8px 0' }}>Payslip History</h4>
              {payrollRecords.length > 0 ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  {payrollRecords.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: 10, background: '#fff5f5', border: '1px solid #fee2e2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 700 }}>
                          <FileText size={18} color="#ef4444" />
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{p.month} {p.year}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>Generated on {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right', marginRight: 8 }}>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>₹{((p.net_pay || p.net || 0)).toLocaleString('en-IN')}</div>
                        </div>
                        <button onClick={() => {
                          // view payslip in modal: populate state from record
                          setSalaryCalculation(p.salary_calculation || {});
                          setBasicSalary(p.salary || p.earned_salary || 0);
                          setAllowances(p.allowance_items || []);
                          setDeductions(p.deduction_items || []);
                          setNetSalary(p.net_pay || p.net || 0);
                          setFixedNetLocked(true);
                          setShowPayslip(true);
                        }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="View">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button onClick={async () => {
                          try {
                            setLoading(true);
                            const pdfRes = await api.post('/payroll/generate_preview_payslip/', { employee_id: selectedEmployee.id, month: p.month, year: p.year }, { responseType: 'blob' });
                            const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `Payslip_${selectedEmployee.id}_${p.month}_${p.year}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (e) {
                            console.error('Download failed', e);
                            setError('Failed to download payslip');
                          } finally {
                            setLoading(false);
                          }
                        }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Download">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280' }}>No payslips generated yet for this employee.</div>
              )}
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
  emptyText: {
    padding: '12px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '12px',
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
  componentsCard: {
    background: '#f0fdf4',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #bbf7d0',
    marginBottom: '16px',
  },
  componentsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    color: '#16a34a',
    fontSize: '14px',
    fontWeight: '600',
  },
  componentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
  },
  componentItem: {
    background: '#fff',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #dcfce7',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  componentLabel: {
    fontSize: '11px',
    color: '#166534',
    fontWeight: '500',
  },
  componentValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#15803d',
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
    background: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)',
    padding: '20px',
    borderRadius: '12px',
    color: '#7f1d1d',
    border: '1px solid #fecaca',
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
    opacity: '0.9',
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