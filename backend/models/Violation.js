const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Violation code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    defaultAmount: {
      type: Number,
      required: [true, 'Default amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    points: {
      type: Number,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

violationSchema.index({ code: 1 }, { unique: true });
violationSchema.index({ isActive: 1 });

module.exports = mongoose.model('Violation', violationSchema);
