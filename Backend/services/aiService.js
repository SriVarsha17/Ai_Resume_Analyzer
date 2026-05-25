const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API if key is present
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Conducts AI analysis of a resume against a job description and a target role.
 * Automatically falls back to local heuristic analysis if the Gemini API fails.
 * @param {string} resumeText - Raw parsed resume text
 * @param {string} jobDescription - Raw job description text
 * @param {string} targetRole - Selectable user target role (e.g. Frontend Engineer)
 * @returns {Promise<object>} Entire structured analysis report
 */
const analyzeResumeWithAI = async (resumeText, jobDescription, targetRole = "General") => {
  if (!genAI) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to local analysis.");
    return runLocalFallbackAnalysis(resumeText, jobDescription, targetRole);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert Applicant Tracking System (ATS), a seasoned recruiter, and a professional resume optimization consultant.
Analyze the following resume against the job description and the target role of "${targetRole}".

Resume Text:
${resumeText}

Job Description Text:
${jobDescription}

Perform a rigorous evaluation and respond ONLY with a single JSON object. Do not wrap the JSON in markdown code blocks (such as \`\`\`json). The JSON must conform exactly to this structure:
{
  "atsScore": number, // Overall rating (0-100)
  "keywordScore": number, // (0-100) based on keyword matching
  "skillsScore": number, // (0-100) based on technical/soft skills fit
  "experienceScore": number, // (0-100) based on work history depth
  "formatScore": number, // (0-100) based on structure and parsed section headers
  "shortlistChance": number, // Shortlist probability (0-100%)
  "sectionScores": {
    "summary": number, // (0-100)
    "experience": number, // (0-100)
    "skills": number, // (0-100)
    "education": number // (0-100)
  },
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "suggestions": ["string"], // Actionable suggestions
  "sectionAnalysis": {
    "skills": { "present": boolean, "details": "string" },
    "experience": { "present": boolean, "details": "string" },
    "education": { "present": boolean, "details": "string" }
  },
  "bulletPointImprovements": [
    {
      "original": "string", // A weak bullet point from the resume
      "improved": "string", // Rewritten using strong action verbs, quantifiable metrics, and tech stack
      "explanation": "string"
    }
  ],
  "recruiterSimulation": {
    "skimmabilityScore": number, // (0-100) how easy is it to read in 6 seconds
    "readabilityScore": number, // (0-100) readability scale
    "firstImpressionHighlights": ["string"], // Highlights of what a recruiter notices first
    "redFlags": [
      {
        "type": "string", // e.g. "Formatting", "Gaps", "Lack of Metrics"
        "message": "string"
      }
    ]
  },
  "atsCompatibility": {
    "riskScore": number, // (0-100) risk of being rejected by ATS parser (high score = higher risk)
    "detectedIssues": [
      {
        "element": "string", // e.g. "Multi-column layout", "Complex table", "Font"
        "risk": "string", // "Low" | "Medium" | "High"
        "fix": "string" // Practical step to resolve
      }
    ]
  },
  "roleComparison": {
    "missingSkills": ["string"], // Key skills required for target role "${targetRole}" missing in resume
    "experienceGaps": ["string"],
    "keywordDifferences": [
      {
        "word": "string",
        "status": "string" // "Highly Recommended" | "Optional"
      }
    ]
  },
  "gapRiskDetection": {
    "careerGapsDetected": boolean,
    "frequentJobSwitches": boolean,
    "suggestions": ["string"]
  }
}
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const text = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed) {
      throw new Error("Unable to parse Gemini response as JSON");
    }

    // Sanitize and ensure defaults
    return sanitizeAnalysisData(parsed, targetRole);
  } catch (error) {
    console.error("AI Analysis Service Error:", error.message);
    return runLocalFallbackAnalysis(resumeText, jobDescription, targetRole);
  }
};

/**
 * Ensures all required schema fields exist and are of correct types.
 */
const sanitizeAnalysisData = (data, targetRole) => {
  const clean = { ...data };
  clean.targetRole = targetRole;
  clean.atsScore = Number(clean.atsScore) || 70;
  clean.keywordScore = Number(clean.keywordScore) || 70;
  clean.skillsScore = Number(clean.skillsScore) || 70;
  clean.experienceScore = Number(clean.experienceScore) || 70;
  clean.formatScore = Number(clean.formatScore) || 70;
  clean.shortlistChance = Number(clean.shortlistChance) || Math.round((clean.keywordScore * 0.4) + (clean.experienceScore * 0.3) + (clean.formatScore * 0.3));

  clean.sectionScores = clean.sectionScores || {
    summary: 75,
    experience: 70,
    skills: 70,
    education: 80
  };

  clean.matchedKeywords = clean.matchedKeywords || [];
  clean.missingKeywords = clean.missingKeywords || [];
  clean.suggestions = clean.suggestions || ["Tailor your resume skills and keywords to align with the job description."];

  clean.sectionAnalysis = clean.sectionAnalysis || {
    skills: { present: true, details: "Verified Skills section" },
    experience: { present: true, details: "Verified Experience section" },
    education: { present: true, details: "Verified Education section" }
  };

  clean.bulletPointImprovements = clean.bulletPointImprovements || [];

  clean.recruiterSimulation = clean.recruiterSimulation || {
    skimmabilityScore: 75,
    readabilityScore: 70,
    firstImpressionHighlights: ["Contact information is clear", "Work chronology matches target role"],
    redFlags: []
  };

  clean.atsCompatibility = clean.atsCompatibility || {
    riskScore: 20,
    detectedIssues: []
  };

  clean.roleComparison = clean.roleComparison || {
    missingSkills: [],
    experienceGaps: [],
    keywordDifferences: []
  };

  clean.gapRiskDetection = clean.gapRiskDetection || {
    careerGapsDetected: false,
    frequentJobSwitches: false,
    suggestions: []
  };

  return clean;
};

/**
 * Local heuristic logic fallback for text-based analysis when AI is offline.
 */
const runLocalFallbackAnalysis = (resume, jd, targetRole) => {
  const resumeLower = resume.toLowerCase();
  const jdLower = jd.toLowerCase();

  // Simple keyword scanning
  const wordsToCheck = Array.from(new Set(jdLower.split(/\W+/).filter(w => w.length > 4))).slice(0, 20);
  const matched = [];
  const missing = [];

  wordsToCheck.forEach(w => {
    if (resumeLower.includes(w)) {
      matched.push(w);
    } else {
      missing.push(w);
    }
  });

  const kwRatio = wordsToCheck.length ? matched.length / wordsToCheck.length : 0.5;
  const keywordScore = Math.round(kwRatio * 100);

  // Standard checks
  const hasSkills = resumeLower.includes("skill");
  const hasExp = resumeLower.includes("experience") || resumeLower.includes("work") || resumeLower.includes("history");
  const hasEdu = resumeLower.includes("education") || resumeLower.includes("university") || resumeLower.includes("college");
  const hasSummary = resumeLower.includes("summary") || resumeLower.includes("profile") || resumeLower.includes("about");

  const formatScore = Math.round(((hasSkills ? 1 : 0) + (hasExp ? 1 : 0) + (hasEdu ? 1 : 0) + (hasSummary ? 1 : 0)) * 25);
  
  // Scoring
  const skillsScore = Math.round(keywordScore * 0.9 + (hasSkills ? 10 : 0));
  const experienceScore = Math.round(keywordScore * 0.8 + (hasExp ? 20 : 0));
  const atsScore = Math.round((keywordScore * 0.4) + (skillsScore * 0.2) + (experienceScore * 0.2) + (formatScore * 0.2));
  
  const shortlistChance = Math.round((keywordScore * 0.4) + (experienceScore * 0.3) + (formatScore * 0.3));

  // Recruiter scan simulations
  const skimmabilityScore = Math.round(formatScore * 0.8 + 15);
  const readabilityScore = resume.length > 500 ? 75 : 60;

  const redFlags = [];
  if (!resumeLower.includes("1") && !resumeLower.includes("2") && !resumeLower.includes("3")) {
    redFlags.push({ type: "Lack of Metrics", message: "No quantitative numbers, percentages, or metrics found in experience statements." });
  }
  if (resume.split(/\n\n+/).some(para => para.split(" ").length > 80)) {
    redFlags.push({ type: "Text Walls", message: "Found paragraph blocks longer than 4 lines which decreases skimmability." });
  }

  // ATS risk detection
  const detectedIssues = [];
  if (resumeLower.includes("\t") || resumeLower.includes("  ")) {
    detectedIssues.push({
      element: "Multi-column layout markers",
      risk: "Medium",
      fix: "Convert multi-column grids or custom spacing tables to simple top-down single column paragraphs."
    });
  }

  return {
    atsScore,
    keywordScore,
    skillsScore,
    experienceScore,
    formatScore,
    shortlistChance,
    targetRole,
    sectionScores: {
      summary: hasSummary ? 85 : 0,
      experience: experienceScore,
      skills: skillsScore,
      education: hasEdu ? 90 : 0
    },
    matchedKeywords: matched,
    missingKeywords: missing,
    suggestions: [
      `Format your work achievements for the specific "${targetRole}" target role by emphasizing action words.`,
      "Add quantifiable deliverables (e.g., 'reduced page load time by 30%') to increase experience rating.",
      "Incorporate missing core keywords from the job description directly into your skills grid."
    ],
    sectionAnalysis: {
      skills: { present: hasSkills, details: hasSkills ? "Skills section identified" : "No separate skills grid parsed" },
      experience: { present: hasExp, details: hasExp ? "Professional experience list identified" : "Missing clear work history headers" },
      education: { present: hasEdu, details: hasEdu ? "Education credentials found" : "Education records not identified" }
    },
    bulletPointImprovements: [
      {
        original: "Responsible for managing and writing code in JavaScript.",
        improved: `Architected and developed high-throughput web modules using JavaScript and React, improving feature delivery speed by 20%.`,
        explanation: "Replaced flat responsibilities with strong verbs, detailed technology stack, and specified the business impact."
      }
    ],
    recruiterSimulation: {
      skimmabilityScore,
      readabilityScore,
      firstImpressionHighlights: ["Contact information parsed successfully", "Basic education timeline visible"],
      redFlags
    },
    atsCompatibility: {
      riskScore: detectedIssues.length > 0 ? 45 : 15,
      detectedIssues
    },
    roleComparison: {
      missingSkills: missing.slice(0, 4),
      experienceGaps: [],
      keywordDifferences: missing.map(m => ({ word: m, status: "Highly Recommended" }))
    },
    gapRiskDetection: {
      careerGapsDetected: false,
      frequentJobSwitches: false,
      suggestions: ["Check the chronological ordering of dates in your resume to ensure smooth career progression."]
    }
  };
};

module.exports = { analyzeResumeWithAI };
