const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit = 50 } = req.query;
    const query = { recipientId: req.user.id };
    if (unreadOnly === 'true') query.read = false;
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    const unreadCount = await Notification.countDocuments({ recipientId: req.user.id, read: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch notifications.' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user.id,
    });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    notification.read = true;
    await notification.save();
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update.' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'All marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update.' });
  }
};
