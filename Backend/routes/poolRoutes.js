// Backend/routes/poolRoutes.js
import express from "express";
import Pool from "../models/Pool.js";
import PoolBooking from "../models/PoolBooking.js";

const router = express.Router();

// Get all pool details
router.get("/", async (req, res) => {
  try {
    const pools = await Pool.find();
    res.status(200).json(pools);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pool details", error });
  }
});

// Get pool availability for a specific date/time range
router.get("/availability", async (req, res) => {
  try {
    const { date, startTime, endTime, poolId } = req.query;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Date, start time, and end time are required"
      });
    }

    const checkDate = new Date(date);
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    let query = {};
    if (poolId) {
      query._id = poolId;
    }

    const pools = await Pool.find(query);
    const poolAvailability = [];

    for (const pool of pools) {
      const isAvailable = await Pool.checkAvailability(
        pool._id,
        startDateTime,
        endDateTime
      );
      
      poolAvailability.push({
        ...pool.toObject(),
        isAvailable,
        requestedPeriod: {
          date: checkDate,
          startTime,
          endTime
        }
      });
    }

    res.status(200).json({
      success: true,
      data: poolAvailability
    });
  } catch (error) {
    console.error("Pool availability check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check pool availability",
      error: error.message
    });
  }
});

// Get pool booking statistics for dashboard
router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's bookings
    const todayBookings = await PoolBooking.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('poolId', 'name');

    // Get pending bookings
    const pendingBookings = await PoolBooking.find({
      status: 'pending'
    }).populate('poolId', 'name');

    // Get confirmed bookings for today
    const confirmedTodayBookings = await PoolBooking.find({
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $in: ['confirmed', 'approved'] }
    }).populate('poolId', 'name');

    // Get total pools
    const totalPools = await Pool.countDocuments();
    const availablePools = await Pool.countDocuments({ poolStatus: 'Available' });

    res.status(200).json({
      success: true,
      stats: {
        totalPools,
        availablePools,
        todayBookings: todayBookings.length,
        pendingBookings: pendingBookings.length,
        confirmedTodayBookings: confirmedTodayBookings.length
      },
      todayBookings,
      pendingBookings
    });
  } catch (error) {
    console.error("Pool stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pool statistics",
      error: error.message
    });
  }
});

export default router;