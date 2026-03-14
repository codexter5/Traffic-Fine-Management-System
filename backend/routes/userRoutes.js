const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);
router.use(roleCheck('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser);

module.exports = router;

