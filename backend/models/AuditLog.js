const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actorName: {
      type: String,
      trim: true,
    },
    actorRole: {
      type: String,
      enum: ['admin', 'officer', 'driver'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    fineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fine',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    details: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ actorRole: 1 });
auditLogSchema.index({ fineId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
