import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  guestDetails: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: String,
    whatsapp: String,
  },
  bookingDetails: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    roomNumber: { type: String, required: true },
    roomType: { type: String, required: true },
    acType: { type: String, required: true },
    packageType: { type: String, required: true },
    dayNightType: { type: String }, // Optional - only for normal package
    additionalNote: { type: String }, // Optional - special requests or notes
  },
  paymentDetails: {
    paymentType: { type: String, required: true },
    advanceAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  },
  status: {
    type: String,
    default: "confirmed",
    enum: ["confirmed", "cancelled", "checked-in", "checked-out", "no-show"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ReceptionBooking", bookingSchema);
