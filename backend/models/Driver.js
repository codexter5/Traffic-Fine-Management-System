const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\s\-+()]{8,20}$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

driverSchema.index({ licenseNumber: 1 }, { unique: true });
driverSchema.index({ name: 1 });
driverSchema.index({ phone: 1 });

module.exports = mongoose.model('Driver', driverSchema);
