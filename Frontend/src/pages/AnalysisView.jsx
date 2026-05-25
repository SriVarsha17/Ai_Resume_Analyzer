import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import ScoreCard from "../components/ScoreCard";
import SuggestionsPanel from "../components/SuggestionsPanel";
import ResumeViewer from "../components/ResumeViewer";
import {
  Calendar,
  Briefcase,
  FileText,
  ArrowLeft,
  Download,
  Check,
  X,
  AlertTriangle,
  FileSearch,
  Cpu,
  UserCheck,
  LayoutGrid
} from "lucide-react";

const AnalysisView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalysisById(id);
      setAnalysis(res.data);
    } catch (err) {
      setError("Failed to load analysis report details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    if (!analysis) return;

    let text = `========================================\n`;
    text += `ATS RESUME GRADER REPORT\n`;
    text += `========================================\n\n`;
    text += `Job Title: ${analysis.jobDescriptionTitle}\n`;
    text += `Target Role: ${analysis.targetRole || "General"}\n`;
    text += `Date: ${new Date(analysis.createdAt).toLocaleString()}\n`;
    text += `ATS Score: ${analysis.atsScore}/100\n`;
    text += `Shortlist Probability: ${analysis.shortlistChance || 0}%\n\n`;

    text += `SCORE BREAKDOWN:\n`;
    text += `- Keyword Matching: ${analysis.breakdown?.keywordScore || 0}%\n`;
    text += `- Skills Alignment: ${analysis.breakdown?.skillsScore || 0}%\n`;
    text += `- Experience Depth: ${analysis.breakdown?.experienceScore || 0}%\n`;
    text += `- Format & Structure: ${analysis.breakdown?.formatScore || 0}%\n\n`;

    text += `RECRUITER SCAN SIMULATION:\n`;
    text += `- Skimmability Score: ${analysis.recruiterSimulation?.skimmabilityScore || 0}%\n`;
    text += `- Readability Score: ${analysis.recruiterSimulation?.readabilityScore || 0}%\n`;
    text += `First Impression Highlights:\n`;
    analysis.recruiterSimulation?.firstImpressionHighlights?.forEach(h => {
      text += `  * ${h}\n`;
    });
    text += `Red Flags Detected:\n`;
    if (analysis.recruiterSimulation?.redFlags?.length) {
      analysis.recruiterSimulation.redFlags.forEach(f => {
        text += `  * [!] [${f.type}] ${f.message}\n`;
      });
    } else {
      text += `  None\n`;
    }
    text += `\n`;

    text += `ATS COMPATIBILITY ISSUES:\n`;
    text += `- Parser Risk Score: ${analysis.atsCompatibility?.riskScore || 0}%\n`;
    if (analysis.atsCompatibility?.detectedIssues?.length) {
      analysis.atsCompatibility.detectedIssues.forEach(i => {
        text += `  * Element: ${i.element}\n`;
        text += `    Risk Level: ${i.risk}\n`;
        text += `    Recommended Fix: ${i.fix}\n`;
      });
    } else {
      text += `  None - Safe Layout Verified\n`;
    }
    text += `\n`;

    text += `MATCHED KEYWORDS:\n`;
    analysis.matchedKeywords?.forEach((k) => {
      text += `- [✓] ${k}\n`;
    });
    if (!analysis.matchedKeywords?.length) text += `None\n`;
    text += `\n`;

    text += `MISSING KEYWORDS:\n`;
    analysis.missingKeywords?.forEach((k) => {
      text += `- [ ] ${k}\n`;
    });
    if (!analysis.missingKeywords?.length) text += `None\n`;
    text += `\n`;

    text += `KEY SUGGESTIONS:\n`;
    analysis.suggestions?.forEach((s, i) => {
      text += `${i + 1}. ${s}\n`;
    });
    if (!analysis.suggestions?.length) text += `None\n`;
    text += `\n`;

    text += `BULLET POINT REWRITES:\n`;
    analysis.bulletPointImprovements?.forEach((item, i) => {
      text += `\n--- Suggestion #${i + 1} ---\n`;
      text += `Original: "${item.original}"\n`;
      text += `Improved: "${item.improved}"\n`;
      text += `Explanation: ${item.explanation}\n`;
    });
    if (!analysis.bulletPointImprovements?.length) text += `None\n`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ATS_Detailed_Report_${analysis.jobDescriptionTitle.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSummary = () => {
    if (!analysis) return;

    let text = `========================================\n`;
    text += `RECRUITER SUMMARY REPORT (ATS SHIELD)\n`;
    text += `========================================\n\n`;
    text += `Candidate Draft: ${analysis.resume?.fileName || "Resume"}\n`;
    text += `Target Profile: ${analysis.jobDescriptionTitle}\n`;
    text += `Recommended Target Role: ${analysis.targetRole || "General"}\n`;
    text += `Review Date: ${new Date(analysis.createdAt).toLocaleDateString()}\n\n`;

    text += `VITAL SIGNS:\n`;
    text += `- Shortlist Probability: ${analysis.shortlistChance || 0}%\n`;
    text += `- Recruiter Skimmability Grade: ${analysis.recruiterSimulation?.skimmabilityScore || 0}/100\n`;
    text += `- Flesch Readability Score: ${analysis.recruiterSimulation?.readabilityScore || 0}/100\n`;
    text += `- ATS Parsing Risk Rating: ${analysis.atsCompatibility?.riskScore || 0}% (Lower is safer)\n\n`;

    text += `FIRST IMPRESSION METRICS:\n`;
    analysis.recruiterSimulation?.firstImpressionHighlights?.forEach(h => {
      text += `- [✓] ${h}\n`;
    });
    text += `\n`;

    text += `CRITICAL RED FLAGS:\n`;
    if (analysis.recruiterSimulation?.redFlags?.length) {
      analysis.recruiterSimulation.redFlags.forEach(f => {
        text += `- [!] [${f.type}] ${f.message}\n`;
      });
    } else {
      text += `- Excellent! No fatal red flags detected.\n`;
    }
    text += `\n`;

    text += `IMPROVEMENT SUGGESTIONS:\n`;
    analysis.suggestions?.slice(0, 3).forEach((s, i) => {
      text += `${i + 1}. ${s}\n`;
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Recruiter_Summary_${analysis.jobDescriptionTitle.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReGrade = async (newText) => {
    const resumeId = analysis.resume?._id || analysis.resume;
    // Call the update endpoint
    await api.updateResumeText(resumeId, newText);

    // Run analysis again
    const runRes = await api.runAnalysis(
      resumeId,
      undefined,
      analysis.jobDescriptionText,
      analysis.jobDescriptionTitle,
      analysis.targetRole
    );

    if (runRes.success && runRes.data?._id) {
      navigate(`/analyze/${runRes.data._id}`);
    } else {
      throw new Error("Re-grading analysis failed to compile.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-sm text-dark-500 font-medium">Fetching report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 glass rounded-2xl border border-danger-500/10 text-center flex flex-col items-center gap-4">
        <X className="h-10 w-10 text-danger-500" />
        <h3 className="text-lg font-bold text-white">Error Loading Report</h3>
        <p className="text-sm text-dark-500">{error || "The report could not be found."}</p>
        <Link to="/" className="text-sm text-brand-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const recFlags = analysis.recruiterSimulation?.redFlags || [];
  const atsIssues = analysis.atsCompatibility?.detectedIssues || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8 print:p-0 print:bg-white print:text-black">
      {/* Back Header & Print Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-dark-500 hover:text-white transition-all self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadSummary}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-brand-500/25 hover:bg-brand-500/5 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-brand-400" />
            <span>Recruiter Summary</span>
          </button>
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-dark-400" />
            <span>Export Full text</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF (Print)</span>
          </button>
        </div>
      </div>

      {/* Report Info Header */}
      <div className="border-b border-white/5 pb-6 flex flex-col gap-4 print:border-black print:pb-4">
        <div>
          <span className="px-2.5 py-1 rounded bg-brand-500/10 border border-brand-500/25 text-[10px] font-bold text-brand-400 uppercase tracking-widest print:text-black">
            Optimized for: {analysis.targetRole || "General"}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white print:text-black mt-2">
            AI Resume Diagnostic Report
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-dark-500 print:text-gray-700">
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-brand-400 print:text-black" />
            Job Title:{" "}
            <strong className="text-white print:text-black">
              {analysis.jobDescriptionTitle}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-brand-400 print:text-black" />
            Resume File:{" "}
            <strong className="text-white print:text-black">
              {analysis.resume?.fileName || "Uploaded Resume"}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-brand-400 print:text-black" />
            Analyzed: {new Date(analysis.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Score gauge Card */}
      <ScoreCard
        atsScore={analysis.atsScore}
        shortlistChance={analysis.shortlistChance || 0}
        breakdown={analysis.breakdown}
      />

      {/* Recruiter Simulator & ATS Compatibility Analyzer Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recruiter Simulation Box */}
        <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-brand-400" />
              Recruiter 6-Second Screen Simulator
            </h3>
            <span className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">
              Human Evaluation
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-dark-500 uppercase">Skimmability Score</span>
              <span className="text-2xl font-black text-brand-400">
                {analysis.recruiterSimulation?.skimmabilityScore || 70}%
              </span>
              <span className="text-[9px] text-dark-500 leading-none">Layout balance & spacing</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-dark-500 uppercase">Readability Index</span>
              <span className="text-2xl font-black text-brand-400">
                {analysis.recruiterSimulation?.readabilityScore || 65}%
              </span>
              <span className="text-[9px] text-dark-500 leading-none">Sentence structure flow</span>
            </div>
          </div>

          {/* First Impression areas */}
          <div>
            <h4 className="text-xs font-bold uppercase text-dark-500 tracking-wider mb-2.5">
              Focus Areas (First Impression)
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              {analysis.recruiterSimulation?.firstImpressionHighlights?.map((hl, i) => (
                <li key={i} className="flex items-start gap-2 text-white/95 leading-normal">
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Red flags */}
          <div>
            <h4 className="text-xs font-bold uppercase text-dark-500 tracking-wider mb-2.5">
              Red Flags detected ({recFlags.length})
            </h4>
            {recFlags.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {recFlags.map((flag, i) => (
                  <div key={i} className="p-3 rounded-xl bg-danger-500/5 border border-danger-500/10 flex items-start gap-2.5 text-xs text-danger-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-white/90 block mb-0.5">{flag.type}</strong>
                      <span className="leading-normal text-white/70">{flag.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center border border-accent-500/10 bg-accent-500/5 text-xs text-accent-400 rounded-xl">
                Fantastic! No critical recruiter red flags detected.
              </div>
            )}
          </div>
        </div>

        {/* ATS Compatibility Box */}
        <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-400" />
              ATS Parser Compatibility Checklist
            </h3>
            <span className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">
              Machine Reading
            </span>
          </div>

          {/* Risk Level gauge */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="text-[10px] font-bold text-dark-500 uppercase block mb-1">
                Parsing Error Risk Score
              </span>
              <p className="text-xs text-dark-500 max-w-xs leading-normal">
                Indicates the chance that layout tables, columns, symbols, or fonts cause parsing failures.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-black ${
                (analysis.atsCompatibility?.riskScore || 20) >= 50 ? "text-danger-500" : "text-emerald-400"
              }`}>
                {analysis.atsCompatibility?.riskScore || 20}%
              </span>
              <span className="text-[9px] uppercase font-bold text-dark-500 mt-1">
                {(analysis.atsCompatibility?.riskScore || 20) >= 50 ? "High Risk" : "Low Risk"}
              </span>
            </div>
          </div>

          {/* Identified Issues */}
          <div>
            <h4 className="text-xs font-bold uppercase text-dark-500 tracking-wider mb-2.5">
              Detected Layout Obstacles ({atsIssues.length})
            </h4>
            {atsIssues.length > 0 ? (
              <div className="flex flex-col gap-3">
                {atsIssues.map((issue, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-2 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-white font-bold">{issue.element}</strong>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        issue.risk === "High" ? "bg-danger-500/10 text-danger-400" : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {issue.risk} Risk
                      </span>
                    </div>
                    <p className="text-dark-500 leading-normal text-[11px]">
                      <span className="text-white/80 font-semibold block mb-0.5">How to Fix:</span>
                      {issue.fix}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center border border-accent-500/10 bg-accent-500/5 text-xs text-accent-400 rounded-xl">
                Parser Compatibility Clean! The text structure and formatting are fully readable by standard ATS frameworks.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Keywords matching lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        {/* Matched */}
        <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl print:border-gray-300">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 print:text-black">
            <span className="h-2 w-2 rounded-full bg-accent-500"></span>
            Matched Job Keywords ({analysis.matchedKeywords?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.matchedKeywords?.length > 0 ? (
              analysis.matchedKeywords.map((k, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 text-xs font-medium text-accent-400 flex items-center gap-1 print:bg-gray-100 print:text-black"
                >
                  <Check className="h-3 w-3" /> {k}
                </span>
              ))
            ) : (
              <span className="text-sm text-dark-500 italic">No keywords matched yet. Check suggestions.</span>
            )}
          </div>
        </div>

        {/* Missing */}
        <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl print:border-gray-300">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 print:text-black">
            <span className="h-2 w-2 rounded-full bg-danger-500"></span>
            Missing Job Keywords ({analysis.missingKeywords?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords?.length > 0 ? (
              analysis.missingKeywords.map((k, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-danger-500/10 border border-danger-500/20 text-xs font-medium text-danger-400 flex items-center gap-1 print:bg-gray-100 print:text-black"
                >
                  <X className="h-3 w-3" /> {k}
                </span>
              ))
            ) : (
              <span className="text-sm text-accent-500 font-medium">
                Excellent! All keywords matching requirements satisfied.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Suggestion list and bullet point accordion */}
      <SuggestionsPanel
        suggestions={analysis.suggestions}
        bulletPointImprovements={analysis.bulletPointImprovements}
      />

      {/* Interactive Resume heatmap and inline editor */}
      <ResumeViewer
        extractedText={analysis.resume?.extractedText || ""}
        sectionAnalysis={analysis.sectionAnalysis}
        sectionScores={analysis.sectionScores}
        resumeId={analysis.resume?._id || analysis.resume}
        targetRole={analysis.targetRole}
        onReGrade={handleReGrade}
      />
    </div>
  );
};

export default AnalysisView;
