const Driver = require('../models/Driver');

exports.getDrivers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { licenseNumber: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [drivers, total] = await Promise.all([
      Driver.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Driver.countDocuments(query),
    ]);
    res.json({ success: true, data: drivers, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch drivers.' });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).lean();
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch driver.' });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'License number already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to create driver.' });
  }
};
