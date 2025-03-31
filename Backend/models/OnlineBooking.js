import mongoose from "mongoose";

const onlineBookingSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  adultsCount: { type: Number, required: true },
  childrenCount: { type: Number, required: true },
  whatsappNumber: { type: String, required: true },
  contactDetails: String,
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Cancelled'] }
});

const OnlineBooking = mongoose.model('OnlineBooking', onlineBookingSchema);
export default OnlineBooking;