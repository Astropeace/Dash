const express = require('express');
const datasourceController = require('../../controllers/datasource.controller');
// const authMiddleware = require('../../middleware/auth.middleware');
// const rbacMiddleware = require('../../middleware/rbac.middleware');
// const validateMiddleware = require('../../middleware/validate.middleware');
// const tenantMiddleware = require('../../middleware/tenant.middleware');
// const { createDataSourceSchema, updateDataSourceSchema } = require('../../validations/datasource.validation'); // Placeholder

const router = express.Router({ mergeParams: true }); // mergeParams allows access to tenantId from parent router

// --- TODO: Add Middleware ---
// router.use(authMiddleware);
// router.use(tenantMiddleware.verifyTenantAccess); // Ensure :tenantId matches user's tenant

// --- Routes ---

// List DataSources
router.get(
    '/',
    // rbacMiddleware.checkPermission('read:datasources'),
    datasourceController.listDataSources
);

// Create DataSource
router.post(
    '/',
    // rbacMiddleware.checkPermission('create:datasources'),
    // validateMiddleware(createDataSourceSchema),
    datasourceController.createDataSource
);

// Get DataSource by ID
router.get(
    '/:dataSourceId',
    // rbacMiddleware.checkPermission('read:datasources'),
    datasourceController.getDataSourceById
);

// Update DataSource
router.put(
    '/:dataSourceId',
    // rbacMiddleware.checkPermission('update:datasources'),
    // validateMiddleware(updateDataSourceSchema),
    datasourceController.updateDataSource
);

// Delete DataSource
router.delete(
    '/:dataSourceId',
    // rbacMiddleware.checkPermission('delete:datasources'),
    datasourceController.deleteDataSource
);

// --- Ingestion / Sync Routes ---

// Trigger Manual Sync
router.post(
    '/:dataSourceId/sync',
    // rbacMiddleware.checkPermission('sync:datasources'),
    datasourceController.triggerManualSync
);

// Get Sync Status
router.get(
    '/:dataSourceId/sync/status',
    // rbacMiddleware.checkPermission('read:datasources'),
    datasourceController.getSyncStatus
);

// // Example: CSV Upload Endpoint (requires file handling middleware like multer)
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Configure temporary storage
// router.post(
//     '/:dataSourceId/ingest/csv',
//     // rbacMiddleware.checkPermission('ingest:datasources'), // Or a more specific permission
//     upload.single('csvFile'), // 'csvFile' should match the form field name
//     datasourceController.ingestCsv // Controller method to handle CSV ingestion
// );


module.exports = router;
