import mongoose from 'mongoose';

const poolBookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  whatsapp: String,
  email: String,
  peopleCount: Number,
  checkIn: Date,
  checkOut: Date,
  totalAmount: Number,
  paymentType: {
    type: String,
    enum: ['notPaid', 'advance', 'full'],
    default: 'notPaid'
  },
  advanceAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'notAccepted', 'done'],
    default: 'pending'
  },
  // ...other fields as needed...
}, { timestamps: true });

export default mongoose.model('PoolBooking', poolBookingSchema);