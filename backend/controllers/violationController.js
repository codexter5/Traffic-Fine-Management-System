const Violation = require('../models/Violation');

exports.getViolations = async (req, res) => {
  try {
    const violations = await Violation.find({ isActive: true }).sort({ code: 1 }).lean();
    res.json({ success: true, data: violations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch violations.' });
  }
};
