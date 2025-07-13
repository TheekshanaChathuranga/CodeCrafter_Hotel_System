import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import PoolBooking from "../models/PoolBooking.js";
import Pool from "../models/Pool.js";
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

// Get all pool bookings with optional limit (this should come before /:poolId/:date)
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

// GET pool details by ID (more specific route)
router.get("/pool/:id", async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id);
    if (!pool) return res.status(404).json({ message: "Pool not found" });
    res.json(pool);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET total guests booked for a specific pool on a specific date
// This route must come after the /pool/:id route to avoid conflicts
router.get("/:poolId/:date", async (req, res) => {
  const { poolId, date } = req.params;

  // Validate date format (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  try {
    console.log(`Checking availability for pool ${poolId} on ${date}`);

    // Create date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Search for bookings by both legacy and new date fields
    const bookings = await PoolBooking.find({
      poolId,
      $or: [
        { date: { $gte: startDate, $lte: endDate } },
        { checkIn: { $gte: startDate, $lte: endDate } },
      ],
    });

    const totalGuests = bookings.reduce(
      (sum, booking) => sum + (booking.guestCount || booking.peopleCount || 0),
      0
    );

    console.log(
      `Found ${bookings.length} bookings with ${totalGuests} total guests`
    );
    res.json({ totalGuests });
  } catch (err) {
    console.error("Error fetching guest count:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create new booking (handle both reception and online bookings)
router.post("/", upload.single("paymentProof"), async (req, res) => {
  console.log("=== poolBookingRoutes.js POST route called ===");
  console.log("Request body:", req.body);
  console.log("File uploaded:", !!req.file);

  try {
    const {
      // Handle both legacy and new field names
      name,
      fullName,
      phone,
      phoneNumber,
      whatsapp,
      whatsappNumber,
      email,
      peopleCount,
      guestCount,
      checkIn,
      date,
      checkOut,
      checkInTime,
      checkOutTime,
      request,
      specificRequest,
      paymentType,
      advanceAmount,
      totalAmount,
      status, // allow status from frontend
      paymentProof, // for online bookings
      poolId,
    } = req.body;

    // Normalize field names - prefer the frontend field names
    const normalizedName = fullName || name;
    const normalizedPhone = phoneNumber || phone;
    const normalizedWhatsapp = whatsappNumber || whatsapp;
    const normalizedGuestCount = guestCount || peopleCount;
    const normalizedRequest = request || specificRequest;

    // Check if this is a reception booking (has status "approved" and different data structure)
    const isReceptionBooking = status === "approved";

    console.log("Is reception booking:", isReceptionBooking);

    // Validate required fields
    if (!normalizedName || !normalizedPhone || !normalizedGuestCount) {
      return res.status(400).json({
        message:
          "Missing required fields: name, phone, and guestCount are required",
      });
    }

    let newBooking;

    if (isReceptionBooking) {
      // Handle reception booking (from BookingForm.jsx)
      console.log("Processing reception booking");

      if (!checkIn || !checkOut) {
        return res.status(400).json({
          message:
            "Check-in and check-out times are required for reception bookings",
        });
      }

      // For reception bookings, checkIn/checkOut are DateTime objects
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date format for check-in or check-out",
        });
      }

      // Extract date (use checkIn date) and times
      const bookingDate = checkInDate.toISOString().split("T")[0];
      const extractedCheckInTime = checkInDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      const extractedCheckOutTime = checkOutDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      console.log(`Reception booking details:
        - Date: ${bookingDate}
        - Check-in time: ${extractedCheckInTime}
        - Check-out time: ${extractedCheckOutTime}
        - Guest count: ${normalizedGuestCount}
        - Total amount: ${totalAmount}`);

      // Create reception booking
      newBooking = new PoolBooking({
        poolId: poolId || null,
        fullName: normalizedName,
        date: new Date(bookingDate),
        guestCount: Number(normalizedGuestCount),
        specificRequest: normalizedRequest || "",
        checkInTime: extractedCheckInTime,
        checkOutTime: extractedCheckOutTime,
        phoneNumber: normalizedPhone,
        whatsappNumber: normalizedWhatsapp || "",
        email: email || "",
        paymentProof: null, // No payment proof for reception bookings
        status: "approved", // Reception bookings are pre-approved
        paymentType: paymentType || "notPaid",
        advanceAmount: Number(advanceAmount) || 0,
        totalAmount: Number(totalAmount) || 0,
      });
    } else {
      // Handle online booking (from customer forms)
      console.log("Processing online booking");

      // Validate required fields for online bookings
      if (!date && !checkIn) {
        return res.status(400).json({
          message: "Date is required for online bookings",
        });
      }

      if (!checkInTime || !checkOutTime) {
        return res.status(400).json({
          message:
            "Check-in time and check-out time are required for online bookings",
        });
      }

      // Validate payment proof file for online bookings
      if (!req.file) {
        return res.status(400).json({
          message: "Payment proof file is required for online bookings",
        });
      }

      // Basic phone validation
      const cleanPhone = normalizedPhone.replace(/[\s-]/g, "");
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        return res.status(400).json({
          message: "Phone number must be 10 digits",
        });
      }

      // Handle date
      let bookingDate;
      if (date) {
        bookingDate = new Date(date);
      } else {
        bookingDate = new Date(checkIn);
      }

      // Validate booking date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);
      if (isNaN(bookingDate.getTime()) || bookingDate < today) {
        return res.status(400).json({
          message: "Booking date must be today or a future date",
        });
      }

      // Get pool or use default
      let targetPoolId = poolId;
      if (!targetPoolId) {
        const defaultPool = await Pool.findOne({ poolStatus: "Available" });
        if (!defaultPool) {
          return res.status(400).json({ message: "No available pools found" });
        }
        targetPoolId = defaultPool._id;
      }

      // Check pool capacity
      const existingBookings = await PoolBooking.find({
        date: bookingDate,
        status: { $ne: "cancelled" },
      });

      const totalExistingGuests = existingBookings.reduce(
        (sum, booking) =>
          sum + (booking.guestCount || booking.peopleCount || 0),
        0
      );

      const pool = await Pool.findById(targetPoolId);
      const poolCapacity = pool ? pool.capacity : 30;

      if (totalExistingGuests + Number(normalizedGuestCount) > poolCapacity) {
        return res.status(400).json({ message: "Pool capacity exceeded" });
      }

      // Handle file upload
      const proofPath = req.file ? req.file.path : null;

      // Create online booking
      newBooking = new PoolBooking({
        poolId: targetPoolId,
        fullName: normalizedName,
        date: bookingDate,
        guestCount: Number(normalizedGuestCount),
        specificRequest: normalizedRequest || "",
        checkInTime,
        checkOutTime,
        phoneNumber: normalizedPhone,
        whatsappNumber: normalizedWhatsapp || "",
        email: email || "",
        paymentProof: proofPath,
        status: "pending",
      });
    }

    // Save the booking
    await newBooking.save();
    console.log(
      `${
        isReceptionBooking ? "Reception" : "Online"
      } pool booking created successfully:`,
      newBooking._id
    );

    // Create persistent notification for all admins (only for online bookings, not reception bookings)
    if (!isReceptionBooking) {
      const notification = new Notification({
        type: "pool-booking",
        title: "New Pool Booking",
        message: `${newBooking.fullName || newBooking.name} booked pool for ${newBooking.guestCount || newBooking.peopleCount} guests`,
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
          fullName: newBooking.fullName || newBooking.name,
          guestCount: newBooking.guestCount || newBooking.peopleCount,
          date: newBooking.date || newBooking.checkIn,
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
              message: `${newBooking.fullName || newBooking.name} booked pool for ${newBooking.guestCount || newBooking.peopleCount} guests`,
              time: new Date().toISOString(),
              notificationId: notification._id,
            });
          });
        }
      }
    } else {
      console.log("Skipping notification for reception booking");
    }

    // Prepare response
    const response = {
      message: "Pool booking created successfully",
      booking: newBooking,
    };

    // Add payment proof filename for online bookings
    if (!isReceptionBooking && newBooking.paymentProof) {
      response.paymentProof = path.basename(newBooking.paymentProof);
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
});

// PUT update booking by ID (ensure paymentType and advanceAmount can be updated)
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
