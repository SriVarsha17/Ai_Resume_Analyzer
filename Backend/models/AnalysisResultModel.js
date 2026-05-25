const mongoose = require("mongoose");

const analysisResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    jobDescriptionText: {
      type: String,
      required: true,
    },
    jobDescriptionTitle: {
      type: String,
      default: "Job Description",
    },
    targetRole: {
      type: String,
      default: "General",
    },
    atsScore: {
      type: Number,
      required: true,
    },
    shortlistChance: {
      type: Number,
      default: 0,
    },
    breakdown: {
      keywordScore: { type: Number, default: 0 },
      skillsScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      formatScore: { type: Number, default: 0 },
    },
    sectionScores: {
      summary: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      skills: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
    },
    matchedKeywords: [String],
    missingKeywords: [String],
    suggestions: [String],
    sectionAnalysis: {
      skills: {
        present: { type: Boolean, default: false },
        details: { type: String, default: "" },
      },
      experience: {
        present: { type: Boolean, default: false },
        details: { type: String, default: "" },
      },
      education: {
        present: { type: Boolean, default: false },
        details: { type: String, default: "" },
      },
    },
    bulletPointImprovements: [
      {
        original: String,
        improved: String,
        explanation: String,
      },
    ],
    recruiterSimulation: {
      skimmabilityScore: { type: Number, default: 0 },
      readabilityScore: { type: Number, default: 0 },
      firstImpressionHighlights: [String],
      redFlags: [
        {
          type: { type: String },
          message: String,
        },
      ],
    },
    atsCompatibility: {
      riskScore: { type: Number, default: 0 },
      detectedIssues: [
        {
          element: String,
          risk: String,
          fix: String,
        },
      ],
    },
    roleComparison: {
      missingSkills: [String],
      experienceGaps: [String],
      keywordDifferences: [
        {
          word: String,
          status: String,
        },
      ],
    },
    gapRiskDetection: {
      careerGapsDetected: { type: Boolean, default: false },
      frequentJobSwitches: { type: Boolean, default: false },
      suggestions: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalysisResult", analysisResultSchema);

