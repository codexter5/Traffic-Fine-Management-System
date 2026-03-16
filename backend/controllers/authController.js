const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret-change-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });

const generateLicenseNumber = () => {
  const d = new Date();
  const part = d.toISOString().slice(0, 10).replace(/-/g, '') + Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DL-${part}`;
};

exports.signup = async (req, res) => {
  try {
    const { email, password, name, licenseNumber, phone, address, vehicle } = req.body;
    const emailNorm = email?.trim().toLowerCase();
    if (!emailNorm || !password || !name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({
      email: emailNorm,
      password,
      name: name.trim(),
      role: 'driver',
    });
    const license = (licenseNumber && String(licenseNumber).trim()) || generateLicenseNumber();
    const licenseClean = license.toUpperCase().replace(/\s/g, '');
    const existingDriver = await Driver.findOne({ licenseNumber: licenseClean });
    if (existingDriver) {
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({ success: false, message: 'License number already in use. Try another or leave blank.' });
    }
    const driver = await Driver.create({
      licenseNumber: licenseClean,
      name: user.name,
      email: user.email,
      phone: phone?.trim() || undefined,
      address: address?.trim() || undefined,
    });
    let vehicleRecord = null;
    if (vehicle && vehicle.plateNumber && String(vehicle.plateNumber).trim()) {
      const plate = String(vehicle.plateNumber).trim().toUpperCase().replace(/\s/g, '');
      const existingVehicle = await Vehicle.findOne({ plateNumber: plate });
      if (!existingVehicle) {
        vehicleRecord = await Vehicle.create({
          plateNumber: plate,
          driverId: driver._id,
          make: vehicle.make?.trim() || undefined,
          model: vehicle.model?.trim() || undefined,
          year: vehicle.year ? Number(vehicle.year) : undefined,
          type: vehicle.type || 'car',
        });
      }
    }
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      message: 'Account created. You can now log in.',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Signup failed.' });
  }
};

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
    const user = await User.findById(req.user.id).select('-password').lean();
    let driver = null;
    if (user?.role === 'driver') {
      driver = await Driver.findOne({ email: user.email }).lean();
    }
    res.json({ success: true, user, driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get profile.' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, email, password, badgeId, licenseNumber, phone, address } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const nextEmail = email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== user.email) {
      const existing = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }
      user.email = nextEmail;
    }
    if (name?.trim()) user.name = name.trim();
    if (password?.trim()) user.password = password;
    if (user.role === 'officer' && typeof badgeId !== 'undefined') {
      user.badgeId = badgeId?.trim() || undefined;
    }
    await user.save();

    let driverPayload = null;
    if (user.role === 'driver') {
      let driver = await Driver.findOne({ email: req.user.email });
      if (!driver && nextEmail) {
        driver = await Driver.findOne({ email: nextEmail });
      }
      if (driver) {
        if (name?.trim()) driver.name = name.trim();
        if (nextEmail) driver.email = nextEmail;
        if (typeof phone !== 'undefined') driver.phone = phone?.trim() || undefined;
        if (typeof address !== 'undefined') driver.address = address?.trim() || undefined;
        if (licenseNumber && String(licenseNumber).trim()) {
          const lic = String(licenseNumber).trim().toUpperCase().replace(/\s/g, '');
          const existingLic = await Driver.findOne({ licenseNumber: lic, _id: { $ne: driver._id } });
          if (existingLic) {
            return res.status(400).json({ success: false, message: 'License number already exists.' });
          }
          driver.licenseNumber = lic;
        }
        await driver.save();
        driverPayload = driver.toObject();
      }
    }

    const freshUser = await User.findById(user._id).select('-password').lean();
    res.json({ success: true, user: freshUser, driver: driverPayload, message: 'Profile updated successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or license number already in use.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to update profile.' });
  }
};
