import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Briefcase, Trash2, PlusCircle, AlertCircle, Calendar } from "lucide-react";

const JobDescriptions = () => {
  const [jds, setJds] = useState([]);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [descriptionText, setDescriptionText] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadJds = async () => {
    try {
      setFetching(true);
      const res = await api.getAllJobDescriptions();
      setJds(res.data || []);
    } catch (err) {
      console.error("Failed to load job descriptions", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadJds();
  }, []);

  const handleSaveJd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !descriptionText) {
      setError("Please fill out both the job title and description text.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.saveJobDescription(title, company, descriptionText);
      setSuccess("Job description saved successfully!");
      setTitle("");
      setCompany("");
      setDescriptionText("");
      setJds([res.data, ...jds]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save job description.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJd = async (id) => {
    if (window.confirm("Are you sure you want to delete this job description?")) {
      try {
        await api.deleteJobDescription(id);
        setJds(jds.filter((jd) => jd._id !== id));
      } catch (err) {
        alert("Failed to delete job description.");
      }
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-sm text-dark-500 font-medium">Fetching job listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create form */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-brand-500" />
            Add Job Profile
          </h1>
          <p className="text-sm text-dark-500 mt-1">Catalog job requirements for quick matching.</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl">
          <form onSubmit={handleSaveJd} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/20 text-xs text-danger-500 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-accent-500/10 border border-accent-500/20 text-xs text-accent-500 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend React Developer"
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google (Optional)"
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Job Description Details
              </label>
              <textarea
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="Paste requirements, tech stack, and responsibilities..."
                rows={6}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all font-sans leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Saving..." : "Save Job Profile"}
            </button>
          </form>
        </div>
      </div>

      {/* Grid List */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Saved Job Descriptions
          </h2>
          <p className="text-sm text-dark-500 mt-1">Manage target profiles for ATS checks.</p>
        </div>

        {jds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jds.map((jd) => (
              <div
                key={jd._id}
                className="glass rounded-2xl p-5 border border-white/5 shadow-xl flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-white leading-tight">{jd.title}</h4>
                      {jd.company && (
                        <p className="text-xs text-brand-400 font-semibold mt-0.5">{jd.company}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteJd(jd._id)}
                      className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50/5 hover:border-danger-500/10 transition-all flex-shrink-0"
                      title="Delete Profile"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <p className="text-xs text-dark-500 leading-relaxed line-clamp-4 bg-dark-950/45 p-3 rounded-lg border border-white/5">
                    {jd.descriptionText}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-dark-500 pt-2 border-t border-white/5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created: {new Date(jd.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-10 border border-white/5 flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-white/5 text-dark-500">
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No saved profiles</p>
              <p className="text-xs text-dark-500 mt-1">
                Add job descriptions on the left to quickly analyze future resumes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescriptions;
