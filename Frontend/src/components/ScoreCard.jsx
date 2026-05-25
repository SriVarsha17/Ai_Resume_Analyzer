import React from "react";
import { CheckCircle, AlertCircle, Award } from "lucide-react";

const ScoreCard = ({ atsScore = 0, shortlistChance = 0, breakdown = {} }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-accent-500 stroke-accent-500";
    if (score >= 60) return "text-yellow-500 stroke-yellow-500";
    return "text-danger-500 stroke-danger-500";
  };

  const getShortlistColor = (chance) => {
    if (chance >= 75) return "text-emerald-400 stroke-emerald-400 bg-emerald-500/5";
    if (chance >= 50) return "text-yellow-400 stroke-yellow-400 bg-yellow-500/5";
    return "text-danger-400 stroke-danger-400 bg-danger-500/5";
  };

  const getShortlistStatusText = (chance) => {
    if (chance >= 75) return "Highly Likely to Shortlist";
    if (chance >= 50) return "Moderate Shortlist Potential";
    return "High Risk of Instant Rejection";
  };

  const circumference = 2 * Math.PI * 45; // Radius = 45
  const strokeDashoffsetAts = circumference - (atsScore / 100) * circumference;
  const strokeDashoffsetShortlist = circumference - (shortlistChance / 100) * circumference;

  const categories = [
    { label: "Keyword Matching", val: breakdown.keywordScore ?? 0, color: "bg-brand-500" },
    { label: "Skills Alignment", val: breakdown.skillsScore ?? 0, color: "bg-indigo-400" },
    { label: "Experience Depth", val: breakdown.experienceScore ?? 0, color: "bg-pink-500" },
    { label: "Format & Structure", val: breakdown.formatScore ?? 0, color: "bg-accent-500" },
  ];

  return (
    <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col lg:flex-row items-center gap-8">
      {/* Dual Circle Gauges Container */}
      <div className="flex items-center justify-center gap-6 flex-wrap w-full lg:w-auto">
        
        {/* ATS Score Gauge */}
        <div className="relative flex flex-col items-center gap-2">
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="45" className="stroke-dark-800 fill-none" strokeWidth="8" />
              <circle
                cx="72"
                cy="72"
                r="45"
                className={`fill-none transition-all duration-1000 ease-out ${getScoreColor(atsScore)}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffsetAts}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-white">{atsScore}</span>
              <span className="text-[9px] uppercase font-bold text-dark-500 mt-0.5">ATS Filter</span>
            </div>
          </div>
          <span className="text-xs font-bold text-white/80">ATS Score</span>
        </div>

        {/* Shortlist Probability Gauge */}
        <div className="relative flex flex-col items-center gap-2">
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="45" className="stroke-dark-800 fill-none" strokeWidth="8" />
              <circle
                cx="72"
                cy="72"
                r="45"
                className={`fill-none transition-all duration-1000 ease-out ${getScoreColor(shortlistChance)}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffsetShortlist}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-white">{shortlistChance}%</span>
              <span className="text-[9px] uppercase font-bold text-dark-500 mt-0.5">Probability</span>
            </div>
          </div>
          <span className="text-xs font-bold text-white/80">Shortlist Chance</span>
        </div>

      </div>

      {/* Grid Score Breakdown & Status */}
      <div className="flex-1 w-full flex flex-col gap-4">
        {/* Shortlist status banner */}
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${getShortlistColor(shortlistChance)} border-white/5`}>
          {shortlistChance >= 50 ? (
            <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-6 w-6 text-danger-400 flex-shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              {getShortlistStatusText(shortlistChance)}
            </h4>
            <p className="text-[11px] text-dark-500 mt-0.5">
              Weighs 40% keyword density, 30% experience longevity, and 30% formatting checks.
            </p>
          </div>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">
                  {cat.label}
                </span>
                <span className="text-xs font-bold text-white">{cat.val}%</span>
              </div>
              <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${cat.color}`}
                  style={{ width: `${cat.val}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
