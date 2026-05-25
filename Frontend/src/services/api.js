import axios from "axios";

// ✅ Use environment variable (best practice)
// fallback added so it still works locally
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-resume-analyzer-dd7f.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // if you're using cookies/JWT
});

const api = {
  // Auth
  login: async (email, password) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    return res.data;
  },

  register: async (name, email, password) => {
    const res = await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
    });
    return res.data;
  },

  // Resume
  uploadResume: async (formData) => {
    const res = await axiosInstance.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getAllResumes: async () => {
    const res = await axiosInstance.get("/resume/user/all");
    return res.data;
  },

  getResumeById: async (id) => {
    const res = await axiosInstance.get(`/resume/${id}`);
    return res.data;
  },

  updateResumeText: async (id, extractedText) => {
    const res = await axiosInstance.put(`/resume/${id}`, {
      extractedText,
    });
    return res.data;
  },

  // Job Description
  saveJobDescription: async (title, company, descriptionText) => {
    const res = await axiosInstance.post("/jd", {
      title,
      company,
      descriptionText,
    });
    return res.data;
  },

  getAllJobDescriptions: async () => {
    const res = await axiosInstance.get("/jd/user/all");
    return res.data;
  },

  deleteJobDescription: async (id) => {
    const res = await axiosInstance.delete(`/jd/${id}`);
    return res.data;
  },

  // Analysis
  runAnalysis: async (
    resumeId,
    jdId,
    rawJdText,
    rawJdTitle,
    targetRole
  ) => {
    const res = await axiosInstance.post("/analyze", {
      resumeId,
      jdId,
      rawJdText,
      rawJdTitle,
      targetRole,
    });
    return res.data;
  },

  getAnalysisHistory: async () => {
    const res = await axiosInstance.get("/analyze/history");
    return res.data;
  },

  getAnalysisById: async (id) => {
    const res = await axiosInstance.get(`/analyze/${id}`);
    return res.data;
  },

  deleteAnalysis: async (id) => {
    const res = await axiosInstance.delete(`/analyze/${id}`);
    return res.data;
  },

  compareAnalyses: async (analysisId1, analysisId2) => {
    const res = await axiosInstance.post("/analyze/compare", {
      analysisId1,
      analysisId2,
    });
    return res.data;
  },
};

export default api;