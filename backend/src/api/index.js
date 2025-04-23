const express = require('express');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

/**
 * API Routes
 * @returns {express.Router} Express router instance
 */
function routes() {
  const router = express.Router();

  // Health check route
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  router.use('/auth', authRoutes);
  router.use('/users', userRoutes);

  return router;
}

module.exports = routes;
