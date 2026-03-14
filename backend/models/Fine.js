const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    fineNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required'],
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    violationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Violation',
      required: [true, 'Violation is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Issuing officer is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

fineSchema.index({ fineNumber: 1 }, { unique: true });
fineSchema.index({ driverId: 1 });
fineSchema.index({ vehicleId: 1 });
fineSchema.index({ issuedBy: 1 });
fineSchema.index({ status: 1 });
fineSchema.index({ issueDate: -1 });

module.exports = mongoose.model('Fine', fineSchema);
