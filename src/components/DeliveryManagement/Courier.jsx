/**
 * Courier.jsx
 * Courier expense management module for Delivery Management
 * Allows manual entry of courier financial data with auto-calculated total expense
 */

import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import api from "../../api/client";
import { toast } from "react-toastify";

const FONT = "'Outfit', system-ui, sans-serif";
const fmt = (n) => parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const paymentOptions = [
  { value: "paid", label: "Paid" },
  { value: "credit", label: "Credit" },
];

const buildInitialForm = () => ({
  id: null,
  date: new Date().toISOString().split("T")[0],
  order_placed_by: "",
  customer_name: "",
  customer_address: "",
  customer_phone: "",
  weight_kg: "",
  courier_name: "",
  lr_number: "",
  payment_mode: "paid",
  bill_value: "",
  courier_amount: "",
  no_of_cartons: "",
  total_quantity: "",
  who_prepared: localStorage.getItem("username") || "",
  received_date: "",
});

export default function Courier() {
  const [view, setView] = useState("list");
  const [courierEntries, setCourierEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState(buildInitialForm());

  // List state
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch courier entries
  const fetchCourierEntries = async () => {
    setLoading(true);
    try {
      const response = await api.get("/delivery-management/courier/");
      const data = response.data?.results || response.data;
      setCourierEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch courier entries:", error);
      toast.error("Failed to load courier entries");
      setCourierEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourierEntries();
  }, []);

  // Calculate expense
  const calculateExpense = () => {
    const bill = parseFloat(formData.bill_value || 0);
    const courier = parseFloat(formData.courier_amount || 0);
    return bill + courier;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bill_value || !formData.courier_amount) {
      toast.error("Bill Value and Courier Amount are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        date: formData.date,
        order_placed_by: formData.order_placed_by,
        customer_name: formData.customer_name,
        customer_address: formData.customer_address,
        customer_phone: formData.customer_phone,
        weight_kg: parseFloat(formData.weight_kg || 0),
        courier_name: formData.courier_name,
        lr_number: formData.lr_number,
        payment_mode: formData.payment_mode,
        bill_value: parseFloat(formData.bill_value || 0),
        courier_amount: parseFloat(formData.courier_amount || 0),
        no_of_cartons: parseInt(formData.no_of_cartons || 0, 10),
        total_quantity: parseInt(formData.total_quantity || 0, 10),
        expense: calculateExpense(),
        who_prepared: formData.who_prepared,
        received_date: formData.received_date || null,
      };

      if (formData.id) {
        await api.patch(`/delivery-management/courier/${formData.id}/`, payload);
        toast.success("Courier entry updated successfully!");
      } else {
        await api.post("/delivery-management/courier/", payload);
        toast.success("Courier entry saved successfully!");
      }

      resetForm();
      setView("list");
      fetchCourierEntries();
    } catch (error) {
      console.error("Error saving courier entry:", error);
      toast.error(error?.response?.data?.detail || "Failed to save courier entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await api.delete(`/delivery-management/courier/${id}/`);
        toast.success("Courier entry deleted successfully!");
        fetchCourierEntries();
      } catch (error) {
        console.error("Error deleting courier entry:", error);
        toast.error("Failed to delete courier entry");
      }
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      id: entry.id,
      date: entry.date,
      order_placed_by: entry.order_placed_by || "",
      customer_name: entry.customer_name || "",
      customer_address: entry.customer_address || "",
      customer_phone: entry.customer_phone || "",
      weight_kg: entry.weight_kg?.toString() || "",
      courier_name: entry.courier_name || "",
      lr_number: entry.lr_number || "",
      payment_mode: entry.payment_mode || "paid",
      bill_value: entry.bill_value?.toString() || "",
      courier_amount: entry.courier_amount?.toString() || "",
      no_of_cartons: entry.no_of_cartons?.toString() || "",
      total_quantity: entry.total_quantity?.toString() || "",
      who_prepared: entry.who_prepared || localStorage.getItem("username") || "",
      received_date: entry.received_date || "",
    });
    setView("form");
  };

  const resetForm = () => {
    setFormData(buildInitialForm());
  };

  const getFilteredAndSortedEntries = () => {
    if (!Array.isArray(courierEntries)) return [];

    let filtered = [...courierEntries];

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) =>
        (entry.customer_name || "").toLowerCase().includes(searchLower) ||
        (entry.lr_number || "").toLowerCase().includes(searchLower) ||
        (entry.customer_phone || "").toLowerCase().includes(searchLower)
      );
    }

    if (paymentFilter) {
      filtered = filtered.filter((entry) => entry.payment_mode === paymentFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter((entry) => new Date(entry.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter((entry) => new Date(entry.date) <= new Date(dateTo));
    }

    if (sortBy === "date_desc") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "date_asc") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "expense_desc") {
      filtered.sort((a, b) => parseFloat(b.expense) - parseFloat(a.expense));
    } else if (sortBy === "expense_asc") {
      filtered.sort((a, b) => parseFloat(a.expense) - parseFloat(b.expense));
    }

    return filtered;
  };

  const filteredEntries = getFilteredAndSortedEntries();
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIdx, startIdx + itemsPerPage);

  const totals = filteredEntries.reduce(
    (acc, curr) => {
      acc.shipments += 1;
      acc.bill += parseFloat(curr.bill_value || 0);
      acc.courier += parseFloat(curr.courier_amount || 0);
      acc.expense += parseFloat(curr.expense || 0);
      return acc;
    },
    { shipments: 0, bill: 0, courier: 0, expense: 0 }
  );

  const exportCsv = () => {
    if (!filteredEntries.length) {
      toast.info("No data to export");
      return;
    }
    const headers = [
      "S.No",
      "Sending Date",
      "Order Placed By",
      "Customer Name",
      "Customer Address",
      "Customer Phone",
      "Weight",
      "Courier Name",
      "LR Number",
      "Payment Mode",
      "Bill Value",
      "Courier Amount",
      "No. of Cartons",
      "Total Quantity",
      "Expense",
      "Who Prepared",
      "Received Date",
    ];

    const rows = filteredEntries.map((entry, index) => [
      index + 1,
      entry.date || "",
      entry.order_placed_by || "",
      entry.customer_name || "",
      (entry.customer_address || "").replace(/\n/g, " "),
      entry.customer_phone || "",
      entry.weight_kg || "",
      entry.courier_name || "",
      entry.lr_number || "",
      entry.payment_mode || "",
      entry.bill_value || "",
      entry.courier_amount || "",
      entry.no_of_cartons || "",
      entry.total_quantity || "",
      entry.expense || "",
      entry.who_prepared || "",
      entry.received_date || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `courier_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (view === "form") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.headerIcon}>🚚</span>
            <h2 style={styles.cardTitle}>{formData.id ? "Edit Courier Entry" : "Add Courier Entry"}</h2>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.sectionTitle}>Basic Details</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📅</span> Sending Date
              </label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Order Placed By</label>
              <input type="text" name="order_placed_by" value={formData.order_placed_by} onChange={handleInputChange} style={styles.input} placeholder="Enter name" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Customer Name</label>
              <input type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} style={styles.input} placeholder="Customer name" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Customer Phone</label>
              <input type="tel" name="customer_phone" value={formData.customer_phone} onChange={handleInputChange} style={styles.input} placeholder="Phone number" />
            </div>

            <div style={styles.formGroupFull}>
              <label style={styles.label}>Customer Address</label>
              <textarea
                name="customer_address"
                value={formData.customer_address}
                onChange={handleInputChange}
                style={styles.textarea}
                rows={3}
                placeholder="Customer address"
              />
            </div>

            <div style={styles.sectionTitle}>Shipment Details</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Weight of the Carton (Kg)</label>
              <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleInputChange} style={styles.input} min="0" step="0.01" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Courier Name</label>
              <input type="text" name="courier_name" value={formData.courier_name} onChange={handleInputChange} style={styles.input} placeholder="Courier partner" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>LR Number / Tracking ID</label>
              <input type="text" name="lr_number" value={formData.lr_number} onChange={handleInputChange} style={styles.input} placeholder="LR / Tracking ID" />
            </div>

            <div style={styles.sectionTitle}>Payment Details</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bill Value (₹)</label>
              <input type="number" name="bill_value" value={formData.bill_value} onChange={handleInputChange} style={styles.input} step="0.01" min="0" required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Mode</label>
              <select name="payment_mode" value={formData.payment_mode} onChange={handleInputChange} style={styles.select}>
                {paymentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Courier Amount (₹)</label>
              <input type="number" name="courier_amount" value={formData.courier_amount} onChange={handleInputChange} style={styles.input} step="0.01" min="0" required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Expense (₹) - Auto</label>
              <div style={styles.expenseDisplay}>
                <span style={styles.expenseValue}>{fmt(calculateExpense())}</span>
              </div>
            </div>

            <div style={styles.sectionTitle}>Quantity Details</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>No. of Cartons</label>
              <input type="number" name="no_of_cartons" value={formData.no_of_cartons} onChange={handleInputChange} style={styles.input} min="0" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Total Quantity</label>
              <input type="number" name="total_quantity" value={formData.total_quantity} onChange={handleInputChange} style={styles.input} min="0" />
            </div>

            <div style={styles.sectionTitle}>Additional</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Who Prepared</label>
              <input type="text" name="who_prepared" value={formData.who_prepared} onChange={handleInputChange} style={styles.input} placeholder="Prepared by" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Received Date</label>
              <input type="date" name="received_date" value={formData.received_date} onChange={handleInputChange} style={styles.input} />
            </div>

            <div style={styles.formActions}>
              <button type="button" onClick={() => { setView("list"); resetForm(); }} style={{ ...styles.button, ...styles.buttonSecondary }}>
                Cancel
              </button>
              <button type="button" onClick={resetForm} style={{ ...styles.button, ...styles.buttonSecondary }}>
                Reset
              </button>
              <button type="submit" disabled={submitting} style={{ ...styles.button, ...styles.buttonPrimary, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Saving..." : formData.id ? "Update Entry" : "Save Courier Entry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.pageTitle}>📦 Courier Management</h1>
          <p style={styles.pageSubtitle}>Capture dispatch details and expenses</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={exportCsv} style={{ ...styles.button, ...styles.buttonSecondary }}>
            <FileDown size={16} style={{ marginRight: 6 }} /> Export CSV
          </button>
          <button
            onClick={() => { resetForm(); setView("form"); }}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Plus size={18} style={{ marginRight: 8 }} /> Add Courier Entry
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Shipments</div>
          <div style={styles.summaryValue}>{totals.shipments}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Bill Value</div>
          <div style={styles.summaryValue}>₹ {fmt(totals.bill)}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Courier Amount</div>
          <div style={styles.summaryValue}>₹ {fmt(totals.courier)}</div>
        </div>
        <div style={styles.summaryCardAccent}>
          <div style={styles.summaryLabel}>Total Expense</div>
          <div style={styles.summaryValue}>₹ {fmt(totals.expense)}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterSection}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, alignItems: "end" }}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search (name / LR / phone)</label>
            <div style={styles.searchBox}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by customer, LR, phone"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Payment Mode</label>
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }} style={styles.select}>
              <option value="">All</option>
              {paymentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} style={styles.input} />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date To</label>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} style={styles.input} />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Sort By</label>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} style={styles.select}>
              <option value="date_desc">Latest Date</option>
              <option value="date_asc">Oldest Date</option>
              <option value="expense_desc">Highest Expense</option>
              <option value="expense_asc">Lowest Expense</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.resultInfo}>
        Showing {paginatedEntries.length > 0 ? startIdx + 1 : 0} to {Math.min(startIdx + itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
      </div>

      <div style={styles.tableWrapper}>
        {loading ? (
          <div style={styles.loadingMessage}>Loading...</div>
        ) : paginatedEntries.length === 0 ? (
          <div style={styles.emptyMessage}>
            {filteredEntries.length === 0 && searchQuery ? "No entries found matching your search" : "No courier entries yet. Click 'Add Courier Entry' to get started."}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>S.No</th>
                <th style={styles.tableHeader}>Sending Date</th>
                <th style={styles.tableHeader}>Order Placed By</th>
                <th style={styles.tableHeader}>Customer Name</th>
                <th style={styles.tableHeader}>Weight (Kg)</th>
                <th style={styles.tableHeader}>Courier Name</th>
                <th style={styles.tableHeader}>LR Number</th>
                <th style={styles.tableHeader}>Bill Value (₹)</th>
                <th style={styles.tableHeader}>Payment Mode</th>
                <th style={styles.tableHeader}>Courier Amount (₹)</th>
                <th style={styles.tableHeader}>No. of Cartons</th>
                <th style={styles.tableHeader}>Total Quantity</th>
                <th style={styles.tableHeader}>Expense (₹)</th>
                <th style={styles.tableHeader}>Who Prepared</th>
                <th style={styles.tableHeader}>Customer Phone</th>
                <th style={styles.tableHeader}>Received Date</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.map((entry, idx) => (
                <tr key={entry.id} style={{ ...styles.tableRow, backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                  <td style={styles.tableCell}>{startIdx + idx + 1}</td>
                  <td style={styles.tableCell}>{entry.date}</td>
                  <td style={styles.tableCell}>{entry.order_placed_by || "—"}</td>
                  <td style={styles.tableCell}>{entry.customer_name || "—"}</td>
                  <td style={styles.tableCell}>{entry.weight_kg || "—"}</td>
                  <td style={styles.tableCell}>{entry.courier_name || "—"}</td>
                  <td style={styles.tableCell}>{entry.lr_number || "—"}</td>
                  <td style={styles.tableCell}>{fmt(entry.bill_value)}</td>
                  <td style={styles.tableCell}>
                    <span style={{ ...styles.badge, ...(entry.payment_mode === 'credit' ? styles.badgeWarning : styles.badgeSuccess) }}>
                      {entry.payment_mode ? entry.payment_mode.toUpperCase() : '—'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{fmt(entry.courier_amount)}</td>
                  <td style={styles.tableCell}>{entry.no_of_cartons ?? '—'}</td>
                  <td style={styles.tableCell}>{entry.total_quantity ?? '—'}</td>
                  <td style={{ ...styles.tableCell, ...styles.expenseCell }}>{fmt(entry.expense)}</td>
                  <td style={styles.tableCell}>{entry.who_prepared || "—"}</td>
                  <td style={styles.tableCell}>{entry.customer_phone || "—"}</td>
                  <td style={styles.tableCell}>{entry.received_date || "—"}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button onClick={() => handleEdit(entry)} style={{ ...styles.actionButton, ...styles.editButton }} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} style={{ ...styles.actionButton, ...styles.deleteButton }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ ...styles.paginationButton, opacity: currentPage === 1 ? 0.5 : 1 }}>
            <ChevronLeft size={16} />
          </button>
          <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={{ ...styles.paginationButton, opacity: currentPage === totalPages ? 0.5 : 1 }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = {
  container: { minHeight: "100vh", padding: "24px", backgroundColor: "#f3f4f6", fontFamily: FONT },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "16px", flexWrap: "wrap" },
  headerContent: { flex: 1 },
  pageTitle: { fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" },
  pageSubtitle: { fontSize: "14px", color: "#6b7280", margin: 0 },
  button: { padding: "10px 16px", fontSize: "14px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, transition: "all 0.2s ease" },
  buttonPrimary: { backgroundColor: "#ef4444", color: "#ffffff", boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)" },
  buttonSecondary: { backgroundColor: "#f8fafc", color: "#0f172a", border: "1px solid #e2e8f0" },
  card: { backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", overflow: "hidden", marginBottom: "24px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", backgroundColor: "#ef4444", color: "#ffffff" },
  headerIcon: { fontSize: "24px" },
  cardTitle: { fontSize: "18px", fontWeight: "600", margin: 0 },
  form: { padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" },
  sectionTitle: { gridColumn: "1 / -1", fontSize: "13px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px" },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  formGroupFull: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 },
  label: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: 2 },
  labelIcon: { fontSize: "16px" },
  input: { padding: "10px 12px", fontSize: "14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontFamily: FONT, color: "#0f172a", outline: "none", transition: "border-color 0.2s ease" },
  textarea: { padding: "10px 12px", fontSize: "14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontFamily: FONT, color: "#0f172a", resize: "vertical", outline: "none" },
  select: { padding: "10px 12px", fontSize: "14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontFamily: FONT, color: "#0f172a", backgroundColor: "#ffffff", outline: "none", cursor: "pointer" },
  expenseDisplay: { padding: "10px 12px", fontSize: "14px", backgroundColor: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "8px", color: "#166534", fontWeight: "600", display: "flex", alignItems: "center" },
  expenseValue: { fontSize: "16px", fontWeight: "700" },
  formActions: { gridColumn: "1 / -1", display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "12px", borderTop: "1px solid #e5e7eb" },
  filterSection: { backgroundColor: "#ffffff", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  filterLabel: { fontSize: "12px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" },
  searchBox: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#ffffff" },
  searchIcon: { color: "#9ca3af" },
  searchInput: { border: "none", outline: "none", fontSize: "14px", flex: 1, fontFamily: FONT, color: "#0f172a", backgroundColor: "transparent" },
  resultInfo: { fontSize: "13px", color: "#6b7280", marginBottom: "12px", padding: "0 4px" },
  tableWrapper: { backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", overflowX: "auto", marginBottom: "24px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  tableHeaderRow: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e5e7eb" },
  tableHeader: { padding: "10px 12px", textAlign: "left", fontWeight: "700", color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap" },
  tableRow: { borderBottom: "1px solid #e5e7eb" },
  tableCell: { padding: "10px 12px", color: "#0f172a", whiteSpace: "nowrap" },
  expenseCell: { fontWeight: "700", color: "#166534", backgroundColor: "rgba(240, 253, 244, 0.5)" },
  badge: { padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center" },
  badgeSuccess: { backgroundColor: "#ecfdf3", color: "#166534", border: "1px solid #bbf7d0" },
  badgeWarning: { backgroundColor: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" },
  actionButtons: { display: "flex", gap: "8px" },
  actionButton: { padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" },
  editButton: { color: "#0f172a", border: "1px solid #e5e7eb" },
  deleteButton: { color: "#dc2626", border: "1px solid #fecaca" },
  loadingMessage: { padding: "40px 24px", textAlign: "center", color: "#9ca3af" },
  emptyMessage: { padding: "40px 24px", textAlign: "center", color: "#9ca3af" },
  pagination: { display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" },
  paginationButton: { padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, transition: "all 0.2s ease" },
  pageInfo: { fontSize: "14px", color: "#374151", fontWeight: "600" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" },
  summaryCard: { backgroundColor: "#ffffff", padding: "14px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  summaryCardAccent: { backgroundColor: "#fff1f2", padding: "14px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #fecdd3" },
  summaryLabel: { fontSize: "12px", color: "#6b7280", marginBottom: "6px", fontWeight: "700", letterSpacing: "0.3px" },
  summaryValue: { fontSize: "18px", fontWeight: "700", color: "#0f172a" },
};
