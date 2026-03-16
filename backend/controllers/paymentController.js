const Payment = require('../models/Payment');
const Fine = require('../models/Fine');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateTransactionId = () => `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

exports.payFine = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id).populate('driverId');
    if (!fine) return res.status(404).json({ success: false, message: 'Fine not found.' });
    if (fine.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Fine already paid.' });
    }
    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ email: req.user.email });
      if (!driver || fine.driverId._id.toString() !== driver._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only pay your own fines.' });
      }
    }
    const { amount, method = 'card' } = req.body;
    const payAmount = Number(amount) || fine.amount;
    if (payAmount < fine.amount) {
      return res.status(400).json({ success: false, message: 'Amount must be at least the fine amount.' });
    }
    const transactionId = generateTransactionId();
    const payment = await Payment.create({
      fineId: fine._id,
      amount: payAmount,
      method,
      transactionId,
      gatewayStatus: 'success',
    });
    fine.status = 'paid';
    await fine.save();

    const driverName = fine.driverId?.name || 'A driver';
    const message = `Fine ${fine.fineNumber} (₹${payAmount}) was paid by ${driverName}.`;
    const notificationPromises = [];
    if (fine.issuedBy) {
      notificationPromises.push(
        Notification.create({
          recipientId: fine.issuedBy,
          type: 'fine_paid',
          message,
          relatedId: { fineId: fine._id, paymentId: payment._id },
        })
      );
    }
    const admins = await User.find({ role: 'admin' }).select('_id').lean();
    admins.forEach((a) => {
      if (a._id.toString() !== (fine.issuedBy || '').toString()) {
        notificationPromises.push(
          Notification.create({
            recipientId: a._id,
            type: 'fine_paid',
            message,
            relatedId: { fineId: fine._id, paymentId: payment._id },
          })
        );
      }
    });

    const driverEmail = fine.driverId?.email;
    if (driverEmail) {
      const driverUser = await User.findOne({ email: String(driverEmail).toLowerCase(), role: 'driver' })
        .select('_id')
        .lean();
      if (driverUser?._id) {
        notificationPromises.push(
          Notification.create({
            recipientId: driverUser._id,
            type: 'payment_success',
            message: `Your payment of ₹${payAmount} for fine ${fine.fineNumber} was successful.`,
            relatedId: { fineId: fine._id, paymentId: payment._id },
          })
        );
      }
    }

    await Promise.all(notificationPromises);

    const populated = await Payment.findById(payment._id).populate('fineId').lean();
    res.status(201).json({
      success: true,
      message: 'Payment successful (simulated).',
      data: { payment: populated, fine: await Fine.findById(fine._id).populate('driverId violationId').lean() },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Payment failed.' });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find({})
        .populate('fineId', 'fineNumber amount driverId violationId')
        .sort({ paidAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Payment.countDocuments(),
    ]);
    res.json({ success: true, data: payments, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch payments.' });
  }
};
