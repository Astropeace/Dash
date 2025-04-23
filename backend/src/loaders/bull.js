const Bull = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const config = require('../config');
const logger = require('../utils/logger');

// Mock queues for development when Redis is not available
class MockQueue {
  constructor(name) {
    this.name = name;
    this.eventHandlers = {};
  }

  on(event, handler) {
    this.eventHandlers[event] = handler;
    return this;
  }

  add(data, options) {
    logger.info(`[MOCK] Added job to ${this.name} queue`);
    return Promise.resolve({ id: 'mock-job-id', data });
  }

  process(handler) {
    logger.info(`[MOCK] Registered processor for ${this.name} queue`);
    return this;
  }
}

// Determine whether to use real or mock queues
let reportQueue, dataIngestionQueue, notificationQueue;

if (config.nodeEnv === 'development') {
  // Use mock queues in development mode if Redis is not available
  try {
    // Try to create real queues, but fallback to mock if Redis is unavailable
    reportQueue = new Bull('report-generation', {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
    
    dataIngestionQueue = new Bull('data-ingestion', {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });
    
    notificationQueue = new Bull('notifications', {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        removeOnComplete: 200,
        removeOnFail: 100,
      },
    });
  } catch (error) {
    logger.warn('Unable to connect to Redis, using mock queues in development mode');
    reportQueue = new MockQueue('report-generation');
    dataIngestionQueue = new MockQueue('data-ingestion');
    notificationQueue = new MockQueue('notifications');
  }
} else {
  // Use real queues in production mode
  reportQueue = new Bull('report-generation', {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  });
  
  dataIngestionQueue = new Bull('data-ingestion', {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  });
  
  notificationQueue = new Bull('notifications', {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      removeOnComplete: 200,
      removeOnFail: 100,
    },
  });
}

// Set up queue event handlers (only for real queues, not mocks)
if (!(reportQueue instanceof MockQueue)) {
  [reportQueue, dataIngestionQueue, notificationQueue].forEach((queue) => {
    queue.on('error', (error) => {
      logger.error(`Queue ${queue.name} error:`, error);
    });

    queue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} in ${queue.name} failed:`, error);
    });

    queue.on('completed', (job, result) => {
      logger.debug(`Job ${job.id} in ${queue.name} completed successfully`);
    });
  });
}

/**
 * Initialize Bull queues and admin UI
 * @param {Object} app - Express application instance
 */
function bullLoader({ app }) {
  try {
    // Set up Bull Board admin UI, even with mock queues
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    // Create Bull Board with whatever queues we have (real or mock)
    const queueAdapters = [];
    
    if (!(reportQueue instanceof MockQueue)) {
      queueAdapters.push(new BullAdapter(reportQueue));
      queueAdapters.push(new BullAdapter(dataIngestionQueue));
      queueAdapters.push(new BullAdapter(notificationQueue));
    }

    createBullBoard({
      queues: queueAdapters,
      serverAdapter,
    });

    // Add Bull Board routes to the Express app
    app.use('/admin/queues', serverAdapter.getRouter());

    logger.info('Bull queues initialized');
    logger.info('Bull Board admin UI initialized at /admin/queues');

    return {
      reportQueue,
      dataIngestionQueue,
      notificationQueue,
    };
  } catch (error) {
    logger.error('Failed to initialize Bull queues', error);
    
    // In development, continue without Bull if Redis is not available
    if (config.nodeEnv === 'development') {
      logger.warn('Continuing without Bull queues in development mode');
      return {
        reportQueue: new MockQueue('report-generation'),
        dataIngestionQueue: new MockQueue('data-ingestion'),
        notificationQueue: new MockQueue('notifications'),
      };
    }
    
    throw error;
  }
}

// Export queues for use in services
module.exports = bullLoader;
module.exports.queues = {
  reportQueue,
  dataIngestionQueue,
  notificationQueue,
};
