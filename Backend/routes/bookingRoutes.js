import express from "express";
import Booking from "../models/booking.js";

const router = express.Router();

// ✅ GET all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

// ✅ GET a single booking by ID
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error });
  }
});

// ✅ POST a new booking
router.post("/", async (req, res) => {
  try {
    const { adminDetails, selectedRoom, packageType, paymentDetails } = req.body;

    if (!adminDetails || !selectedRoom || !packageType || !paymentDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newBooking = new Booking({
      adminDetails: {
        name: adminDetails.name,
        mobile: adminDetails.mobile,
        email: adminDetails.email || null,
        whatsapp: adminDetails.whatsapp || null,
        checkIn: adminDetails.checkIn,
        checkOut: adminDetails.checkOut,
      },
      selectedRoom: {
        roomNumber: selectedRoom.roomNumber,
        acType: selectedRoom.acType,
      },
      packageType: packageType, // Ensure packageType is stored correctly
      paymentDetails: paymentDetails, // Ensure paymentDetails is stored correctly
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ PUT route to update a booking by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    // Validate the check-in and check-out dates
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Check-in and check-out dates are required." });
    }

    const parsedCheckIn = new Date(checkIn);
    const parsedCheckOut = new Date(checkOut);

    if (isNaN(parsedCheckIn.getTime()) || isNaN(parsedCheckOut.getTime())) {
      return res.status(400).json({ message: "Invalid date format for check-in or check-out." });
    }

    if (parsedCheckIn >= parsedCheckOut) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { "adminDetails.checkIn": parsedCheckIn, "adminDetails.checkOut": parsedCheckOut },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
