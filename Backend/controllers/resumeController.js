const Resume = require("../models/ResumeModel");
const { extractText } = require("../utils/extractText");
const { uploadToCloudinary } = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

/**
 * @desc    Upload and parse a resume file (PDF/DOCX)
 * @route   POST /api/resume/upload
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No resume file uploaded");
    }

    // Extract text from the file buffer
    const resumeText = await extractText(req.file.buffer, req.file.mimetype);

    if (!resumeText || resumeText.trim().length < 20) {
      res.status(400);
      throw new Error("Unable to extract sufficient text from the uploaded file");
    }

    let filePath = "";

    // Proactively attempt Cloudinary upload if API key is present
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        filePath = cloudinaryResult.secure_url;
      } catch (cloudinaryErr) {
        console.warn("Cloudinary upload failed, falling back to local file storage:", cloudinaryErr.message);
      }
    }

    // Fallback: Store file locally under uploads/
    if (!filePath) {
      const uploadsDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = `${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
      const localFilePath = path.join(uploadsDir, filename);
      fs.writeFileSync(localFilePath, req.file.buffer);
      filePath = `/uploads/${filename}`;
    }

    // Create a new Resume entry in database
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath,
      extractedText: resumeText,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and text extracted successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific resume details by ID
 * @route   GET /api/resume/:id
 * @access  Private
 */
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error("Resume not found or access denied");
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resumes uploaded by the logged-in user
 * @route   GET /api/resume/user/all
 * @access  Private
 */
const getAllResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the extracted text of a resume (for inline editing)
 * @route   PUT /api/resume/:id
 * @access  Private
 */
const updateResumeText = async (req, res, next) => {
  try {
    const { extractedText } = req.body;

    if (!extractedText) {
      res.status(400);
      throw new Error("Extracted text is required for update");
    }

    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error("Resume not found or access denied");
    }

    resume.extractedText = extractedText;
    await resume.save();

    res.json({
      success: true,
      message: "Resume content updated successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumeById,
  getAllResumes,
  updateResumeText,
};