const { createClient } = require("redis");

let redisClient;
let errorLogged = false;

const connectRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URI || "redis://localhost:6379",
    socket: {
      reconnectStrategy: false, // Don't constantly try to reconnect if Redis is missing
    }
  });

  redisClient.on("error", (error) => {
    if (!errorLogged) {
      console.warn(`Redis Connection Error: ${error.message} - Caching will be bypassed.`);
      errorLogged = true;
    }
  });

  redisClient.on("connect", () => {
    console.log("Redis cache connected");
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.warn("Could not connect to Redis. Running without cache.");
  }
};

const getRedisClient = () => redisClient;

/**
 * Cache middleware for Express routes
 * @param {string} keyPrefix - Prefix for the cache key
 * @param {number} expirationTime - Expiration time in seconds
 */
const cacheMiddleware = (keyPrefix, expirationTime = 300) => {
  return async (req, res, next) => {
    if (!redisClient || !redisClient.isOpen) {
      return next(); // Bypass cache if Redis is down
    }

    try {
      // Create a unique key based on prefix and query params
      const key = `${keyPrefix}:${req.originalUrl}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Override res.json to cache the response before sending it
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redisClient.setEx(key, expirationTime, JSON.stringify(data)).catch((err) => {
          console.warn("Failed to set cache:", err.message);
        });
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.warn("Cache error:", err.message);
      next();
    }
  };
};

/**
 * Utility to clear keys matching a pattern
 */
const clearCache = async (pattern) => {
  if (!redisClient || !redisClient.isOpen) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.warn("Failed to clear cache:", err.message);
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cacheMiddleware,
  clearCache,
};
