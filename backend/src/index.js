require('dotenv').config();
const express = require('express');
const http = require('http');
const config = require('./config');
const loaders = require('./loaders');
const logger = require('./utils/logger');

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Initialize application loaders
  await loaders({ app });

  // Start the server
  server.listen(config.port, () => {
    logger.info(`🚀 Server running at http://localhost:${config.port}`);
    logger.info(`📚 API Documentation available at http://localhost:${config.port}/api-docs`);
    logger.info(`🔧 Environment: ${config.nodeEnv}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Don't crash the server, just log the error
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // For uncaught exceptions, it's safer to crash and restart
    process.exit(1);
  });

  return { app, server };
}

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
