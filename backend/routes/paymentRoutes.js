const express = require('express');
const { getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);
router.get('/', roleCheck('admin', 'driver'), getPayments);

module.exports = router;
