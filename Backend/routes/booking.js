import express from "express";
import Booking from "../models/Booking.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images (JPEG/PNG) and PDFs are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

router.post("/", upload.single("document"), async (req, res) => {
  try {
    // Destructure and validate input
    const { checkIn, checkOut, phoneNumber, roomNumber, user, ...rest } =
      req.body;

    // Convert to Date objects
    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    // Date validation
    if (newCheckOut <= newCheckIn) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date",
      });
    }

    // Phone number validation
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        message: "Invalid phone number format (10 digits required)",
      });
    }

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      roomNumber: roomNumber,
      $or: [
        {
          checkIn: { $lt: newCheckOut },
          checkOut: { $gt: newCheckIn },
        },
      ],
    });

    if (existingBooking) {
      return res.status(409).json({
        message: `Room ${roomNumber} is already booked from ${existingBooking.checkIn.toDateString()} to ${existingBooking.checkOut.toDateString()}`,
      });
    }

    // Create new booking with document and user
    const newBooking = new Booking({
      roomNumber,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      phoneNumber,
      document: req.file.path, // Add document path from uploaded file
      processedBy: req.user ? req.user._id : null, // Assuming req.user is set by authentication middleware
      user, // Set user from decoded JWT or request body
      ...rest,
    });

    // Save to database
    const savedBooking = await newBooking.save();

    // Success response
    res.status(201).json({
      success: true,
      message: "Booking confirmed!",
      bookingId: savedBooking._id,
      details: {
        roomNumber: savedBooking.roomNumber,
        dates: {
          checkIn: savedBooking.checkIn,
          checkOut: savedBooking.checkOut,
        },
        guest: savedBooking.fullName,
        document: savedBooking.document,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);

    // Handle file upload errors
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: `File upload error: ${error.message}`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate booking detected",
      });
    }

    // Handle custom errors from file filter
    if (error.message.includes("Invalid file type")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Generic error response
    res.status(500).json({
      message: "Booking processing failed",
      error: error.message,
    });
  }
});

export default router;