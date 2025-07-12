import mongoose from "mongoose";

const poolBookingSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    whatsapp: String,
    email: String,
    peopleCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: function () {
        // Calculate default totalAmount based on peopleCount
        const baseRate = 500;
        const peopleCount = this.peopleCount || 1;
        return baseRate * peopleCount;
      },
    },
    paymentType: {
      type: String,
      enum: ["notPaid", "advance", "full"],
      default: "notPaid",
    },
    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "notAccepted", "done"],
      default: "pending",
    },
    paymentProof: String, // for online bookings
    specificRequest: String,
    notes: String,
    // Legacy field support
    fullName: String,
    phoneNumber: String,
    whatsappNumber: String,
    guestCount: Number,
    date: String,
    checkInTime: String,
    checkOutTime: String,
    advance: Number,
  },
  {
    timestamps: true,
    // Add a pre-save middleware to ensure totalAmount is calculated
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware to ensure totalAmount is always calculated correctly
poolBookingSchema.pre("save", function (next) {
  if (!this.totalAmount || this.totalAmount <= 0) {
    const baseRate = 500;
    const additionalRate = 200;
    const baseHours = 2;
    const peopleCount = Math.max(this.peopleCount || 1, 1);

    let totalAmount = baseRate;

    // Calculate based on duration if checkIn and checkOut exist
    if (this.checkIn && this.checkOut) {
      const durationHours =
        (new Date(this.checkOut) - new Date(this.checkIn)) / (1000 * 60 * 60);
      const additionalHours = Math.ceil(Math.max(durationHours - baseHours, 0));

      if (additionalHours > 0) {
        totalAmount += additionalHours * additionalRate;
      }
    }

    this.totalAmount = totalAmount * peopleCount;
    console.log(
      `Auto-calculated totalAmount: ${peopleCount} people × Rs.${
        totalAmount / peopleCount
      } = Rs.${this.totalAmount}`
    );
  }

  // Ensure peopleCount is at least 1
  if (!this.peopleCount || this.peopleCount < 1) {
    this.peopleCount = 1;
  }

  next();
});

export default mongoose.model("PoolBooking", poolBookingSchema, "poolbookings");
