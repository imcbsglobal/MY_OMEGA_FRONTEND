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

  // ✅ Correct Interview Status mapper
  const mapStatus = (s) => {
    if (!s) return "pending";
    const v = s.toLowerCase();
    if (v.startsWith("p")) return "pending";
    if (v.startsWith("o") || v.startsWith("sch")) return "ongoing";
    if (v.startsWith("s") || v.startsWith("comp")) return "selected";
    if (v.startsWith("r")) return "rejected";
    return "pending";
  };

  // ✅ Convert DOB to YYYY-MM-DD
  const normalizeDob = (dob) => {
    if (!dob) return "";
    const parts = dob.split("-");
    if (parts.length === 3) {
      const [a, b, c] = parts;
      // if first part > 31 → it's already in YYYY-MM-DD format
      if (Number(a) > 31) return dob;
      // else convert DD-MM-YYYY → YYYY-MM-DD
      return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
    }
    return dob;
  };

  const form = new FormData();
  if (ui.name) form.append("name", ui.name);
  if (ui.gender) form.append("gender", mapGender(ui.gender));
  if (ui.dob) form.append("dob", normalizeDob(ui.dob)); // ✅ fixed here
  if (ui.jobTitleId != null) form.append("job_title", String(ui.jobTitleId));
  if (ui.place) form.append("place", ui.place);
  if (ui.district) form.append("district", ui.district);
  if (ui.education) form.append("education", ui.education);
  if (ui.experience) form.append("experience", ui.experience);
  if (ui.email) form.append("email", ui.email);
  if (ui.phoneNumber) form.append("phone_number", ui.phoneNumber);
  if (ui.address) form.append("address", ui.address);
  form.append("cv_source", ui.cvSource || "Direct");
  form.append("interview_status", mapStatus(ui.interviewStatus));
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
    gender: cv.gender === "M" ? "Male" : cv.gender === "F" ? "Female" : "Other",
    dob: cv.dob || "",
    jobTitleId: cv.job_title ?? null,
    jobTitle: cv.job_title_name ?? cv.job_title ?? "",
    place: cv.place || "",
    district: cv.district || "",
    education: cv.education || "",
    experience: cv.experience || "",
    email: cv.email || "",
    phoneNumber : cv.phone_number || "",
    address: cv.address || "",
    cvAttachmentUrl: cv.cv_file || "",
    cvFileName: cv.cv_file ? cv.cv_file.split("/").pop() : "",
    cvSource: cv.cv_source || "Direct",
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
  create: async (formData) => {
    const r = await api.post("/cv-management/cvs/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data.data;
  },
  update: async (uuid, formDataOrJson, isMultipart = true) => {
    const r = await api.put(`/cv-management/cvs/${uuid}/`, formDataOrJson, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
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
