const express = require('express');
const { getVehicles, createVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);
router.use(roleCheck('admin', 'officer'));
router.route('/').get(getVehicles).post(createVehicle);

module.exports = router;
