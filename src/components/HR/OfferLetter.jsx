import React, { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, Download } from "lucide-react";

// Import your API client - adjust the path as needed
import api from "../../api/client";

export default function OfferLetter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/offer-letter/");
      const data = res?.data?.data || [];

      const mapped = data.map((it) => ({
        id: it.id,
        name: it.candidate_name,
        position: it.position,
        department: it.department,
        salary: it.salary,
        phone: it.candidate_phone,
        email: it.candidate_email,
        pdf: it.pdf_file,
        cv: it.candidate_cv,
        body: it.body,
        joining: it.joining_data,
        notice: it.notice_period,
        basicPay: it.basic_pay || Math.round(it.salary * 0.5),
        da: it.dearness_allowance || Math.round(it.salary * 0.15),
        hra: it.hra || Math.round(it.salary * 0.2),
        conveyance: it.conveyance_allowance || Math.round(it.salary * 0.1),
        specialAllowance: it.special_allowance || Math.round(it.salary * 0.05),
        probation: it.probation_months || 6,
        paidLeaves: it.paid_leaves || 12,
        sickLeaves: it.sick_leaves || 3
      }));

      setItems(mapped);
    } catch (err) {
      console.error("Error loading offer letters:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const generateOfferPDF = (item) => {
    // Load jsPDF dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);

      // Header with company name in RED
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38); // Red color
      doc.text("OMEGA", pageWidth / 2, 20, { align: "center" });
      doc.setTextColor(0, 0, 0); // Reset to black
      
      // Decorative line
      doc.setLineWidth(0.5);
      doc.line(margin, 25, pageWidth - margin, 25);

      // Date
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const today = new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      doc.text(`To ${today}`, margin, 35);

      // Candidate details
      let yPos = 45;
      doc.text(`Mr. ${item.name}`, margin, yPos);
      yPos += 6;
      doc.text(`Ph: ${item.phone}`, margin, yPos);
      yPos += 6;
      doc.text(`Gmail: ${item.email}`, margin, yPos);

      // Subject
      yPos += 12;
      doc.setFont("helvetica", "bold");
      doc.text(`Subject: Offer of Employment - ${item.position}`, margin, yPos);

      // Salutation
      yPos += 10;
      doc.setFont("helvetica", "normal");
      const firstName = item.name.split(' ')[0];
      doc.text(`Dear ${firstName},`, margin, yPos);

      // Body paragraph
      yPos += 10;
      const bodySplit = doc.splitTextToSize(item.body, contentWidth);
      doc.text(bodySplit, margin, yPos);
      yPos += (bodySplit.length * 6) + 8;

      const governanceText = "Your appointment will be governed by the terms and conditions detailed in your employment contract and company policies. The key details of your offer are as follows:";
      const govSplit = doc.splitTextToSize(governanceText, contentWidth);
      doc.text(govSplit, margin, yPos);
      yPos += (govSplit.length * 6) + 8;

      // Position
      doc.setFont("helvetica", "bold");
      doc.text(`Position: ${item.position}`, margin, yPos);
      yPos += 10;

      // Salary breakdown table
      doc.setFontSize(11);
      const tableData = [
        ["Basic Pay", `${item.basicPay}`],
        ["Dearness Allowance (DA)", `${item.da}`],
        ["House Rent Allowance (HRA)", `${item.hra}`],
        ["Conveyance Allowance", `${item.conveyance}`],
        ["Special Allowance", `${item.specialAllowance}`],
      ];

      // Draw table
      const cellHeight = 8;
      const col1Width = 120;
      const col2Width = 40;
      
      doc.setFont("helvetica", "normal");
      tableData.forEach(([label, value]) => {
        doc.rect(margin, yPos, col1Width, cellHeight);
        doc.rect(margin + col1Width, yPos, col2Width, cellHeight);
        doc.text(label, margin + 2, yPos + 5.5);
        doc.text(value, margin + col1Width + 2, yPos + 5.5);
        yPos += cellHeight;
      });

      // Total
      doc.setFont("helvetica", "bold");
      doc.rect(margin, yPos, col1Width, cellHeight);
      doc.rect(margin + col1Width, yPos, col2Width, cellHeight);
      doc.text("Total Gross Earnings", margin + 2, yPos + 5.5);
      doc.text(`${item.salary}`, margin + col1Width + 2, yPos + 5.5);
      yPos += cellHeight + 10;

      // Check if new page needed
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }

      // Terms and conditions
      doc.setFont("helvetica", "normal");
      const terms = [
        `1. Probation Period: You will be on probation for a period of ${item.probation} months from your date of joining.`,
        `2. Working Hours: As per company norms`,
        `   - The leave calendar is from April to March of a year.`,
        `   - The organization provides ${item.paidLeaves} Paid Leaves (PLs) for its regular employees.`,
        `   - Paid Leaves can be taken after the completion of probation period and on confirmation.`,
        `   - ${item.sickLeaves} days per year. Sick leave may be availed on medical grounds with supporting medical certificate. For ESI-covered staff → No statutory sick leave required.`,
      ];

      terms.forEach(term => {
        const termSplit = doc.splitTextToSize(term, contentWidth);
        if (yPos + (termSplit.length * 6) > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(termSplit, margin, yPos);
        yPos += (termSplit.length * 6) + 3;
      });

      // Joining date
      yPos += 5;
      doc.setFont("helvetica", "bold");
      const joiningDate = new Date(item.joining).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const joiningText = `Proposed Joining Date: You are requested to confirm joining date within 6 days from ${joiningDate}`;
      const joiningSplit = doc.splitTextToSize(joiningText, contentWidth);
      doc.text(joiningSplit, margin, yPos);
      yPos += (joiningSplit.length * 6) + 10;

      // Check if footer fits on current page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      // Footer
      doc.setFont("helvetica", "normal");
      doc.text("We look forward to welcoming you to our team.", margin, yPos);
      yPos += 10;
      doc.text("Yours sincerely,", margin, yPos);
      yPos += 15;
      doc.setFont("helvetica", "bold");
      doc.text("HR Department", margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      doc.text("OMEGA", margin, yPos);

      // Save PDF
      doc.save(`${item.name.replace(/\s+/g, '_')}_OfferLetter.pdf`);
    };
    
    script.onerror = () => {
      console.error("Failed to load jsPDF library");
      alert("Failed to load PDF library. Please try again.");
    };
    
    // Check if jsPDF is already loaded
    if (window.jspdf) {
      script.onload();
    } else {
      document.head.appendChild(script);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/offer-letter/${id}/`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const filtered = items.filter((it) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (it.name || "").toLowerCase().includes(q) ||
      (it.position || "").toLowerCase().includes(q) ||
      (it.department || "").toLowerCase().includes(q) ||
      (it.phone || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [search]);

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: "center", paddingTop: "100px" }}>
        <div style={styles.loader}></div>
        <p style={{ fontSize: "18px", color: "#6b7280", marginTop: "20px" }}>
          Loading offer letter data...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Offer Letter Management</h2>

        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, position, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>

          <button
            style={styles.addButton}
            onClick={() => alert("Navigate to: /offer-letter/add")}
          >
            + Add New
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>SL NO</th>
              <th style={styles.tableHeader}>NAME</th>
              <th style={styles.tableHeader}>POSITION</th>
              <th style={styles.tableHeader}>CV</th>
              <th style={styles.tableHeader}>DEPARTMENT</th>
              <th style={styles.tableHeader}>SALARY</th>
              <th style={styles.tableHeader}>PHONE</th>
              <th style={styles.tableHeader}>GENERATE</th>
              <th style={{ ...styles.tableHeader, textAlign: "center", width: "120px" }}>
                ACTION
              </th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan="9" style={styles.noResults}>
                  {search
                    ? `No results for "${search}"`
                    : "No offer letter records found"}
                </td>
              </tr>
            ) : (
              pageItems.map((item, index) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{startIndex + index + 1}</td>
                  <td style={styles.tableCell}>{item.name}</td>
                  <td style={styles.tableCell}>{item.position}</td>
                  <td style={styles.tableCell}>
                    {item.cv ? (
                      <button
                        style={styles.viewCvBtn}
                        onClick={() => window.open(item.cv, "_blank")}
                      >
                        View CV
                      </button>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>N/A</span>
                    )}
                  </td>
                  <td style={styles.tableCell}>{item.department}</td>
                  <td style={styles.tableCell}>₹ {item.salary.toLocaleString()}</td>
                  <td style={styles.tableCell}>{item.phone || "N/A"}</td>
                  <td style={styles.tableCell}>
                    <button
                      style={styles.generateBtn}
                      onClick={() => generateOfferPDF(item)}
                      title="Generate PDF"
                    >
                      <Download size={14} style={{ marginRight: "6px" }} />
                      Generate
                    </button>
                  </td>

                  <td style={styles.actionCell}>
                    <div style={styles.iconActions}>
                      <button
                        title="View"
                        onClick={() => alert(`Navigate to: /offer-letter/view/${item.id}`)}
                        style={styles.iconBtn}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title="Edit"
                        onClick={() => alert(`Navigate to: /offer-letter/edit/${item.id}`)}
                        style={styles.iconBtn}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        title="Delete"
                        onClick={() => handleDelete(item.id)}
                        style={{ ...styles.iconBtn, color: "#dc2626" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.paginationContainer}>
        <span style={styles.paginationInfo}>
          Showing {pageItems.length ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + itemsPerPage, filtered.length)} of{" "}
          {filtered.length} entries
        </span>
        <div style={styles.paginationButtons}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === 1 ? styles.paginationBtnDisabled : {}),
            }}
          >
            Prev
          </button>
          <div style={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    ...styles.pageNumberBtn,
                    ...(pageNum === currentPage
                      ? styles.pageNumberBtnActive
                      : {}),
                  }}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === totalPages
                ? styles.paginationBtnDisabled
                : {}),
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  loader: {
    width: "50px",
    height: "50px",
    border: "5px solid #e5e7eb",
    borderTop: "5px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    padding: "12px 40px 12px 16px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    width: "320px",
    transition: "all 0.3s",
    fontWeight: "500",
    color: "#374151",
  },
  searchIcon: {
    position: "absolute",
    right: "14px",
    fontSize: "18px",
    pointerEvents: "none",
    color: "#9ca3af",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  addButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    backgroundColor: "#f3f4f6",
  },
  tableHeader: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  tableCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
  },
  actionCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    textAlign: "center",
    width: "120px",
  },
  viewCvBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  generateBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#2563eb",
    backgroundColor: "#dbeafe",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    padding: "16px 24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    flexWrap: "wrap",
    gap: "16px",
  },
  paginationInfo: {
    fontSize: "14px",
    color: "#6b7280",
  },
  paginationButtons: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  paginationBtn: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  paginationBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  pageNumberBtn: {
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "40px",
  },
  pageNumberBtnActive: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
  iconActions: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    transition: "color 0.2s",
  },
};