const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

const generateLicenseNumber = () => {
  const d = new Date();
  const part = d.toISOString().slice(0, 10).replace(/-/g, '') + Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DL-${part}`;
};

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
    const { email, password, name, role, badgeId, licenseNumber, phone, address, vehicle } = req.body;
    const existing = await User.findOne({ email: email?.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({
      email: email?.trim().toLowerCase(),
      password,
      name: name?.trim(),
      role: role || 'officer',
      badgeId: role === 'officer' ? badgeId : undefined,
    });

    let driverRecord = null;
    let vehicleRecord = null;
    if (user.role === 'driver') {
      const license = (licenseNumber && String(licenseNumber).trim()) || generateLicenseNumber();
      const existingDriver = await Driver.findOne({ licenseNumber: license.toUpperCase().replace(/\s/g, '') });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: 'License number already exists. Use a different number or leave blank to auto-generate.',
        });
      }
      driverRecord = await Driver.create({
        licenseNumber: license.toUpperCase().replace(/\s/g, ''),
        name: user.name,
        email: user.email,
        phone: phone?.trim() || undefined,
        address: address?.trim() || undefined,
      });
      if (vehicle && vehicle.plateNumber && String(vehicle.plateNumber).trim()) {
        const plate = String(vehicle.plateNumber).trim().toUpperCase().replace(/\s/g, '');
        const existingVehicle = await Vehicle.findOne({ plateNumber: plate });
        if (!existingVehicle) {
          vehicleRecord = await Vehicle.create({
            plateNumber: plate,
            driverId: driverRecord._id,
            make: vehicle.make?.trim() || undefined,
            model: vehicle.model?.trim() || undefined,
            year: vehicle.year ? Number(vehicle.year) : undefined,
            type: vehicle.type || 'car',
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        badgeId: user.badgeId,
      },
      driverCreated: !!driverRecord,
      vehicleCreated: !!vehicleRecord,
      message: user.role === 'driver' && driverRecord
        ? (vehicleRecord ? 'User, driver and vehicle created. They will appear when issuing fines.' : 'User and driver record created. They will appear when issuing fines.')
        : 'User created successfully.',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or license number already in use.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to create user.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, badgeId, password, licenseNumber, phone, address } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.role === 'admin' && req.user.id !== id) {
      return res
        .status(403)
        .json({ success: false, message: 'Admin users cannot be edited by another admin.' });
    }
    const newEmail = email?.trim().toLowerCase();
    if (newEmail && newEmail !== user.email) {
      const existing = await User.findOne({ email: newEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }
      user.email = newEmail;
    }
    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (typeof badgeId !== 'undefined') user.badgeId = role === 'officer' ? badgeId : undefined;
    if (password && password.trim()) {
      user.password = password;
    }
    await user.save();

    if (user.role === 'driver') {
      let driver = await Driver.findOne({ email: user.email });
      if (driver) {
        if (name) driver.name = name.trim();
        if (newEmail) driver.email = newEmail;
        if (phone !== undefined) driver.phone = phone?.trim() || undefined;
        if (address !== undefined) driver.address = address?.trim() || undefined;
        if (licenseNumber && String(licenseNumber).trim()) {
          const lic = String(licenseNumber).trim().toUpperCase().replace(/\s/g, '');
          const existingLic = await Driver.findOne({ licenseNumber: lic, _id: { $ne: driver._id } });
          if (!existingLic) driver.licenseNumber = lic;
        }
        await driver.save();
      } else {
        const lic = (licenseNumber && String(licenseNumber).trim()) || generateLicenseNumber();
        await Driver.create({
          licenseNumber: lic.toUpperCase().replace(/\s/g, ''),
          name: user.name,
          email: user.email,
          phone: phone?.trim() || undefined,
          address: address?.trim() || undefined,
        });
      }
    }

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
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or license number already in use.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to update user.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (req.user.id === id) {
      return res
        .status(400)
        .json({ success: false, message: 'You cannot delete your own account.' });
    }
    if (user.role === 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Admin users cannot be removed by another admin.' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete user.' });
  }
};

