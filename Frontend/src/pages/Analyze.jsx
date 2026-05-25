import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import FileUploader from "../components/FileUploader";
import { BarChart3, AlertCircle, RefreshCw, Briefcase, FileText } from "lucide-react";

const Analyze = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jds, setJds] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJdId, setSelectedJdId] = useState("");
  const [rawJdText, setRawJdText] = useState("");
  const [rawJdTitle, setRawJdTitle] = useState("");
  const [targetRole, setTargetRole] = useState("Frontend Engineer");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [step, setStep] = useState(0); // 0: Idle, 1: Uploading/Parsing, 2: AI evaluation, 3: Completed
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [jdsRes, resumesRes] = await Promise.all([
          api.getAllJobDescriptions(),
          api.getAllResumes(),
        ]);
        setJds(jdsRes.data || []);
        setResumes(resumesRes.data || []);
      } catch (err) {
        console.error("Failed to load options", err);
      } finally {
        setFetching(false);
      }
    };
    loadOptions();
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file) {
      setSelectedResumeId(""); // Clear existing selection
    }
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!selectedFile && !selectedResumeId) {
      setError("Please either upload a new resume or select a previously uploaded one.");
      return;
    }
    if (!selectedJdId && !rawJdText) {
      setError("Please either select a saved job description or paste one in.");
      return;
    }

    setLoading(true);
    setStep(1);

    try {
      let resumeId = selectedResumeId;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("resume", selectedFile);
        const uploadRes = await api.uploadResume(formData);
        resumeId = uploadRes.data._id;
      }

      setStep(2);

      const analysisRes = await api.runAnalysis(
        resumeId,
        selectedJdId || undefined,
        selectedJdId ? undefined : rawJdText,
        selectedJdId ? undefined : rawJdTitle || "Custom Job Description",
        targetRole
      );

      setStep(3);
      setTimeout(() => {
        navigate(`/analyze/${analysisRes.data._id}`);
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to complete resume analysis."
      );
      setStep(0);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-sm text-dark-500 font-medium">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-brand-500" />
          ATS Resume Grader
        </h1>
        <p className="text-sm text-dark-500 mt-1">
          Grade your resume against specific Job Descriptions to optimize for Applicant Tracking
          Systems.
        </p>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-8 border border-brand-500/10 flex flex-col items-center justify-center min-h-[300px] text-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-500/5 animate-pulse"></div>

          <div className="animate-spin p-4 rounded-full bg-brand-500/10 text-brand-400 relative">
            <RefreshCw className="h-8 w-8" />
          </div>

          <div className="relative">
            <h3 className="text-lg font-bold text-white mb-2">Analyzing Resume</h3>
            <div className="flex flex-col gap-3 items-center mt-4">
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    step >= 1 ? "bg-accent-500" : "bg-dark-700 animate-pulse"
                  }`}
                ></span>
                <span className={step === 1 ? "text-white font-medium" : "text-dark-500"}>
                  Uploading & extracting file text
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    step >= 2 ? "bg-accent-500" : "bg-dark-700"
                  }`}
                ></span>
                <span className={step === 2 ? "text-white font-medium" : "text-dark-500"}>
                  Evaluating keywords & structure with Gemini AI
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    step >= 3 ? "bg-accent-500" : "bg-dark-700"
                  }`}
                ></span>
                <span className={step === 3 ? "text-white font-medium" : "text-dark-500"}>
                  Completing report profiles
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRunAnalysis} className="flex flex-col gap-6">
          {error && (
            <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-xs text-danger-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Resume */}
          <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-400" />
              1. Choose Resume
            </h3>

            {resumes.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Select saved resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    setSelectedResumeId(e.target.value);
                    if (e.target.value) {
                      setSelectedFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer"
                >
                  <option value="">-- Choose one of your uploaded resumes --</option>
                  {resumes.map((res) => (
                    <option key={res._id} value={res._id}>
                      {res.fileName} (Uploaded: {new Date(res.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-dark-500 text-center font-medium my-1">OR</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {resumes.length > 0 && (
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Upload new resume file
                </label>
              )}
              <FileUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />
            </div>
          </div>

          {/* Section 1.5: Target Role Selection */}
          <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-brand-400" />
              Target Role Optimization
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Select your target career role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer"
              >
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Fullstack Engineer">Fullstack Engineer</option>
                <option value="Mobile Developer">Mobile Developer (iOS/Android)</option>
                <option value="Data Scientist">Data Scientist / Analyst</option>
                <option value="DevOps Engineer">DevOps / Cloud Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="QA Engineer">QA / Test Engineer</option>
                <option value="General Professional">General Professional / Other</option>
              </select>
              <p className="text-xs text-dark-500 mt-1">
                Scoring weights, keyword recommendations, and recruiter diagnostics will dynamically optimize for this specific career path.
              </p>
            </div>
          </div>

          {/* Section 2: Job Description */}
          <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-brand-400" />
              2. Target Job Description
            </h3>

            {jds.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Select target job profile
                </label>
                <select
                  value={selectedJdId}
                  onChange={(e) => {
                    setSelectedJdId(e.target.value);
                    if (e.target.value) {
                      setRawJdText("");
                      setRawJdTitle("");
                    }
                  }}
                  className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer"
                >
                  <option value="">-- Choose saved job description --</option>
                  {jds.map((jd) => (
                    <option key={jd._id} value={jd._id}>
                      {jd.title} {jd.company && `at ${jd.company}`}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-dark-500 text-center font-medium my-1">OR</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Job Title (Optional)
                </label>
                <input
                  type="text"
                  value={rawJdTitle}
                  onChange={(e) => setRawJdTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  disabled={!!selectedJdId}
                  className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all disabled:opacity-40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Paste Job Description Text
                </label>
                <textarea
                  value={rawJdText}
                  onChange={(e) => setRawJdText(e.target.value)}
                  placeholder="Paste the full job description details, requirements, and responsibilities here..."
                  disabled={!!selectedJdId}
                  rows={8}
                  className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all font-sans leading-relaxed disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-600/10 hover:shadow-brand-600/20 text-base"
          >
            Start ATS Analysis
          </button>
        </form>
      )}
    </div>
  );
};

export default Analyze;
