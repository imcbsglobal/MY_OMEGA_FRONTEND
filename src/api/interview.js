// src/api/interview.js
import api from "./client";

export const InterviewAPI = {
  // 1️⃣ Get CVs for interview dropdown
  getCVs(all = false) {
    return api.get(`/interview-management/cvs-for-interview/${all ? "?all=true" : ""}`);
  },

  // 2️⃣ Start a new interview
  startInterview(data) {
    return api.post(`/interview-management/start-interview/`, data);
  },

  // 3️⃣ List all interviews
  getAll() {
    return api.get(`/interview-management/`);
  },

  // 4️⃣ Get ongoing interviews
  getOngoing() {
    return api.get(`/interview-management/ongoing-interviews/`);
  },

  // 5️⃣ Get single interview details
  getById(id) {
    return api.get(`/interview-management/${id}/`);
  },

  // 6️⃣ Update interview status
  updateStatus(id, data) {
    return api.patch(`/interview-management/${id}/update-status/`, data);
  },

  // 7️⃣ Create or update evaluation
  saveEvaluation(id, data, isFormData = false) {
    if (isFormData)
      return api.post(`/interview-management/${id}/evaluation/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    return api.post(`/interview-management/${id}/evaluation/`, data);
  },

  // 8️⃣ Delete interview
  delete(id) {
    return api.delete(`/interview-management/${id}/`);
  },
};
