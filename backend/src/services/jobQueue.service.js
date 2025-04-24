const { Queue } = require('bullmq');
const config = require('../config'); // For Redis config
const logger = require('../utils/logger');

// Define queue names
const QUEUE_NAMES = {
    DATA_SYNC: 'data-sync',
    // Add other queues as needed (e.g., 'report-generation', 'notifications')
};

// Create a reusable Redis connection options object
const redisConnectionOptions = {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    maxRetriesPerRequest: null // Recommended by BullMQ docs
};

// Initialize queues
const queues = {};

try {
    queues[QUEUE_NAMES.DATA_SYNC] = new Queue(QUEUE_NAMES.DATA_SYNC, {
        connection: redisConnectionOptions,
        defaultJobOptions: {
            attempts: 3, // Retry failed jobs 3 times
            backoff: {
                type: 'exponential',
                delay: 1000, // Initial delay 1s, then 2s, 4s
            },
            removeOnComplete: { // Keep completed jobs for a limited time
                age: 3600 * 24, // Keep for 24 hours
                count: 1000,    // Keep max 1000 jobs
            },
            removeOnFail: { // Keep failed jobs longer for inspection
                age: 3600 * 24 * 7, // Keep for 7 days
            },
        },
    });
    logger.info(`BullMQ queue '${QUEUE_NAMES.DATA_SYNC}' initialized.`);

    // Initialize other queues here...

} catch (error) {
    logger.error(`Failed to initialize BullMQ queues: ${error.message}`, { stack: error.stack });
    // Depending on the app's needs, you might want to exit or handle this differently
    process.exit(1);
}


/**
 * Adds a data synchronization job to the queue.
 * @param {object} jobData - Data for the job.
 * @param {string} jobData.dataSourceId - ID of the DataSource to sync.
 * @param {string} jobData.tenantId - ID of the tenant.
 * @param {string} [jobData.triggeredBy] - ID of the user who triggered the sync (optional).
 * @param {string} [jobData.type] - Type of sync (e.g., 'MANUAL', 'SCHEDULED', 'CSV_UPLOAD').
 * @param {object} [jobData.payload] - Additional payload (e.g., filePath for CSV).
 * @returns {Promise<import('bullmq').Job|null>} The added job or null on error.
 */
const addSyncJob = async (jobData) => {
    if (!jobData || !jobData.dataSourceId || !jobData.tenantId) {
        logger.error('Invalid job data provided to addSyncJob.', { jobData });
        return null;
    }

    const queue = queues[QUEUE_NAMES.DATA_SYNC];
    if (!queue) {
        logger.error(`Queue '${QUEUE_NAMES.DATA_SYNC}' not found.`);
        return null;
    }

    try {
        // Use dataSourceId as job ID to potentially prevent duplicate active jobs if needed,
        // though BullMQ handles concurrency well. Consider implications.
        const jobId = `sync-${jobData.dataSourceId}`;
        const job = await queue.add(QUEUE_NAMES.DATA_SYNC, jobData, { jobId });
        logger.info(`Added job ${job.id} to queue '${QUEUE_NAMES.DATA_SYNC}'`, { jobData });
        return job;
    } catch (error) {
        logger.error(`Failed to add job to queue '${QUEUE_NAMES.DATA_SYNC}': ${error.message}`, { jobData, stack: error.stack });
        return null;
    }
};

// Add functions to add jobs to other queues here...
// const addReportJob = async (jobData) => { ... };

module.exports = {
    queues,
    addSyncJob,
    // addReportJob,
    QUEUE_NAMES,
    redisConnectionOptions // Export connection options for worker
};
