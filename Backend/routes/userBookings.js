import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// Get all bookings for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all bookings for the user, sorted by creation date (newest first)
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance since we don't need Mongoose document methods

    // Add bookingId field for frontend compatibility
    const bookingsWithId = bookings.map((booking) => ({
      ...booking,
      bookingId: booking.bookingId || booking._id.toString(), // Use custom bookingId if available, fallback to _id
      document: booking.documentPath, // Ensure document field is available for backward compatibility
      documentPath: booking.documentPath, // Keep original field as well
    }));

    res.json(bookingsWithId);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      message: "Failed to fetch your bookings",
      error: error.message,
    });
  }
});

export default router;
