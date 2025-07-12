import express from "express";
import PoolBooking from "../models/PoolBooking.js";
import Pool from "../models/Pool.js";
const router = express.Router();

// POST create new booking (ensure paymentType and advanceAmount are stored)
router.post("/", async (req, res) => {
  console.log("=== poolBookingRoutes.js POST route called ===");
  console.log("Request body:", req.body);
  try {
    const {
      name,
      phone,
      whatsapp,
      email,
      peopleCount,
      checkIn,
      checkOut,
      paymentType,
      advanceAmount,
      status, // allow status from frontend
      paymentProof, // for online bookings
    } = req.body;

    // Validate required fields
    if (!name || !phone || !peopleCount || !checkIn) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Basic phone validation - allow 10 digits with or without spaces/dashes
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    }

    // Get default pool (first available pool) if no poolId provided
    let poolId = req.body.poolId;
    if (!poolId) {
      const defaultPool = await Pool.findOne({ poolStatus: "Available" });
      if (!defaultPool) {
        return res.status(400).json({ message: "No available pools found" });
      }
      poolId = defaultPool._id;
    }

    // Ensure peopleCount is a valid number and at least 1
    const validPeopleCount = Math.max(parseInt(peopleCount) || 1, 1);

    const checkInDate = new Date(checkIn);
    let checkOutDate;
    if (checkOut) {
      checkOutDate = new Date(checkOut);
    } else {
      checkOutDate = new Date(checkInDate.getTime() + 2 * 60 * 60 * 1000);
    }

    const durationHours = (checkOutDate - checkInDate) / (1000 * 60 * 60);
    if (durationHours < 2) {
      return res
        .status(400)
        .json({ message: "Minimum booking duration is 2 hours" });
    }

    // Enhanced calculation logic with debugging
    const baseRate = 500;
    const additionalRate = 200;
    const baseHours = 2;
    let totalAmount = baseRate;
    const additionalHours = Math.ceil(durationHours - baseHours);

    if (additionalHours > 0) {
      totalAmount += additionalHours * additionalRate;
    }

    // Multiply by people count - this is crucial
    totalAmount = totalAmount * validPeopleCount;

    // Ensure totalAmount is never 0 or negative
    if (totalAmount <= 0) {
      totalAmount = baseRate * validPeopleCount; // fallback calculation
    }

    console.log(
      `Booking calculation: ${validPeopleCount} people × ${baseRate} base rate = ${totalAmount} (duration: ${durationHours}hrs, additional: ${additionalHours}hrs)`
    );

    let advAmount = 0;
    let payType = paymentType || "notPaid";
    if (payType === "advance") {
      advAmount = Number(advanceAmount) || 0;
      if (advAmount <= 0 || advAmount > totalAmount) {
        return res.status(400).json({ message: "Invalid advance amount" });
      }
    }
    if (payType === "full") {
      advAmount = totalAmount;
    }

    // Store paymentType and advanceAmount in DB, and status if provided
    const bookingData = {
      poolId,
      name,
      phone,
      whatsapp,
      email,
      peopleCount: validPeopleCount,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount: totalAmount, // Explicitly ensure this is set
      paymentType: payType,
      advanceAmount: advAmount,
      status: status || "pending",
    };

    // Add payment proof if it's an online booking
    if (paymentProof) {
      bookingData.paymentProof = paymentProof;
    }

    const booking = new PoolBooking(bookingData);

    const savedBooking = await booking.save();

    // Verify the saved booking has totalAmount
    if (!savedBooking.totalAmount || savedBooking.totalAmount <= 0) {
      console.error(
        "Warning: Saved booking has invalid totalAmount:",
        savedBooking.totalAmount
      );
      // Try to update it immediately
      await PoolBooking.findByIdAndUpdate(savedBooking._id, {
        totalAmount: totalAmount,
      });
    }

    console.log(
      "Booking saved successfully with totalAmount:",
      savedBooking.totalAmount
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: savedBooking,
      pricing: {
        baseRate,
        additionalHours,
        additionalRate,
        totalAmount: totalAmount,
        perPersonAmount: totalAmount / validPeopleCount,
        peopleCount: validPeopleCount,
      },
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
});

// Get all pool bookings with optional limit
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
