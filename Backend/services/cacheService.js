const crypto = require("crypto");

// In-memory cache store
const cacheStore = new Map();

// Default Cache TTL: 15 minutes (in milliseconds)
const DEFAULT_TTL = 15 * 60 * 1000;

/**
 * Generates a unique SHA-256 hash key based on the analysis parameters.
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Target job description text
 * @param {string} targetRole - Chosen target role
 * @returns {string} Unique hash key
 */
const generateCacheKey = (resumeText = "", jobDescription = "", targetRole = "") => {
  const inputString = `${resumeText.trim()}_${jobDescription.trim()}_${targetRole.trim()}`;
  return crypto.createHash("sha256").update(inputString).digest("hex");
};

/**
 * Retrieves a cached analysis result if it exists and has not expired.
 * @param {string} key - Hashed cache key
 * @returns {object|null} Cached result or null
 */
const getCachedResult = (key) => {
  if (!cacheStore.has(key)) return null;

  const cached = cacheStore.get(key);
  const now = Date.now();

  if (now > cached.expiresAt) {
    cacheStore.delete(key); // Evict expired item
    return null;
  }

  return cached.data;
};

/**
 * Stores an analysis result in the cache with an expiration timeline.
 * @param {string} key - Hashed cache key
 * @param {object} data - Analysis report payload
 * @param {number} ttlMs - Time-to-live in milliseconds
 */
const setCachedResult = (key, data, ttlMs = DEFAULT_TTL) => {
  const expiresAt = Date.now() + ttlMs;
  cacheStore.set(key, {
    data,
    expiresAt,
  });
};

/**
 * Periodically cleans up expired entries to prevent memory growth.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cacheStore.entries()) {
    if (now > value.expiresAt) {
      cacheStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

module.exports = {
  generateCacheKey,
  getCachedResult,
  setCachedResult,
};
