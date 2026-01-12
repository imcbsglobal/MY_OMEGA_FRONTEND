import React from "react";
import { X, Printer } from "lucide-react";

export default function Payslip({ 
  employee, 
  month, 
  year, 
  earnings = {},
  deductions = {},
  
  attendance = {},
  onClose 
}) {
  const handlePrint = () => {
    window.print();
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹-';
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate totals
  const basicPay = earnings.basicPay || 0;
  const otherAllowance = earnings.otherAllowance || 0;
  const teaAllowance = earnings.teaAllowance || 0;
  const spIncentive = earnings.spIncentive || 0;
  const avgPay = earnings.avgPay || 0;
  
  const grossEarnings = basicPay + otherAllowance + teaAllowance + spIncentive + avgPay;
  
  const leaveDeduction = deductions.leaveDeduction || 0;
  const latePunchDeduction = deductions.latePunchDeduction || 0;
  const punchMissCd = deductions.punchMissCd || 0;
  const purchase = deductions.purchase || 0;
  const advance = deductions.advance || 0;
  const healthInsurance = deductions.healthInsurance || 0;
  const reimbursement = deductions.reimbursement || 0;
  
  const totalDeductions = leaveDeduction + latePunchDeduction + punchMissCd + purchase + advance + healthInsurance + reimbursement;
  const netPay = grossEarnings - totalDeductions;

  const getEmployeeName = (emp) => {
    if (!emp) return 'Unknown';
    if (emp.full_name) return emp.full_name;
    if (emp.name) return emp.name;
    if (emp.get_full_name && typeof emp.get_full_name === 'function') {
      try { const n = emp.get_full_name(); if (n) return n; } catch(e) {}
    }
    if (emp.user) {
      const u = emp.user;
      if (u.get_full_name && typeof u.get_full_name === 'function') {
        try { const n = u.get_full_name(); if (n) return n; } catch(e) {}
      }
      if (u.full_name) return u.full_name;
      if (u.name) return u.name;
    }
    return emp.employee_id || emp.id || 'Unknown';
  };

  const getEmployeeField = (emp, keys, fallback='') => {
    if (!emp) return fallback;
    for (const k of keys) {
      if (emp[k]) return emp[k];
    }
    // check nested job_info
    if (emp.job_info) {
      for (const k of keys) {
        if (emp.job_info[k]) return emp.job_info[k];
      }
    }
    // check user
    if (emp.user) {
      for (const k of keys) {
        if (emp.user[k]) return emp.user[k];
      }
    }
    return fallback;
  };

  return (
    <div style={styles.overlay} className="payslip-overlay">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .payslip-overlay, 
          .payslip-overlay *,
          .payslip-container,
          .payslip-container * { 
            visibility: visible;
          }
          .payslip-overlay { 
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .payslip-container {
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            max-height: none !important;
          }
          .payslip-container > div:last-child {
            padding: 20px 30px !important;
          }
        }
      `}</style>
      
      <div style={styles.container} className="payslip-container">
        {/* Action Buttons */}
        <div style={styles.actions} className="no-print">
          <button onClick={handlePrint} style={styles.printBtn}>
            <Printer size={16} />
            Print Payslip
          </button>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={16} />
            Close
          </button>
        </div>

        {/* Payslip Content */}
        <div style={styles.payslip}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.logo}>
                <img 
                  src="/assets/omega-logo.png" 
                  alt="Omega Logo" 
                  style={styles.logoImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#E74C3C"/><text x="20" y="27" fontSize="24" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="Arial">Ω</text></svg>';
                  }}
                />
              </div>
              <div style={styles.companyInfo}>
                <h1 style={styles.companyName}>MYOMEGA</h1>
                <p style={styles.companyTagline}>Staff Payroll Services</p>
              </div>
            </div>
            <div style={styles.headerRight}>
              <div style={styles.logoRight}>
                <svg width="60" height="20" viewBox="0 0 60 20">
                  <text x="0" y="15" fontSize="16" fill="#E74C3C" fontWeight="bold" fontFamily="Arial"></text>
                </svg>
              </div>
            </div>
          </div>

          {/* Pay Period Title */}
          <div style={styles.payPeriodHeader}>
            Payslip for the month of {month} {year}
          </div>

          {/* Employee Summary Section */}
          <div style={styles.summarySection}>
            <div style={styles.summaryHeader}>
              EMPLOYEE PAY SUMMARY
            </div>

            <div style={styles.summaryContent}>
              {/* Left Side - Employee Details */}
              <div style={styles.summaryLeft}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Employee Name</span>
                  <span style={styles.detailColon}>:</span>
                  <span style={styles.detailValue}>{getEmployeeName(employee)}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Designation</span>
                  <span style={styles.detailColon}>:</span>
                  <span style={styles.detailValue}>{employee.designation || employee.job_info?.designation || ''}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Date of Joining</span>
                  <span style={styles.detailColon}>:</span>
                  <span style={styles.detailValue}>{getEmployeeField(employee, ['dateOfJoining','date_of_joining'], '15-03-2020')}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Pay Period</span>
                  <span style={styles.detailColon}>:</span>
                  <span style={styles.detailValue}>{month}-{year}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Pay Date</span>
                  <span style={styles.detailColon}>:</span>
                  <span style={styles.detailValue}>{getEmployeeField(employee, ['payDate','pay_date'], '30/11/2025')}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>PF A/C Number</span>
                  <span style={styles.detailColon}>:</span>
                  <span style={styles.detailValue}>{getEmployeeField(employee, ['pfNumber','pf_number'], 'AA/AAA/0000000/00/0000000')}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>UAN Number</span>
                  <span style={styles.detailColon}>:</span>
                  <span style={styles.detailValue}>{getEmployeeField(employee, ['uanNumber','uan_number'], '101010101010')}</span>
                </div>
              </div>

              {/* Right Side - Net Pay */}
              <div style={styles.summaryRight}>
                <div style={styles.netPayBox}>
                  <div style={styles.netPayLabel}>Employee Net Pay</div>
                  <div style={styles.netPayAmount}>{formatCurrency(netPay)}</div>
                  <div style={styles.netPaySubtext}>Worked Days: {attendance.workedDays || 0} | Leave Days: {attendance.totalLeave || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={styles.mainGrid}>
            {/* Left Column - Earnings */}
            <div style={styles.column}>
              <div style={styles.sectionHeader}>
                <span>EARNINGS</span>
                <span>AMOUNT</span>
              </div>
              <div style={styles.sectionContent}>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Basic Pay</span>
                  <span style={styles.itemAmount}>{formatCurrency(basicPay)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Other Allowance</span>
                  <span style={styles.itemAmount}>{formatCurrency(otherAllowance)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Tea Allowance</span>
                  <span style={styles.itemAmount}>{formatCurrency(teaAllowance)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>SP. Incentive</span>
                  <span style={styles.itemAmount}>{formatCurrency(spIncentive)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Avg Pay</span>
                  <span style={styles.itemAmount}>{formatCurrency(avgPay)}</span>
                </div>
                <div style={styles.totalLine}>
                  <span style={styles.totalLabel}>Gross Earnings</span>
                  <span style={styles.totalAmount}>{formatCurrency(grossEarnings)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Deductions & Attendance */}
            <div style={styles.column}>
              {/* Attendance Details */}
              <div style={styles.sectionHeader}>
                <span>ATTENDANCE DETAILS</span>
                <span>DAYS</span>
              </div>
              <div style={styles.sectionContent}>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Working Days</span>
                  <span style={styles.itemAmount}>{attendance.workingDays || 0}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Casual Leave</span>
                  <span style={styles.itemAmount}>{attendance.casualLeave || 0}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Sick Days</span>
                  <span style={styles.itemAmount}>{attendance.sickDays || '-'}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Total Leave</span>
                  <span style={styles.itemAmount}>{attendance.totalLeave || 0}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Worked Days</span>
                  <span style={styles.itemAmount}>{attendance.workedDays || 0}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Punch Miss</span>
                  <span style={styles.itemAmount}>{attendance.punchMiss || 0}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Late Punch</span>
                  <span style={styles.itemAmount}>{attendance.latePunch || '-'}</span>
                </div>
              </div>

              {/* Deductions */}
              <div style={{...styles.sectionHeader, marginTop: '20px'}}>
                <span>DEDUCTIONS</span>
                <span>AMOUNT</span>
              </div>
              <div style={styles.sectionContent}>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Leave Deduction</span>
                  <span style={styles.itemAmount}>{formatCurrency(leaveDeduction)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Late Punch Deduction</span>
                  <span style={styles.itemAmount}>{formatCurrency(latePunchDeduction)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Punch Miss C/d</span>
                  <span style={styles.itemAmount}>{formatCurrency(punchMissCd)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Purchase</span>
                  <span style={styles.itemAmount}>{formatCurrency(purchase)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Advance</span>
                  <span style={styles.itemAmount}>{formatCurrency(advance)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Health Insurance</span>
                  <span style={styles.itemAmount}>{formatCurrency(healthInsurance)}</span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.itemLabel}>Reimbursement</span>
                  <span style={styles.itemAmount}>{formatCurrency(reimbursement)}</span>
                </div>
                <div style={styles.totalLine}>
                  <span style={styles.totalLabel}>Total Deductions</span>
                  <span style={styles.totalAmount}>{formatCurrency(totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Footer */}
          <div style={styles.netPayFooter}>
            <div style={styles.netPayFooterContent}>
              <div style={styles.netPayFooterLeft}>
                <span style={styles.netPayFooterLabel}>NET PAY (Gross Earnings - Total Deductions)</span>
                <span style={styles.netPayFooterFormula}>{formatCurrency(grossEarnings)} - {formatCurrency(totalDeductions)}</span>
              </div>
              <div style={styles.netPayFooterAmount}>{formatCurrency(netPay)}</div>
            </div>
          </div>

          {/* Footer Note
          <div style={styles.footer}>
            <p style={styles.footerText}>
              This is a computer generated payslip and does not require a signature.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    overflowY: 'auto',
  },
  container: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '95vh',
    overflowY: 'auto',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
    borderRadius: '8px 8px 0 0',
  },
  printBtn: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  closeBtn: {
    padding: '10px 20px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
    transition: 'all 0.2s',
  },
  payslip: {
    padding: '30px 40px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#333',
    background: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #ddd',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logo: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  companyInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  companyName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    letterSpacing: '1px',
  },
  companyTagline: {
    margin: '2px 0 0 0',
    fontSize: '11px',
    color: '#666',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  logoRight: {
    display: 'flex',
    alignItems: 'center',
  },
  payPeriodHeader: {
    background: '#fff',
    padding: '12px 20px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#E74C3C',
    fontWeight: '600',
    borderLeft: '4px solid #E74C3C',
  },
  summarySection: {
    marginBottom: '25px',
    border: '1px solid #ddd',
  },
  summaryHeader: {
    background: '#f5f5f5',
    padding: '10px 20px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#333',
    borderBottom: '1px solid #ddd',
  },
  summaryContent: {
    display: 'flex',
    padding: '20px',
    gap: '30px',
  },
  summaryLeft: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailRow: {
    display: 'flex',
    fontSize: '11px',
    lineHeight: '1.6',
  },
  detailLabel: {
    width: '140px',
    color: '#666',
    fontWeight: '500',
  },
  detailColon: {
    width: '15px',
    color: '#666',
  },
  detailValue: {
    flex: 1,
    color: '#333',
    fontWeight: '600',
  },
  summaryRight: {
    width: '280px',
    display: 'flex',
    alignItems: 'center',
  },
  netPayBox: {
    background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '100%',
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
  },
  netPayLabel: {
    fontSize: '11px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '8px',
    opacity: 0.95,
  },
  netPayAmount: {
    fontSize: '26px',
    color: '#fff',
    fontWeight: '700',
    marginBottom: '8px',
  },
  netPaySubtext: {
    fontSize: '10px',
    color: '#fff',
    opacity: 0.9,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '25px',
  },
  column: {
    border: '1px solid #ddd',
  },
  sectionHeader: {
    background: '#f5f5f5',
    padding: '10px 15px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #ddd',
  },
  sectionContent: {
    padding: '15px',
  },
  lineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '11px',
    borderBottom: '1px solid #f0f0f0',
  },
  itemLabel: {
    color: '#666',
  },
  itemAmount: {
    color: '#333',
    fontWeight: '600',
  },
  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    marginTop: '8px',
    fontSize: '12px',
    borderTop: '2px solid #ddd',
    fontWeight: '700',
  },
  totalLabel: {
    color: '#333',
  },
  totalAmount: {
    color: '#E74C3C',
  },
  netPayFooter: {
    background: '#E74C3C',
    padding: '18px 20px',
    marginBottom: '20px',
    borderRadius: '6px',
  },
  netPayFooterContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netPayFooterLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  netPayFooterLabel: {
    fontSize: '11px',
    color: '#fff',
    fontWeight: '600',
    opacity: 0.95,
  },
  netPayFooterFormula: {
    fontSize: '10px',
    color: '#fff',
    opacity: 0.85,
  },
  netPayFooterAmount: {
    fontSize: '28px',
    color: '#fff',
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '15px',
    borderTop: '1px solid #ddd',
  },
  footerText: {
    margin: 0,
    fontSize: '10px',
    color: '#999',
    fontStyle: 'italic',
  },
};