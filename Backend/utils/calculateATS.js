const calculateATS = (resumeText, jobDescription) => {
  const resumeWords = resumeText.toLowerCase();

  const jdWords = jobDescription
    .toLowerCase()
    .split(" ");

  let matched = 0;

  let missingKeywords = [];

  jdWords.forEach((word) => {
    if (resumeWords.includes(word)) {
      matched++;
    } else {
      missingKeywords.push(word);
    }
  });

  const score = Math.round(
    (matched / jdWords.length) * 100
  );

  return {
    score,
    missingKeywords,
  };
};

module.exports = calculateATS;