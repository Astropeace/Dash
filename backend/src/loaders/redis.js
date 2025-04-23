const Redis = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

// Create Redis client
let redisClient = null;

/**
 * Initialize Redis connection
 */
async function redisLoader() {
  try {
    // In development, we'll make Redis optional
    if (config.nodeEnv === 'development') {
      logger.warn('Running in development mode without Redis. Some features will be limited.');
      return null;
    }
    
    // Configure Redis client
    redisClient = Redis.createClient({
      url: `redis://${config.redis.password ? `:${config.redis.password}@` : ''}${config.redis.host}:${config.redis.port}`,
      legacyMode: false, // use new Redis 4 interface
    });

    // Set event handlers
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis successfully');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Reconnecting to Redis...');
    });

    // Connect to Redis
    await redisClient.connect();

    // Test connection with ping
    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      logger.info('Redis connection test successful');
    }

    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    // In development, allow the app to start without Redis
    if (config.nodeEnv === 'development') {
      logger.warn('Continuing without Redis in development mode');
      return null;
    }
    throw error;
  }
}

// Export Redis client for reuse in different modules
module.exports = redisLoader;
module.exports.getClient = () => redisClient;
