import express from "express";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import ReceptionBooking from "../models/ReceptionBooking.js";

const router = express.Router();

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get available rooms
router.get("/available", async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    console.log("Received date query:", { checkIn, checkOut });

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Both checkIn and checkOut dates are required",
      });
    }

    // Convert strings to Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Validate check-in is not in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (checkInDate < now) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past",
      });
    }

    // Validate check-in is before check-out
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // Find bookings that overlap with the requested period from both collections
    // Check online bookings
    const onlineBookedRooms = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      $or: [
        // Booking starts before check-out and ends after check-in
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    }).select("roomNumber -_id");

    // Check reception bookings
    const receptionBookedRooms = await ReceptionBooking.find({
      status: { $in: ["confirmed", "checked-in"] }, // Reception bookings have different status options
      $or: [
        // Booking starts before check-out and ends after check-in
        {
          "bookingDetails.checkIn": { $lt: checkOutDate },
          "bookingDetails.checkOut": { $gt: checkInDate },
        },
      ],
    }).select("bookingDetails.roomNumber -_id");

    console.log("Found online booked rooms:", onlineBookedRooms);
    console.log("Found reception booked rooms:", receptionBookedRooms);

    // Get the room numbers that are booked from both collections
    const onlineBookedRoomNumbers = onlineBookedRooms.map(
      (booking) => booking.roomNumber
    );
    const receptionBookedRoomNumbers = receptionBookedRooms.map(
      (booking) => booking.bookingDetails.roomNumber
    );

    // Combine both arrays and remove duplicates
    const allBookedRoomNumbers = [
      ...new Set([...onlineBookedRoomNumbers, ...receptionBookedRoomNumbers]),
    ];

    console.log("All booked room numbers:", allBookedRoomNumbers);

    // Find all rooms that are not in the allBookedRoomNumbers array and are available
    const availableRooms = await Room.find({
      roomNumber: { $nin: allBookedRoomNumbers },
      roomStatus: "Available",
    });

    console.log(`Found ${availableRooms.length} available rooms`);

    // Enhance response with booking period
    return res.status(200).json({
      success: true,
      bookingPeriod: {
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
      },
      totalRooms: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (error) {
    console.error("Error in /available route:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking room availability",
      error: error.message,
    });
  }
});

export default router;
