
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");

const authRoutes = require("./api/authAPI");
const resumeRoutes = require("./api/resumeAPI");
const jdRoutes = require("./api/jdAPI");
const analyzeRoutes = require("./api/analyzeAPI");

const {
  notFound,
  errorHandler,
} = require("./middlewares/errorMiddleware");

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Upload directory (development fallback)
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static file access
app.use("/uploads", express.static(uploadsDir));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/analyze", analyzeRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).send("ATS Resume Grader Backend API Running...");
});

// API health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working",
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server after database connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
