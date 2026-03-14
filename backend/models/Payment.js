const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    fineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fine',
      required: [true, 'Fine is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking'],
      default: 'card',
    },
    transactionId: {
      type: String,
      trim: true,
      sparse: true,
    },
    gatewayStatus: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ fineId: 1 });
paymentSchema.index({ transactionId: 1 }, { sparse: true });
paymentSchema.index({ paidAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
