
import axios from "axios";

// Backend URL from Vercel environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Automatically attach JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(
      localStorage.getItem("resume_grader_user") || "null"
    );

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const api = {
  // Authentication
  login: async (email, password) => {
    const res = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    });

    return res.data;
  },

  register: async (name, email, password) => {
    const res = await axiosInstance.post("/api/auth/register", {
      name,
      email,
      password,
    });

    return res.data;
  },

  // Resume
  uploadResume: async (formData) => {
    const res = await axiosInstance.post(
      "/api/resume/upload",
      formData
    );

    return res.data;
  },

  getAllResumes: async () => {
    const res = await axiosInstance.get("/api/resume/user/all");
    return res.data;
  },

  getResumeById: async (id) => {
    const res = await axiosInstance.get(`/api/resume/${id}`);
    return res.data;
  },

  updateResumeText: async (id, extractedText) => {
    const res = await axiosInstance.put(`/api/resume/${id}`, {
      extractedText,
    });

    return res.data;
  },

  // Job descriptions
  saveJobDescription: async (title, company, descriptionText) => {
    const res = await axiosInstance.post("/api/jd", {
      title,
      company,
      descriptionText,
    });

    return res.data;
  },

  getAllJobDescriptions: async () => {
    const res = await axiosInstance.get("/api/jd/user/all");
    return res.data;
  },

  deleteJobDescription: async (id) => {
    const res = await axiosInstance.delete(`/api/jd/${id}`);
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
    const res = await axiosInstance.post("/api/analyze", {
      resumeId,
      jdId,
      rawJdText,
      rawJdTitle,
      targetRole,
    });

    return res.data;
  },

  getAnalysisHistory: async () => {
    const res = await axiosInstance.get("/api/analyze/history");
    return res.data;
  },

  getAnalysisById: async (id) => {
    const res = await axiosInstance.get(`/api/analyze/${id}`);
    return res.data;
  },

  deleteAnalysis: async (id) => {
    const res = await axiosInstance.delete(`/api/analyze/${id}`);
    return res.data;
  },

  compareAnalyses: async (analysisId1, analysisId2) => {
    const res = await axiosInstance.post("/api/analyze/compare", {
      analysisId1,
      analysisId2,
    });

    return res.data;
  },
};

export default api;
