const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { rateLimiter } = require("../middlewares/rateLimitMiddleware");
const {
  analyzeResumeAgainstJD,
  getAnalysisById,
  getAnalysisHistory,
  deleteAnalysis,
  compareAnalyses,
} = require("../controllers/analyzeController");

const router = express.Router();

// Apply auth middleware to protect all analysis endpoints
router.use(protect);

router.post("/", rateLimiter, analyzeResumeAgainstJD);
router.get("/history", getAnalysisHistory);
router.post("/compare", compareAnalyses);
router.get("/:id", getAnalysisById);
router.delete("/:id", deleteAnalysis);


module.exports = router;
