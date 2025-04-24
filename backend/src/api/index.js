const express = require('express');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const datasourceRoutes = require('./routes/datasource.routes'); // Added datasource routes

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
  // Note: User routes might also need to be tenant-aware depending on requirements
  router.use('/users', userRoutes); 
  
  // Mount tenant-specific routes
  router.use('/tenants/:tenantId/datasources', datasourceRoutes);
  // TODO: Add other tenant-specific routes here (campaigns, investors, metrics, etc.)

  return router;
}

module.exports = routes;
