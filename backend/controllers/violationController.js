const Violation = require('../models/Violation');

exports.getViolations = async (req, res) => {
  try {
    const violations = await Violation.find({ isActive: true }).sort({ code: 1 }).lean();
    res.json({ success: true, data: violations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch violations.' });
  }
};

exports.createViolation = async (req, res) => {
  try {
    const { code, description, defaultAmount, points } = req.body;

    if (!code?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, message: 'Code and description are required.' });
    }

    const amount = Number(defaultAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Default amount must be a non-negative number.' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const existing = await Violation.findOne({ code: normalizedCode }).lean();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Violation code already exists.' });
    }

    const violation = await Violation.create({
      code: normalizedCode,
      description: description.trim(),
      defaultAmount: amount,
      points: Number.isFinite(Number(points)) ? Number(points) : 0,
      isActive: true,
    });

    res.status(201).json({ success: true, data: violation });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Violation code already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to create violation.' });
  }
};
