import express from "express";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "document-" + uniqueSuffix + path.extname(file.originalname));
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
  let savedBooking = null;
  try {
    console.log("Received booking request:", {
      ...req.body,
      file: req.file ? { ...req.file, buffer: undefined } : null,
    });

    // Validate required fields
    const requiredFields = [
      "roomNumber",
      "roomType",
      "checkIn",
      "checkOut",
      "fullName",
      "phoneNumber",
      "adults",
      "user",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (!req.file) {
      throw new Error("Document upload is required");
    }

    // Convert and validate dates
    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error("Invalid dates provided");
    }

    if (checkIn >= checkOut) {
      throw new Error("Check-out date must be after check-in date");
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
      throw new Error("Invalid user ID");
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.findOverlappingBookings(
      req.body.roomNumber,
      checkIn,
      checkOut
    );

    if (overlappingBookings.length > 0) {
      throw new Error("Room is already booked for these dates");
    }

    // Create new booking
    const newBooking = new Booking({
      roomNumber: req.body.roomNumber,
      roomType: req.body.roomType,
      checkIn: checkIn,
      checkOut: checkOut,
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      nicNumber: req.body.nicNumber || null,
      whatsappNumber: req.body.whatsappNumber || null,
      adults: parseInt(req.body.adults),
      children: parseInt(req.body.children) || 0,
      specialRequests: req.body.specialRequests || "",
      documentPath: "/uploads/" + req.file.filename,
      user: req.body.user,
      status: "pending",
      createdAt: new Date(),
    });

    // Save booking
    savedBooking = await newBooking.save();
    console.log("Booking saved successfully:", savedBooking._id);

    // Create persistent notification for all admins
    const notification = new Notification({
      type: "booking",
      title: "New Room Booking",
      message: `${savedBooking.fullName} booked Room ${savedBooking.roomNumber}`,
      bookingId: savedBooking._id,
      adminId: null, // null means for all admins
      isRead: false,
    });

    await notification.save();
    console.log("Notification saved to database:", notification._id);

    // Emit real-time notification to online admins
    const io = req.app.get("io");
    const adminSockets = req.app.get("adminSockets");

    // Emit both individual notifications and booking-created event
    if (io) {
      // Emit to all connected clients (for real-time updates)
      io.emit("booking-created", {
        bookingId: savedBooking._id,
        roomNumber: savedBooking.roomNumber,
        fullName: savedBooking.fullName,
        status: savedBooking.status,
        createdAt: savedBooking.createdAt,
        notificationId: notification._id,
      });

      // Emit targeted notifications to admin sockets
      if (adminSockets && adminSockets.size > 0) {
        adminSockets.forEach((socketId, adminId) => {
          io.to(socketId).emit("bookingNotification", {
            type: "room",
            title: "New Room Booking",
            message: `${savedBooking.fullName} booked Room ${savedBooking.roomNumber}`,
            time: new Date().toISOString(),
            notificationId: notification._id,
          });
        });
      }
    }

    // Send success response
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      bookingId: savedBooking._id,
      details: {
        roomNumber: savedBooking.roomNumber,
        dates: {
          checkIn: savedBooking.checkIn,
          checkOut: savedBooking.checkOut,
        },
      },
    });
  } catch (error) {
    console.error("Booking error:", error);

    // Clean up uploaded file if booking failed
    if (req.file && !savedBooking) {
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }

    // Send appropriate error response
    const statusCode =
      error.name === "ValidationError" ? 400 : error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create booking",
      errors: error.errors
        ? Object.values(error.errors).map((err) => err.message)
        : undefined,
    });
  }
});

// GET route to fetch all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

// GET route to fetch a single booking by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Transform the data to match the expected format
    const transformedBooking = {
      ...booking,
      bookingType: "online",
      // Keep original data structure for compatibility
      originalData: {
        nicNumber: booking.nicNumber,
        adults: booking.adults,
        children: booking.children,
        specialRequests: booking.specialRequests,
        document: booking.documentPath,
      },
      // Also provide direct access to fields
      nicNumber: booking.nicNumber,
      adults: booking.adults,
      children: booking.children,
      specialRequests: booking.specialRequests,
      documentPath: booking.documentPath,
    };

    res.status(200).json(transformedBooking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
});

export default router;
