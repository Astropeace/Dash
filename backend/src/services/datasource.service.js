const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const encryptionService = require('./encryption.service'); // Placeholder for encryption
const logger = require('../utils/logger');

/**
 * Lists data sources for a given tenant with pagination, sorting, and filtering.
 * @param {string} tenantId - The ID of the tenant.
 * @param {object} options - Options for pagination, sorting, filtering.
 * @param {number} options.page - Page number.
 * @param {number} options.limit - Items per page.
 * @param {string} options.sortBy - Field to sort by.
 * @param {string} options.sortOrder - 'asc' or 'desc'.
 * @param {object} options.filter - Filtering criteria (e.g., { type, status, search }).
 * @returns {Promise<object>} - Paginated list of data sources (excluding credentials).
 */
exports.listDataSourcesByTenant = async (tenantId, options) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', filter = {} } = options;
    const skip = (page - 1) * limit;
    const where = { tenantId };

    // Apply filters (example)
    if (filter.type) {
        where.type = filter.type; // Assumes filter.type matches Enum value
    }
    if (filter.status) {
        where.status = filter.status; // Assumes filter.status matches Enum value
    }
    if (filter.search) {
        where.name = { contains: filter.search, mode: 'insensitive' };
    }

    try {
        const [dataSources, total] = await prisma.$transaction([
            prisma.dataSource.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                select: { // Explicitly select non-sensitive fields
                    id: true, name: true, type: true, status: true, lastSync: true,
                    lastSyncStatus: true, createdAt: true, updatedAt: true, tags: true
                }
            }),
            prisma.dataSource.count({ where })
        ]);

        return {
            data: dataSources,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.error(`Error listing data sources for tenant ${tenantId}: ${error.message}`);
        throw error; // Re-throw for controller to handle
    }
};

/**
 * Creates a new data source, encrypting credentials.
 * @param {object} dataSourceData - Data for the new data source.
 * @param {string} dataSourceData.tenantId - Tenant ID.
 * @param {string} dataSourceData.name - Name.
 * @param {DataSourceType} dataSourceData.type - Type enum.
 * @param {object} [dataSourceData.connectionDetails] - Connection details JSON.
 * @param {object} [dataSourceData.credentials] - Credentials JSON (will be encrypted).
 * @param {object} [dataSourceData.config] - Configuration JSON.
 * @param {string} [dataSourceData.refreshSchedule] - Cron schedule string.
 * @param {string[]} [dataSourceData.tags] - Tags.
 * @returns {Promise<object>} - The created data source (excluding credentials).
 */
exports.createDataSource = async (dataSourceData) => {
    const { credentials, tenantId, ...restData } = dataSourceData;
    let encryptedCredentials = null;

    try {
        if (credentials) {
            // TODO: Implement actual encryption
            // encryptedCredentials = await encryptionService.encrypt(JSON.stringify(credentials));
            logger.warn('TODO: Implement credential encryption in datasource.service.js');
            encryptedCredentials = credentials; // Placeholder: Store as is (UNSAFE)
        }

        const newDataSource = await prisma.dataSource.create({
            data: {
                ...restData,
                tenantId,
                credentials: encryptedCredentials ? encryptedCredentials : Prisma.JsonNull, // Store encrypted data or null
            },
            select: { // Exclude sensitive fields
                id: true, name: true, type: true, status: true, createdAt: true, updatedAt: true
            }
        });
        return newDataSource;
    } catch (error) {
        logger.error(`Error creating data source for tenant ${tenantId}: ${error.message}`);
        // Handle potential unique constraint errors (e.g., name)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error(`Data source with name '${dataSourceData.name}' already exists for this tenant.`);
        }
        throw error;
    }
};

/**
 * Retrieves a single data source by ID and tenant ID.
 * @param {string} dataSourceId - The ID of the data source.
 * @param {string} tenantId - The ID of the tenant.
 * @returns {Promise<object|null>} - The data source (excluding credentials) or null if not found.
 */
exports.getDataSourceByIdAndTenant = async (dataSourceId, tenantId) => {
    try {
        const dataSource = await prisma.dataSource.findUnique({
            where: { id: dataSourceId, tenantId },
            select: { // Exclude sensitive fields
                id: true, name: true, type: true, status: true, connectionDetails: true, config: true,
                refreshSchedule: true, lastSync: true, lastSyncStatus: true, syncErrorMessage: true,
                tags: true, createdAt: true, updatedAt: true, syncLogs: { take: 10 } // Limit logs
            }
        });
        return dataSource;
    } catch (error) {
        logger.error(`Error retrieving data source ${dataSourceId} for tenant ${tenantId}: ${error.message}`);
        throw error;
    }
};

/**
 * Updates a data source, encrypting credentials if provided.
 * @param {string} dataSourceId - The ID of the data source.
 * @param {string} tenantId - The ID of the tenant.
 * @param {object} updateData - Data to update. Credentials will be encrypted if present.
 * @returns {Promise<object>} - The updated data source (excluding credentials).
 */
