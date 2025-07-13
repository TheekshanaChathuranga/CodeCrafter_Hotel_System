import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// Get available rooms
router.get("/available", async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    console.log("Available rooms request:", { checkIn, checkOut });

    // Validate required parameters
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        error: "Check-in and check-out dates are required",
        message: "Please provide both checkIn and checkOut parameters",
      });
    }

    // Validate date format
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        error: "Invalid date format",
        message:
          "Please provide valid ISO date strings for checkIn and checkOut",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        error: "Invalid date range",
        message: "Check-out date must be after check-in date",
      });
    }

    // Find rooms that are booked during the requested period and not cancelled or checked-out
    const bookedRooms = await Booking.find({
      status: { $nin: ["cancelled", "checked-out"] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    }).distinct("roomNumber");

    console.log("Booked rooms:", bookedRooms);

    // All rooms in the hotel
    const allRooms = [
      { id: "102", type: "Single Room", acType: "Non-AC" },
      { id: "101", type: "Double Room", acType: "AC" },
      { id: "103", type: "Double Room", acType: "AC" },
      { id: "104", type: "Double Room", acType: "AC" },
      { id: "105", type: "Double Room", acType: "AC" },
      { id: "106", type: "Double Room", acType: "AC" },
      { id: "107", type: "Triple Room", acType: "AC" },
      { id: "108", type: "Triple Room", acType: "AC" },
      { id: "109", type: "Triple Room", acType: "AC" },
    ];

    // Filter available rooms
    const availableRooms = allRooms.filter(
      (room) => !bookedRooms.includes(room.id)
    );

    console.log("Available rooms:", availableRooms.length);
    res.json(availableRooms);
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;
