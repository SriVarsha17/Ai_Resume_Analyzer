import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Copy,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Sparkles,
  Cpu,
  UserCheck
} from "lucide-react";

const Compare = () => {
  const [history, setHistory] = useState([]);
  const [analysisId1, setAnalysisId1] = useState("");
  const [analysisId2, setAnalysisId2] = useState("");
  const [comparison, setComparison] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getAnalysisHistory();
        setHistory(res.data || []);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setFetching(false);
      }
    };
    fetchHistory();
  }, []);

  const handleCompare = async (e) => {
    e.preventDefault();
    setError("");
    setComparison(null);

    if (!analysisId1 || !analysisId2) {
      setError("Please select two analysis reports to compare.");
      return;
    }

    if (analysisId1 === analysisId2) {
      setError("Please select two different reports.");
      return;
    }

    setLoading(true);
    try {
     const res = await api.compareAnalyses(
  analysisId1,
  analysisId2
);

console.log("COMPARE RESPONSE");
console.log(res);

setComparison(res);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to compare analysis reports."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-sm text-dark-500 font-medium">Fetching reports...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Copy className="h-8 w-8 text-brand-500" />
          Resume Version Comparison
        </h1>
        <p className="text-sm text-dark-500 mt-1">
          Select two draft evaluations to evaluate improvements and track score gains side-by-side.
        </p>
      </div>

      {/* Select Box Grid */}
      <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl">
        <form onSubmit={handleCompare} className="flex flex-col gap-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/20 text-xs text-danger-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Analysis Report #1 (Base Draft)
              </label>
              <select
                value={analysisId1}
                onChange={(e) => setAnalysisId1(e.target.value)}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer"
              >
                <option value="">-- Choose base report --</option>
                {history.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.jobDescriptionTitle} ({h.resume?.fileName || "Resume"} - {h.atsScore}% ATS -{" "}
                    {new Date(h.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Analysis Report #2 (Revised Draft)
              </label>
              <select
                value={analysisId2}
                onChange={(e) => setAnalysisId2(e.target.value)}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer"
              >
                <option value="">-- Choose revised report --</option>
                {history.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.jobDescriptionTitle} ({h.resume?.fileName || "Resume"} - {h.atsScore}% ATS -{" "}
                    {new Date(h.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-sm mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Comparing drafts..." : "Compare Versions"}
          </button>
        </form>
      </div>

      {/* Comparison Results Card */}
      {comparison && (
        <div className="flex flex-col gap-8 animate-fadeIn">
          {/* Comparison Score Delta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Base draft info */}
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider block">
                  Older Draft
                </span>
                <h4 className="text-base font-bold text-white mt-1 truncate">
                  {comparison.older.fileName}
                </h4>
                <p className="text-[10px] text-dark-500 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(comparison.older.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">{comparison.older.atsScore}% <span className="text-xs text-dark-500">ATS</span></div>
                <div className="text-sm font-semibold text-dark-400 mt-1">Shortlist probability: {comparison.older.shortlistChance || 0}%</div>
              </div>
            </div>

            {/* Score Delta indicator */}
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center gap-2 text-center">
              <span className="text-xs font-bold text-dark-500 uppercase tracking-wider block">
                Shortlist Fit Gains
              </span>
              {comparison.differences.shortlistChanceDiff > 0 ? (
                <div className="flex items-center gap-2 text-emerald-400 my-1">
                  <ArrowUpRight className="h-9 w-9" />
                  <span className="text-3xl font-black">+{comparison.differences.shortlistChanceDiff}%</span>
                </div>
              ) : comparison.differences.shortlistChanceDiff < 0 ? (
                <div className="flex items-center gap-2 text-danger-400 my-1">
                  <ArrowDownRight className="h-9 w-9" />
                  <span className="text-3xl font-black">{comparison.differences.shortlistChanceDiff}%</span>
                </div>
              ) : (
                <div className="text-3xl font-black text-yellow-500 my-2">0%</div>
              )}
              <span className="text-xs text-dark-500">
                {comparison.differences.shortlistChanceDiff > 0
                  ? "Matching success odds improved!"
                  : comparison.differences.shortlistChanceDiff < 0
                  ? "Shortlist compatibility dropped."
                  : "No change in shortlist chance."}
              </span>
            </div>

            {/* Revised draft info */}
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">
                  Newer Draft
                </span>
                <h4 className="text-base font-bold text-white mt-1 truncate">
                  {comparison.newer.fileName}
                </h4>
                <p className="text-[10px] text-dark-500 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(comparison.newer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-brand-400">{comparison.newer.atsScore}% <span className="text-xs text-brand-400">ATS</span></div>
                <div className="text-sm font-semibold text-brand-300 mt-1">Shortlist probability: {comparison.newer.shortlistChance || 0}%</div>
              </div>
            </div>
          </div>

          {/* Metrics breakdown Comparison */}
          <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-5">
            <h3 className="text-lg font-bold text-white">Score Component Gains</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">
                  Keywords Matching Gain
                </span>
                <span className={`text-xl font-bold ${comparison.differences.keywordScoreDiff >= 0 ? "text-emerald-400" : "text-danger-400"}`}>
                  {comparison.differences.keywordScoreDiff >= 0 ? `+${comparison.differences.keywordScoreDiff}` : comparison.differences.keywordScoreDiff}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">
                  Skills Alignment Gain
                </span>
                <span className={`text-xl font-bold ${comparison.differences.skillsScoreDiff >= 0 ? "text-emerald-400" : "text-danger-400"}`}>
                  {comparison.differences.skillsScoreDiff >= 0 ? `+${comparison.differences.skillsScoreDiff}` : comparison.differences.skillsScoreDiff}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">
                  Experience Depth Gain
                </span>
                <span className={`text-xl font-bold ${comparison.differences.experienceScoreDiff >= 0 ? "text-emerald-400" : "text-danger-400"}`}>
                  {comparison.differences.experienceScoreDiff >= 0 ? `+${comparison.differences.experienceScoreDiff}` : comparison.differences.experienceScoreDiff}%
                </span>
              </div>
            </div>
          </div>

          {/* Advanced Human & Machine Metrics Compare */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Skimmability Gain */}
            <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-dark-500 uppercase block">Skimmability Gain</span>
                <span className={`text-lg font-black ${comparison.differences.skimmabilityDiff >= 0 ? "text-emerald-400" : "text-danger-400"}`}>
                  {comparison.differences.skimmabilityDiff >= 0 ? `+${comparison.differences.skimmabilityDiff}` : comparison.differences.skimmabilityDiff}%
                </span>
              </div>
            </div>

            {/* Readability Gain */}
            <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-dark-500 uppercase block">Readability Ease Gain</span>
                <span className={`text-lg font-black ${comparison.differences.readabilityDiff >= 0 ? "text-emerald-400" : "text-danger-400"}`}>
                  {comparison.differences.readabilityDiff >= 0 ? `+${comparison.differences.readabilityDiff}` : comparison.differences.readabilityDiff}%
                </span>
              </div>
            </div>

            {/* ATS Risk reduction */}
            <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-dark-500 uppercase block">Parser Error Risk Change</span>
                <span className={`text-lg font-black ${comparison.differences.atsRiskDiff <= 0 ? "text-emerald-400" : "text-danger-400"}`}>
                  {comparison.differences.atsRiskDiff > 0 ? `+${comparison.differences.atsRiskDiff}` : comparison.differences.atsRiskDiff}%
                </span>
                <span className="text-[9px] text-dark-500 block leading-none mt-0.5">Negative is better</span>
              </div>
            </div>

          </div>

          {/* Keyword and Skills changes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Newly matched keywords */}
            <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl md:col-span-1">
              <h3 className="text-xs font-bold uppercase text-white mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-500"></span>
                New Keywords Matched ({comparison.differences.newlyMatched?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {comparison.differences.newlyMatched?.length > 0 ? (
                  comparison.differences.newlyMatched.map((k, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-accent-500/10 border border-accent-500/20 text-[10px] font-semibold text-accent-400 flex items-center gap-0.5"
                    >
                      <Check className="h-3 w-3" /> {k}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-dark-500 italic">No new keywords matched.</span>
                )}
              </div>
            </div>

            {/* Resolved Role-Based Skills */}
            <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl md:col-span-1">
              <h3 className="text-xs font-bold uppercase text-white mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-500"></span>
                Resolved Skills Gaps ({comparison.differences.resolvedSkills?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {comparison.differences.resolvedSkills?.length > 0 ? (
                  comparison.differences.resolvedSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-brand-500/10 border border-brand-500/20 text-[10px] font-semibold text-brand-400 flex items-center gap-0.5"
                    >
                      <Check className="h-3 w-3" /> {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-dark-500 italic">No skills gaps resolved.</span>
                )}
              </div>
            </div>

            {/* Remaining Missing keywords */}
            <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl md:col-span-1">
              <h3 className="text-xs font-bold uppercase text-white mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-danger-500"></span>
                Remaining Gaps ({comparison.differences.stillMissing?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {comparison.differences.stillMissing?.length > 0 ? (
                  comparison.differences.stillMissing.map((k, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-danger-500/10 border border-danger-500/20 text-[10px] font-semibold text-danger-400 flex items-center gap-0.5"
                    >
                      <X className="h-3 w-3" /> {k}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-accent-400 font-semibold">
                    100% matched! No gaps remain.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
