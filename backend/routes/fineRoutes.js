const express = require('express');
const { getFines, getFineById, createFine, updateFine, submitDispute, resolveDispute } = require('../controllers/fineController');
const { payFine } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);

router.route('/').get(getFines).post(roleCheck('admin', 'officer'), createFine);
router.get('/:id', getFineById);
router.patch('/:id', roleCheck('admin', 'officer'), updateFine);
router.post('/:id/dispute', roleCheck('driver'), submitDispute);
router.patch('/:id/dispute', roleCheck('admin', 'officer'), resolveDispute);
router.post('/:id/pay', roleCheck('admin', 'driver'), payFine);

module.exports = router;
