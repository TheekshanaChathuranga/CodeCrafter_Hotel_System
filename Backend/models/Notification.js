import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["booking", "pool-booking", "cancellation", "system"],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // null means notification for all admins
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
    required: false,
  },
});

// Index for efficient queries
notificationSchema.index({ adminId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
