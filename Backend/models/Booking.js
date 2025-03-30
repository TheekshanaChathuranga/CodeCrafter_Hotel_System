import mongoose from "mongoose";

// Define the booking schema
const bookingSchema = new mongoose.Schema({
  adminDetails: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    whatsapp: { type: String },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },
  },
  selectedRooms: [
    {
      roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
      acType: { type: String, required: true },
      quantity: { type: Number, required: true },
    }
  ]
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
