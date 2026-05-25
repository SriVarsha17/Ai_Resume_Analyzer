const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts raw text from a document buffer based on its mimetype.
 * Supports PDF and DOCX.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File mimetype
 * @returns {Promise<string>} Extracted text
 */
const extractText = async (buffer, mimetype) => {
  try {
    if (mimetype === "application/pdf") {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      const data = await mammoth.extractRawText({ buffer });
      return data.value;
    } else {
      // Fallback: try PDF, then DOCX
      try {
        const data = await pdfParse(buffer);
        if (data && data.text) return data.text;
      } catch (pdfErr) {
        try {
          const data = await mammoth.extractRawText({ buffer });
          return data.value;
        } catch (docxErr) {
          console.error("Fallback extraction failed:", docxErr);
        }
      }
      return "";
    }
  } catch (error) {
    console.error("Text Extraction Error:", error);
    return "";
  }
};

module.exports = { extractText };