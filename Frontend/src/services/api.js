import axios from "axios";

// ✅ Use environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-resume-analyzer-dd7f.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ✅ Automatically attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(
      localStorage.getItem("resume_grader_user")
    );

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api = {
  // Auth
  login: async (email, password) => {
    const res = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

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

    const user = JSON.parse(
      localStorage.getItem("resume_grader_user")
    );

    const res = await axiosInstance.post(
      "/resume/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

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
  saveJobDescription: async (
    title,
    company,
    descriptionText
  ) => {
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

    const res = await axiosInstance.post(
      "/analyze",
      {
        resumeId,
        jdId,
        rawJdText,
        rawJdTitle,
        targetRole,
      }
    );

    return res.data;
  },

  getAnalysisHistory: async () => {
    const res = await axiosInstance.get(
      "/analyze/history"
    );

    return res.data;
  },

  getAnalysisById: async (id) => {
    const res = await axiosInstance.get(
      `/analyze/${id}`
    );

    return res.data;
  },

  deleteAnalysis: async (id) => {
    const res = await axiosInstance.delete(
      `/analyze/${id}`
    );

    return res.data;
  },

  compareAnalyses: async (
    analysisId1,
    analysisId2
  ) => {

    const res = await axiosInstance.post(
      "/analyze/compare",
      {
        analysisId1,
        analysisId2,
      }
    );

    return res.data;
  },
};

export default api;