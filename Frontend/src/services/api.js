import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = {
  // Auth endpoints
  login: async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return res.data;
  },
  register: async (name, email, password) => {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
    return res.data;
  },

  // Resume endpoints
  uploadResume: async (formData) => {
    const res = await axios.post(`${API_BASE_URL}/resume/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  getAllResumes: async () => {
    const res = await axios.get(`${API_BASE_URL}/resume/user/all`);
    return res.data;
  },
  getResumeById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/resume/${id}`);
    return res.data;
  },
  updateResumeText: async (id, extractedText) => {
    const res = await axios.put(`${API_BASE_URL}/resume/${id}`, { extractedText });
    return res.data;
  },

  // Job Description endpoints
  saveJobDescription: async (title, company, descriptionText) => {
    const res = await axios.post(`${API_BASE_URL}/jd`, { title, company, descriptionText });
    return res.data;
  },
  getAllJobDescriptions: async () => {
    const res = await axios.get(`${API_BASE_URL}/jd/user/all`);
    return res.data;
  },
  deleteJobDescription: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/jd/${id}`);
    return res.data;
  },

  // Analysis / Grading endpoints
  runAnalysis: async (resumeId, jdId, rawJdText, rawJdTitle, targetRole) => {
    const res = await axios.post(`${API_BASE_URL}/analyze`, {
      resumeId,
      jdId,
      rawJdText,
      rawJdTitle,
      targetRole,
    });
    return res.data;
  },

  getAnalysisHistory: async () => {
    const res = await axios.get(`${API_BASE_URL}/analyze/history`);
    return res.data;
  },
  getAnalysisById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/analyze/${id}`);
    return res.data;
  },
  deleteAnalysis: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/analyze/${id}`);
    return res.data;
  },
  compareAnalyses: async (analysisId1, analysisId2) => {
    const res = await axios.post(`${API_BASE_URL}/analyze/compare`, {
      analysisId1,
      analysisId2,
    });
    return res.data;
  },
};

export default api;
