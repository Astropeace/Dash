import express from 'express';
import http from 'http';
import config from './config';
import loaders from './loaders';
import logger from './utils/logger';
import { Handler, Context } from '@netlify/functions';

export const handler: Handler = async (event: any, context: Context) => {
  try {
    const app = express();
    const server = http.createServer(app);

    // Initialize application loaders
    await loaders({ app });

    // Netlify functions don't need to listen
    // server.listen(config.port, () => {
    //   logger.info(`🚀 Server running at http://localhost:${config.port}`);
    //   logger.info(`📚 API Documentation available at http://localhost:${config.port}/api-docs`);
    //   logger.info(`🔧 Environment: ${config.nodeEnv}`);
    // });

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Server started successfully' }),
    };
  } catch (error: any) {
    logger.error('Failed to start server:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to start server', error: error.message }),
    };
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  logger.error('Uncaught Exception:', err);
  // For uncaught exceptions, it's safer to crash and restart
  process.exit(1);
};
