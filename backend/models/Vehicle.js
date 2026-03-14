const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required'],
    },
    make: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: [1900, 'Invalid year'],
      max: [new Date().getFullYear() + 1, 'Invalid year'],
    },
    type: {
      type: String,
      trim: true,
      enum: ['car', 'motorcycle', 'truck', 'bus', 'other'],
      default: 'car',
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ plateNumber: 1 }, { unique: true });
vehicleSchema.index({ driverId: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
