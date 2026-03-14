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

