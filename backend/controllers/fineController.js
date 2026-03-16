const Fine = require('../models/Fine');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateFineNumber = () => {
  const prefix = 'TF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

exports.getFines = async (req, res) => {
  try {
    const { status, driverId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ email: req.user.email });
      if (!driver) return res.json({ success: true, data: [], total: 0, page: 1, limit: Number(limit) });
      query.driverId = driver._id;
    } else if (req.user.role === 'officer') {
      query.issuedBy = req.user.id;
    }
    if (status) query.status = status;
    if (driverId && (req.user.role === 'admin' || req.user.role === 'officer')) query.driverId = driverId;
    const skip = (Number(page) - 1) * Number(limit);
    const [fines, total] = await Promise.all([
      Fine.find(query)
        .populate('driverId', 'name licenseNumber')
        .populate('vehicleId', 'plateNumber make model')
        .populate('violationId', 'code description defaultAmount')
        .populate('issuedBy', 'name badgeId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Fine.countDocuments(query),
    ]);
    res.json({ success: true, data: fines, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch fines.' });
  }
};

exports.getFineById = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id)
      .populate('driverId', 'name licenseNumber phone email')
      .populate('vehicleId', 'plateNumber make model year')
      .populate('violationId', 'code description defaultAmount points')
      .populate('issuedBy', 'name badgeId')
      .lean();
    if (!fine) return res.status(404).json({ success: false, message: 'Fine not found.' });
    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ email: req.user.email });
          if (!driver || fine.driverId._id.toString() !== driver._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    } else if (req.user.role === 'officer' && fine.issuedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, data: fine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch fine.' });
  }
};

exports.createFine = async (req, res) => {
  try {
    const { driverId, vehicleId, violationId, amount, dueDate, location, notes } = req.body;
    const fineNumber = generateFineNumber();
    const fine = await Fine.create({
      fineNumber,
      driverId,
      vehicleId,
      violationId,
      amount: Number(amount),
      issuedBy: req.user.id,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location,
      notes,
    });
    const populated = await Fine.findById(fine._id)
      .populate('driverId', 'name licenseNumber email')
      .populate('vehicleId', 'plateNumber')
      .populate('violationId', 'code description')
      .populate('issuedBy', 'name badgeId')
      .lean();

    // Notify the linked driver user account about the newly issued fine.
    const driverEmail = populated?.driverId?.email;
    if (driverEmail) {
      const driverUser = await User.findOne({ email: String(driverEmail).toLowerCase(), role: 'driver' })
        .select('_id')
        .lean();
      if (driverUser?._id) {
        await Notification.create({
          recipientId: driverUser._id,
          type: 'fine_issued',
          message: `A new fine ${populated.fineNumber} of ₹${populated.amount} has been issued to your account.`,
          relatedId: { fineId: populated._id },
        });
      }
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create fine.' });
  }
};

exports.updateFine = async (req, res) => {
  try {
    const { status } = req.body;
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ success: false, message: 'Fine not found.' });
    if (fine.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot update a paid fine.' });
    }
    if (status === 'cancelled' && fine.dueDate && new Date() > fine.dueDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot cancel a fine after the due date.' });
    }
    if (status) fine.status = status;
    await fine.save();
    const populated = await Fine.findById(fine._id)
      .populate('driverId', 'name licenseNumber')
      .populate('vehicleId', 'plateNumber')
      .populate('violationId', 'code description')
      .populate('issuedBy', 'name badgeId')
      .lean();
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update fine.' });
  }
};
