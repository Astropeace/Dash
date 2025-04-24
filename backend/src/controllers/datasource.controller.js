const dataSourceService = require('../services/datasource.service'); // Use the service
// const encryptionService = require('../services/encryption.service'); // Used within dataSourceService
const jobQueueService = require('../services/jobQueue.service'); // Use the job queue service
const logger = require('../utils/logger');
// Remove temporary Prisma client, rely on services
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// Basic error handling utility (replace with more robust solution)
const handleControllerError = (res, error, message = 'An error occurred') => {
    logger.error(`${message}: ${error.message}`, { stack: error.stack });
    // Distinguish between client errors (e.g., not found) and server errors
    if (error.code === 'P2025') { // Prisma code for record not found
        return res.status(404).json({ message: 'Resource not found.' });
    }
    // Add more specific error handling as needed
    return res.status(500).json({ message: `${message}.`, error: error.message });
};

// GET /api/v1/tenants/:tenantId/datasources
exports.listDataSources = async (req, res) => {
    const { tenantId } = req.params; // Assuming tenantId is validated by middleware
    // const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', type, status, search } = req.query;

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', type, status, search } = req.query;

    try {
        const options = { page: parseInt(page, 10), limit: parseInt(limit, 10), sortBy, sortOrder, filter: { type, status, search } };
        const result = await dataSourceService.listDataSourcesByTenant(tenantId, options);
        res.status(200).json(result);

    } catch (error) {
        handleControllerError(res, error, 'Failed to list data sources');
    }
};

// POST /api/v1/tenants/:tenantId/datasources
exports.createDataSource = async (req, res) => {
    const { tenantId } = req.params;
    const { name, type, connectionDetails, credentials, config, refreshSchedule, tags } = req.body;

    try {
        // Service handles encryption
        const dataSourceData = { name, type, connectionDetails, credentials, config, refreshSchedule, tags, tenantId };
        const newDataSource = await dataSourceService.createDataSource(dataSourceData);
        res.status(201).json(newDataSource); // Service already selects non-sensitive fields

    } catch (error) {
        handleControllerError(res, error, 'Failed to create data source');
    }
};

// GET /api/v1/tenants/:tenantId/datasources/:dataSourceId
exports.getDataSourceById = async (req, res) => {
    const { tenantId, dataSourceId } = req.params;

    try {
        const dataSource = await dataSourceService.getDataSourceByIdAndTenant(dataSourceId, tenantId);

        if (!dataSource) {
            return res.status(404).json({ message: 'Data source not found.' });
        }
        res.status(200).json(dataSource);

    } catch (error) {
        handleControllerError(res, error, 'Failed to retrieve data source');
    }
};

// PUT /api/v1/tenants/:tenantId/datasources/:dataSourceId
exports.updateDataSource = async (req, res) => {
    const { tenantId, dataSourceId } = req.params;
    const updateData = req.body;

    try {
        // Service handles encryption if credentials are included in updateData
        const updatedDataSource = await dataSourceService.updateDataSource(dataSourceId, tenantId, updateData);
        res.status(200).json(updatedDataSource); // Service already selects non-sensitive fields

    } catch (error) {
        handleControllerError(res, error, 'Failed to update data source');
    }
};

// DELETE /api/v1/tenants/:tenantId/datasources/:dataSourceId
exports.deleteDataSource = async (req, res) => {
    const { tenantId, dataSourceId } = req.params;

    try {
        await dataSourceService.deleteDataSource(dataSourceId, tenantId);
        res.status(204).send();

    } catch (error) {
        handleControllerError(res, error, 'Failed to delete data source');
    }
};

// POST /api/v1/tenants/:tenantId/datasources/:dataSourceId/sync
exports.triggerManualSync = async (req, res) => {
    const { tenantId, dataSourceId } = req.params;
    const userId = req.user?.id; // Assuming auth middleware provides user

    try {
        // Service can handle verification internally or controller can do it first
        // For simplicity, let's assume the service verifies ownership before queuing
        const job = await jobQueueService.addSyncJob({
            dataSourceId,
            tenantId,
            triggeredBy: userId,
            type: 'MANUAL' // Indicate manual trigger
        });

        if (!job) {
            // Handle case where job couldn't be added (e.g., queue service error)
            return res.status(500).json({ message: 'Failed to initiate sync job.' });
        }

        res.status(202).json({ message: 'Sync job initiated.', jobId: job.id });

    } catch (error) {
        handleControllerError(res, error, 'Failed to trigger manual sync');
    }
};

// GET /api/v1/tenants/:tenantId/datasources/:dataSourceId/sync/status
exports.getSyncStatus = async (req, res) => {
    const { tenantId, dataSourceId } = req.params;

    try {
        const statusInfo = await dataSourceService.getSyncStatus(dataSourceId, tenantId);

        if (!statusInfo) {
            return res.status(404).json({ message: 'Data source not found.' });
        }
        res.status(200).json(statusInfo);

    } catch (error) {
        handleControllerError(res, error, 'Failed to get sync status');
    }
};

// POST /api/v1/tenants/:tenantId/datasources/:dataSourceId/ingest/csv
exports.ingestCsv = async (req, res) => {
    const { tenantId, dataSourceId } = req.params;
    const userId = req.user?.id; // Assuming auth middleware provides user
    const csvFile = req.file; // Provided by multer middleware

    if (!csvFile) {
        return res.status(400).json({ message: 'CSV file is required.' });
    }

    try {
        // Optional: Basic verification here, or let the service/worker handle it
        const dataSource = await dataSourceService.getDataSourceByIdAndTenant(dataSourceId, tenantId);
        if (!dataSource || dataSource.type !== 'CSV') { // Check type using Enum from Prisma if available, else string
             // TODO: Clean up uploaded file if validation fails early
             // require('fs').unlink(csvFile.path, (err) => { if(err) logger.error(...) });
            return res.status(404).json({ message: 'CSV Data source not found.' });
        }

        // Add job to the queue
        const job = await jobQueueService.addSyncJob({
            dataSourceId,
            tenantId,
            triggeredBy: userId,
            type: 'CSV_UPLOAD', // Indicate CSV type
            payload: { // Pass file details in payload
                filePath: csvFile.path,
                originalName: csvFile.originalname,
                mimeType: csvFile.mimetype,
                size: csvFile.size
            }
        });

         if (!job) {
            // TODO: Clean up uploaded file if job couldn't be added
            // require('fs').unlink(csvFile.path, (err) => { if(err) logger.error(...) });
            return res.status(500).json({ message: 'Failed to initiate CSV ingestion job.' });
        }

        res.status(202).json({ message: 'CSV received, processing started.', jobId: job.id });

    } catch (error) {
        // TODO: Clean up uploaded file in case of any error before/during job queuing
        // require('fs').unlink(csvFile.path, (err) => { if(err) logger.error(...) });
        handleControllerError(res, error, 'Failed to start CSV ingestion');
    }
};
