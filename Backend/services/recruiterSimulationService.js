/**
 * Recruiter Simulation Service
 * Simulates a 6-8 second human review of the resume.
 * Evaluates skimmability, readability, visual focus zones, and identifies red flags.
 */

/**
 * Runs a simulated recruiter evaluation on the resume text.
 * @param {string} resumeText - Raw resume text
 * @param {string} targetRole - The user's target career role
 * @returns {object} Skimmability score, readability score, visual hotspots, and red flags list
 */
const simulateRecruiterReview = (resumeText = "", targetRole = "General") => {
  const text = resumeText;
  const textLower = text.toLowerCase();

  // 1. Skimmability Score calculation
  // Good skimmability features: bullet points, clear headings, moderate paragraph lengths
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
  const bulletMatches = text.match(/^[•\-\*]/gm) || text.match(/\n\s*[•\-\*]/g) || [];
  
  let skimmabilityScore = 60; // baseline

  // Adjust for bullets
  if (bulletMatches.length > 15) skimmabilityScore += 20;
  else if (bulletMatches.length > 8) skimmabilityScore += 10;
  else skimmabilityScore -= 15; // too few bullets = wall of text

  // Adjust for paragraphs length (long paragraphs reduce skimmability)
  const hasLongParagraph = paragraphs.some(p => p.split(/\s+/).length > 70);
  if (hasLongParagraph) skimmabilityScore -= 15;

  skimmabilityScore = Math.max(20, Math.min(98, skimmabilityScore));

  // 2. Readability Score calculation (Approximate Flesch Reading Ease)
  // Formula: 206.835 - 1.015 * (totalWords/totalSentences) - 84.6 * (totalSyllables/totalWords)
  // Let's use a simpler heuristic for JS based on average word length and average sentence length:
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]\s+/).filter(s => s.length > 0);

  const avgSentenceLength = sentences.length ? words.length / sentences.length : 15;
  
  // Approximate syllable count: count vowels and diphthongs, minus trailing 'e'
  let totalSyllables = 0;
  words.forEach(w => {
    let syllables = (w.toLowerCase().match(/[aeiouy]{1,2}/g) || []).length;
    if (w.toLowerCase().endsWith('e') && syllables > 1) syllables--;
    totalSyllables += Math.max(1, syllables);
  });

  const avgSyllablesPerWord = words.length ? totalSyllables / words.length : 1.5;

  // Flesch Reading Ease
  let readabilityScore = Math.round(
    206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
  );

  // Normalize to 0-100 range
  readabilityScore = Math.max(10, Math.min(100, readabilityScore));

  // 3. First Impression Focus Areas
  const firstImpressionHighlights = [];
  
  // Contact check
  const hasEmail = textLower.includes("@") && (textLower.includes(".com") || textLower.includes(".org") || textLower.includes(".net") || textLower.includes(".io"));
  const hasPhone = /\+?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(text);
  if (hasEmail && hasPhone) {
    firstImpressionHighlights.push("Contact header contains essential details (email & phone number).");
  } else {
    firstImpressionHighlights.push("Contact details section appears sparse or missing crucial elements.");
  }

  // Target role keyword matching in first impression area (top 300 words)
  const topText = words.slice(0, 200).join(" ").toLowerCase();
  const roleKeywords = targetRole.toLowerCase().split(/\s+/);
  const roleMatch = roleKeywords.some(keyword => keyword.length > 3 && topText.includes(keyword));
  
  if (roleMatch) {
    firstImpressionHighlights.push(`Resume top-fold matches target role domain ("${targetRole}") immediately.`);
  } else {
    firstImpressionHighlights.push(`Target role term "${targetRole}" is not prominent in the introduction header.`);
  }

  // Summary section check
  const hasSummary = textLower.includes("summary") || textLower.includes("profile") || textLower.includes("about me");
  if (hasSummary) {
    firstImpressionHighlights.push("Professional summary statement provides a quick introductory pitch.");
  }

  // 4. Red Flag Detection
  const redFlags = [];

  // Metrics check (do they quantify achievements?)
  const numberMatches = text.match(/\b\d+%\b|\b\d+\s*(?:percent|million|billion|dollars|usd)\b|\b\$\d+/gi) || [];
  if (numberMatches.length < 3) {
    redFlags.push({
      type: "Lack of Quantified Metrics",
      message: "Experience points are purely task-based. Add numerical results, revenue numbers, or speed increases to show concrete impact.",
    });
  }

  // Large blocks check
  if (hasLongParagraph) {
    redFlags.push({
      type: "Walls of Text",
      message: "Paragraphs containing more than 5 lines are present. Recruiter attention drops off on dense prose blocks.",
    });
  }

  // Job hopping / career gaps heuristic check (e.g. searching for short-tenure patterns like "months", "coop", "intern" or dates gap)
  // Let's check for date patterns or general warning
  const gapTerms = ["gap", "unemployed", "break"];
  const hasGapTerms = gapTerms.some(term => textLower.includes(term));
  if (hasGapTerms) {
    redFlags.push({
      type: "Potential Career Gap Highlighted",
      message: "Keywords indicating career gaps or employment breaks were detected. Address these proactively with a professional context statement.",
    });
  }

  return {
    skimmabilityScore,
    readabilityScore,
    firstImpressionHighlights: firstImpressionHighlights.slice(0, 3),
    redFlags,
  };
};

module.exports = {
  simulateRecruiterReview,
};
