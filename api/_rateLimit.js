// Simple in-memory rate limiter for Vercel serverless
// Resets on cold start - good enough for basic abuse prevention
const _requests = new Map();

export function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  if (!_requests.has(key)) {
    _requests.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  const record = _requests.get(key);

  // Reset if window expired
  if (now > record.resetAt) {
    _requests.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Check limit
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of _requests.entries()) {
    if (now > val.resetAt) _requests.delete(key);
  }
}, 300000); // every 5 min
