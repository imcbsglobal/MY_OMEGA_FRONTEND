// OfferLetter_View.jsx - UPDATED VERSION WITH ASSET LOGO
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
    (Number(record.dearness_allowance) || 0) +
    (Number(record.house_rent_allowance) || 0) +
    (Number(record.special_allowance) || 0) +
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

        {/* Letter Container */}
        <div style={styles.letterContainer}>
          {/* Header with Logo and Company Info */}
          <div style={styles.header}>
            <div style={styles.logoSection}>
              <img 
                src="/assets/omega-logo.png" 
                alt="Omega Logo" 
                style={styles.logo}
                onError={(e) => {
                  // Fallback to SVG if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <svg width="75" height="75" viewBox="0 0 100 100" style={{ display: 'none' }}>
                <circle cx="50" cy="50" r="48" fill="#dc2626" />
                <text x="50" y="58" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="bold" fill="white" textAnchor="middle">Ω</text>
                <text x="50" y="78" fontFamily="Arial, sans-serif" fontSize="12" fontStyle="italic" fill="white" textAnchor="middle">omega</text>
              </svg>
            </div>
            
            <div style={styles.companySection}>
              <h1 style={styles.companyName}>BASIL ENTERPRISES</h1>
              <p style={styles.companyAddress}>
                Omega Trade centre, Opp City Hospital<br />
                Mukkam road, Thiruvambady<br />
                Kozhikode DT Kerala, India - 676101
              </p>
            </div>
            
            <div style={styles.contactSection}>
              <p style={styles.gstInfo}>GSTIN: 32AEYPA3249P1Z0</p>
              <p style={styles.contactInfo}>
                Mob: 9961 282 899<br />
                L-L: 0494 242 5702
              </p>
            </div>
          </div>

          {/* Blue Separator Bar */}
          <div style={styles.blueLine}></div>

          {/* Letter Body */}
          <div style={styles.letterBody}>
            {/* To and Date Section */}
            <div style={styles.toDateSection}>
              <div style={styles.toBlock}>
                <p style={styles.toLabel}>To</p>
                <p style={styles.candidateName}>Mr. {record.candidate_name}</p>
                <p style={styles.contactDetail}>Ph: {record.candidate_phone || "+91 9744735456"}</p>
                <p style={styles.contactDetail}>Email: {record.candidate_email || "bxs95@gmail.com"}</p>
                <p style={styles.subjectLine}>
                  <strong>Subject:</strong> Offer of Employment for the Position of {record.position}
                </p>
              </div>
              <div style={styles.dateBlock}>
                {formatDate(new Date())}
              </div>
            </div>

            {/* Greeting and Introduction */}
            <div style={styles.contentSection}>
              <p style={styles.greeting}>Dear {record.candidate_name?.split(' ')[0]?.toUpperCase() || 'CANDIDATE'},</p>
              
              <p style={styles.bodyText}>
                We are pleased to offer you employment with Basil Enterprises for the position of <strong>{record.position}</strong> in our {record.department} Department. Your skills and experience are a valuable addition to our team.
              </p>

              <p style={styles.bodyText}>
                Your appointment will be governed by the terms and conditions detailed in your employment contract and company policies. The key details of your offer are as follows:
              </p>

              {/* Position and Salary Box */}
              <div style={styles.offerBox}>
                <p style={styles.positionLine}>
                  • •  <strong>Position:</strong> {record.position}
                </p>

                <table style={styles.salaryTable}>
                  <tbody>
                    <tr>
                      <td style={styles.salaryLabel}>Basic Pay</td>
                      <td style={styles.salaryAmount}>{record.basic_pay || 20000}</td>
                    </tr>
                    <tr>
                      <td style={styles.salaryLabel}>Dearness Allowance (DA)</td>
                      <td style={styles.salaryAmount}>{record.dearness_allowance || 6000}</td>
                    </tr>
                    <tr>
                      <td style={styles.salaryLabel}>House Rent Allowance (HRA)</td>
                      <td style={styles.salaryAmount}>{record.house_rent_allowance || 8000}</td>
                    </tr>
                    <tr>
                      <td style={styles.salaryLabel}>Conveyance Allowance</td>
                      <td style={styles.salaryAmount}>{record.conveyance_earnings || 4000}</td>
                    </tr>
                    <tr>
                      <td style={styles.salaryLabel}>Special Allowance</td>
                      <td style={styles.salaryAmount}>{record.special_allowance || 2000}</td>
                    </tr>
                    <tr>
                      <td style={styles.totalLabel}>Total Gross Earnings</td>
                      <td style={styles.totalAmount}>{totalSalary}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms and Conditions - Numbered List */}
              <ol style={styles.termsList}>
                <li style={styles.termItem}>
                  <strong>Probation Period:</strong> You will be on probation for a period of six (6) months from your date of joining.
                </li>
                <li style={styles.termItem}>
                  <strong>Working Hours:</strong> As per company norms
                </li>
                <li style={styles.termItem}>
                  The leave calendar is from April to March of a year.
                </li>
                <li style={styles.termItem}>
                  The organization provides 12 Paid Leaves (PL) for its regular employees.
                </li>
                <li style={styles.termItem}>
                  Paid Leaves can be taken after the completion of probation period and on confirmation.
                </li>
                <li style={styles.termItem}>
                  3 days per year; sick leave may be availed on medical grounds with supporting medical certificate. For ESI-covered staff → no statutory sick leave required.
                </li>
                <li style={styles.termItem}>
                  <strong>Proposed Joining Date:</strong> You are requested to confirm joining date within 5 days from the date of this offer letter.
                </li>
              </ol>

              <p style={styles.bodyText}>
                We look forward to your positive response and to welcoming you to our team.
              </p>

              <p style={styles.bodyText}>
                Please sign and return a copy of this letter to indicate your acceptance of this offer.
              </p>

              {/* Signature Section */}
              <div style={styles.signatureArea}>
                <div style={styles.signatureLeft}>
                  <p style={styles.regardsText}>Yours sincerely,</p>
                  <div style={styles.signatureLine}></div>
                  <p style={styles.signatureName}>For Basil Enterprises</p>
                  <p style={styles.signatureRole}>HR Department</p>
                </div>

                <div style={styles.signatureRight}>
                  <p style={styles.acceptText}>I accept the above terms and conditions</p>
                  <div style={styles.signatureLine}></div>
                  <p style={styles.signatureName}>{record.candidate_name}</p>
                  <p style={styles.signatureRole}>Date: ______________</p>
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
    margin: "0 auto",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "relative",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "90px 1fr 150px",
    padding: "20px 30px 15px",
    gap: "15px",
    alignItems: "start",
  },
  logoSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "75px",
    height: "75px",
    objectFit: "contain",
  },
  companySection: {
    textAlign: "center",
  },
  companyName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0ea5e9",
    margin: "0 0 6px 0",
    letterSpacing: "2.5px",
  },
  companyAddress: {
    fontSize: "10px",
    lineHeight: "1.4",
    color: "#374151",
    margin: 0,
  },
  contactSection: {
    textAlign: "right",
  },
  gstInfo: {
    fontSize: "9.5px",
    margin: "0 0 6px 0",
    color: "#374151",
    fontWeight: "500",
  },
  contactInfo: {
    fontSize: "10.5px",
    lineHeight: "1.5",
    color: "#374151",
    margin: 0,
  },
  blueLine: {
    height: "5px",
    backgroundColor: "#0ea5e9",
    width: "100%",
  },
  letterBody: {
    padding: "25px 35px 50px",
  },
  toDateSection: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid #d1d5db",
  },
  toBlock: {
    fontSize: "11px",
  },
  toLabel: {
    margin: "0 0 4px 0",
    fontWeight: "600",
    color: "#111827",
  },
  candidateName: {
    margin: "4px 0 6px 0",
    fontWeight: "600",
    fontSize: "12px",
    color: "#111827",
  },
  contactDetail: {
    margin: "2px 0",
    color: "#4b5563",
  },
  subjectLine: {
    margin: "10px 0 0 0",
    fontSize: "11px",
    lineHeight: "1.5",
  },
  dateBlock: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#111827",
  },
  contentSection: {
    fontSize: "11px",
    lineHeight: "1.6",
    color: "#1f2937",
  },
  greeting: {
    margin: "0 0 12px 0",
    fontWeight: "600",
    fontSize: "11.5px",
  },
  bodyText: {
    margin: "0 0 12px 0",
    textAlign: "justify",
  },
  offerBox: {
    border: "2px solid #111827",
    padding: "14px",
    margin: "15px 0 18px",
    backgroundColor: "#fafafa",
  },
  positionLine: {
    margin: "0 0 10px 0",
    fontSize: "11.5px",
  },
  salaryTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  salaryLabel: {
    padding: "4px 6px",
    fontSize: "10.5px",
    borderBottom: "1px solid #d1d5db",
    textAlign: "left",
  },
  salaryAmount: {
    padding: "4px 6px",
    fontSize: "10.5px",
    borderBottom: "1px solid #d1d5db",
    textAlign: "right",
    fontWeight: "500",
  },
  totalLabel: {
    padding: "6px 6px",
    fontSize: "11px",
    fontWeight: "700",
    borderTop: "2px solid #111827",
    backgroundColor: "#f3f4f6",
  },
  totalAmount: {
    padding: "6px 6px",
    fontSize: "11px",
    fontWeight: "700",
    textAlign: "right",
    borderTop: "2px solid #111827",
    backgroundColor: "#f3f4f6",
  },
  termsList: {
    margin: "15px 0",
    paddingLeft: "20px",
  },
  termItem: {
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  signatureArea: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    marginTop: "40px",
  },
  signatureLeft: {
    textAlign: "left",
  },
  signatureRight: {
    textAlign: "left",
  },
  regardsText: {
    margin: "0 0 30px 0",
    fontSize: "11px",
  },
  acceptText: {
    margin: "0 0 30px 0",
    fontSize: "11px",
    fontWeight: "600",
  },
  signatureLine: {
    borderBottom: "1px solid #111827",
    width: "170px",
    marginBottom: "5px",
  },
  signatureName: {
    margin: "0 0 3px 0",
    fontWeight: "600",
    fontSize: "11.5px",
    color: "#111827",
  },
  signatureRole: {
    margin: 0,
    fontSize: "10px",
    color: "#6b7280",
  },
  footer: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    backgroundColor: "#0ea5e9",
    padding: "7px 0",
    textAlign: "center",
  },
  footerText: {
    margin: 0,
    color: "white",
    fontSize: "10px",
    fontWeight: "500",
  },
};