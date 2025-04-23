const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const config = require('../config');

// Mock client for development when database is not available
class MockPrismaClient {
  constructor() {
    this.data = {
      user: [],
      tenant: [],
      role: [],
      userRole: [],
      refreshToken: [],
      dataSource: [],
      campaign: [],
      investor: [],
      metric: [],
      report: [],
      auditLog: [],
    };
    
    // Mock methods
    this.user = this.createMockModel('user');
    this.tenant = this.createMockModel('tenant');
    this.role = this.createMockModel('role');
    this.userRole = this.createMockModel('userRole');
    this.refreshToken = this.createMockModel('refreshToken');
    this.dataSource = this.createMockModel('dataSource');
    this.campaign = this.createMockModel('campaign');
    this.investor = this.createMockModel('investor');
    this.metric = this.createMockModel('metric');
    this.report = this.createMockModel('report');
    this.auditLog = this.createMockModel('auditLog');
  }

  createMockModel(modelName) {
    return {
      findUnique: async () => null,
      findFirst: async () => null,
      findMany: async () => [],
      create: async (data) => ({id: 'mock-id', ...data.data}),
      update: async (data) => ({id: 'mock-id', ...data.data}),
      delete: async () => ({}),
      count: async () => 0,
    };
  }

  async $connect() {
    logger.info('Connected to mock database for development');
    return Promise.resolve();
  }

  async $disconnect() {
    return Promise.resolve();
  }
}

// Determine whether to use real or mock client
let prisma;
if (config.nodeEnv === 'development') {
  try {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    
    // Log Prisma errors
    prisma.$on('error', (e) => {
      logger.error(`Prisma Error: ${e.message}`);
    });
  } catch (error) {
    logger.warn('Unable to initialize Prisma client, using mock client for development');
    prisma = new MockPrismaClient();
  }
} else {
  prisma = new PrismaClient({
    log: ['error', 'warn', 'info'],
  });
  
  // Log Prisma errors
  prisma.$on('error', (e) => {
    logger.error(`Prisma Error: ${e.message}`);
  });
}

/**
 * Initialize database connection
 */
async function databaseLoader() {
  try {
    // Test connection
    await prisma.$connect();
    logger.info('Connected to database successfully');
    
    return prisma;
  } catch (error) {
    logger.error('Failed to connect to database', error);
    
    // In development mode, fall back to mock client
    if (config.nodeEnv === 'development') {
      logger.warn('Using mock database for development');
      prisma = new MockPrismaClient();
      await prisma.$connect();
      return prisma;
    }
    
    throw error;
  }
}

// Export Prisma client for reuse in different modules
module.exports = databaseLoader;
module.exports.prisma = prisma;
