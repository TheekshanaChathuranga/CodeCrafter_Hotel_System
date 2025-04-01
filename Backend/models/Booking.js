import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a user"]
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
    required: [true, "Booking must belong to a room"]
  },
  checkInDate: {
    type: Date,
    required: [true, "Check-in date is required"]
  },
  checkOutDate: {
    type: Date,
    required: [true, "Check-out date is required"]
  },
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"]
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending"
  },
  specialRequests: String
}, {
  timestamps: true
});

// Calculate total price before saving
bookingSchema.pre("save", async function(next) {
  const room = await mongoose.model("Room").findById(this.room);
  const nights = Math.ceil(
    (this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24)
  );
  this.totalPrice = room.pricePerNight * nights;
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;