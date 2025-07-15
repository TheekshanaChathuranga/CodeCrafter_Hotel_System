import mongoose from "mongoose";

const poolBookingSchema = new mongoose.Schema(
  {
    // Booking ID with format #P001
    bookingId: {
      type: String,
      unique: true,
      default: function() {
        // This will be overridden by pre-save middleware
        return null;
      }
    },

    // User identification
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Legacy fields (for backward compatibility)
    poolId: { type: mongoose.Schema.Types.ObjectId, ref: "Pool" },
    fullName: { type: String },
    date: { type: Date },
    guestCount: { type: Number, min: 1 },
    specificRequest: { type: String, default: "" },
    paymentProof: { type: String },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    phoneNumber: { type: String },
    whatsappNumber: { type: String, default: "" },

    // New fields (for current frontend)
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    peopleCount: { type: Number, min: 1 },
    checkIn: { type: Date },
    checkOut: { type: Date },
    totalAmount: { type: Number },
    paymentType: {
      type: String,
      enum: ["notPaid", "advance", "full"],
      default: "notPaid",
    },
    advanceAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate booking ID
poolBookingSchema.pre('save', async function(next) {
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
        // Extract number from booking ID (e.g., #P0001 -> 0001 -> 1)
        const match = latestBooking.bookingId.match(/#P(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      // Generate new booking ID with format #P0001
      this.bookingId = `#P${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model("PoolBooking", poolBookingSchema);
