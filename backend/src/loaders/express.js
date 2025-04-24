const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const RedisStore = require('connect-redis').default; // Use .default for ES6 compatibility
const redisLoader = require('./redis'); // Import the loader to get the client
const config = require('../config');
const logger = require('../utils/logger');
const routes = require('../api');

/**
 * Initialize Express with middleware and routes
 * @param {Object} app - Express application instance
 */
async function expressLoader({ app }) {
  // Enable if you're behind a reverse proxy (Heroku, AWS ELB, Nginx, etc)
  app.set('trust proxy', 1);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Enable CORS with options
  app.use(cors({
    origin: config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  // Security headers middleware
  app.use(helmet());

  // Compression middleware to reduce response size
  app.use(compression());

  // Request body parsers
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Session middleware (needs to come before routes that use sessions)
  const redisClient = redisLoader.getClient(); // Get the initialized Redis client
  if (redisClient) { // Only configure session if Redis is available
    const redisStore = new RedisStore({
      client: redisClient,
      prefix: 'sess:', // Optional prefix for session keys in Redis
      // ttl: 86400 // Optional: Session TTL in seconds (e.g., 1 day)
    });

    app.use(
      session({
        store: redisStore,
        secret: config.sessionSecret, // Use the secret from config
        resave: false, // Don't save session if unmodified
        saveUninitialized: false, // Don't create session until something stored
        cookie: {
          secure: config.nodeEnv === 'production', // Use secure cookies in production
          httpOnly: true, // Prevent client-side JS from accessing the cookie
          maxAge: 1000 * 60 * 60 * 24 * 7, // Optional: Cookie expiry (e.g., 7 days)
          sameSite: 'lax', // Adjust as needed ('strict', 'lax', 'none')
        },
      })
    );
    logger.info('Session middleware configured with Redis store.');
  } else {
    logger.warn('Redis client not available. Session middleware skipped. Google OAuth flow requiring sessions will not work.');
    // Optionally, configure a memory store for development if Redis isn't running,
    // but be aware it's not suitable for production and won't persist across restarts.
    // app.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: false }));
  }


  // Request logging
  app.use(morgan('combined', { stream: logger.stream }));

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
  });
  app.use('/api', apiLimiter);

  // Static files directory (for exported reports, etc.)
  app.use('/static', express.static(path.join(__dirname, '../../public')));

  // API routes
  app.use('/api', routes());

  // 404 handler
  app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    // Log error
    logger.error(err.stack);

    // Handle different types of errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation Error',
        errors: err.errors || err.message,
      });
    }

    // Default error response
    const status = err.status || 500;
    const message = status === 500 
      ? 'Internal Server Error' 
      : err.message;
    
    return res.status(status).json({
      status: 'error',
      message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  });
}

module.exports = expressLoader;
