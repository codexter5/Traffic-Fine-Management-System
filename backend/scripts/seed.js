/**
 * Seed script: run with `node scripts/seed.js` from backend folder.
 * Requires MongoDB connection (set MONGODB_URI or use default localhost).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Violation = require('../models/Violation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic-fines';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const existingAdmin = await User.findOne({ email: 'admin@demo.com' });
  if (!existingAdmin) {
    await User.create([
      { email: 'admin@demo.com', password: '123456', name: 'Admin User', role: 'admin' },
      { email: 'officer@demo.com', password: '123456', name: 'Officer John', role: 'officer', badgeId: 'OFF-001' },
      { email: 'driver@demo.com', password: '123456', name: 'Jane Driver', role: 'driver' },
    ]);
    console.log('Created users: admin@demo.com, officer@demo.com, driver@demo.com (password: 123456)');
  } else {
    console.log('Users already exist, skipping.');
  }

  const violations = [
    { code: 'SPD-01', description: 'Over speeding', defaultAmount: 1000, points: 3 },
    { code: 'RL-01', description: 'Red light jump', defaultAmount: 500, points: 2 },
    { code: 'HLM-01', description: 'Helmet not worn', defaultAmount: 300, points: 1 },
    { code: 'PARK-01', description: 'No parking zone', defaultAmount: 400, points: 1 },
  ];
  for (const v of violations) {
    await Violation.findOneAndUpdate({ code: v.code }, v, { upsert: true });
  }
  console.log('Upserted violation types.');

  let driver = await Driver.findOne({ email: 'driver@demo.com' });
  if (!driver) {
    driver = await Driver.create({
      licenseNumber: 'DL0120200012345',
      name: 'Jane Driver',
      phone: '+919876543210',
      email: 'driver@demo.com',
      address: '123 Main St, City',
    });
    console.log('Created driver: Jane Driver (driver@demo.com)');
  }
  const vehicleExists = await Vehicle.findOne({ plateNumber: 'MH12AB1234' });
  if (!vehicleExists) {
    await Vehicle.create({
      plateNumber: 'MH12AB1234',
      driverId: driver._id,
      make: 'Maruti',
      model: 'Swift',
      year: 2020,
      type: 'car',
    });
    console.log('Created vehicle: MH12AB1234');
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