exports.updateDataSource = async (dataSourceId, tenantId, updateData) => {
    const { credentials, ...restUpdateData } = updateData;
    let dataToUpdate = restUpdateData;

    try {
        if (credentials !== undefined) { // Check if credentials field is explicitly provided (even if null)
            if (credentials) {
                // TODO: Implement actual encryption
                // const encrypted = await encryptionService.encrypt(JSON.stringify(credentials));
                logger.warn('TODO: Implement credential encryption in datasource.service.js update');
                dataToUpdate.credentials = credentials; // Placeholder: Store as is (UNSAFE)
            } else {
                // Handle setting credentials to null
                dataToUpdate.credentials = Prisma.JsonNull;
            }
        }

        const updatedDataSource = await prisma.dataSource.update({
            where: { id: dataSourceId, tenantId },
            data: dataToUpdate,
            select: { // Exclude sensitive fields
                id: true, name: true, type: true, status: true, createdAt: true, updatedAt: true
            }
        });
        return updatedDataSource;
    } catch (error) {
        logger.error(`Error updating data source ${dataSourceId} for tenant ${tenantId}: ${error.message}`);
        // Handle potential errors like record not found (P2025)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new Error('Data source not found.');
        }
        throw error;
    }
};

/**
 * Deletes a data source by ID and tenant ID.
 * @param {string} dataSourceId - The ID of the data source.
 * @param {string} tenantId - The ID of the tenant.
 * @returns {Promise<void>}
 */
exports.deleteDataSource = async (dataSourceId, tenantId) => {
    try {
        await prisma.dataSource.delete({
            where: { id: dataSourceId, tenantId }
        });
    } catch (error) {
        logger.error(`Error deleting data source ${dataSourceId} for tenant ${tenantId}: ${error.message}`);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new Error('Data source not found.');
        }
        // Consider implications: Should deleting a data source delete associated metrics? (Handled by schema cascade?)
        throw error;
    }
};


/**
 * Retrieves sync status information for a data source.
 * @param {string} dataSourceId - The ID of the data source.
 * @param {string} tenantId - The ID of the tenant.
 * @returns {Promise<object|null>} - Sync status details or null if not found.
 */
exports.getSyncStatus = async (dataSourceId, tenantId) => {
    try {
        const statusInfo = await prisma.dataSource.findUnique({
            where: { id: dataSourceId, tenantId },
            select: {
                status: true,
                lastSync: true,
                lastSyncStatus: true,
                syncErrorMessage: true,
                syncLogs: { take: 10 } // Example: limit logs
            }
        });
        return statusInfo;
    } catch (error) {
        logger.error(`Error getting sync status for data source ${dataSourceId}: ${error.message}`);
        throw error;
    }
};

/**
 * Updates the sync status of a data source. Used by background jobs.
 * @param {string} dataSourceId - The ID of the data source.
 * @param {DataSourceStatus} status - The new status.
 * @param {object} details - Optional details (lastSyncStatus, syncErrorMessage, logEntry).
 * @returns {Promise<void>}
 */
exports.updateSyncStatus = async (dataSourceId, status, details = {}) => {
    const data = { status };
    if (details.lastSyncStatus) data.lastSyncStatus = details.lastSyncStatus;
    if (details.syncErrorMessage !== undefined) data.syncErrorMessage = details.syncErrorMessage; // Allow setting to null
    if (status === 'ACTIVE' || status === 'ERROR') data.lastSync = new Date(); // Update lastSync on completion/error

    // Handle syncLogs update (append new entry) - Requires careful handling of JSON arrays
    let logUpdate = undefined;
    if (details.logEntry) {
        // This is a simplified example. Appending to JSON arrays in Prisma can be tricky.
        // A more robust approach might involve reading the logs, appending, and writing back,
        // or using a raw query if performance is critical.
        // For now, we'll just log a warning.
        logger.warn(`TODO: Implement robust JSON array append for syncLogs on DataSource ${dataSourceId}`);
        // Example (potentially unsafe without read-modify-write):
        // logUpdate = { push: details.logEntry };
    }

    try {
        await prisma.dataSource.update({
            where: { id: dataSourceId },
            data: {
                ...data,
                // syncLogs: logUpdate // Add this back when append logic is solid
            }
        });
        logger.info(`Updated sync status for DataSource ${dataSourceId} to ${status}`);
    } catch (error) {
        logger.error(`Error updating sync status for DataSource ${dataSourceId}: ${error.message}`);
        // Don't throw here usually, as this is often called from background jobs
    }
};

// TODO: Add functions for triggering jobs (interact with jobQueueService)
// exports.triggerSyncJob = async (dataSourceId, tenantId, triggeredBy) => { ... }
// exports.triggerCsvIngestionJob = async (dataSourceId, tenantId, filePath, originalName, triggeredBy) => { ... }
