// Employee_View.jsx
// Show exact backend fields (no renaming). Safe rendering if some fields missing.

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function EmployeeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/employee-management/employees/${id}/`);
      setEmployee(res.data || {});
    } catch (err) {
      console.error("load employee:", err);
      alert("Failed to load employee");
      navigate("/employee-management");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (!employee) return <div style={{ padding: 20 }}>No data</div>;

  // Helper to safely show primitive values or JSON string for objects
  const show = (v) => {
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "object") return <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(v, null, 2)}</pre>;
    return String(v);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.name}>{employee.full_name ?? employee.user_name ?? "—"}</h2>
            <div style={styles.meta}>{employee.employee_id ?? employee.user_email ?? ""}</div>
            <div style={styles.status}>{String(employee.is_active ?? "")}</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate(`/employee-management/edit/${employee.id}`)} style={styles.btn}>
              Edit
            </button>
            <button onClick={() => navigate("/employee-management")} style={styles.btnAlt}>
              Back
            </button>
          </div>
        </div>

        {/* Job Info (exact keys) */}
        <Section title="Job Information">
          <Row label="employment_status" value={show(employee.employment_status ?? employee.job_info?.employment_status)} />
          <Row label="employment_type" value={show(employee.employment_type ?? employee.job_info?.employment_type)} />
          <Row label="department" value={show(employee.department ?? employee.job_info?.department)} />
          <Row label="designation" value={show(employee.designation ?? employee.job_info?.designation)} />
          <Row label="reporting_manager" value={show(employee.reporting_manager ?? employee.job_info?.reporting_manager)} />
          <Row label="date_of_joining" value={show(employee.date_of_joining ?? employee.job_info?.date_of_joining)} />
          <Row label="date_of_leaving" value={show(employee.date_of_leaving ?? employee.job_info?.date_of_leaving)} />
          <Row label="probation_end_date" value={show(employee.probation_end_date ?? employee.job_info?.probation_end_date)} />
          <Row label="confirmation_date" value={show(employee.confirmation_date ?? employee.job_info?.confirmation_date)} />
          <Row label="basic_salary" value={show(employee.basic_salary ?? employee.job_info?.basic_salary)} />
          <Row label="allowances" value={show(employee.allowances ?? employee.job_info?.allowances)} />
          <Row label="gross_salary" value={show(employee.gross_salary ?? employee.job_info?.gross_salary)} />
          <Row label="location" value={show(employee.location ?? employee.job_info?.location)} />
          <Row label="work_location" value={show(employee.work_location ?? employee.job_info?.work_location)} />
          <Row label="duty_time" value={show(employee.duty_time ?? employee.job_info?.duty_time)} />
        </Section>

        {/* Contact Info */}
        <Section title="Contact Details">
          <Row label="personal_phone" value={show(employee.personal_phone)} />
          <Row label="residential_phone" value={show(employee.residential_phone)} />
          <Row label="emergency_contact_name" value={show(employee.contact_info?.emergency_contact_name)} />
          <Row label="emergency_contact_phone" value={show(employee.contact_info?.emergency_contact_phone)} />
          <Row label="emergency_contact_relation" value={show(employee.contact_info?.emergency_contact_relation)} />
        </Section>

        {/* Bank Info */}
        <Section title="Bank Details">
          <Row label="account_holder_name" value={show(employee.bank_info?.account_holder_name)} />
          <Row label="salary_account_number" value={show(employee.bank_info?.salary_account_number)} />
          <Row label="salary_bank_name" value={show(employee.bank_info?.salary_bank_name)} />
          <Row label="salary_ifsc_code" value={show(employee.bank_info?.salary_ifsc_code)} />
          <Row label="salary_branch" value={show(employee.bank_info?.salary_branch)} />
          <Row label="pf_number" value={show(employee.pf_number)} />
          <Row label="esi_number" value={show(employee.esi_number)} />
          <Row label="pan_number" value={show(employee.pan_number)} />
          <Row label="aadhar_number" value={show(employee.aadhar_number)} />
        </Section>

        {/* Other */}
        <Section title="Other">
          <Row label="blood_group" value={show(employee.blood_group)} />
          <Row label="marital_status" value={show(employee.marital_status)} />
          <Row label="notes" value={show(employee.notes)} />
          <Row label="is_active" value={show(employee.is_active)} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles = {
  page: { padding: 20, background: "#fff", minHeight: "100vh" },
  card: { border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  name: { margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" },
  meta: { color: "#6b7280" },
  status: { marginTop: 6, color: "#059669", fontWeight: 700 },
  btn: { padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff" },
  btnAlt: { padding: "8px 12px", borderRadius: 6, background: "#f3f4f6", border: "1px solid #e5e7eb" },

  section: { marginTop: 14, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fbfdff" },
  sectionTitle: { fontWeight: 700, color: "#374151", marginBottom: 8 },
  row: { display: "flex", gap: 12, padding: "6px 0", alignItems: "flex-start" },
  label: { width: 240, color: "#6b7280", fontSize: 13, fontWeight: 600 },
  value: { color: "#374151", fontSize: 14, flex: 1 },
};
