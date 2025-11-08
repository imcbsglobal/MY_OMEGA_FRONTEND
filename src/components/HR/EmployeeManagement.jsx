import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeManagement() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 25;

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    try {
      const storedData = localStorage.getItem('employee-management-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        setEmployees(data);
      } else {
        const initialData = [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@omega.com",
            location: "Kochi",
            personalPhone: "9876543210",
            residentialPhone: "0484-2345678",
            jobTitle: "Software Engineer",
            dutyTime: "9:00 AM - 6:00 PM",
            joiningDate: "2024-01-15",
            bankAccount: "1234567890",
            bankDetails: "SBI, Kochi Branch",
            aadharUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            aadharFileName: "john_aadhar.pdf",
            createdUser: "myomega@gmail.com",
            createdDate: "21/10/2025, 09:45 AM",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane.smith@omega.com",
            location: "Trivandrum",
            personalPhone: "9123456780",
            residentialPhone: "0471-2345678",
            jobTitle: "Product Manager",
            dutyTime: "10:00 AM - 7:00 PM",
            joiningDate: "2024-03-20",
            bankAccount: "0987654321",
            bankDetails: "HDFC Bank, Trivandrum Branch",
            aadharUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            aadharFileName: "jane_aadhar.pdf",
            createdUser: "myomega@gmail.com",
            createdDate: "23/10/2025, 03:20 PM",
          },
        ];
        localStorage.setItem('employee-management-data', JSON.stringify(initialData));
        setEmployees(initialData);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    navigate('/employee-management/add');
  };

  const handleEditClick = (employee) => {
    navigate(`/employee-management/edit/${employee.id}`);
  };

  const handleViewClick = (employee) => {
    navigate(`/employee-management/view/${employee.id}`);
  };

  const handleViewAadharClick = (aadharUrl, aadharFileName) => {
    if (aadharUrl) {
      window.open(aadharUrl, "_blank");
    } else {
      alert("No Aadhar document available");
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this employee record?")) {
      const updatedEmployees = employees.filter(employee => employee.id !== id);
      setEmployees(updatedEmployees);
      localStorage.setItem('employee-management-data', JSON.stringify(updatedEmployees));
    }
  };

  const filteredEmployees = employees.filter(employee => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      employee.name?.toLowerCase().includes(query) ||
      employee.email?.toLowerCase().includes(query) ||
      employee.location?.toLowerCase().includes(query) ||
      employee.personalPhone?.includes(query) ||
      employee.residentialPhone?.includes(query) ||
      employee.jobTitle?.toLowerCase().includes(query) ||
      employee.dutyTime?.toLowerCase().includes(query) ||
      employee.bankAccount?.includes(query) ||
      employee.bankDetails?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading employee data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Employee Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, email, phone, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <button onClick={handleAddNewClick} style={styles.addButton}>
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
              <th style={styles.tableHeader}>EMAIL</th>
              <th style={styles.tableHeader}>LOCATION</th>
              <th style={styles.tableHeader}>PERSONAL PHONE</th>
              <th style={styles.tableHeader}>RESIDENTIAL PHONE</th>
              <th style={styles.tableHeader}>JOB TITLE</th>
              <th style={styles.tableHeader}>DUTY TIME</th>
              <th style={styles.tableHeader}>JOINING DATE</th>
              <th style={styles.tableHeader}>BANK ACCOUNT</th>
              <th style={styles.tableHeader}>BANK DETAILS</th>
              <th style={styles.tableHeader}>AADHAR</th>
              <th style={styles.tableHeader}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length === 0 ? (
              <tr>
                <td colSpan="13" style={styles.noResults}>
                  {searchQuery ? `No results found for "${searchQuery}"` : "No employee records available"}
                </td>
              </tr>
            ) : (
              currentEmployees.map((employee, index) => (
                <tr key={employee.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{startIndex + index + 1}</td>
                  <td style={styles.tableCell}>{employee.name}</td>
                  <td style={styles.tableCell}>{employee.email}</td>
                  <td style={styles.tableCell}>{employee.location || "N/A"}</td>
                  <td style={styles.tableCell}>{employee.personalPhone || "N/A"}</td>
                  <td style={styles.tableCell}>{employee.residentialPhone || "N/A"}</td>
                  <td style={styles.tableCell}>{employee.jobTitle || "N/A"}</td>
                  <td style={styles.tableCell}>{employee.dutyTime || "N/A"}</td>
                  <td style={styles.tableCell}>{employee.joiningDate || "N/A"}</td>
                  <td style={styles.tableCell}>{employee.bankAccount || "N/A"}</td>
                  <td style={styles.tableCell}>{employee.bankDetails || "N/A"}</td>
                  <td style={styles.tableCell}>
                    <button 
                      style={styles.viewCvBtn}
                      onClick={() => handleViewAadharClick(employee.aadharUrl, employee.aadharFileName)}
                    >
                      📄 View Aadhar
                    </button>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button onClick={() => handleViewClick(employee)} style={styles.viewBtn}>View</button>
                      <button onClick={() => handleEditClick(employee)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDeleteClick(employee.id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.paginationContainer}>
        <div style={styles.paginationInfo}>
          Showing {filteredEmployees.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
          {searchQuery && <span style={styles.searchIndicator}> (filtered from {employees.length} total)</span>}
        </div>
        <div style={styles.paginationButtons}>
          <button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
            style={{...styles.paginationBtn, ...(currentPage === 1 ? styles.paginationBtnDisabled : {})}}
          >
            Previous
          </button>
          
          <div style={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    style={{
                      ...styles.pageNumberBtn,
                      ...(pageNum === currentPage ? styles.pageNumberBtnActive : {})
                    }}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} style={styles.pageEllipsis}>...</span>;
              }
              return null;
            })}
          </div>

          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            style={{...styles.paginationBtn, ...(currentPage === totalPages ? styles.paginationBtnDisabled : {})}}
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
  searchIndicator: {
    color: "#6b7280",
    fontStyle: "italic",
    fontSize: "13px",
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
    overflow: "hidden",
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
  actionButtons: {
    display: "flex",
    gap: "6px",
  },
  viewBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#059669",
    backgroundColor: "#d1fae5",
    border: "1px solid #a7f3d0",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  editBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#dbeafe",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
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
  pageEllipsis: {
    padding: "8px 4px",
    color: "#9ca3af",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};