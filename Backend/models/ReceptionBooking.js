import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: function() {
      // This will be overridden by pre-save middleware
      return null;
    }
  },
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

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingId) {
    try {
      // Find the latest booking to get the next number
      const latestBooking = await this.constructor.findOne(
        {}, 
        {}, 
        { sort: { 'createdAt': -1 } }
      );
      
      let nextNumber = 1;
      if (latestBooking && latestBooking.bookingId) {
        // Extract number from booking ID (e.g., #R0001 -> 0001 -> 1)
        const match = latestBooking.bookingId.match(/#R(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      // Generate new booking ID with format #R0001
      this.bookingId = `#R${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model("ReceptionBooking", bookingSchema);
