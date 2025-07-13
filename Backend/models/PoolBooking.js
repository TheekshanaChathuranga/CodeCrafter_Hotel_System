import mongoose from "mongoose";

const poolBookingSchema = new mongoose.Schema(
  {
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

export default mongoose.model("PoolBooking", poolBookingSchema);
