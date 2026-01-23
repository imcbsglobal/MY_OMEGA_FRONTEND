import React, { useEffect, useState } from "react";
import {
  FileText,
  Download,
  History,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import PayslipTemplate from "./PayslipTemplate";

export default function PayslipPage() {
  const navigate = useNavigate();
  const [payrollData, setPayrollData] = useState(null);
  const [payslipHistory, setPayslipHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedPayslip, setGeneratedPayslip] = useState(null);

  useEffect(() => {
    // Load payroll data from localStorage
    const stored = localStorage.getItem("currentPayroll");
    if (stored) {
      const data = JSON.parse(stored);
      console.log("PayslipPage - Loaded payroll data:", data);
      setPayrollData(data);

      // Fetch payslip history
      if (data.employee_id) {
        fetchPayslipHistory(data.employee_id);
      }
    } else {
      setError(
        "No payroll data found. Please go back to Payroll page and select month/year."
      );
    }
  }, []);

  const fetchPayslipHistory = async (employeeId) => {
    try {
      setLoading(true);

      // Fetch all payslips for this employee
      const response = await api.get(
        `/payroll/payroll/?employee_id=${employeeId}`
      );

      console.log("Payslip History Response:", response.data);

      const payslips = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      // Filter and sort by date (most recent first)
      const sorted = payslips
        .sort(
          (a, b) =>
            new Date(b.created_at || b.updated_at) -
            new Date(a.created_at || a.updated_at)
        )
        .slice(0, 12); // Last 12 payslips

      setPayslipHistory(sorted);
      console.log("Payslip History Sorted:", sorted);
    } catch (err) {
      console.error("Failed to fetch payslip history:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPayslipExists = () => {
    if (!payrollData) return false;

    return payslipHistory.some(
      (ps) =>
        ps.month === payrollData.month && ps.year === payrollData.year
    );
  };

  const handleGeneratePayslip = () => {
    setLoading(false);
    setError("");
    setSuccess("");

    if (!payrollData) {
      setError("Payroll data not found");
      return;
    }

    // Check if payslip already exists
    if (checkPayslipExists()) {
      setError("Payslip for this month has already been generated.");
      return;
    }

    // Display the payslip template
    setGeneratedPayslip(payrollData);
    setSuccess("Payslip generated successfully!");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const downloadPayslip = (payslip) => {
    // Generate PDF or download payslip
    if (payslip.pdf_url) {
      const element = document.createElement("a");
      element.href = payslip.pdf_url;
      element.download = `Payslip_${payslip.month}_${payslip.year}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      alert("PDF not available for this payslip");
    }
  };

  const formatCurrency = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isPayslipExists = checkPayslipExists();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Payslip</h1>
        <p style={styles.subtitle}>
          Generate and manage your payslips
        </p>
      </div>

      {error && (
        <div style={{ ...styles.alertBox, ...styles.errorAlert }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ ...styles.alertBox, ...styles.successAlert }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {generatedPayslip && (
        <PayslipTemplate 
          payrollData={generatedPayslip}
          onClose={() => setGeneratedPayslip(null)}
        />
      )}

      {payrollData && (
        <div style={styles.card}>
          {/* Current Payslip Details */}
          <div style={styles.payslipDetailsSection}>
            <h2 style={styles.sectionTitle}>
              {payrollData.month} {payrollData.year} - Payslip Details
            </h2>

            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Basic Salary</div>
                <div style={styles.summaryValue}>
                  {formatCurrency(payrollData.basic_salary)}
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Allowances</div>
                <div style={styles.summaryValue}>
                  {formatCurrency(payrollData.total_allowances)}
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Deductions</div>
                <div style={styles.summaryValue}>
                  {formatCurrency(payrollData.total_deductions)}
                </div>
              </div>

              <div style={{ ...styles.summaryCard, ...styles.netPayCard }}>
                <div style={styles.summaryLabel}>Net Pay</div>
                <div style={styles.netPayValue}>
                  {formatCurrency(payrollData.net_salary)}
                </div>
              </div>
            </div>

            {/* Allowances Details */}
            {payrollData.allowances && payrollData.allowances.length > 0 && (
              <div style={styles.detailsSection}>
                <h3 style={styles.detailsTitle}>Allowances</h3>
                <div style={styles.detailsTable}>
                  {payrollData.allowances.map((allowance, idx) => (
                    <div key={idx} style={styles.detailsRow}>
                      <span style={styles.detailsLabel}>
                        {allowance.name || `Allowance ${idx + 1}`}
                      </span>
                      <span style={styles.detailsValue}>
                        {formatCurrency(allowance.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deductions Details */}
            {payrollData.deductions && payrollData.deductions.length > 0 && (
              <div style={styles.detailsSection}>
                <h3 style={styles.detailsTitle}>Deductions</h3>
                <div style={styles.detailsTable}>
                  {payrollData.deductions.map((deduction, idx) => (
                    <div key={idx} style={styles.detailsRow}>
                      <span style={styles.detailsLabel}>
                        {deduction.name || `Deduction ${idx + 1}`}
                      </span>
                      <span style={styles.detailsValue}>
                        {formatCurrency(deduction.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Generate Payslip Buttons */}
          <div style={styles.actionSection}>
            <h3 style={styles.sectionTitle}>Generate Payslip</h3>

            {isPayslipExists && (
              <div style={{ ...styles.alertBox, ...styles.warningAlert }}>
                <AlertCircle size={20} />
                <span>Payslip for this month has already been generated.</span>
              </div>
            )}

            <div style={styles.buttonGroup}>
              <button
                onClick={() => handleGeneratePayslip(true)}
                disabled={loading || isPayslipExists}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...(isPayslipExists && styles.buttonDisabled),
                }}
              >
                <FileText size={18} />
                Generate Payslip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip History Section */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <History size={20} style={{ marginRight: "10px" }} />
          Payslip History
        </h2>

        {payslipHistory.length > 0 ? (
          <div style={styles.historyTable}>
            <div style={styles.historyHeader}>
              <div style={styles.historyCell}>Month</div>
              <div style={styles.historyCell}>Year</div>
              <div style={styles.historyCell}>Net Pay</div>
              <div style={styles.historyCell}>Generated Date</div>
              <div style={styles.historyCell}>Action</div>
            </div>
            {payslipHistory.map((payslip, idx) => (
              <div key={idx} style={styles.historyRow}>
                <div style={styles.historyCell}>{payslip.month}</div>
                <div style={styles.historyCell}>{payslip.year}</div>
                <div style={styles.historyCell}>
                  {formatCurrency(payslip.net_pay || 0)}
                </div>
                <div style={styles.historyCell}>
                  {new Date(payslip.created_at || payslip.updated_at).toLocaleDateString()}
                </div>
                <div style={styles.historyCell}>
                  {payslip.pdf_url && (
                    <button
                      onClick={() => downloadPayslip(payslip)}
                      style={styles.downloadButton}
                      title="Download Payslip"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noData}>No payslips generated yet</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: "#fef2f2",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "30px",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    borderLeft: "4px solid #fca5a5",
    boxShadow: "0 2px 4px rgba(252, 165, 165, 0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#f87171",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: "0",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "30px",
    marginBottom: "20px",
  },
  alertBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  errorAlert: {
    backgroundColor: "#fee2e2",
    borderLeft: "4px solid #dc2626",
    color: "#991b1b",
  },
  successAlert: {
    backgroundColor: "#dcfce7",
    borderLeft: "4px solid #16a34a",
    color: "#15803d",
  },
  warningAlert: {
    backgroundColor: "#fef3c7",
    borderLeft: "4px solid #f59e0b",
    color: "#92400e",
  },
  payslipDetailsSection: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#f87171",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    borderBottom: "2px solid #fecaca",
    paddingBottom: "8px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "8px",
    border: "2px solid #fecaca",
    boxShadow: "0 2px 4px rgba(220, 38, 38, 0.05)",
  },
  netPayCard: {
    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    borderColor: "#fca5a5",
  },
  summaryLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#64748b",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  summaryValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
  },
  netPayValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f87171",
  },
  detailsSection: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0",
  },
  detailsTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "12px",
  },
  detailsTable: {
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid #fecaca",
  },
  detailsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #fecaca",
    fontSize: "14px",
  },
  detailsLabel: {
    color: "#475569",
    fontWeight: "500",
  },
  detailsValue: {
    color: "#0f172a",
    fontWeight: "600",
  },
  actionSection: {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "2px solid #e2e8f0",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  primaryButton: {
    backgroundColor: "#f87171",
    color: "#ffffff",
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
  },
  confirmButton: {
    backgroundColor: "#0891b2",
    color: "#ffffff",
  },
  buttonDisabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
  oldTemplateSection: {
    backgroundColor: "#f1f5f9",
    padding: "15px",
    borderRadius: "6px",
    marginTop: "10px",
  },
  oldTemplateText: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "10px",
    margin: "0 0 10px 0",
  },
  historyTable: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    overflow: "hidden",
    border: "2px solid #fecaca",
  },
  historyHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    borderBottom: "2px solid #fca5a5",
    fontWeight: "600",
    fontSize: "14px",
    color: "#ef4444",
  },
  historyCell: {
    padding: "12px 16px",
    textAlign: "left",
  },
  historyRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    borderBottom: "1px solid #fecaca",
    fontSize: "14px",
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "transparent",
    color: "#f87171",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  noData: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },
};
