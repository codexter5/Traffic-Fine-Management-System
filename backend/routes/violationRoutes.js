const express = require('express');
const { getViolations, createViolation } = require('../controllers/violationController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);
router.use(roleCheck('admin', 'officer'));
router.get('/', getViolations);
router.post('/', createViolation);

module.exports = router;
