// src/api/interview.js
import api from "./client";

export const InterviewAPI = {
  // 1️⃣ Get CVs for interview dropdown
  getCVs(all = false) {
    return api.get(`/api/interview-management/cvs-for-interview/${all ? "?all=true" : ""}`);
  },

  // 2️⃣ Start a new interview
  startInterview(data) {
    return api.post(`/api/interview-management/start-interview/`, data);
  },

  // 3️⃣ List all interviews
  getAll() {
    return api.get(`/api/interview-management/`);
  },

  // 4️⃣ Get ongoing interviews
  getOngoing() {
    return api.get(`/api/interview-management/ongoing-interviews/`);
  },

  // 5️⃣ Get single interview details
  getById(id) {
    return api.get(`/api/interview-management/${id}/`);
  },

  // 6️⃣ Update interview status
  updateStatus(id, data) {
    return api.patch(`/api/interview-management/${id}/update-status/`, data);
  },

  // 7️⃣ Create or update evaluation
  saveEvaluation(id, data, isFormData = false) {
    if (isFormData)
      return api.post(`/api/interview-management/${id}/evaluation/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    return api.post(`/api/interview-management/${id}/evaluation/`, data);
  },

  // 8️⃣ Delete interview
  delete(id) {
    return api.delete(`/api/interview-management/${id}/`);
  },
};
