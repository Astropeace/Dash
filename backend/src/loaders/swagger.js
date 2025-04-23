const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * OpenAPI specification
 * This will be populated with the API specification
 * We're using a placeholder that will be replaced with actual routes
 */
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Financial Analytics Dashboard API',
    version: '1.0.0',
    description: 'API for the Financial Analytics Dashboard',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: config.apiUrl,
      description: 'Main API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'error',
                },
                message: {
                  type: 'string',
                  example: 'Unauthorized',
                },
              },
            },
          },
        },
      },
      BadRequestError: {
        description: 'Bad request error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'error',
                },
                message: {
                  type: 'string',
                  example: 'Bad Request',
                },
                errors: {
                  type: 'object',
                  example: {
                    email: 'Email is required',
                  },
                },
              },
            },
          },
        },
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          tenantId: { type: 'string', format: 'uuid' },
          roles: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      Tenant: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          domain: { type: 'string' },
          tier: { type: 'string', enum: ['basic', 'premium', 'enterprise'] },
        },
      },
      // Other schemas will be added as needed
    },
  },
  paths: {},
  tags: [
    { name: 'Authentication', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Tenants', description: 'Tenant management endpoints' },
    { name: 'DataSources', description: 'Data source management endpoints' },
    { name: 'Campaigns', description: 'Campaign management endpoints' },
    { name: 'Investors', description: 'Investor management endpoints' },
    { name: 'Metrics', description: 'Performance metrics endpoints' },
    { name: 'Reports', description: 'Report generation endpoints' },
    { name: 'Analytics', description: 'Analytics and visualization endpoints' },
    { name: 'Recommendations', description: 'Recommendation engine endpoints' },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
};

/**
 * Initialize Swagger documentation
 * @param {Object} app - Express application instance
 */
function swaggerLoader({ app }) {
  try {
    // Configure Swagger UI options
    const options = {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCss: '.swagger-ui .topbar { display: none }',
    };

    // Set up Swagger UI endpoint
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, options));
    
    // JSON endpoint for programmatic access to the OpenAPI specification
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(openApiSpec);
    });

    logger.info('Swagger UI initialized at /api-docs');
  } catch (error) {
    logger.error('Failed to initialize Swagger', error);
  }
}

module.exports = swaggerLoader;
module.exports.openApiSpec = openApiSpec;
