import React from "react";
import { X, Printer } from "lucide-react";

export default function PayslipTemplate({ payrollData, onClose }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!payrollData) return null;

  const basicSalary = parseFloat(payrollData.basic_salary) || 0;
  const allowances = Array.isArray(payrollData.allowances) 
    ? payrollData.allowances 
    : [];
  const deductions = Array.isArray(payrollData.deductions) 
    ? payrollData.deductions 
    : [];
  const totalAllowances = parseFloat(payrollData.total_allowances) || 0;
  const totalDeductions = parseFloat(payrollData.total_deductions) || 0;
  const netSalary = basicSalary + totalAllowances - totalDeductions;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 8mm; }
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .payslip-print { 
            padding: 15px !important; 
            box-shadow: none !important; 
            font-size: 10px !important;
            max-width: 100% !important;
          }
          .payslip-print * { page-break-inside: avoid; }
          .payslip-print table { font-size: 9px !important; }
          .payslip-print h3 { font-size: 10px !important; margin: 8px 0 !important; }
          .payslip-print .section { margin-bottom: 10px !important; }
          .payslip-print .header { margin-bottom: 10px !important; padding-bottom: 8px !important; }
          .payslip-print .title { margin-bottom: 10px !important; padding: 6px !important; font-size: 12px !important; }
          .payslip-print td { padding: 4px 8px !important; }
          .payslip-print .logo { height: 45px !important; }
          .payslip-print .net-pay-box { padding: 12px !important; margin-top: 30px !important; }
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.buttonBar} className="no-print">
          <button onClick={handlePrint} style={styles.printButton}>
            <Printer size={18} /> Print Payslip
          </button>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={18} /> Close
          </button>
        </div>

        <div style={styles.payslipWrapper} className="payslip-print">
        {/* Header */}
        <div style={styles.header} className="header">
          <div style={styles.logoContainer}>
            <div style={styles.logoWithName}>
              <img 
                src="/assets/logo.jpeg" 
                alt="MYOMEGA Logo" 
                style={styles.logoImage}
                className="logo" 
              />
              <div style={styles.logoText}>
                <div style={styles.companyName}>MY OMEGA</div>
                <div style={styles.subtitle}>Staff Payroll Services</div>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={styles.title} className="title">
          Payslip for the month of {payrollData.month} {payrollData.year}
        </div>

        {/* Employee Pay Summary */}
        <div style={styles.section} className="section">
          <h3 style={styles.sectionTitle}>EMPLOYEE PAY SUMMARY</h3>
          <div style={styles.summaryWrapper}>
            <div style={styles.summaryLeft}>
              <table style={styles.summaryTable}>
                <tbody>
                  <tr>
                    <td style={styles.labelCell}>Employee Name</td>
                    <td style={styles.valueCell}>{payrollData.employee_name || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Designation</td>
                    <td style={styles.valueCell}>{payrollData.designation || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Date of Joining</td>
                    <td style={styles.valueCell}>{payrollData.date_of_joining || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Pay Period</td>
                    <td style={styles.valueCell}>
                      {payrollData.month} {payrollData.year}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>Pay Date</td>
                    <td style={styles.valueCell}>
                      {new Date().toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>PF A/C Number</td>
                    <td style={styles.valueCell}>{payrollData.pf_number || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}>UAN Number</td>
                    <td style={styles.valueCell}>{payrollData.uan_number || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={styles.summaryRight}>
              <div style={styles.netPayBox} className="net-pay-box">
                <div style={styles.netPayLabel}>Employee Net Pay</div>
                <div style={styles.netPayAmount}>{formatCurrency(netSalary)}</div>
                <div style={styles.netPayDetails}>
                  Worked Days: {payrollData.worked_days || 0} | Leave Days: {payrollData.total_leave || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div style={styles.mainContent}>
          {/* Left Column - Earnings */}
          <div style={styles.earningsColumn}>
            <div style={styles.earningsSection}>
              <table style={styles.detailsTable}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.headerCell}>EARNINGS</th>
                    <th style={styles.headerCell}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>Basic Pay</td>
                    <td style={styles.detailValue}>{formatCurrency(basicSalary)}</td>
                  </tr>
                  {allowances.map((allowance, idx) => (
                    <tr key={idx} style={styles.detailRow}>
                      <td style={styles.detailLabel}>
                        {allowance.name || `Allowance ${idx + 1}`}
                      </td>
                      <td style={styles.detailValue}>
                        {formatCurrency(allowance.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr style={styles.totalRow}>
                    <td style={styles.totalLabel}>Gross Earnings</td>
                    <td style={styles.totalValue}>
                      {formatCurrency(basicSalary + totalAllowances)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Attendance Details & Deductions */}
          <div style={styles.rightDetailsColumn}>
            {/* Attendance Details */}
            <div style={styles.attendanceSection}>
              <table style={styles.detailsTable}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.headerCell}>ATTENDANCE DETAILS</th>
                    <th style={styles.headerCell}>DAYS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>Working Days</td>
                    <td style={styles.detailValue}>{payrollData.working_days || 0}</td>
                  </tr>
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>Casual Leave</td>
                    <td style={styles.detailValue}>{payrollData.casual_leave || 0}</td>
                  </tr>
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>Sick Days</td>
                    <td style={styles.detailValue}>{payrollData.sick_days || "-"}</td>
                  </tr>
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>Total Leave</td>
                    <td style={styles.detailValue}>{payrollData.total_leave || 0}</td>
                  </tr>
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>Worked Days</td>
                    <td style={styles.detailValue}>{payrollData.worked_days || 0}</td>
                  </tr>
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>Punch Miss</td>
                    <td style={styles.detailValue}>{payrollData.punch_miss || "-"}</td>
                  </tr>
                  <tr style={styles.detailRow}>
                    <td style={styles.detailLabel}>Late Punch</td>
                    <td style={styles.detailValue}>{payrollData.late_punch || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div style={styles.deductionsSection}>
              <table style={styles.detailsTable}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.headerCell}>DEDUCTIONS</th>
                    <th style={styles.headerCell}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.length > 0 ? (
                    deductions.map((deduction, idx) => (
                      <tr key={idx} style={styles.detailRow}>
                        <td style={styles.detailLabel}>
                          {deduction.name || `Deduction ${idx + 1}`}
                        </td>
                        <td style={styles.detailValue}>
                          {formatCurrency(deduction.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr style={styles.detailRow}>
                      <td colSpan="2" style={styles.noData}>
                        No deductions
                      </td>
                    </tr>
                  )}
                  <tr style={styles.totalRow}>
                    <td style={styles.totalLabel}>Total Deductions</td>
                    <td style={styles.totalValue}>
                      {formatCurrency(totalDeductions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Net Pay Summary */}
        <div style={styles.netPaySummary}>
          <span style={styles.summaryLabel}>
            NET PAY (Gross Earnings - Total Deductions)
          </span>
          <span style={styles.summaryAmount}>{formatCurrency(netSalary)}</span>
        </div>
      </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f5f5f5",
    zIndex: 10000,
    overflow: "auto",
    padding: "20px",
  },
  buttonBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    position: "sticky",
    top: "20px",
    zIndex: 10001,
  },
  printButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  closeButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginLeft: "auto",
  },
  payslipWrapper: {
    backgroundColor: "white",
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  header: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e5e7eb",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
  },
  logoWithName: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoSection: {
    textAlign: "center",
  },
  logoImage: {
    height: "70px",
    objectFit: "contain",
  },
  logoText: {
    display: "flex",
    flexDirection: "column",
  },
  companyName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: "2px",
  },
  subtitle: {
    fontSize: "11px",
    color: "#666",
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: "25px",
    padding: "10px",
    backgroundColor: "#fef2f2",
  },
  section: {
    marginBottom: "25px",
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  summaryTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  labelCell: {
    padding: "8px 12px",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: "500",
    color: "#475569",
    backgroundColor: "#f9fafb",
  },
  valueCell: {
    padding: "8px 12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#1f2937",
  },
  summaryWrapper: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    width: "250px",
  },
  mainContent: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
  },
  earningsColumn: {
    flex: 0.45,
  },
  rightDetailsColumn: {
    flex: 0.55,
  },
  earningsSection: {
    marginBottom: "25px",
  },
  attendanceSection: {
    marginBottom: "20px",
  },
  deductionsSection: {
    marginBottom: "25px",
  },
  detailsTable: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #cbd5e1",
  },
  attendanceTable: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #cbd5e1",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  headerCell: {
    padding: "10px 12px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "700",
    color: "#1f2937",
    textTransform: "uppercase",
    borderBottom: "2px solid #cbd5e1",
  },
  detailRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  detailLabel: {
    padding: "10px 12px",
    color: "#475569",
  },
  detailValue: {
    padding: "10px 12px",
    textAlign: "right",
    color: "#1f2937",
    fontWeight: "500",
  },
  totalRow: {
    backgroundColor: "#f9fafb",
    fontWeight: "600",
  },
  totalLabel: {
    padding: "10px 12px",
    color: "#1f2937",
  },
  totalValue: {
    padding: "10px 12px",
    textAlign: "right",
    color: "#dc2626",
    fontSize: "14px",
  },
  noData: {
    padding: "10px 12px",
    color: "#999",
    fontStyle: "italic",
  },
  netPayBox: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    marginTop: "70px",
  },
  netPayLabel: {
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  netPayAmount: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  netPayDetails: {
    fontSize: "11px",
    opacity: "0.9",
  },
  netPaySummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    backgroundColor: "#dc2626",
    color: "white",
    fontWeight: "600",
    borderRadius: "6px",
  },
  summaryLabel: {
    fontSize: "13px",
  },
  summaryAmount: {
    fontSize: "18px",
    fontWeight: "700",
  },
};
