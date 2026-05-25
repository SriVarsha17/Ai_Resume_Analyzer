const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createJobDescription,
  getAllJobDescriptions,
  deleteJobDescription,
} = require("../controllers/jdController");

const router = express.Router();

// Apply auth middleware to protect all job description routes
router.use(protect);

router.post("/", createJobDescription);
router.get("/user/all", getAllJobDescriptions);
router.delete("/:id", deleteJobDescription);

module.exports = router;
