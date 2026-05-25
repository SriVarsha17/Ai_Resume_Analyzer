const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/authMiddleware");
const {
  uploadResume,
  getResumeById,
  getAllResumes,
  updateResumeText,
} = require("../controllers/resumeController");

const router = express.Router();

// Memory storage keeps file buffers for parsing
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX Word documents are allowed"), false);
    }
  },
});

// All routes are protected by JWT authentication
router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/user/all", protect, getAllResumes);
router.get("/:id", protect, getResumeById);
router.put("/:id", protect, updateResumeText);


router.get("/test", (req, res) => {
  res.send("Resume API is working");
});

module.exports = router;