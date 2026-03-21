// src/components/VehicleManagement/TravelReport.jsx
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import api from "../../api/client";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function fmtTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
}

function StatusBadge({ status }) {
  const map = {
    started:   { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c" },
    completed: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
    approved:  { bg: "#eff6ff", border: "#bfdbfe", text: "#2563eb" },
    rejected:  { bg: "#fff1f2", border: "#fecaca", text: "#ef4444" },
  };
  const s = map[status?.toLowerCase()] || map.started;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.text,
      textTransform: "capitalize",
    }}>
      {status || "—"}
    </span>
  );
}

export default function TravelReport() {
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [year,  setYear]  = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const printRef = useRef(null);
  const [vehicleMasterSearch, setVehicleMasterSearch] = useState("");
  const [vehicleMaster, setVehicleMaster] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // { id, registration_number, vehicle_name }

  // load employees from warehouse employees API (active employees)
  useEffect(() => {
    api.get("/employee-management/employees/?page_size=500")
      .then(r => setEmployees(r.data.results || r.data || []))
      .catch(() => toast.error("Failed to load employees"));
  }, []);

  useEffect(() => {
    const emp = employees.find(e => String(e.id) === String(selectedUser));
    setUserName(emp?.full_name || emp?.name || "");
  }, [selectedUser, employees]);

  // Fetch vehicle master list from backend
  useEffect(() => {
    api.get("/vehicle-management/vehicles/")
      .then(r => setVehicleMaster(r.data))
      .catch(() => toast.error("Failed to load vehicle master list"));
  }, []);

  function fetchReport() {
    if (!selectedVehicle && !selectedUser) {
      toast.warning("Please select an employee or search by vehicle");
      return;
    }
    setLoading(true);

    // Build date range for selected month/year
    const y = Number(year);
    const m = Number(month);
    const startDate = `${y}-${String(m).padStart(2,"0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2,"0")}-${String(lastDay).padStart(2,"0")}`;

    const params = { start_date: startDate, end_date: endDate };
    if (selectedVehicle) {
      params.vehicle = selectedVehicle.id;
    } else {
      params.employee = selectedUser;
    }

    api.get("/vehicle-management/trips/", { params })
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
        // sort by date asc
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setTrips(data);
        if (data.length === 0) toast.info("No trips found for this period.");
      })
      .catch(() => toast.error("Failed to load trip report"))
      .finally(() => setLoading(false));
  }

  function exportExcel() {
    if (!trips.length) { toast.warning("No data to export"); return; }

    const title    = `TRAVEL MANAGEMENT REPORT - ${userName.toUpperCase()}`;
    const subtitle = `${MONTHS[Number(month) - 1]} ${year}`;
    const headers  = ["#","DATE","VEHICLE","TRAVELED BY","CLIENT & PURPOSE","ROUTE","START TIME","END TIME","ODO START","ODO END","DISTANCE (KM)","FUEL COST (₹)","STATUS"];

    const wsData = [
      [title],
      [subtitle],
      [],
      headers,
      ...trips.map((t, i) => [
        i + 1,
        fmtDate(t.date),
        `${t.vehicle_info?.registration_number || ""}${t.vehicle_info?.vehicle_name ? "\n" + t.vehicle_info.vehicle_name : ""}`,
        t.employee_info?.full_name || t.employee_info?.email || "—",
        `${t.client_name || ""}${t.purpose ? " / " + t.purpose : ""}`,
        t.route || "—",
        t.start_time ? fmtTime(t.start_time) : "—",
        t.end_time   ? fmtTime(t.end_time)   : "—",
        t.odometer_start ?? "—",
        t.odometer_end   ?? "—",
        t.distance_km    ?? "—",
        t.fuel_cost ? `₹${parseFloat(t.fuel_cost).toFixed(2)}` : "₹0.00",
        t.status || "—",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    ];
    ws["!cols"] = [
      { wch: 4 }, { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 28 }, { wch: 24 },
      { wch: 11 }, { wch: 11 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Travel Report");
    XLSX.writeFile(wb, `Travel_Report_${userName}_${MONTHS[Number(month)-1]}_${year}.xlsx`);
  }

  function handlePrint() {
    if (!trips.length) { toast.warning("No data to print"); return; }
    window.print();
  }

  // Normalize vehicle master list (API can return array or paginated object)
  const vehicleMasterList = Array.isArray(vehicleMaster)
    ? vehicleMaster
    : (vehicleMaster?.results || []);

  // Summary stats
  const totalDistance  = trips.reduce((s, t) => s + (parseFloat(t.distance_km)  || 0), 0);
  const totalFuelCost  = trips.reduce((s, t) => s + (parseFloat(t.fuel_cost)     || 0), 0);
  const completedTrips = trips.filter(t => t.status === "completed" || t.status === "approved").length;

  return (
    <div style={{ padding: "20px", fontFamily: "inherit" }}>

      {/* ── Filter Card ── */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        marginBottom: 24,
      }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
          🚗 Travel Management Report
        </h2>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Employee — hidden when a vehicle is selected */}
          {!selectedVehicle && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200 }}>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Employee</label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, background: "#fff", cursor: "pointer" }}
              >
                <option value="">— Select Employee —</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.full_name || e.name || e.employee_id || e.id}</option>
                ))}
              </select>
            </div>
          )}

          {/* Month */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
            <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Month</label>
            <select
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, background: "#fff", cursor: "pointer" }}
            >
              {MONTHS.map((m, i) => (
                <option key={i+1} value={String(i+1)}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 100 }}>
            <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Year</label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, background: "#fff", cursor: "pointer" }}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Master Search — hidden when an employee is selected */}
          {!selectedUser && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200, position: "relative" }}>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Vehicle Search</label>
              {selectedVehicle ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #10b981", background: "#f0fdf4", fontSize: 13 }}>
                  <span style={{ flex: 1 }}><strong>{selectedVehicle.registration_number}</strong> — {selectedVehicle.vehicle_name}</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedVehicle(null); setVehicleMasterSearch(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontWeight: 700, fontSize: 16, lineHeight: 1 }}
                    title="Clear vehicle"
                  >×</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={vehicleMasterSearch}
                    onChange={e => setVehicleMasterSearch(e.target.value)}
                    placeholder="Type reg. no or name…"
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, background: "#fff" }}
                  />
                  {vehicleMasterSearch && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: "auto", zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                      {vehicleMasterList.filter(v =>
                        v.registration_number.toLowerCase().includes(vehicleMasterSearch.toLowerCase()) ||
                        v.vehicle_name.toLowerCase().includes(vehicleMasterSearch.toLowerCase())
                      ).map(v => (
                        <div
                          key={v.id}
                          onClick={() => { setSelectedVehicle(v); setVehicleMasterSearch(""); }}
                          style={{ padding: "8px 12px", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                          onMouseLeave={e => e.currentTarget.style.background = ""}
                        >
                          <strong>{v.registration_number}</strong> — {v.vehicle_name}
                        </div>
                      ))}
                      {vehicleMasterList.filter(v =>
                        v.registration_number.toLowerCase().includes(vehicleMasterSearch.toLowerCase()) ||
                        v.vehicle_name.toLowerCase().includes(vehicleMasterSearch.toLowerCase())
                      ).length === 0 && (
                        <div style={{ padding: "8px 12px", color: "#9ca3af" }}>No vehicles found</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <button
            onClick={fetchReport}
            disabled={loading}
            style={{
              padding: "9px 22px", borderRadius: 8, border: "none",
              background: "#10b981", color: "#fff", fontWeight: 600,
              fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Loading…" : "Generate"}
          </button>

          {trips.length > 0 && (
            <button
              onClick={exportExcel}
              style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              ⬇ Export Excel
            </button>
          )}

          {trips.length > 0 && (
            <button
              onClick={handlePrint}
              style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              🖨 Print
            </button>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {trips.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }} className="no-print">
          {[
            { label: "Total Trips",      value: trips.length,                    color: "#2563eb", icon: "🚗" },
            { label: "Completed",        value: completedTrips,                  color: "#16a34a", icon: "✅" },
            { label: "Total Distance",   value: `${totalDistance.toFixed(2)} km`,color: "#7c3aed", icon: "📍" },
            { label: "Total Fuel Cost",  value: `₹${totalFuelCost.toFixed(2)}`,  color: "#ea580c", icon: "⛽" },
          ].map(c => (
            <div key={c.label} style={{
              background: "#fff", borderRadius: 10, padding: "14px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)", minWidth: 140, flex: 1,
              borderLeft: `4px solid ${c.color}`,
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Report Table ── */}
      {trips.length > 0 && (
        <div
          ref={printRef}
          style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}
          className="travel-print-area"
        >
          {/* Report header (print only shows this) */}
          <div style={{ textAlign: "center", padding: "18px 24px 10px", borderBottom: "2px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#111827" }}>
              Travel Management Report {userName && `— ${userName}`}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
              {MONTHS[Number(month) - 1]} {year}
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#10b981" }}>
                  {["#","VEHICLE","TRAVELED BY","CLIENT & PURPOSE","ROUTE","DATE","START TIME","END TIME","ODO START","ODO END","DISTANCE (KM)","FUEL COST","STATUS"].map(h => (
                    <th key={h} style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: 0.4,
                      whiteSpace: "nowrap",
                      borderRight: "1px solid rgba(255,255,255,0.15)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trips.map((t, idx) => (
                  <tr key={t.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={td}>{idx + 1}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{t.vehicle_info?.registration_number || "—"}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{t.vehicle_info?.vehicle_name || ""}</div>
                    </td>
                    <td style={td}>{t.employee_info?.full_name || t.employee_info?.email || "—"}</td>
                    <td style={{ ...td, maxWidth: 180 }}>
                      <div style={{ fontWeight: 500 }}>{t.client_name || "—"}</div>
                      {t.purpose && <div style={{ fontSize: 11, color: "#6b7280" }}>{t.purpose}</div>}
                    </td>
                    <td style={{ ...td, maxWidth: 180, color: "#374151" }}>{t.route || "—"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtDate(t.date)}</td>
                    <td style={{ ...td, whiteSpace: "nowrap", color: "#2563eb", fontWeight: 500 }}>{t.start_time ? fmtTime(t.start_time) : "—"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap", color: "#2563eb", fontWeight: 500 }}>{t.end_time   ? fmtTime(t.end_time)   : "—"}</td>
                    <td style={td}>{t.odometer_start != null ? Number(t.odometer_start).toFixed(2) : "—"}</td>
                    <td style={td}>{t.odometer_end   != null ? Number(t.odometer_end).toFixed(2)   : "—"}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{t.distance_km != null ? Number(t.distance_km).toFixed(2) : "—"}</td>
                    <td style={{ ...td, fontWeight: 600 }}>₹{parseFloat(t.fuel_cost || 0).toFixed(2)}</td>
                    <td style={td}><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr style={{ background: "#f0fdf4", borderTop: "2px solid #bbf7d0" }}>
                  <td colSpan={10} style={{ ...td, fontWeight: 700, textAlign: "right", color: "#111827" }}>Totals:</td>
                  <td style={{ ...td, fontWeight: 700, color: "#7c3aed" }}>{totalDistance.toFixed(2)}</td>
                  <td style={{ ...td, fontWeight: 700, color: "#ea580c" }}>₹{totalFuelCost.toFixed(2)}</td>
                  <td style={td}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ padding: "10px 24px", borderTop: "1px solid #e5e7eb", fontSize: 12, color: "#9ca3af", textAlign: "right" }}>
            Total records: {trips.length}
          </div>
        </div>
      )}

      {!loading && trips.length === 0 && selectedUser && (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", color: "#9ca3af", fontSize: 14 }}>
          No trips found for the selected period.
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .travel-print-area,
          .travel-print-area * { display: revert !important; }
          .travel-print-area {
            box-shadow: none !important;
            border-radius: 0 !important;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            overflow: visible !important;
            background: #fff;
            z-index: 99999;
          }
          .no-print { display: none !important; }
          @page { margin: 10mm; size: landscape; }
        }
      `}</style>
    </div>
  );
}

const td = {
  padding: "8px 12px",
  color: "#374151",
  verticalAlign: "top",
  borderRight: "1px solid #f3f4f6",
};