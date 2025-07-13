import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

import Pool from "../models/Pool.js";
import PoolBooking from "../models/PoolBooking.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/proofs");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// GET pool details by ID
router.get("/:id", async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id);
    if (!pool) return res.status(404).json({ message: "Pool not found" });
    res.json(pool);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET total guests booked for a specific pool on a specific date
router.get("/:poolId/:date", async (req, res) => {
  const { poolId, date } = req.params;

  try {
    const bookings = await PoolBooking.find({ poolId, date });
    const totalGuests = bookings.reduce(
      (sum, booking) => sum + booking.guestCount,
      0
    );

    res.json({ totalGuests });
  } catch (err) {
    console.error("Error fetching guest count:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new booking
router.post("/", upload.single("paymentProof"), async (req, res) => {
  // --- FIELD VALIDATION ---
  // 1. Full Name: only English letters, spaces, and dots (no numbers or other symbols)
  if (!/^[A-Za-z.\s]+$/.test(req.body.fullName)) {
    return res.status(400).json({
      field: "fullName",
      message: "Invalid name",
    });
  }

  // 2. Phone number: only numbers, must be 10 digits
  if (!/^[0-9]{10}$/.test(req.body.phoneNumber)) {
    return res.status(400).json({
      field: "phoneNumber",
      message: "Phone number must be exactly 10 digits.",
    });
  }

  // 3. WhatsApp number: only numbers, must be 10 digits (if provided)
  if (req.body.whatsappNumber && req.body.whatsappNumber.trim() !== "") {
    if (!/^[0-9]{10}$/.test(req.body.whatsappNumber)) {
      return res.status(400).json({
        field: "whatsappNumber",
        message: "Whatsapp number must be exactly 10 digits.",
      });
    }
  }

  // 4. Booking date: must be today or a future date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(req.body.date);
  bookingDate.setHours(0, 0, 0, 0);
  if (isNaN(bookingDate.getTime()) || bookingDate < today) {
    return res.status(400).json({
      field: "date",
      message: "Booking date must be today or a future date.",
    });
  }

  // 5. Check-in/check-out time: must be within open hours (08:00 to 20:00)
  const OPEN_TIME = "08:00";
  const CLOSE_TIME = "20:00";
  function timeToMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }
  if (!req.body.checkInTime || !req.body.checkOutTime) {
    return res.status(400).json({
      field: "checkInTime",
      message: "Check-in time and check-out time are required.",
    });
  }
  const checkInMins = timeToMinutes(req.body.checkInTime);
  const checkOutMins = timeToMinutes(req.body.checkOutTime);
  const openMins = timeToMinutes(OPEN_TIME);
  const closeMins = timeToMinutes(CLOSE_TIME);
  if (
    checkInMins < openMins ||
    checkInMins >= closeMins ||
    checkOutMins > closeMins ||
    checkOutMins <= openMins ||
    checkOutMins <= checkInMins
  ) {
    return res.status(400).json({
      field: "checkInTime",
      message: `Check-in and check-out times must be within open hours (${OPEN_TIME} - ${CLOSE_TIME}) and check-out must be after check-in.`,
    });
  }
  const {
    poolId,
    fullName,
    date,
    guestCount,
    //specificRequest,
    request: specificRequest,
    checkInTime,
    checkOutTime,
    phoneNumber,
    whatsappNumber,
  } = req.body;

  // Validate required fields
  if (!checkInTime || !checkOutTime || !phoneNumber) {
    return res.status(400).json({
      message: "Check-in time, check-out time, and phone number are required",
    });
  }
  //Add this at the start of your POST route handler
  if (!checkInTime || !checkOutTime || !phoneNumber) {
    return res.status(400).json({
      message: "Check-in time, check-out time, and phone number are required",
    });
  }

  try {
    const pool = await Pool.findById(poolId);
    if (!pool) return res.status(404).json({ message: "Pool not found" });

    // Validate pool capacity
    const existingBookings = await PoolBooking.find({ poolId, date });
    const totalGuests = existingBookings.reduce(
      (sum, b) => sum + b.guestCount,
      0
    );
    const requestedGuests = parseInt(guestCount, 10);

    if (totalGuests + requestedGuests > pool.capacity) {
      return res.status(400).json({ message: "Pool capacity exceeded" });
    }

    // Handle file upload
    const proofPath = req.file ? req.file.path : null;

    // Create new booking with all fields
    const newBooking = new PoolBooking({
      poolId,
      fullName,
      date,
      guestCount: requestedGuests,
      specificRequest: specificRequest || "",
      checkInTime,
      checkOutTime,
      phoneNumber,
      //whatsappNumber: whatsappNumber || undefined,  // MongoDB doesn't store undefined values
      whatsappNumber: whatsappNumber || "",
      paymentProof: proofPath,
      status: "pending",
    });

    await newBooking.save();

    // Create persistent notification for all admins
    const notification = new Notification({
      type: "pool-booking",
      title: "New Pool Booking",
      message: `${newBooking.fullName} booked pool for ${newBooking.guestCount} guests`,
      bookingId: newBooking._id,
      adminId: null, // null means for all admins
      isRead: false,
    });

    await notification.save();
    console.log("Pool booking notification saved to database:", notification._id);

    // Emit real-time notification to online admins
    const io = req.app.get("io");
    const adminSockets = req.app.get("adminSockets");

    // Emit both individual notifications and booking-created event
    if (io) {
      // Emit to all connected clients (for real-time updates)
      io.emit("pool-booking-created", {
        bookingId: newBooking._id,
        fullName: newBooking.fullName,
        guestCount: newBooking.guestCount,
        date: newBooking.date,
        status: newBooking.status,
        createdAt: newBooking.createdAt,
        notificationId: notification._id,
      });

      // Emit targeted notifications to admin sockets
      if (adminSockets && adminSockets.size > 0) {
        adminSockets.forEach((socketId, adminId) => {
          io.to(socketId).emit("bookingNotification", {
            type: "pool",
            title: "New Pool Booking",
            message: `${newBooking.fullName} booked pool for ${newBooking.guestCount} guests`,
            time: new Date().toISOString(),
            notificationId: notification._id,
          });
        });
      }
    }

    res.status(201).json({
      ...newBooking._doc,
      paymentProof: proofPath ? path.basename(proofPath) : null,
    });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({
      message: err.message || "Server error during booking creation",
    });
  }
});

// GET all pool bookings
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const query = PoolBooking.find().sort({ createdAt: -1 });

    if (limit > 0) {
      query.limit(limit);
    }

    const bookings = await query.exec();
    res.json({
      count: bookings.length,
      bookings: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

// PUT update booking by ID
router.put("/:id", async (req, res) => {
  try {
    const updateFields = {};
    if ("fullName" in req.body) updateFields.fullName = req.body.fullName;
    if ("phoneNumber" in req.body)
      updateFields.phoneNumber = req.body.phoneNumber;
    if ("whatsappNumber" in req.body)
      updateFields.whatsappNumber = req.body.whatsappNumber;
    if ("checkIn" in req.body) updateFields.checkIn = req.body.checkIn;
    if ("checkOut" in req.body) updateFields.checkOut = req.body.checkOut;
    if ("guestCount" in req.body) updateFields.guestCount = req.body.guestCount;
    if ("peopleCount" in req.body)
      updateFields.peopleCount = req.body.peopleCount;
    if ("totalAmount" in req.body)
      updateFields.totalAmount = req.body.totalAmount;
    if ("paymentStatus" in req.body)
      updateFields.paymentStatus = req.body.paymentStatus;
    if ("status" in req.body) updateFields.status = req.body.status;
    if ("notes" in req.body) updateFields.notes = req.body.notes;
    if ("specificRequest" in req.body)
      updateFields.specificRequest = req.body.specificRequest;
    if ("paymentType" in req.body)
      updateFields.paymentType = req.body.paymentType;
    if ("advanceAmount" in req.body)
      updateFields.advanceAmount = req.body.advanceAmount;

    // Fallback for legacy fields
    if ("name" in req.body) updateFields.name = req.body.name;
    if ("phone" in req.body) updateFields.phone = req.body.phone;
    if ("whatsapp" in req.body) updateFields.whatsapp = req.body.whatsapp;

    const booking = await PoolBooking.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ booking });
  } catch (err) {
    res
      .status(400)
      .json({ message: err.message || "Failed to update booking" });
  }
});

export default router;
