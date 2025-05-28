import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

import Pool from "../models/Pool.js";
import PoolBooking from "../models/PoolBooking.js";

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
    const totalGuests = bookings.reduce((sum, booking) => sum + booking.guestCount, 0);

    res.json({ totalGuests });
  } catch (err) {
    console.error("Error fetching guest count:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new booking
router.post("/", upload.single("paymentProof"), async (req, res) => {
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
    whatsappNumber
  } = req.body;

  // // Validate required fields
  // if (!checkInTime || !checkOutTime || !phoneNumber) {
  //   return res.status(400).json({
  //     message: "Check-in time, check-out time, and phone number are required"
  //   });
  // }
  // Add this at the start of your POST route handler
if (!checkInTime || !checkOutTime || !phoneNumber) {
  return res.status(400).json({
    message: "Check-in time, check-out time, and phone number are required"
  });
}

  try {
    const pool = await Pool.findById(poolId);
    if (!pool) return res.status(404).json({ message: "Pool not found" });

    // Validate pool capacity
    const existingBookings = await PoolBooking.find({ poolId, date });
    const totalGuests = existingBookings.reduce((sum, b) => sum + b.guestCount, 0);
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
      status: "pending"
    });

    await newBooking.save();
    
    res.status(201).json({
      ...newBooking._doc,
      paymentProof: proofPath ? path.basename(proofPath) : null
    });

  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({
      message: err.message || "Server error during booking creation"
    });
  }
});

export default router;