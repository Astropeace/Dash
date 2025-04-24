const { Worker } = require('bullmq');
const { QUEUE_NAMES, redisConnectionOptions } = require('../services/jobQueue.service');
const logger = require('../utils/logger');
const dataSourceService = require('../services/datasource.service');
const encryptionService = require('../services/encryption.service');
const { PrismaClient, DataSourceType } = require('@prisma/client'); // Import Enum
const prisma = new PrismaClient(); // Temporary, use services ideally

logger.info(`Starting Data Sync Worker, connecting to Redis at ${redisConnectionOptions.host}:${redisConnectionOptions.port}...`);

// --- Placeholder Sync Functions ---
// These functions will contain the core logic for fetching/processing data based on type

const syncApiDataSource = async (dataSource, job) => {
    logger.info(`[Job ${job.id}] Starting API sync for DataSource ${dataSource.id} (${dataSource.name})`);
    // 1. Decrypt credentials (handle potential decryption errors)
    let credentials;
    if (dataSource.credentials) {
        const decryptedCredsStr = encryptionService.decrypt(dataSource.credentials); // Assuming credentials stored as encrypted JSON string
        if (!decryptedCredsStr) {
            throw new Error('Failed to decrypt credentials.');
        }
        try {
            credentials = JSON.parse(decryptedCredsStr);
        } catch (parseError) {
            throw new Error('Failed to parse decrypted credentials.');
        }
    } else {
        throw new Error('Credentials not found for API sync.');
    }

    // 2. Based on dataSource.type (GOOGLE_ADS, FACEBOOK_ADS, etc.), use credentials
    //    and connectionDetails/config to call the respective external API.
    //    - Use SDKs (e.g., google-ads-api, facebook-nodejs-business-sdk) or fetch.
    //    - Handle API pagination, rate limits, errors.
    logger.warn(`[Job ${job.id}] TODO: Implement API fetching logic for type ${dataSource.type}`);
    const fetchedMetrics = []; // Placeholder for fetched data

    // 3. Validate and Transform fetched data into Metric schema format.
    //    - Map API fields to Metric fields.
    //    - Ensure correct data types.
    //    - Associate with campaignId (how? Needs logic based on API response/config).
    const metricsToCreate = fetchedMetrics.map(metric => ({
        // ... map fields ...
        tenantId: dataSource.tenantId,
        campaignId: 'placeholder-campaign-id', // Needs real logic
        date: new Date(), // Needs real logic
        source: dataSource.type,
        // ... other metric fields
    }));
    logger.info(`[Job ${job.id}] Transformed ${metricsToCreate.length} metrics.`);

    // 4. Load data into Metric table (batching recommended).
    if (metricsToCreate.length > 0) {
        // TODO: Implement robust batching and duplicate handling (upsert?)
        await prisma.metric.createMany({
            data: metricsToCreate,
            skipDuplicates: true, // Example: simple duplicate skipping
        });
        logger.info(`[Job ${job.id}] Loaded ${metricsToCreate.length} metrics into database.`);
    }

    // 5. Return success details (optional)
    return { syncedRecords: metricsToCreate.length };
};

const syncCsvDataSource = async (dataSource, job) => {
    const filePath = job.data.payload?.filePath; // Get file path from job data
    logger.info(`[Job ${job.id}] Starting CSV sync for DataSource ${dataSource.id} from file ${filePath}`);

    if (!filePath) {
        throw new Error('CSV file path not provided in job data.');
    }

    // 1. Read and parse the CSV file (e.g., using 'csv-parser').
    //    - Handle potential file read errors.
    logger.warn(`[Job ${job.id}] TODO: Implement CSV parsing logic for file ${filePath}`);
    const csvRows = []; // Placeholder

    // 2. Validate and Transform rows based on mapping (if defined in dataSource.config).
    //    - Check data types, required fields.
    //    - Associate with campaignId.
    const metricsToCreate = csvRows.map(row => ({
        // ... map fields based on config/assumptions ...
        tenantId: dataSource.tenantId,
        campaignId: 'placeholder-campaign-id', // Needs real logic
        date: new Date(), // Needs real logic
        source: 'CSV',
        // ... other metric fields
    }));
    logger.info(`[Job ${job.id}] Transformed ${metricsToCreate.length} metrics from CSV.`);

    // 3. Load data into Metric table (batching, duplicate handling).
    if (metricsToCreate.length > 0) {
        await prisma.metric.createMany({
            data: metricsToCreate,
            skipDuplicates: true,
        });
        logger.info(`[Job ${job.id}] Loaded ${metricsToCreate.length} metrics into database.`);
    }

    // 4. TODO: Clean up the temporary CSV file.
    //    require('fs').unlink(filePath, (err) => { if (err) logger.error(...) });

    return { syncedRecords: metricsToCreate.length };
};

