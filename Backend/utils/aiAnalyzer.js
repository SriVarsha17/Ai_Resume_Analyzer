const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Evaluates the resume text against the job description using Google Gemini API.
 * Falls back to local keyword mapping if Gemini API calls fail.
 * @param {string} resumeText - Raw text of the resume
 * @param {string} jobDescription - Raw text of the job description
 * @returns {Promise<object>} ATS analysis results
 */
const analyzeResume = async (resumeText, jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are an expert Applicant Tracking System (ATS) evaluator and professional resume grader.
Analyze the following resume against the job description.

Resume Text:
${resumeText}

Job Description:
${jobDescription}

Perform a deep analysis and respond ONLY with a single JSON object. Ensure there are no surrounding markdown tags (like \`\`\`json). The JSON structure must match this:
{
  "atsScore": number, // Overall score (0-100)
  "keywordScore": number, // (0-100) based on keyword density and presence
  "skillsScore": number, // (0-100) based on skills section fit
  "experienceScore": number, // (0-100) based on depth, active verbs, and alignment
  "formatScore": number, // (0-100) based on readable section headings and completeness
  "matchedKeywords": ["string"], // Key terms from the job description present in the resume
  "missingKeywords": ["string"], // Essential skills/keywords from the job description missing from the resume
  "suggestions": ["string"], // High level suggestions for the resume owner
  "sectionAnalysis": {
    "skills": { "present": boolean, "details": "string" },
    "experience": { "present": boolean, "details": "string" },
    "education": { "present": boolean, "details": "string" }
  },
  "bulletPointImprovements": [
    {
      "original": "string", // Weak bullet points found in the resume
      "improved": "string", // Rewritten bullet points adding active action verbs, tech stack, and metrics/impact
      "explanation": "string" // Why the rewrite is better
    }
  ]
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

    if (!parsed) throw new Error("Invalid AI JSON output format");

    // Standardize fields just in case
    parsed.atsScore = Number(parsed.atsScore) || 70;
    parsed.keywordScore = Number(parsed.keywordScore) || 70;
    parsed.skillsScore = Number(parsed.skillsScore) || 70;
    parsed.experienceScore = Number(parsed.experienceScore) || 70;
    parsed.formatScore = Number(parsed.formatScore) || 70;
    parsed.matchedKeywords = parsed.matchedKeywords || [];
    parsed.missingKeywords = parsed.missingKeywords || [];
    parsed.suggestions = parsed.suggestions || ["Improve keywords and bullet points."];
    parsed.sectionAnalysis = parsed.sectionAnalysis || {
      skills: { present: true, details: "Verified" },
      experience: { present: true, details: "Verified" },
      education: { present: true, details: "Verified" }
    };
    parsed.bulletPointImprovements = parsed.bulletPointImprovements || [];

    return parsed;
  } catch (error) {
    console.error("AI Error:", error.message);
    return simpleKeywordAnalysis(resumeText, jobDescription);
  }
};

const simpleKeywordAnalysis = (resume, jd) => {
  const jdWords = jd.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const resumeWords = resume.toLowerCase().split(/\W+/).filter(w => w.length > 3);

  const matched = jdWords.filter(word => resumeWords.includes(word));
  const missing = jdWords.filter(word => !resumeWords.includes(word));

  const score = jdWords.length
    ? Math.round((matched.length / jdWords.length) * 100)
    : 0;

  // Ensure reasonable scores
  const finalScore = Math.max(10, Math.min(score, 98));

  return {
    atsScore: finalScore,
    keywordScore: finalScore,
    skillsScore: Math.round(finalScore * 0.9),
    experienceScore: Math.round(finalScore * 0.8),
    formatScore: 75,
    matchedKeywords: [...new Set(matched)].slice(0, 10),
    missingKeywords: [...new Set(missing)].slice(0, 10),
    suggestions: [
      "Tailor your resume by adding matching keywords from the job description.",
      "Quantify your accomplishments in your experience section with numbers and metrics.",
      "Check that your skills section list matches standard technical skills like React, Node, SQL."
    ],
    sectionAnalysis: {
      skills: { present: resume.toLowerCase().includes("skill"), details: "Checks for presence of 'skills' in resume text." },
      experience: { present: resume.toLowerCase().includes("experience") || resume.toLowerCase().includes("work"), details: "Checks for 'experience' or 'work' sections." },
      education: { present: resume.toLowerCase().includes("education"), details: "Checks for 'education' section." }
    },
    bulletPointImprovements: [
      {
        original: "Responsible for writing code and debugging issues.",
        improved: "Engineered scalable REST APIs using Node.js/Express, resolving 15+ bug backlogs and improving query performance by 25%.",
        explanation: "Replaced passive duties with active action verbs, specified the tech stack, and quantified the performance improvement."
      }
    ]
  };
};

module.exports = { analyzeResume };