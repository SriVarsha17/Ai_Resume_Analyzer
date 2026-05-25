// Memory store to keep track of IP request histories
const ipRequestHistory = new Map();

// Configuration: 60 requests per 15 minutes per IP
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 60;

/**
 * Rate Limiter middleware.
 * Restricts requests from a single IP address within a specified time window.
 */
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip";
  const now = Date.now();

  if (!ipRequestHistory.has(ip)) {
    ipRequestHistory.set(ip, []);
  }

  const timestamps = ipRequestHistory.get(ip);

  // Filter timestamps to only include those in the current window
  const activeTimestamps = timestamps.filter(time => now - time < WINDOW_MS);
  
  if (activeTimestamps.length >= MAX_REQUESTS) {
    res.status(429);
    return next(new Error("Too many analysis requests from this IP. Please wait 15 minutes before trying again."));
  }

  // Record this request
  activeTimestamps.push(now);
  ipRequestHistory.set(ip, activeTimestamps);

  // Set standard rate limiting headers
  res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
  res.setHeader("X-RateLimit-Remaining", MAX_REQUESTS - activeTimestamps.length);
  res.setHeader("X-RateLimit-Reset", new Date(now + WINDOW_MS).toISOString());

  next();
};

module.exports = {
  rateLimiter,
};
