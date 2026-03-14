const express = require('express');
const { getDrivers, getDriverById, createDriver } = require('../controllers/driverController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);
router.use(roleCheck('admin', 'officer'));
router.route('/').get(getDrivers).post(createDriver);
router.get('/:id', getDriverById);

module.exports = router;
