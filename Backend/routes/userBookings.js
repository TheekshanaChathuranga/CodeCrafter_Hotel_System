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

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      message: "Failed to fetch your bookings",
      error: error.message,
    });
  }
});

export default router;
