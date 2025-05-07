const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// ...existing code...

router.post("/api/bookings", async (req, res) => {
  try {
    const { adminDetails, selectedRoom, packageType, paymentDetails } = req.body;

    // Validate payment details
    if (!paymentDetails || !paymentDetails.paymentType) {
      return res.status(400).json({ error: "Payment details are required." });
    }

    // Save booking to the database (example schema)
    const booking = new Booking({
      adminDetails,
      selectedRoom,
      packageType,
      paymentDetails, // Save payment details
    });

    await booking.save();

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ...existing code...

module.exports = router;