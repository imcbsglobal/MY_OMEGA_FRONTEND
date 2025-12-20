// OfferLetter_View.jsx - COMPLETE UPDATED VERSION WITH HEADER/FOOTER
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function OfferLetterView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    try {
      const res = await api.get(`/offer-letter/${id}/`);
      setRecord(res.data.data);
    } catch (err) {
      console.error("Error loading record", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.errorText}>Record not found</p>
          <button style={styles.secondaryBtn} onClick={() => navigate("/offer-letter")}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const totalSalary = 
    (Number(record.basic_pay) || 0) +
    (Number(record.house_rent_allowance) || 0) +
    (Number(record.conveyance_earnings) || 0);

  return (
    <>
      <div style={styles.page}>
        {/* Action Buttons - Hidden on Print */}
        <div style={styles.actionBar} className="no-print">
          <button style={styles.backBtn} onClick={() => navigate("/offer-letter")}>
            ← Back to List
          </button>
          <div style={styles.actionRight}>
            <button style={styles.editBtn} onClick={() => navigate(`/offer-letter/edit/${record.id}`)}>
              ✏️ Edit
            </button>
            <button style={styles.printBtn} onClick={handlePrint}>
              🖨️ Print Letter
            </button>
          </div>
        </div>

        {/* PAGE 1 */}
        <div style={styles.letterContainer}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logoSection}>
              <img 
                src="/assets/omega-logo.png" 
                alt="Omega Logo" 
                style={styles.logo}
              />
            </div>
            
            <div style={styles.companySection}>
              <h1 style={styles.companyName}>BASIL ENTERPRISES</h1>
              <p style={styles.companyAddress}>
                Omega Trade centre, Opp City Hospital<br />
                Madrasa road, Tirur - 676101<br />
                Malappuram Dt Kerala, India
              </p>
            </div>
            
            <div style={styles.contactSection}>
              <p style={styles.gstin}>GSTIN : 32AEYPA3249P1ZO</p>
              <p style={styles.contactInfo}>
                Mob | 9961 282 899<br />
                L-L | 0494 242 5702
              </p>
            </div>
          </div>

          {/* Blue Line */}
          <div style={styles.blueLine}></div>

          {/* Letter Body */}
          <div style={styles.letterBody}>
            {/* To and Date Section */}
            <div style={styles.toDateSection}>
              <div style={styles.toBlock}>
                <p style={styles.toLabel}>To</p>
                <p style={styles.candidateName}>Mr. {record.candidate_name}</p>
              </div>
              <div style={styles.dateBlock}>
                {formatDate(new Date())}
              </div>
            </div>

            <div style={styles.contactDetails}>
              <p style={styles.contactDetail}>Ph: {record.candidate_phone || "+91 9744735456"}</p>
              <p style={styles.contactDetail}>Gmail: {record.candidate_email || "candidate@gmail.com"}</p>
              <p style={styles.subjectLine}>Subject: Offer of Employment – {record.position}</p>
            </div>

            {/* Title */}
            <div style={styles.titleSection}>
              <h2 style={styles.letterTitle}>JOB OFFER LETTER</h2>
            </div>

            {/* Greeting */}
            <p style={styles.greeting}>Dear Mr. {record.candidate_name},</p>

            {/* Introduction */}
            <p style={styles.bodyText}>
              We are pleased to offer you employment with Basil Enterprises for the position of <strong>{record.position}</strong> in our Sales Department. Your skills and experience are a valuable addition to our team.
            </p>

            <p style={styles.bodyText}>
              Your appointment will be governed by the terms and conditions detailed in your employment contract and company policies. The key details of your offer are as follows:
            </p>

            {/* Salary Box */}
            <div style={styles.salaryBox}>
              <div style={styles.designationRow}>
                <strong>Designation :</strong> {record.position}
              </div>
              
              <table style={styles.salaryTable}>
                <tbody>
                  <tr>
                    <td style={styles.salaryLabel}>Basic Pay</td>
                    <td style={styles.salaryValue}>{record.basic_pay || 15000}</td>
                  </tr>
                  <tr>
                    <td style={styles.salaryLabel}>House Rent Allowance (HRA)</td>
                    <td style={styles.salaryValue}>{record.house_rent_allowance || 8000}</td>
                  </tr>
                  <tr>
                    <td style={styles.salaryLabel}>Incentives against Parameters</td>
                    <td style={styles.salaryValue}>{record.conveyance_earnings || 10000}</td>
                  </tr>
                  <tr style={styles.totalRow}>
                    <td style={styles.salaryLabel}>Total Gross Earnings</td>
                    <td style={styles.salaryValue}>{totalSalary}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Incentives Section */}
            <div style={styles.incentivesSection}>
              <p style={styles.sectionTitle}>Incentives parameters monthly are</p>
              
              <table style={styles.incentivesTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Incentives parameters</th>
                    <th style={styles.tableHeader}>Daily Target</th>
                    <th style={styles.tableHeader}>Monthly Target</th>
                    <th style={styles.tableHeader}>Incentives</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.tableCell}>NO.OF SHOP VISIT</td>
                    <td style={styles.tableCell}>20</td>
                    <td style={styles.tableCell}>500</td>
                    <td style={styles.tableCell}>2,500</td>
                  </tr>
                  <tr>
                    <td style={styles.tableCell}>TOTAL BOXES</td>
                    <td style={styles.tableCell}>55</td>
                    <td style={styles.tableCell}>1375</td>
                    <td style={styles.tableCell}>3,000</td>
                  </tr>
                  <tr>
                    <td style={styles.tableCell}>NEW SHOP</td>
                    <td style={styles.tableCell}>-</td>
                    <td style={styles.tableCell}>10</td>
                    <td style={styles.tableCell}>2,000</td>
                  </tr>
                  <tr>
                    <td style={styles.tableCell}>FOCUS CATAGORY</td>
                    <td style={styles.tableCell}>20</td>
                    <td style={styles.tableCell}>500</td>
                    <td style={styles.tableCell}>2,500</td>
                  </tr>
                </tbody>
              </table>

              <p style={styles.incentiveNote}>Must achieve 70% target to get incentive</p>

              <p style={styles.dearnessTitle}>Dearness Allowance:</p>
              <p style={styles.allowanceText}>
                • Headquarters - ₹100<br />
                • Outstation - ₹1000 ( with stay ₹800+200 ); Without stay - ₹200.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>www.myomega.in  -  email: hr@myomega</p>
          </div>
        </div>

        {/* PAGE 2 */}
        <div style={styles.letterContainer} className="page-break">
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logoSection}>
              <img 
                src="/assets/omega-logo.png" 
                alt="Omega Logo" 
                style={styles.logo}
              />
            </div>
            
            <div style={styles.companySection}>
              <h1 style={styles.companyName}>BASIL ENTERPRISES</h1>
              <p style={styles.companyAddress}>
                Omega Trade centre, Opp City Hospital<br />
                Madrasa road, Tirur - 676101<br />
                Malappuram Dt Kerala, India
              </p>
            </div>
            
            <div style={styles.contactSection}>
              <p style={styles.gstin}>GSTIN : 32AEYPA3249P1ZO</p>
              <p style={styles.contactInfo}>
                Mob | 9961 282 899<br />
                L-L | 0494 242 5702
              </p>
            </div>
          </div>

          {/* Blue Line */}
          <div style={styles.blueLine}></div>

          {/* Letter Body - Page 2 */}
          <div style={styles.letterBody}>
            <ol style={styles.termsList}>
              <li style={styles.termItem}>
                <strong>Company Rules and Regulations:</strong> The Company's rules and regulations are subject to change from time to time. The rules mentioned at present may not be permanent, and updates may be implemented as per management's discretion. All employees are required to comply with the latest policies as communicated by the Company.
              </li>
              <li style={styles.termItem}>
                You are required to adhere to the rules and standards of this office, including behavior, dress code, and punctuality.
              </li>
              <li style={styles.termItem}>
                Salary will be released on 5<sup>th</sup> of every month.
              </li>
              <li style={styles.termItem}>
                If an employee resigns, they must complete the required notice period as per Company policy. Upon successful completion of the notice period, the Company will provide both the final salary and the experience certificate. If the notice period is not completed The final salary will be paid only for the days worked and will be processed at the end of the month If an employee has not completed the notice period but still requests the experience certificate, they must pay an amount equivalent to one month's salary to the Company.
              </li>
              <li style={styles.termItem}>
                <strong>LEAVE AND ATTENDANCE POLICY</strong><br />
                The HR team maintains all records regarding leave and attendance. Monitoring: The Company monitors requests for early leave and late arrivals. Salary Deductions: If late arrival or early leave requests are frequent or continuous, the Company may deduct a half-day or full-salary based on time calculations.
              </li>
              <li style={styles.termItem}>
                <strong>Harassment Policy:</strong> The company has a zero-tolerance policy for abuse, harassment, or misconduct toward any colleague, regardless of gender. Violations of the harassment policy will result in immediate disciplinary action and may include legal proceedings.
              </li>
              <li style={styles.termItem}>
                If the employee resign within 6 months of receiving your uniform, the cost of the uniform will be deducted from your final month's salary.
              </li>
            </ol>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>www.myomega.in  -  email: hr@myomega</p>
          </div>
        </div>

        {/* PAGE 3 */}
        <div style={styles.letterContainer} className="page-break">
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logoSection}>
              <img 
                src="/assets/omega-logo.png" 
                alt="Omega Logo" 
                style={styles.logo}
              />
            </div>
            
            <div style={styles.companySection}>
              <h1 style={styles.companyName}>BASIL ENTERPRISES</h1>
              <p style={styles.companyAddress}>
                Omega Trade centre, Opp City Hospital<br />
                Madrasa road, Tirur - 676101<br />
                Malappuram Dt Kerala, India
              </p>
            </div>
            
            <div style={styles.contactSection}>
              <p style={styles.gstin}>GSTIN : 32AEYPA3249P1ZO</p>
              <p style={styles.contactInfo}>
                Mob | 9961 282 899<br />
                L-L | 0494 242 5702
              </p>
            </div>
          </div>

          {/* Blue Line */}
          <div style={styles.blueLine}></div>

          {/* Letter Body - Page 3 */}
          <div style={styles.letterBody}>
            <ul style={styles.leaveBullets}>
              <li style={styles.bulletItem}>The leave calendar is from April to March of a year.</li>
              <li style={styles.bulletItem}>The organization provides 12 Paid Leaves (PLs) for its regular employees.</li>
              <li style={styles.bulletItem}>Paid Leaves can be taken after the completion of probation period and on confirmation.</li>
              <li style={styles.bulletItem}>3 days per year. Sick leave may be availed on medical grounds with supporting medical certificate. For ESI-covered staff → No statutory sick leave required.</li>
            </ul>

            {/* Acceptance Section */}
            <div style={styles.acceptanceSection}>
              <h3 style={styles.acceptanceTitle}>ACCEPTANCE OF OFFER:</h3>
              <p style={styles.acceptanceText}>
                I, <strong>{record.candidate_name?.toUpperCase()}</strong>, here by accept the above offer of employment with <strong>BASIL ENTERPRISES</strong> under the terms and conditions mentioned in this letter.
              </p>

              <div style={styles.signatureFields}>
                <div style={styles.sigRow}>
                  <span style={styles.sigLabel}>Employee Signature:</span>
                  <div style={styles.sigLine}></div>
                </div>
                <div style={styles.sigRow}>
                  <span style={styles.sigLabel}>Date:</span>
                  <div style={styles.sigLine}></div>
                </div>
              </div>

              {/* Bottom Signatures */}
              <div style={styles.bottomSignatures}>
                <div style={styles.sigBlock}>
                  <div style={styles.sigSpace}></div>
                  <div style={styles.sigName}>HR Manager</div>
                  <div style={styles.sigCompany}>Basil Enterprises</div>
                </div>
                <div style={styles.sigBlock}>
                  <div style={styles.sigSpace}></div>
                  <div style={styles.sigName}>Sales Director</div>
                  <div style={styles.sigCompany}>Basil Enterprises</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>www.myomega.in  -  email: hr@myomega</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }

          .page-break {
            page-break-before: always;
          }
          
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  page: {
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    padding: "20px",
  },
  actionBar: {
    maxWidth: "210mm",
    margin: "0 auto 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#e5e7eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  actionRight: {
    display: "flex",
    gap: "12px",
  },
  editBtn: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  printBtn: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#8b5cf6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    maxWidth: "500px",
    margin: "0 auto",
  },
  loadingText: {
    fontSize: "16px",
    color: "#6b7280",
  },
  errorText: {
    fontSize: "16px",
    color: "#dc2626",
    marginBottom: "20px",
  },
  secondaryBtn: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#e5e7eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  letterContainer: {
    maxWidth: "210mm",
    minHeight: "297mm",
    margin: "0 auto 20px",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "relative",
  },
  // Header Section
  header: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 180px",
    padding: "25px 30px 15px",
    gap: "15px",
    alignItems: "start",
    borderBottom: "1px solid #e5e7eb",
  },
  logoSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logo: {
    width: "90px",
    height: "auto",
    objectFit: "contain",
  },
  companySection: {
    textAlign: "center",
    paddingTop: "5px",
  },
  companyName: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#06b6d4",
    margin: "0 0 8px 0",
    letterSpacing: "3px",
  },
  companyAddress: {
    fontSize: "10px",
    lineHeight: "1.5",
    color: "#374151",
    margin: "0",
  },
  contactSection: {
    textAlign: "right",
    fontSize: "10px",
    paddingTop: "5px",
  },
  gstin: {
    fontWeight: "600",
    marginBottom: "8px",
    color: "#111827",
  },
  contactInfo: {
    lineHeight: "1.6",
    color: "#374151",
  },
  // Blue Line
  blueLine: {
    height: "4px",
    backgroundColor: "#06b6d4",
    width: "100%",
  },
  // Letter Body
  letterBody: {
    padding: "25px 35px 60px",
  },
  toDateSection: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "11px",
  },
  toBlock: {
    lineHeight: "1.6",
  },
  toLabel: {
    margin: "0 0 4px 0",
    fontWeight: "600",
  },
  candidateName: {
    margin: "4px 0 6px 0",
    fontWeight: "600",
    fontSize: "12px",
  },
  dateBlock: {
    fontSize: "11px",
    fontWeight: "600",
  },
  contactDetails: {
    fontSize: "11px",
    marginBottom: "15px",
    lineHeight: "1.6",
  },
  contactDetail: {
    margin: "3px 0",
    color: "#374151",
  },
  subjectLine: {
    marginTop: "8px",
    fontSize: "11px",
  },
  titleSection: {
    textAlign: "center",
    margin: "20px 0",
  },
  letterTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
    margin: "0",
  },
  greeting: {
    margin: "15px 0 12px 0",
    fontWeight: "600",
    fontSize: "11px",
  },
  bodyText: {
    margin: "0 0 12px 0",
    fontSize: "11px",
    lineHeight: "1.6",
    textAlign: "justify",
    color: "#1f2937",
  },
  // Salary Box
  salaryBox: {
    margin: "15px 0 20px 0",
    border: "2px solid #111827",
    padding: "15px",
  },
  designationRow: {
    fontSize: "11px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  salaryTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",
  },
  salaryLabel: {
    padding: "4px 8px",
    border: "1px solid #000",
    fontWeight: "500",
  },
  salaryValue: {
    padding: "4px 8px",
    border: "1px solid #000",
    textAlign: "right",
    fontWeight: "600",
  },
  totalRow: {
    fontWeight: "700",
    backgroundColor: "#f9fafb",
  },
  // Incentives Section
  incentivesSection: {
    margin: "20px 0",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: "600",
    margin: "0 0 5px 0",
  },
  incentivesTable: {
    width: "100%",
    borderCollapse: "collapse",
    margin: "10px 0",
    fontSize: "10px",
  },
  tableHeader: {
    padding: "6px 8px",
    border: "1px solid #000",
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: "#f3f4f6",
  },
  tableCell: {
    padding: "6px 8px",
    border: "1px solid #000",
    textAlign: "center",
  },
  incentiveNote: {
    fontSize: "11px",
    fontWeight: "600",
    margin: "8px 0",
  },
  dearnessTitle: {
    fontSize: "11px",
    fontWeight: "600",
    margin: "15px 0 8px 0",
  },
  allowanceText: {
    fontSize: "11px",
    lineHeight: "1.6",
    marginLeft: "20px",
  },
  // Terms Section
  termsList: {
    margin: "15px 0 15px 18px",
    paddingLeft: "0",
    listStylePosition: "outside",
  },
  termItem: {
    marginBottom: "10px",
    fontSize: "11px",
    lineHeight: "1.6",
    textAlign: "justify",
    color: "#1f2937",
  },
  leaveBullets: {
    margin: "10px 0 10px 20px",
    paddingLeft: "0",
  },
  bulletItem: {
    marginBottom: "8px",
    fontSize: "11px",
    lineHeight: "1.6",
    textAlign: "justify",
  },
  // Acceptance Section
  acceptanceSection: {
    margin: "30px 0 0 0",
    paddingTop: "20px",
  },
  acceptanceTitle: {
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#111827",
  },
  acceptanceText: {
    fontSize: "11px",
    lineHeight: "1.6",
    marginBottom: "20px",
    color: "#1f2937",
  },
  signatureFields: {
    margin: "25px 0 40px 0",
  },
  sigRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "30px",
    fontSize: "11px",
  },
  sigLabel: {
    width: "150px",
    fontWeight: "600",
  },
  sigLine: {
    flex: 1,
    borderBottom: "1px solid #111827",
    height: "1px",
  },
  // Bottom Signatures
  bottomSignatures: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    marginTop: "50px",
  },
  sigBlock: {
    textAlign: "center",
  },
  sigSpace: {
    height: "50px",
    marginBottom: "10px",
  },
  sigName: {
    fontSize: "11px",
    fontWeight: "700",
    marginBottom: "3px",
  },
  sigCompany: {
    fontSize: "11px",
    color: "#4b5563",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    backgroundColor: "#06b6d4",
    padding: "8px 0",
    textAlign: "center",
  },
  footerText: {
    margin: "0",
    color: "white",
    fontSize: "10px",
    fontWeight: "500",
  },
};