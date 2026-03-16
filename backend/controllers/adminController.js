const Fine = require('../models/Fine');
const Payment = require('../models/Payment');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const [totalFines, pendingFines, paidFines, totalRevenue, totalDrivers, totalVehicles, totalOfficers] = await Promise.all([
      Fine.countDocuments(),
      Fine.countDocuments({ status: 'pending' }),
      Fine.countDocuments({ status: 'paid' }),
      Payment.aggregate([{ $match: { gatewayStatus: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Driver.countDocuments(),
      Vehicle.countDocuments(),
      User.countDocuments({ role: 'admin' }),
    ]);
    const revenue = totalRevenue[0]?.total || 0;
    res.json({
      success: true,
      data: {
        totalFines,
        pendingFines,
        paidFines,
        totalRevenue: revenue,
        totalDrivers,
        totalVehicles,
        totalOfficers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch stats.' });
  }
};
