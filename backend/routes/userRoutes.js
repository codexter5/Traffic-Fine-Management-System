const express = require('express');
const { getUsers, createUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);
router.use(roleCheck('admin'));

router.route('/').get(getUsers).post(createUser);

module.exports = router;

