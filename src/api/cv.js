// src/api/cv.js
import api from "./client";

// ---- Map UI -> API ----
export function toApiPayload(ui, fileIfAny) {
  // Gender mapper
  const mapGender = (g) => {
    if (!g) return "O";
    const v = g.toLowerCase();
    if (v.startsWith("m")) return "M";
    if (v.startsWith("f")) return "F";
    return "O";
  };

  // ✅ Convert DOB to YYYY-MM-DD
  const normalizeDob = (dob) => {
    if (!dob) return "";
    const parts = dob.split("-");
    if (parts.length === 3) {
      const [a, b, c] = parts;
      // If already YYYY-MM-DD
      if (Number(a) > 31) return dob;
      // Convert DD-MM-YYYY → YYYY-MM-DD
      return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
    }
    return dob;
  };

  const form = new FormData();

  if (ui.name) form.append("name", ui.name);
  if (ui.gender) form.append("gender", mapGender(ui.gender));
  if (ui.dob) form.append("dob", normalizeDob(ui.dob));
  if (ui.jobTitleId != null) form.append("job_title", String(ui.jobTitleId));
  if (ui.place) form.append("place", ui.place);
  if (ui.district) form.append("district", ui.district);
  if (ui.education) form.append("education", ui.education);
  if (ui.experience) form.append("experience", ui.experience);
  if (ui.email) form.append("email", ui.email);
  if (ui.phoneNumber) form.append("phone_number", ui.phoneNumber);
  if (ui.address) form.append("address", ui.address);

  form.append("cv_source", ui.cvSource || "Direct");

  // ✅ FORCE DEFAULT STATUS ON CREATE
  form.append("interview_status", "pending");

  if (ui.remarks) form.append("remarks", ui.remarks);
  if (fileIfAny) form.append("cv_file", fileIfAny);

  console.log("toApiPayload form data:", [...form.entries()]);
  return form;
}

// ---- Map API -> UI ----
export function toUi(cv) {
  return {
    uuid: cv.id || cv.uuid,
    name: cv.name || "",
    gender:
      cv.gender === "M"
        ? "Male"
        : cv.gender === "F"
        ? "Female"
        : "Other",
    dob: cv.dob || "",
    jobTitleId: cv.job_title ?? null,
    jobTitle: cv.job_title_name ?? cv.job_title ?? "",
    place: cv.place || "",
    district: cv.district || "",
    education: cv.education || "",
    experience: cv.experience || "",
    email: cv.email || "",
    phoneNumber: cv.phone_number || "",
    address: cv.address || "",
    cvAttachmentUrl: cv.cv_file || "",
    cvFileName: cv.cv_file ? cv.cv_file.split("/").pop() : "",
    cvSource: cv.cv_source || "Direct",

    // ✅ Always fallback to pending
    interviewStatus: cv.interview_status || "pending",

    remarks: cv.remarks || "",
    createdUser: cv.created_by || "",
    createdDate: cv.created_at || "",
    updated_at: cv.updated_at || "",
  };
}

// ---- API Calls ----
export const CV = {
  list: async () => {
    const r = await api.get("/cv-management/cvs/");
    return r.data.data;
  },

  get: async (uuid) => {
    const r = await api.get(`/cv-management/cvs/${uuid}/`);
    return r.data.data;
  },

  // ✅ CREATE (multipart)
  create: async (formData) => {
    const r = await api.post("/cv-management/cvs/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data.data;
  },

  // ✅ PATCH for PARTIAL updates (status change)
  update: async (uuid, data, isMultipart = false) => {
    const r = await api.patch(`/cv-management/cvs/${uuid}/`, data, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    return r.data.data;
  },

  remove: async (uuid) => {
    const r = await api.delete(`/cv-management/cvs/${uuid}/`);
    return r.data;
  },

  jobTitles: async () => {
    const r = await api.get("/cv-management/job-titles/");
    return r.data.data || r.data;
  },
};
