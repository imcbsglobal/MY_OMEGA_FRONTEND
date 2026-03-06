import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import api from "../../api/client";

const PRIMARY      = "#f87171";
const PRIMARY_DARK = "#ef4444";

function WarehouseTabs() {
const navigate     = useNavigate();
const { pathname } = useLocation();
const user    = JSON.parse(localStorage.getItem("user") || "{}");
const level   = user?.user_level || "User";
const isAdmin = level === "Admin" || level === "Super Admin" || user?.is_staff || user?.is_superuser;

const tabs = [
{ label: "My Tasks", icon: "🛡",  path: "/warehouse/mytasks" },
...(isAdmin ? [
{ label: "Monitor",  icon: "📊", path: "/warehouse/admin" },
{ label: "Assign",   icon: "📋", path: "/warehouse/assign" },
{ label: "Report",   icon: "📄", path: "/warehouse/duty-report" },
] : []),
];

return (
<div style={{
display: "flex",
border: "1px solid #e5e7eb",
borderRadius: 10,
overflow: "hidden",
marginBottom: 20,
background: "#fff",
boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
width: "100%",
}}>
{tabs.map((t, i) => {
const active = pathname === t.path;
return (
<button
key={t.path}
onClick={() => navigate(t.path)}
style={{
flex: 1,
padding: "10px 0",
fontSize: 13,
fontWeight: 500,
display: "flex",
alignItems: "center",
justifyContent: "center",
gap: 6,
background: active ? "#fff" : "#f9fafb",
color: active ? "#111827" : "#9ca3af",
borderRight: i < tabs.length - 1 ? "1px solid #e5e7eb" : "none",
border: "none",
cursor: "pointer",
borderBottom: active ? `2px solid ${PRIMARY}` : "2px solid transparent",
transition: "all 0.15s",
fontFamily: "inherit",
}}
>
<span>{t.icon}</span> {t.label}
</button>
);
})}
</div>
);
}

const MONTHS = [
"January","February","March","April","May","June",
"July","August","September","October","November","December",
];

function fmtDate(dateStr) {
if (!dateStr) return "";
const [y, m, d] = dateStr.split("-");
return `${d}/${m}/${y}`;
}

