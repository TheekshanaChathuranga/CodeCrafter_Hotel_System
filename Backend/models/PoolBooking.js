const mongoose = require('mongoose');

const poolBookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String },
  peopleCount: { type: Number, required: true, min: 1 },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Validate checkOut is after checkIn
poolBookingSchema.pre('save', function(next) {
  if (this.checkOut <= this.checkIn) {
    throw new Error('Check-out time must be after check-in time');
  }
  next();
});

module.exports = mongoose.model('PoolBooking', poolBookingSchema);