// A simple memory-based rate limiter
const rateLimit = new Map();

// Rate limit configuration
const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_REQUESTS = 250; // Maximum requests per window

export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, {
      requests: 1,
      windowStart: now
    });
    return next();
  }

  const client = rateLimit.get(ip);
  
  // If the window has expired, reset the counter
  if (now - client.windowStart > WINDOW_SIZE) {
    client.requests = 1;
    client.windowStart = now;
    return next();
  }

  // If within the window but exceeded max requests
  if (client.requests >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil((client.windowStart + WINDOW_SIZE - now) / 1000)
    });
  }

  // Increment the request count
  client.requests++;
  next();
};

// Cleanup function to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimit.entries()) {
    if (now - data.windowStart > WINDOW_SIZE) {
      rateLimit.delete(ip);
    }
  }
}, WINDOW_SIZE);