export default function WarehouseDutyReport() {
const currentYear  = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const [employees, setEmployees] = useState([]);
const [selectedUser, setSelectedUser] = useState("");
const [year,  setYear]  = useState(String(currentYear));
const [month, setMonth] = useState(String(currentMonth));
const [rows,  setRows]  = useState([]);
const [loading, setLoading] = useState(false);
const [userName, setUserName] = useState("");

const printRef = useRef(null);

useEffect(() => {
api.get("/warehouse/employees/")
.then(r => setEmployees(r.data))
.catch(() => toast.error("Failed to load employees"));
}, []);

useEffect(() => {
const emp = employees.find(e => String(e.id) === String(selectedUser));
setUserName(emp?.name || "");
}, [selectedUser, employees]);

function fetchReport() {
if (!selectedUser) { toast.warning("Please select an employee"); return; }
setLoading(true);
api.get("/warehouse/duty-report/", { params: { user_id: selectedUser, year, month } })
.then(r => setRows(r.data))
.catch(() => toast.error("Failed to load report"))
.finally(() => setLoading(false));
}

function exportExcel() {
if (!rows.length) { toast.warning("No data to export"); return; }

const title     = `DAILY WARE HOUSE DUTIES - ${userName.toUpperCase()}`;
const subtitle  = `${MONTHS[Number(month) - 1]} ${year}`;
const headers   = ["DATE", "SLNO", "DUTIES"];

const wsData = [
[title],
[subtitle],
[],
headers,
...rows.map(r => [fmtDate(r.date), r.slno, r.task_title]),
];

const ws = XLSX.utils.aoa_to_sheet(wsData);
ws["!merges"] = [
{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
{ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
];
ws["!cols"] = [{ wch: 14 }, { wch: 6 }, { wch: 60 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Duty Report");
XLSX.writeFile(wb, `Warehouse_Duty_Report_${userName}_${MONTHS[Number(month)-1]}_${year}.xlsx`);
}

function handlePrint() {
	if (!rows.length) { toast.warning("No data to print"); return; }
	const printContents = printRef.current?.innerHTML;
	if (!printContents) { toast.error("Print area not found"); return; }
	const printWindow = window.open('', '', 'height=600,width=800');
	printWindow.document.write('<html><head><title>Print</title>');
	printWindow.document.write('<style>body{margin:0;font-family:inherit;}@media print{body>*{display:none!important}.warehouse-print-area,.warehouse-print-area *{display:revert!important}.warehouse-print-area{box-shadow:none!important;border-radius:0!important;position:fixed;top:0;left:0;right:0;bottom:0;overflow:visible!important;background:#fff;z-index:99999;}@page{margin:15mm;}}</style>');
	printWindow.document.write('</head><body>');
	printWindow.document.write('<div class="warehouse-print-area">' + printContents + '</div>');
	printWindow.document.write('</body></html>');
	printWindow.document.close();
	printWindow.focus();
	setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}

const displayRows = rows.map((r, idx) => ({
...r,
showDate: idx === 0 || rows[idx - 1].date !== r.date,
rowSpan: rows.filter(x => x.date === r.date).length,
}));

return (
<div style={{ padding: "20px", fontFamily: "inherit" }}>
<WarehouseTabs />

<div style={{
background: "#fff",
borderRadius: 12,
padding: "20px 24px",
boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
marginBottom: 24,
}}>
<h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
📄 Daily Warehouse Duty Report
</h2>

<div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
<div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200 }}>
<label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Employee</label>
<select
value={selectedUser}
onChange={e => setSelectedUser(e.target.value)}
style={{
padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db",
fontSize: 13, background: "#fff", cursor: "pointer",
}}
>
<option value="">— Select Employee —</option>
{employees.map(e => (
<option key={e.id} value={e.id}>{e.name}</option>
))}
</select>
</div>

<div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
<label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Month</label>
<select
value={month}
onChange={e => setMonth(e.target.value)}
style={{
padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db",
fontSize: 13, background: "#fff", cursor: "pointer",
}}
>
{MONTHS.map((m, i) => (
<option key={i+1} value={String(i+1)}>{m}</option>
))}
</select>
</div>

<div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 100 }}>
<label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Year</label>
<select
value={year}
onChange={e => setYear(e.target.value)}
style={{
padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db",
fontSize: 13, background: "#fff", cursor: "pointer",
}}
>
{[currentYear - 1, currentYear, currentYear + 1].map(y => (
<option key={y} value={String(y)}>{y}</option>
))}
</select>
</div>

<button
onClick={fetchReport}
disabled={loading}
style={{
padding: "9px 22px", borderRadius: 8, border: "none",
background: PRIMARY, color: "#fff", fontWeight: 600,
fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
opacity: loading ? 0.7 : 1,
}}
>
{loading ? "Loading..." : "Generate"}
</button>

{rows.length > 0 && (
<button
onClick={exportExcel}
style={{
padding: "9px 22px", borderRadius: 8, border: "none",
background: "#16a34a", color: "#fff", fontWeight: 600,
fontSize: 13, cursor: "pointer",
}}
>
Export Excel
</button>
)}

{rows.length > 0 && (
<button
onClick={handlePrint}
style={{
padding: "9px 22px", borderRadius: 8, border: "none",
background: "#2563eb", color: "#fff", fontWeight: 600,
fontSize: 13, cursor: "pointer",
}}
>
Print
</button>
)}
</div>
</div>

{rows.length > 0 && (
<div
ref={printRef}
style={{
background: "#fff",
borderRadius: 12,
boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
overflow: "hidden",
}}
className="warehouse-print-area"
>
<div style={{
textAlign: "center",
padding: "18px 24px 10px",
borderBottom: "2px solid #e5e7eb",
}}>
<h3 style={{
margin: 0,
fontSize: 16,
fontWeight: 800,
letterSpacing: 1,
textTransform: "uppercase",
color: "#111827",
}}>
Daily Ware House Duties {userName && ("— " + userName)}
</h3>
<p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
{MONTHS[Number(month) - 1]} {year}
</p>
</div>

<div style={{ overflowX: "auto" }}>
<table style={{
width: "100%",
borderCollapse: "collapse",
fontSize: 13,
}}>
<thead>
<tr style={{ background: "#f87171" }}>
{["DATE", "SLNO", "DUTIES"].map(h => (
<th key={h} style={{
padding: "10px 16px",
textAlign: h === "SLNO" ? "center" : "left",
color: "#fff",
fontWeight: 700,
fontSize: 13,
letterSpacing: 0.5,
whiteSpace: "nowrap",
}}>
{h}
</th>
))}
</tr>
</thead>
<tbody>
{displayRows.map((r, idx) => (
<tr
key={r.id}
style={{
background: idx % 2 === 0 ? "#fff" : "#fafafa",
borderBottom: "1px solid #f3f4f6",
}}
>
<td style={{
padding: "8px 16px",
fontWeight: r.showDate ? 600 : 400,
color: r.showDate ? "#111827" : "transparent",
whiteSpace: "nowrap",
verticalAlign: "top",
borderRight: "1px solid #e5e7eb",
userSelect: r.showDate ? "auto" : "none",
}}>
{r.showDate ? fmtDate(r.date) : ""}
</td>
<td style={{
padding: "8px 16px",
textAlign: "center",
color: "#374151",
fontWeight: 500,
borderRight: "1px solid #e5e7eb",
}}>
{r.slno}
</td>
<td style={{
padding: "8px 16px",
color: "#374151",
}}>
{r.task_title}
</td>
</tr>
))}
</tbody>
</table>
</div>

<div style={{
padding: "10px 24px",
borderTop: "1px solid #e5e7eb",
fontSize: 12,
color: "#9ca3af",
textAlign: "right",
}}>
Total entries: {rows.length}
</div>
</div>
)}

{!loading && rows.length === 0 && selectedUser && (
<div style={{
textAlign: "center", padding: "48px 24px",
background: "#fff", borderRadius: 12,
boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
color: "#9ca3af", fontSize: 14,
}}>
No duty records found for the selected period.
</div>
)}

<style>{`
@media print {
body > * { display: none !important; }
.warehouse-print-area,
.warehouse-print-area * { display: revert !important; }
.warehouse-print-area {
box-shadow: none !important;
border-radius: 0 !important;
position: fixed;
top: 0; left: 0; right: 0; bottom: 0;
overflow: visible !important;
background: #fff;
z-index: 99999;
}
@page { margin: 15mm; }
}
`}</style>
</div>
);
}
