const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret-change-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });

exports.register = async (req, res) => {
  try {
    const { email, password, name, role, badgeId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({ email, password, name, role: role || 'officer', badgeId });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, badgeId: user.badgeId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, badgeId: user.badgeId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Login failed.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get profile.' });
  }
};
