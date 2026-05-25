import React, { useState } from "react";
import { Check, X, FileText, Edit3, Save, RotateCw, AlertTriangle } from "lucide-react";

const ResumeViewer = ({
  extractedText = "",
  sectionAnalysis = {},
  sectionScores = {},
  resumeId = "",
  targetRole = "General",
  onReGrade = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("heatmap"); // "heatmap" | "editor"
  const [editText, setEditText] = useState(extractedText);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync edits if base text changes
  React.useEffect(() => {
    setEditText(extractedText);
  }, [extractedText]);

  // Define sections with their scores and verification states
  const sections = [
    {
      label: "Summary / Profile",
      key: "summary",
      present: extractedText.toLowerCase().includes("summary") || extractedText.toLowerCase().includes("profile") || extractedText.toLowerCase().includes("about"),
      score: sectionScores.summary ?? 0,
      details: sectionAnalysis.summary?.details || "Introductory pitch highlighting your career goals.",
      color: "border-brand-500/20 bg-brand-500/5",
      badgeColor: "text-brand-400 bg-brand-500/10",
      barColor: "bg-brand-500",
    },
    {
      label: "Skills / Expertise",
      key: "skills",
      present: sectionAnalysis.skills?.present ?? extractedText.toLowerCase().includes("skill"),
      score: sectionScores.skills ?? 0,
      details: sectionAnalysis.skills?.details || "List of technical skills and tool familiarity.",
      color: "border-indigo-500/20 bg-indigo-500/5",
      badgeColor: "text-indigo-400 bg-indigo-500/10",
      barColor: "bg-indigo-500",
    },
    {
      label: "Experience / History",
      key: "experience",
      present: sectionAnalysis.experience?.present ?? (extractedText.toLowerCase().includes("experience") || extractedText.toLowerCase().includes("work")),
      score: sectionScores.experience ?? 0,
      details: sectionAnalysis.experience?.details || "Chronological work history and achievements.",
      color: "border-pink-500/20 bg-pink-500/5",
      badgeColor: "text-pink-400 bg-pink-500/10",
      barColor: "bg-pink-500",
    },
    {
      label: "Education Credentials",
      key: "education",
      present: sectionAnalysis.education?.present ?? extractedText.toLowerCase().includes("education"),
      score: sectionScores.education ?? 0,
      details: sectionAnalysis.education?.details || "Degree credentials, certifications, and academic background.",
      color: "border-accent-500/20 bg-accent-500/5",
      badgeColor: "text-accent-400 bg-accent-500/10",
      barColor: "bg-accent-500",
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return "text-accent-400 border-accent-500/20 bg-accent-500/5";
    if (score >= 60) return "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
    return "text-danger-400 border-danger-500/20 bg-danger-500/5";
  };

  const handleUpdateAndReGrade = async () => {
    if (!editText.trim()) {
      setErrorMsg("Resume content cannot be empty.");
      return;
    }
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await onReGrade(editText);
      setSuccessMsg("Resume text updated successfully! Re-grading...");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update resume text.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-6">
      {/* Component Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-400" />
            Resume Content Workbench
          </h3>
          <p className="text-xs text-dark-500 mt-0.5">
            Visualize section strengths or modify text in real-time.
          </p>
        </div>

        {/* Tab Toggle buttons */}
        <div className="flex bg-dark-900 border border-white/5 rounded-lg p-1 text-xs self-start sm:self-center">
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "heatmap" ? "bg-brand-600 text-white" : "text-dark-500 hover:text-white"
            }`}
          >
            <RotateCw className="h-3.5 w-3.5" />
            Section Heatmap
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "editor" ? "bg-brand-600 text-white" : "text-dark-500 hover:text-white"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Real-Time Editor
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 text-xs text-accent-400 bg-accent-500/10 border border-accent-500/20 rounded-xl flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-xs text-danger-400 bg-danger-500/10 border border-danger-500/20 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Sections Checklist and scores */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark-500">
            Section Analysis
          </h4>
          <div className="flex flex-col gap-3">
            {sections.map((sec, idx) => {
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${
                    sec.present ? sec.color : "border-danger-500/15 bg-danger-500/5 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{sec.label}</span>
                    {sec.present ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${sec.badgeColor}`}>
                        <Check className="h-3 w-3" /> Score: {sec.score}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-danger-400 bg-danger-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <X className="h-3 w-3" /> Missing
                      </span>
                    )}
                  </div>

                  {sec.present && (
                    <div className="flex flex-col gap-1">
                      <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sec.barColor}`}
                          style={{ width: `${sec.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {sec.details && (
                    <p className="text-[11px] text-dark-500 leading-relaxed font-sans mt-0.5">
                      {sec.details}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Text Window / Editor */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {activeTab === "heatmap" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-dark-500">
                  Visual Heatmap Mode
                </span>
                <span className="text-[10px] font-semibold text-brand-400">
                  Target: {targetRole}
                </span>
              </div>
              
              {/* Highlighted text viewer */}
              <div className="bg-dark-950 border border-white/5 rounded-xl p-5 h-96 overflow-y-auto font-mono text-[11px] text-white/80 leading-relaxed whitespace-pre-wrap select-text relative">
                {/* Background layout grids to simulate visual highlights */}
                <div className="absolute top-0 left-0 right-0 h-1/6 bg-brand-500/2 border-b border-brand-500/5 pointer-events-none flex items-start p-2 justify-end">
                  <span className="text-[9px] font-bold text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded">
                    First Impression Zone (Top 1/3)
                  </span>
                </div>
                <div className="relative pt-6 z-10">
                  {extractedText ? extractedText : "No resume text content found."}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-dark-500">
                  Interactive Text Editor
                </span>
                <span className="text-[10px] text-dark-500 italic">
                  Changes won't modify your uploaded PDF file, only the parsed text draft.
                </span>
              </div>

              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your resume parsed text here..."
                rows={14}
                className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl font-mono text-[11px] text-white focus:outline-none focus:border-brand-500/50 leading-relaxed resize-y h-96"
              />

              <button
                onClick={handleUpdateAndReGrade}
                disabled={saving}
                className="py-3 px-5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all self-end shadow-lg shadow-brand-600/15"
              >
                {saving ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Re-Evaluating Draft...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save & Re-Grade Resume</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeViewer;