const syncSqlDataSource = async (dataSource, job) => {
    logger.info(`[Job ${job.id}] Starting SQL sync for DataSource ${dataSource.id}`);
    // 1. Decrypt credentials.
    // 2. Get connection details and query from config.
    // 3. Connect to the external SQL database.
    // 4. Execute the query.
    // 5. Validate and Transform results.
    // 6. Load into Metric table.
    // 7. Close external DB connection.
    logger.warn(`[Job ${job.id}] TODO: Implement SQL sync logic.`);
    return { syncedRecords: 0 };
};


// --- Worker Definition ---

const worker = new Worker(
    QUEUE_NAMES.DATA_SYNC,
    async (job) => {
        const { dataSourceId, tenantId } = job.data;
        logger.info(`[Job ${job.id}] Processing data sync job for DataSource ${dataSourceId} (Tenant ${tenantId})`);

        let dataSource;
        try {
            // Mark as syncing
            await dataSourceService.updateSyncStatus(dataSourceId, 'SYNCING');

            // Fetch data source details (should include credentials for the worker)
            // TODO: Modify getDataSourceByIdAndTenant or create a specific service method
            //       for the worker that *includes* (and decrypts?) credentials.
            //       For now, fetching directly with temporary prisma client.
            dataSource = await prisma.dataSource.findUnique({
                 where: { id: dataSourceId, tenantId }
                 // NO select clause here, need credentials
            });

            if (!dataSource) {
                throw new Error(`DataSource ${dataSourceId} not found for tenant ${tenantId}.`);
            }

            // Route to the correct sync function based on type
            let result;
            switch (dataSource.type) {
                case DataSourceType.API: // Using imported Enum
                case DataSourceType.GOOGLE_ADS:
                case DataSourceType.FACEBOOK_ADS:
                    result = await syncApiDataSource(dataSource, job);
                    break;
                case DataSourceType.CSV:
                    result = await syncCsvDataSource(dataSource, job);
                    break;
                case DataSourceType.SQL:
                    result = await syncSqlDataSource(dataSource, job);
                    break;
                default:
                    throw new Error(`Unsupported data source type: ${dataSource.type}`);
            }

            // Update status on success
            await dataSourceService.updateSyncStatus(dataSourceId, 'ACTIVE', {
                lastSyncStatus: 'success',
                syncErrorMessage: null, // Clear previous errors
                logEntry: { timestamp: new Date(), level: 'info', message: `Sync successful. ${result?.syncedRecords || 0} records processed.` }
            });

            logger.info(`[Job ${job.id}] Successfully completed sync for DataSource ${dataSourceId}.`);
            return result; // Optional: return value stored in job result

        } catch (error) {
            logger.error(`[Job ${job.id}] Failed sync for DataSource ${dataSourceId}: ${error.message}`, { stack: error.stack });
            // Update status on failure
            if (dataSourceId) { // Ensure we have the ID even if fetching failed
                await dataSourceService.updateSyncStatus(dataSourceId, 'ERROR', {
                    lastSyncStatus: 'error',
                    syncErrorMessage: error.message,
                    logEntry: { timestamp: new Date(), level: 'error', message: `Sync failed: ${error.message}` }
                });
            }
            // IMPORTANT: Throw the error again to mark the job as failed in BullMQ
            throw error;
        }
    },
    { connection: redisConnectionOptions, concurrency: 5 } // Adjust concurrency as needed
);

// --- Worker Event Listeners ---

worker.on('completed', (job, result) => {
    logger.info(`[Job ${job.id}] Completed. Result:`, result || 'No result');
});

worker.on('failed', (job, err) => {
    logger.error(`[Job ${job.id}] Failed with error: ${err.message}`, { stack: err.stack });
    // Additional error reporting (e.g., Sentry) could go here
});

worker.on('error', (err) => {
    logger.error(`Worker encountered an error: ${err.message}`, { stack: err.stack });
});

worker.on('active', (job) => {
    logger.info(`[Job ${job.id}] Started processing.`);
});

logger.info('Data Sync Worker is running and waiting for jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received. Closing worker...');
    await worker.close();
    logger.info('Worker closed.');
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received. Closing worker...');
    await worker.close();
    logger.info('Worker closed.');
    process.exit(0);
});
