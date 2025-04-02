// models/Booking.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  roomType: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  nicNumber: { type: String },
  whatsappNumber: { type: String },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  specialRequests: { type: String },
  bookingDate: { type: Date, default: Date.now }
}, { collection: 'onlinebooking' });

export default mongoose.model('Booking', bookingSchema);