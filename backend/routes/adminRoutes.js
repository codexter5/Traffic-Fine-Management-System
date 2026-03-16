const express = require('express');
const { getStats, getAuditLogs } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);
router.use(roleCheck('admin'));
router.get('/stats', getStats);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
