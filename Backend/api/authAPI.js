const express = require("express");
const { protect } = require("../middlewares/authMiddleware");

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require("../controllers/authController");

const router = express.Router();

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// GET PROFILE
router.get("/profile", protect, getUserProfile);

// UPDATE PROFILE
router.put("/profile", protect, updateUserProfile);

module.exports = router;