const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

exports.getVehicles = async (req, res) => {
  try {
    const { driverId, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (driverId) query.driverId = driverId;
    if (search) {
      query.$or = [
        { plateNumber: new RegExp(search, 'i') },
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).populate('driverId', 'name licenseNumber').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Vehicle.countDocuments(query),
    ]);
    res.json({ success: true, data: vehicles, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch vehicles.' });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    const populated = await Vehicle.findById(vehicle._id).populate('driverId', 'name licenseNumber').lean();
    res.status(201).json({ success: true, data: populated || vehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Plate number already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to create vehicle.' });
  }
};

exports.getMyVehicles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const driver = await Driver.findOne({ email: req.user.email }).lean();
    if (!driver) {
      return res.json({ success: true, data: [], total: 0, page: Number(page), limit: Number(limit) });
    }

    const query = { driverId: driver._id };
    if (search) {
      query.$or = [
        { plateNumber: new RegExp(search, 'i') },
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate('driverId', 'name licenseNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Vehicle.countDocuments(query),
    ]);

    res.json({ success: true, data: vehicles, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch your vehicles.' });
  }
};

exports.createMyVehicle = async (req, res) => {
  try {
    const driver = await Driver.findOne({ email: req.user.email });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found for your account.' });
    }

    const plate = String(req.body?.plateNumber || '').trim().toUpperCase().replace(/\s/g, '');
    if (!plate) {
      return res.status(400).json({ success: false, message: 'Plate number is required.' });
    }

    const vehicle = await Vehicle.create({
      plateNumber: plate,
      driverId: driver._id,
      make: req.body?.make?.trim() || undefined,
      model: req.body?.model?.trim() || undefined,
      year: req.body?.year ? Number(req.body.year) : undefined,
      type: req.body?.type || 'car',
    });
    const populated = await Vehicle.findById(vehicle._id).populate('driverId', 'name licenseNumber').lean();
    res.status(201).json({ success: true, data: populated || vehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Plate number already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to create your vehicle.' });
  }
};
