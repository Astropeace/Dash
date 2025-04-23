/**
 * Application Configuration
 * Centralizes all configuration values from environment variables
 */

const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // JWT authentication
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // 100 requests per windowMs
  },
  
  // Logging
  logs: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // External APIs
  externalApis: {
    alphaVantage: {
      apiKey: process.env.ALPHA_VANTAGE_API_KEY,
      baseUrl: 'https://www.alphavantage.co/query',
    },
    yahooFinance: {
      apiKey: process.env.YAHOO_FINANCE_API_KEY,
      baseUrl: 'https://yfapi.net',
    },
    googleAnalytics: {
      apiKey: process.env.GOOGLE_ANALYTICS_API_KEY,
    },
    facebookAds: {
      apiKey: process.env.FACEBOOK_ADS_API_KEY,
    },
  },
  
  // Feature flags for different subscription tiers
  featureFlags: {
    basic: {
      maxDataSources: 3,
      maxUsers: 5,
      enabledFeatures: ['basic_reports', 'csv_import', 'standard_visualizations'],
    },
    premium: {
      maxDataSources: 10,
      maxUsers: 20,
      enabledFeatures: ['basic_reports', 'csv_import', 'standard_visualizations', 'advanced_reports', 'api_connectors', 'recommendation_engine'],
    },
    enterprise: {
      maxDataSources: -1, // unlimited
      maxUsers: -1, // unlimited
      enabledFeatures: ['basic_reports', 'csv_import', 'standard_visualizations', 'advanced_reports', 'api_connectors', 'recommendation_engine', 'custom_exports', 'white_label', 'sso'],
    },
  },
};

module.exports = config;
