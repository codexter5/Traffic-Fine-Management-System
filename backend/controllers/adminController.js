const Fine = require('../models/Fine');
const Payment = require('../models/Payment');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const formatMonthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const getRecentMonths = (count) => {
  const months = [];
  const cursor = new Date();
  cursor.setUTCDate(1);
  cursor.setUTCHours(0, 0, 0, 0);
  for (let index = count - 1; index >= 0; index -= 1) {
    const month = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - index, 1));
    months.push({
      key: formatMonthKey(month),
      label: month.toLocaleString('en-US', { month: 'short' }),
    });
  }
  return months;
};

exports.getStats = async (req, res) => {
  try {
    const recentMonths = getRecentMonths(6);
    const [totalFines, pendingFines, paidFines, totalRevenue, totalDrivers, totalVehicles, totalOfficers, monthlyFineAgg, monthlyRevenueAgg, violationAgg] = await Promise.all([
      Fine.countDocuments(),
      Fine.countDocuments({ status: 'pending' }),
      Fine.countDocuments({ status: 'paid' }),
      Payment.aggregate([{ $match: { gatewayStatus: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Driver.countDocuments(),
      Vehicle.countDocuments(),
      User.countDocuments({ role: 'officer' }),
      Fine.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5, 1)) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { gatewayStatus: 'success', paidAt: { $gte: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5, 1)) } } },
        {
          $group: {
            _id: {
              year: { $year: '$paidAt' },
              month: { $month: '$paidAt' },
            },
            amount: { $sum: '$amount' },
          },
        },
      ]),
      Fine.aggregate([
        {
          $group: {
            _id: '$violationId',
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'violations',
            localField: '_id',
            foreignField: '_id',
            as: 'violation',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            count: 1,
            amount: 1,
            code: { $arrayElemAt: ['$violation.code', 0] },
            description: { $arrayElemAt: ['$violation.description', 0] },
          },
        },
      ]),
    ]);
    const revenue = totalRevenue[0]?.total || 0;
    const fineCountByMonth = Object.fromEntries(monthlyFineAgg.map((item) => [`${item._id.year}-${String(item._id.month).padStart(2, '0')}`, item.count]));
    const revenueByMonth = Object.fromEntries(monthlyRevenueAgg.map((item) => [`${item._id.year}-${String(item._id.month).padStart(2, '0')}`, item.amount]));
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
        monthlyFines: recentMonths.map((month) => ({ label: month.label, value: fineCountByMonth[month.key] || 0 })),
        monthlyRevenue: recentMonths.map((month) => ({ label: month.label, value: revenueByMonth[month.key] || 0 })),
        violationBreakdown: violationAgg,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch stats.' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { action = '', limit = 100 } = req.query;
    const query = {};
    if (action) query.action = action;
    const logs = await AuditLog.find(query)
      .populate('actorId', 'name email role')
      .populate('fineId', 'fineNumber status amount')
      .populate('paymentId', 'transactionId amount paidAt')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch audit logs.' });
  }
};
