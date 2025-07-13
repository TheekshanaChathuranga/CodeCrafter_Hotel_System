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

// GET route to fetch dashboard statistics for reception
router.get("/dashboard-stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    // Get today's bookings
    const todayBookings = await Booking.find({
      checkIn: {
        $gte: today,
        $lt: tomorrow,
      },
    }).lean();

    // Get check-ins for today
    const todayCheckIns = await Booking.find({
      checkIn: {
        $gte: today,
        $lt: tomorrow,
      },
      status: "confirmed",
    }).lean();

    // Get check-outs for today
    const todayCheckOuts = await Booking.find({
      checkOut: {
        $gte: today,
        $lt: tomorrow,
      },
      status: "confirmed",
    }).lean();

    // Get pending bookings
    const pendingBookings = await Booking.find({
      status: "pending",
    }).lean();

    // Get upcoming bookings (next 7 days)
    const upcomingBookings = await Booking.find({
      checkIn: {
        $gte: today,
        $lt: weekFromNow,
      },
      status: { $in: ["confirmed", "pending"] },
    }).lean();

    // Get current occupancy (guests currently checked in)
    const currentOccupancy = await Booking.find({
      checkIn: { $lte: today },
      checkOut: { $gt: today },
      status: "confirmed",
    }).lean();

    // Calculate revenue statistics
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthlyBookings = await Booking.find({
      createdAt: {
        $gte: monthStart,
        $lt: monthEnd,
      },
      status: { $in: ["confirmed", "pending"] },
    }).lean();

    const stats = {
      today: {
        totalBookings: todayBookings.length,
        checkIns: todayCheckIns.length,
        checkOuts: todayCheckOuts.length,
        pendingBookings: pendingBookings.length,
      },
      upcoming: {
        weeklyBookings: upcomingBookings.length,
        currentOccupancy: currentOccupancy.length,
      },
      monthly: {
        totalBookings: monthlyBookings.length,
        confirmed: monthlyBookings.filter((b) => b.status === "confirmed")
          .length,
        pending: monthlyBookings.filter((b) => b.status === "pending").length,
      },
    };

    res.status(200).json({
      success: true,
      stats,
      todayBookings: todayBookings.slice(0, 10), // Latest 10 for quick view
      pendingBookings: pendingBookings.slice(0, 5), // Latest 5 pending
      upcomingCheckIns: todayCheckIns.slice(0, 5),
      upcomingCheckOuts: todayCheckOuts.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
});

// GET route to fetch bookings by date range
router.get("/by-date-range", async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    let query = {
      $or: [
        {
          checkIn: { $gte: start, $lte: end },
        },
        {
          checkOut: { $gte: start, $lte: end },
        },
        {
          checkIn: { $lte: start },
          checkOut: { $gte: end },
        },
      ],
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ checkIn: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings by date range:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

// PUT route to update booking status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, processedBy } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be 'pending', 'confirmed', or 'cancelled'",
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;
    if (processedBy) {
      booking.processedBy = processedBy;
      booking.processedAt = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    });
  }
});

export default router;
