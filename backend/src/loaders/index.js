const expressLoader = require('./express');
const databaseLoader = require('./database');
const redisLoader = require('./redis');
const passportLoader = require('./passport');
const swaggerLoader = require('./swagger');
const bullLoader = require('./bull');
const logger = require('../utils/logger');

/**
 * Initialize all application loaders
 * @param {Object} app - Express application instance
 */
async function init({ app }) {
  logger.info('✅ Starting application loaders...');

  // Initialize database connection
  await databaseLoader();
  logger.info('✅ Database initialized');

  // Initialize Redis connection
  await redisLoader();
  logger.info('✅ Redis initialized');

  // Initialize Passport authentication
  passportLoader(app);
  logger.info('✅ Passport authentication initialized');

  // Initialize Express middleware
  await expressLoader({ app });
  logger.info('✅ Express initialized');

  // Initialize Swagger documentation
  swaggerLoader({ app });
  logger.info('✅ API Documentation initialized');

  // Initialize Bull queues for background jobs
  bullLoader({ app });
  logger.info('✅ Background jobs initialized');

  logger.info('✅ All modules loaded successfully!');
}

module.exports = init;
