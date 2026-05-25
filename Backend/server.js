require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// Database configuration
const connectDB = require("./config/db");
const User = require("./models/UserModel");

// Routes imports
const authRoutes = require("./api/authAPI");
const resumeRoutes = require("./api/resumeAPI");
const jdRoutes = require("./api/jdAPI");
const analyzeRoutes = require("./api/analyzeAPI");

// Error middleware
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

// Seed Demo User function
const seedDemoUser = async () => {
  try {
    const demoEmail = "demo@resumegrader.com";
    const userExists = await User.findOne({ email: demoEmail });
    if (!userExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);
      await User.create({
        name: "Demo User",
        email: demoEmail,
        password: hashedPassword,
      });
      console.log("Demo user seeded successfully (demo@resumegrader.com / password123)");
    }
  } catch (err) {
    console.error("Failed to seed demo user:", err.message);
  }
};

// Connect to MongoDB and seed
connectDB().then(() => {
  seedDemoUser();
});

// Create uploads folder synchronously if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middlewares
app.use(cors({
  origin: "https://ai-resume-analyzer-five-umber.vercel.app/login",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local file uploads statically
app.use("/uploads", express.static(uploadsDir));

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/analyze", analyzeRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("ATS Resume Grader Backend API Running...");
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Listen to port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});