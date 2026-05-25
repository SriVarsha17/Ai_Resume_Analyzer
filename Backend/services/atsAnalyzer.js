/**
 * ATS Compatibility Analyzer Service
 * Scans the resume text formatting and structure to identify potential parsing errors.
 */

/**
 * Analyzes resume text for compatibility issues with standard ATS scanners.
 * @param {string} resumeText - Raw text from resume
 * @returns {object} ATS Risk Score and detected formatting issues
 */
const analyzeATSCompatibility = (resumeText = "") => {
  const issues = [];
  const text = resumeText;

  // 1. Check for tab characters or multiple consecutive spaces (indicates complex columns/grids)
  const hasTabs = text.includes("\t");
  const spaceMatch = text.match(/ {4,}/g); // 4 or more spaces
  if (hasTabs || (spaceMatch && spaceMatch.length > 5)) {
    issues.push({
      element: "Multi-column layout or tables",
      risk: "Medium",
      fix: "Standardize formatting into a single-column top-to-bottom layout. Avoid side-by-side text grids which confuse ATS parsers.",
    });
  }

  // 2. Check for graphic characters or symbols (icons like ✉, ☎, 🔗)
  const iconPattern = /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g;
  const iconMatches = text.match(iconPattern);
  if (iconMatches && iconMatches.length > 3) {
    issues.push({
      element: "Decorative icons and emojis",
      risk: "Low",
      fix: "Replace social media icons, email/phone icons, and decorative bullets with standard text labels (e.g., 'Email:', 'Phone:', or standard round bullets).",
    });
  }

  // 3. Check for unusual table characters or vertical pipe borders
  const pipeMatches = text.match(/\|/g);
  if (pipeMatches && pipeMatches.length > 6) {
    issues.push({
      element: "Vertical table dividers (pipe symbols)",
      risk: "Low",
      fix: "Remove pipe character dividers ('|') between sections or skills. Use commas, bullet points, or standard spacing instead.",
    });
  }

  // 4. Check for headers/footers with dates or page numbers
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 10) {
    issues.push({
      element: "Unstructured document block",
      risk: "High",
      fix: "Ensure your resume has distinct sections, line breaks, and clear headers rather than a single compressed block of text.",
    });
  }

  // Calculate compatibility risk score
  // Start with 10 (base clean score). Increase with each issue
  let riskScore = 15;
  issues.forEach((issue) => {
    if (issue.risk === "High") riskScore += 35;
    else if (issue.risk === "Medium") riskScore += 20;
    else riskScore += 10;
  });

  riskScore = Math.min(95, riskScore);

  return {
    riskScore, // Higher is worse / higher risk
    detectedIssues: issues,
  };
};

module.exports = {
  analyzeATSCompatibility,
};
