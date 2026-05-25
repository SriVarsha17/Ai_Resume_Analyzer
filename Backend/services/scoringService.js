/**
 * Scoring Service
 * Computes, adjusts, and normalizes scoring metrics for resumes.
 */

/**
 * Calculates the overall ATS score and its components.
 * @param {object} params - Input parameters
 * @param {number} params.keywordScore
 * @param {number} params.skillsScore
 * @param {number} params.experienceScore
 * @param {number} params.formatScore
 * @returns {object} Final score and category breakdown
 */
const calculateScores = ({ keywordScore, skillsScore, experienceScore, formatScore }) => {
  // Normalize values between 0 and 100
  const kw = Math.max(0, Math.min(100, keywordScore || 0));
  const sk = Math.max(0, Math.min(100, skillsScore || 0));
  const ex = Math.max(0, Math.min(100, experienceScore || 0));
  const ft = Math.max(0, Math.min(100, formatScore || 0));

  // Weighted formula for ATS Score:
  // 35% Keyword, 25% Skills, 25% Experience, 15% Format
  const atsScore = Math.round(kw * 0.35 + sk * 0.25 + ex * 0.25 + ft * 0.15);

  return {
    atsScore,
    breakdown: {
      keywordScore: kw,
      skillsScore: sk,
      experienceScore: ex,
      formatScore: ft,
    },
  };
};

/**
 * Calculates probability of passing ATS recruiter screening and getting shortlisted.
 * @param {number} keywordScore
 * @param {number} experienceScore
 * @param {number} formatScore
 * @returns {number} Percentage shortlist probability (0-100)
 */
const calculateShortlistChance = (keywordScore, experienceScore, formatScore) => {
  const kw = keywordScore || 0;
  const ex = experienceScore || 0;
  const ft = formatScore || 0;

  // Shortlist weight: 40% Keyword match, 30% Experience depth, 30% Format clean
  const shortlistChance = Math.round(kw * 0.4 + ex * 0.3 + ft * 0.3);
  return Math.max(5, Math.min(99, shortlistChance));
};

module.exports = {
  calculateScores,
  calculateShortlistChance,
};
