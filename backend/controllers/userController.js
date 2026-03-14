const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch users.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, badgeId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'officer',
      badgeId: role === 'officer' ? badgeId : undefined,
    });
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        badgeId: user.badgeId,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create user.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, badgeId, password } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }
      user.email = email;
    }
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof badgeId !== 'undefined') user.badgeId = role === 'officer' ? badgeId : undefined;
    if (password && password.trim()) {
      user.password = password; // will be hashed by pre-save hook
    }
    await user.save();
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        badgeId: user.badgeId,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update user.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) {
      return res
        .status(400)
        .json({ success: false, message: 'You cannot delete your own admin account.' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete user.' });
  }
};

