import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../store/AuthContext";
import {
  FileText,
  ArrowRight,
  Activity,
  PlusCircle,
  Trash2,
  Calendar,
  FileSpreadsheet,
  Eye,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyData, resumeData, jdData] = await Promise.all([
        api.getAnalysisHistory(),
        api.getAllResumes(),
        api.getAllJobDescriptions(),
      ]);

      setHistory(historyData.data || []);
      setResumes(resumeData.data || []);
      setJds(jdData.data || []);
    } catch (err) {
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteAnalysis = async (id) => {
    if (window.confirm("Are you sure you want to delete this analysis report?")) {
      try {
        await api.deleteAnalysis(id);
        setHistory(history.filter((h) => h._id !== id));
      } catch (err) {
        alert("Failed to delete analysis.");
      }
    }
  };

  const getAverageScore = () => {
    if (history.length === 0) return 0;
    const total = history.reduce((acc, h) => acc + h.atsScore, 0);
    return Math.round(total / history.length);
  };

  // Build simple SVG curve points for trend
  const getTrendPoints = () => {
    if (history.length < 2) return "";
    const sorted = [...history].reverse();
    const width = 500;
    const height = 120;
    const padding = 15;
    const xStep = (width - padding * 2) / (sorted.length - 1);

    return sorted
      .map((item, index) => {
        const x = padding + index * xStep;
        const y = height - padding - (item.atsScore / 100) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-sm text-dark-500 font-medium">Analyzing dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-dark-500 mt-1">
            Welcome back, {user?.name}. Check your resume grading progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/analyze"
            className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-brand-600/10 hover:shadow-brand-600/20"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            New Evaluation
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-2">
          <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
            Average Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{getAverageScore()}%</span>
            {history.length > 0 && (
              <span className="text-xs font-bold text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <span className="text-xs text-dark-500">Across {history.length} evaluations</span>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-2">
          <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
            Resumes Uploaded
          </span>
          <span className="text-3xl font-extrabold text-white">{resumes.length}</span>
          <span className="text-xs text-dark-500">Files parsed in database</span>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-2">
          <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
            Job Descriptions
          </span>
          <span className="text-3xl font-extrabold text-white">{jds.length}</span>
          <span className="text-xs text-dark-500">Target profiles cataloged</span>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-2">
          <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
            Total Runs
          </span>
          <span className="text-3xl font-extrabold text-white">{history.length}</span>
          <span className="text-xs text-dark-500">Reports generated</span>
        </div>
      </div>

      {/* Main Grid: Graph and Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Graph */}
        <div className="glass rounded-2xl p-6 border border-white/5 lg:col-span-2 flex flex-col gap-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-400" />
              Score Improvements
            </h3>
            <p className="text-xs text-dark-500 mt-1">
              Visualization of your resume's progress over time.
            </p>
          </div>

          <div className="w-full flex items-center justify-center bg-dark-900/30 border border-white/5 rounded-xl p-4 min-h-[160px]">
            {history.length >= 2 ? (
              <svg className="w-full h-32" viewBox="0 0 500 120" preserveAspectRatio="none">
                {/* Trend line */}
                <polyline
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getTrendPoints()}
                  className="transition-all duration-500"
                />
                {/* Dots on points */}
                {history.slice().reverse().map((item, index) => {
                  const width = 500;
                  const height = 120;
                  const padding = 15;
                  const xStep = (width - padding * 2) / (history.length - 1);
                  const x = padding + index * xStep;
                  const y = height - padding - (item.atsScore / 100) * (height - padding * 2);
                  return (
                    <g key={index} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r="5.5"
                        className="fill-brand-600 stroke-dark-950 stroke-[2px] transition-all hover:r-7"
                      />
                      <title>{`Score: ${item.atsScore}% (${item.jobDescriptionTitle})`}</title>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <p className="text-xs text-dark-500 text-center">
                Need at least 2 analysis reports to plot a score improvement trend.
              </p>
            )}
          </div>
        </div>

        {/* Side Actions List */}
        <div className="glass rounded-2xl p-6 border border-white/5 lg:col-span-1 flex flex-col gap-6 shadow-xl">
          <h3 className="text-lg font-bold text-white">Quick Tasks</h3>
          <div className="flex flex-col gap-4">
            <Link
              to="/analyze"
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/20 hover:bg-white/10 transition-all text-left"
            >
              <div>
                <p className="text-sm font-semibold text-white">Grade Resume</p>
                <p className="text-xs text-dark-500 mt-0.5">Test resume fit against jobs.</p>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-brand-400" />
            </Link>

            <Link
              to="/jd"
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/20 hover:bg-white/10 transition-all text-left"
            >
              <div>
                <p className="text-sm font-semibold text-white">Target Profiles</p>
                <p className="text-xs text-dark-500 mt-0.5">Manage job descriptions.</p>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-brand-400" />
            </Link>

            <Link
              to="/compare"
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/20 hover:bg-white/10 transition-all text-left"
            >
              <div>
                <p className="text-sm font-semibold text-white">Compare Versions</p>
                <p className="text-xs text-dark-500 mt-0.5">
                  Track differences between uploads.
                </p>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-brand-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Analyses</h3>
            <p className="text-xs text-dark-500 mt-0.5">List of all evaluations generated.</p>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-dark-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Resume File</th>
                  <th className="px-6 py-4">ATS Score</th>
                  <th className="px-6 py-4">Date Checked</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-medium text-white">{item.jobDescriptionTitle}</td>
                    <td className="px-6 py-4 text-dark-500 flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-brand-400" />
                      {item.resume?.fileName || "Unnamed Resume"}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-400">{item.atsScore}%</td>
                    <td className="px-6 py-4 text-dark-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/analyze/${item._id}`}
                          className="p-1.5 rounded-lg text-dark-500 hover:text-white hover:bg-white/10 transition-all"
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteAnalysis(item._id)}
                          className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50/5 hover:border-danger-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-white/5 text-dark-500">
              <FileText className="h-10 w-10" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No analysis reports found</p>
              <p className="text-xs text-dark-500 mt-1">
                Upload a resume and enter a job description to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
