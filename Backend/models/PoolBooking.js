import mongoose from "mongoose";

const poolBookingSchema = new mongoose.Schema({
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: "Pool", required: true },
  fullName: { type: String, required: true },
  date: { type: Date, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  specificRequest: { type: String, default: "" },
  paymentProof: { type: String, required: true },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  whatsappNumber: { type: String, default: "" },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("PoolBooking", poolBookingSchema);