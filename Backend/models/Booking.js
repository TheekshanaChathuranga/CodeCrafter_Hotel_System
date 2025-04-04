import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  adminDetails: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    whatsapp: { type: String, required: false },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
  },
  selectedRoom: {
    roomNumber: { type: Number, required: true },
    acType: { type: String, required: true },
  },
  packageType: { type: String, required: true },
  paymentDetails: {
    paymentType: { type: String, required: true },
    advanceAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
