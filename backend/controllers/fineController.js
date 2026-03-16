const Fine = require('../models/Fine');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Violation = require('../models/Violation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createAuditLog } = require('../utils/auditLog');

const generateFineNumber = () => {
  const prefix = 'TF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const populateFineQuery = (query) =>
  query
    .populate('driverId', 'name licenseNumber phone email')
    .populate('vehicleId', 'plateNumber make model year type')
    .populate('violationId', 'code description defaultAmount points')
    .populate('issuedBy', 'name badgeId')
    .populate('dispute.resolvedBy', 'name role');

const canManageFine = (req, fine) => req.user.role === 'admin' || fine.issuedBy.toString() === req.user.id;

exports.getFines = async (req, res) => {
  try {
    const { status, driverId, page = 1, limit = 20, q, disputeStatus } = req.query;
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
    if (disputeStatus && disputeStatus !== 'all') query['dispute.status'] = disputeStatus;

    if (q?.trim()) {
      const regex = new RegExp(escapeRegex(q.trim()), 'i');
      const [matchedDrivers, matchedVehicles, matchedViolations] = await Promise.all([
        Driver.find({
          $or: [{ name: regex }, { licenseNumber: regex }, { email: regex }],
        })
          .select('_id')
          .lean(),
        Vehicle.find({ plateNumber: regex }).select('_id').lean(),
        Violation.find({ $or: [{ code: regex }, { description: regex }] }).select('_id').lean(),
      ]);

      query.$or = [
        { fineNumber: regex },
        { driverId: { $in: matchedDrivers.map((item) => item._id) } },
        { vehicleId: { $in: matchedVehicles.map((item) => item._id) } },
        { violationId: { $in: matchedViolations.map((item) => item._id) } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [fines, total] = await Promise.all([
      populateFineQuery(Fine.find(query))
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
    const fine = await populateFineQuery(Fine.findById(req.params.id)).lean();
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
    const populated = await populateFineQuery(Fine.findById(fine._id)).lean();

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

    await createAuditLog(req, {
      action: 'fine_issued',
      fineId: fine._id,
      details: `Issued fine ${fine.fineNumber} for ₹${fine.amount}.`,
      metadata: {
        driverId,
        vehicleId,
        violationId,
      },
    });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create fine.' });
  }
};

exports.updateFine = async (req, res) => {
  try {
    const { status, amount, violationId, vehicleId, dueDate, location, notes } = req.body;
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ success: false, message: 'Fine not found.' });
    if (!canManageFine(req, fine)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (fine.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot update a paid fine.' });
    }
    if (status === 'cancelled' && fine.dueDate && new Date() > fine.dueDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot cancel a fine after the due date.' });
    }
    const changes = [];
    if (status) fine.status = status;
    if (status) changes.push(`status=${status}`);
    if (typeof amount !== 'undefined') {
      const nextAmount = Number(amount);
      if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
      }
      fine.amount = nextAmount;
      changes.push(`amount=${nextAmount}`);
    }
    if (violationId) {
      fine.violationId = violationId;
      changes.push('violation updated');
    }
    if (vehicleId) {
      fine.vehicleId = vehicleId;
      changes.push('vehicle updated');
    }
    if (typeof dueDate !== 'undefined') {
      fine.dueDate = dueDate;
      changes.push('due date updated');
    }
    if (typeof location !== 'undefined') {
      fine.location = location || undefined;
      changes.push('location updated');
    }
    if (typeof notes !== 'undefined') {
      fine.notes = notes || undefined;
      changes.push('notes updated');
    }
    await fine.save();
    const populated = await populateFineQuery(Fine.findById(fine._id)).lean();

    await createAuditLog(req, {
      action: status === 'cancelled' ? 'fine_cancelled' : 'fine_updated',
      fineId: fine._id,
      details: `Updated fine ${fine.fineNumber}${changes.length ? ` (${changes.join(', ')})` : ''}.`,
      metadata: { changes },
    });

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update fine.' });
  }
};

exports.submitDispute = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Dispute reason is required.' });
    }
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ success: false, message: 'Fine not found.' });
    const driver = await Driver.findOne({ email: req.user.email });
    if (!driver || fine.driverId.toString() !== driver._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only dispute your own fines.' });
    }
    if (fine.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled fines cannot be disputed.' });
    }
    if (fine.dispute?.status === 'pending') {
      return res.status(400).json({ success: false, message: 'This fine already has a pending dispute.' });
    }
    fine.dispute = {
      status: 'pending',
      reason: reason.trim(),
      requestedAt: new Date(),
      resolvedAt: undefined,
      resolutionNote: undefined,
      resolvedBy: undefined,
    };
    await fine.save();

    await createAuditLog(req, {
      action: 'fine_disputed',
      fineId: fine._id,
      details: `Submitted dispute for fine ${fine.fineNumber}.`,
      metadata: { reason: reason.trim() },
    });

    const populated = await populateFineQuery(Fine.findById(fine._id)).lean();
    res.json({ success: true, data: populated, message: 'Dispute submitted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to submit dispute.' });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { decision, resolutionNote } = req.body;
    if (!['accepted', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be accepted or rejected.' });
    }
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ success: false, message: 'Fine not found.' });
    if (!canManageFine(req, fine)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (fine.dispute?.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'No pending dispute to resolve.' });
    }
    fine.dispute.status = decision;
    fine.dispute.resolutionNote = resolutionNote?.trim() || undefined;
    fine.dispute.resolvedAt = new Date();
    fine.dispute.resolvedBy = req.user.id;
    if (decision === 'accepted' && fine.status !== 'paid') {
      fine.status = 'cancelled';
    }
    await fine.save();

    await createAuditLog(req, {
      action: 'dispute_resolved',
      fineId: fine._id,
      details: `${decision === 'accepted' ? 'Accepted' : 'Rejected'} dispute for fine ${fine.fineNumber}.`,
      metadata: { decision, resolutionNote: resolutionNote?.trim() || '' },
    });

    const populated = await populateFineQuery(Fine.findById(fine._id)).lean();
    res.json({ success: true, data: populated, message: `Dispute ${decision}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to resolve dispute.' });
  }
};
