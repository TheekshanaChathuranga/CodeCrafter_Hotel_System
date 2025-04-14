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
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
