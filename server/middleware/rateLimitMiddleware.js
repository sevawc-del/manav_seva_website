const windows = new Map();

const createRateLimiter = ({ windowMs, maxRequests, message }) => {
  return (req, res, next) => {
    const key = `${req.path}:${req.ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = (windows.get(key) || []).filter((ts) => ts > windowStart);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({ message });
    }

    timestamps.push(now);
    windows.set(key, timestamps);
    next();
  };
};

module.exports = {
  createRateLimiter
};
