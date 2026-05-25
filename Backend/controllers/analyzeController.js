const AnalysisResult = require("../models/AnalysisResultModel");
const Resume = require("../models/ResumeModel");
const JobDescription = require("../models/JobDescriptionModel");

const { analyzeResumeWithAI } = require("../services/aiService");
const { generateCacheKey, getCachedResult, setCachedResult } = require("../services/cacheService");
const { calculateShortlistChance } = require("../services/scoringService");
const { analyzeATSCompatibility } = require("../services/atsAnalyzer");
const { simulateRecruiterReview } = require("../services/recruiterSimulationService");

/**
 * @desc    Run ATS analysis on a resume against a job description
 * @route   POST /api/analyze
 * @access  Private
 */
const analyzeResumeAgainstJD = async (req, res, next) => {
  try {
    const { resumeId, jdId, rawJdText, rawJdTitle, targetRole } = req.body;

    if (!resumeId) {
      res.status(400);
      throw new Error("Resume ID is required");
    }

    // Fetch resume
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      res.status(404);
      throw new Error("Resume not found or access denied");
    }

    let jdText = "";
    let jdTitle = "Job Description";

    if (jdId) {
      // Fetch saved job description
      const jd = await JobDescription.findOne({ _id: jdId, user: req.user._id });
      if (!jd) {
        res.status(404);
        throw new Error("Job description not found");
      }
      jdText = jd.descriptionText;
      jdTitle = jd.title;
    } else if (rawJdText) {
      // Use raw pasted text
      jdText = rawJdText;
      jdTitle = rawJdTitle || "Pasted Job Description";
    } else {
      res.status(400);
      throw new Error("Please provide a job description ID or paste a job description");
    }

    if (jdText.trim().length < 20) {
      res.status(400);
      throw new Error("Job description is too short to analyze");
    }

    const roleName = targetRole || "General";

    // Check Cache
    const cacheKey = generateCacheKey(resume.extractedText, jdText, roleName);
    let analysis = getCachedResult(cacheKey);

    if (!analysis) {
      // Run AI/Gemini/Fallback Analysis
      analysis = await analyzeResumeWithAI(resume.extractedText, jdText, roleName);
      setCachedResult(cacheKey, analysis);
    }

    // Run structural heuristics locally for verification/safety
    const localAts = analyzeATSCompatibility(resume.extractedText);
    const localRecruiter = simulateRecruiterReview(resume.extractedText, roleName);

    // Merge logic: ensure high-fidelity calculations
    const finalAtsScore = analysis.atsScore || 70;
    const finalShortlistChance = analysis.shortlistChance || calculateShortlistChance(
      analysis.keywordScore || 70,
      analysis.experienceScore || 70,
      analysis.formatScore || 70
    );

    const finalAtsCompatibility = {
      riskScore: analysis.atsCompatibility?.riskScore ?? localAts.riskScore,
      detectedIssues: (analysis.atsCompatibility?.detectedIssues && analysis.atsCompatibility.detectedIssues.length > 0)
        ? analysis.atsCompatibility.detectedIssues
        : localAts.detectedIssues
    };

    const finalRecruiterSimulation = {
      skimmabilityScore: analysis.recruiterSimulation?.skimmabilityScore ?? localRecruiter.skimmabilityScore,
      readabilityScore: analysis.recruiterSimulation?.readabilityScore ?? localRecruiter.readabilityScore,
      firstImpressionHighlights: (analysis.recruiterSimulation?.firstImpressionHighlights && analysis.recruiterSimulation.firstImpressionHighlights.length > 0)
        ? analysis.recruiterSimulation.firstImpressionHighlights
        : localRecruiter.firstImpressionHighlights,
      redFlags: (analysis.recruiterSimulation?.redFlags && analysis.recruiterSimulation.redFlags.length > 0)
        ? analysis.recruiterSimulation.redFlags
        : localRecruiter.redFlags
    };

    // Save Analysis Result
    const analysisResult = await AnalysisResult.create({
      user: req.user._id,
      resume: resume._id,
      jobDescriptionText: jdText,
      jobDescriptionTitle: jdTitle,
      targetRole: roleName,
      atsScore: finalAtsScore,
      shortlistChance: finalShortlistChance,
      breakdown: {
        keywordScore: analysis.keywordScore || 70,
        skillsScore: analysis.skillsScore || 70,
        experienceScore: analysis.experienceScore || 70,
        formatScore: analysis.formatScore || 70,
      },
      sectionScores: analysis.sectionScores || {
        summary: resume.extractedText.toLowerCase().includes("summary") ? 80 : 0,
        experience: analysis.experienceScore || 70,
        skills: analysis.skillsScore || 70,
        education: resume.extractedText.toLowerCase().includes("education") ? 85 : 0
      },
      matchedKeywords: analysis.matchedKeywords || [],
      missingKeywords: analysis.missingKeywords || [],
      suggestions: analysis.suggestions || [],
      sectionAnalysis: analysis.sectionAnalysis || {
        skills: { present: true, details: "Skills checked" },
        experience: { present: true, details: "Experience checked" },
        education: { present: true, details: "Education checked" }
      },
      bulletPointImprovements: analysis.bulletPointImprovements || [],
      recruiterSimulation: finalRecruiterSimulation,
      atsCompatibility: finalAtsCompatibility,
      roleComparison: analysis.roleComparison || {
        missingSkills: [],
        experienceGaps: [],
        keywordDifferences: []
      },
      gapRiskDetection: analysis.gapRiskDetection || {
        careerGapsDetected: false,
        frequentJobSwitches: false,
        suggestions: []
      }
    });

    res.status(201).json({
      success: true,
      message: "Analysis completed successfully",
      data: analysisResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed analysis report by ID
 * @route   GET /api/analyze/:id
 * @access  Private
 */
const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await AnalysisResult.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("resume");

    if (!analysis) {
      res.status(404);
      throw new Error("Analysis report not found or access denied");
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get analysis history of the user
 * @route   GET /api/analyze/history
 * @access  Private
 */
const getAnalysisHistory = async (req, res, next) => {
  try {
    const history = await AnalysisResult.find({ user: req.user._id })
      .populate("resume", "fileName filePath")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an analysis report
 * @route   DELETE /api/analyze/:id
 * @access  Private
 */
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await AnalysisResult.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      res.status(404);
      throw new Error("Analysis report not found or access denied");
    }

    await analysis.deleteOne();

    res.json({
      success: true,
      message: "Analysis report deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compare two analysis results side-by-side
 * @route   POST /api/analyze/compare
 * @access  Private
 */
const compareAnalyses = async (req, res, next) => {
  try {
    const { analysisId1, analysisId2 } = req.body;

    if (!analysisId1 || !analysisId2) {
      res.status(400);
      throw new Error("Both base and comparison analysis reports are required");
    }

    const [a1, a2] = await Promise.all([
      AnalysisResult.findOne({ _id: analysisId1, user: req.user._id }).populate("resume"),
      AnalysisResult.findOne({ _id: analysisId2, user: req.user._id }).populate("resume"),
    ]);

    if (!a1 || !a2) {
      res.status(404);
      throw new Error("One or both analysis reports not found or access denied");
    }

    // Chronological sort
    const older = a1.createdAt <= a2.createdAt ? a1 : a2;
    const newer = a1.createdAt > a2.createdAt ? a1 : a2;

    const scoreDiff = newer.atsScore - older.atsScore;
    const shortlistChanceDiff = (newer.shortlistChance || 0) - (older.shortlistChance || 0);
    const keywordScoreDiff = (newer.breakdown?.keywordScore || 0) - (older.breakdown?.keywordScore || 0);
    const skillsScoreDiff = (newer.breakdown?.skillsScore || 0) - (older.breakdown?.skillsScore || 0);
    const experienceScoreDiff = (newer.breakdown?.experienceScore || 0) - (older.breakdown?.experienceScore || 0);

    // Advanced metrics diff
    const skimmabilityDiff = ((newer.recruiterSimulation?.skimmabilityScore || 0) - (older.recruiterSimulation?.skimmabilityScore || 0));
    const readabilityDiff = ((newer.recruiterSimulation?.readabilityScore || 0) - (older.recruiterSimulation?.readabilityScore || 0));
    const atsRiskDiff = ((newer.atsCompatibility?.riskScore || 0) - (older.atsCompatibility?.riskScore || 0));

    const olderMatched = new Set(older.matchedKeywords || []);
    const newerMatched = new Set(newer.matchedKeywords || []);

    const newlyMatched = [...newerMatched].filter((k) => !olderMatched.has(k));
    const stillMissing = newer.missingKeywords || [];

    // Top role comparison missing skills differences
    const oldMissingSkills = new Set(older.roleComparison?.missingSkills || []);
    const newMissingSkills = newer.roleComparison?.missingSkills || [];
    const resolvedSkills = [...oldMissingSkills].filter(s => !newMissingSkills.includes(s));

    res.json({
      success: true,
      older: {
        id: older._id,
        fileName: older.resume ? older.resume.fileName : "Older Resume",
        atsScore: older.atsScore,
        shortlistChance: older.shortlistChance || 0,
        createdAt: older.createdAt,
      },
      newer: {
        id: newer._id,
        fileName: newer.resume ? newer.resume.fileName : "Newer Resume",
        atsScore: newer.atsScore,
        shortlistChance: newer.shortlistChance || 0,
        createdAt: newer.createdAt,
      },
      differences: {
        scoreDiff,
        shortlistChanceDiff,
        keywordScoreDiff,
        skillsScoreDiff,
        experienceScoreDiff,
        skimmabilityDiff,
        readabilityDiff,
        atsRiskDiff,
        newlyMatched,
        stillMissing,
        resolvedSkills,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResumeAgainstJD,
  getAnalysisById,
  getAnalysisHistory,
  deleteAnalysis,
  compareAnalyses,
};
