import { Handler } from '@netlify/functions';
import { router } from '../../backend/src/api/routes';
import logger from '../../backend/src/utils/logger';

export const handler: Handler = async (event, context) => {
  try {
    const path = event.path.replace(/\.netlify\/functions\/api/, '');
    const method = event.httpMethod;
    
    // Find matching route
    const route = router.find(method, path);
    
    if (!route) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
    }

    // Execute route handler
    const result = await route.handler({
      query: event.queryStringParameters,
      body: event.body ? JSON.parse(event.body) : {},
      headers: event.headers,
      pathParams: route.params
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json'
      }
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
});
