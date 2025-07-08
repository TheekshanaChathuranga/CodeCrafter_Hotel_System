const express = require('express');
const router = express.Router();
const PoolBooking = require('../models/PoolBooking');

// Create a new pool booking
router.post('/', async (req, res) => {
  try {
    const { name, phone, whatsapp, email, peopleCount, checkIn, checkOut } = req.body;
    
    // Validate required fields
    if (!name || !phone || !peopleCount || !checkIn) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse check-in time
    const checkInDate = new Date(checkIn);
    
    // If check-out is not provided, automatically set it to 2 hours after check-in
    let checkOutDate;
    if (checkOut) {
      checkOutDate = new Date(checkOut);
    } else {
      checkOutDate = new Date(checkInDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    }

    // Calculate duration
    const durationHours = (checkOutDate - checkInDate) / (1000 * 60 * 60);
    
    // Validate duration (minimum 2 hours)
    if (durationHours < 2) {
      return res.status(400).json({ message: 'Minimum booking duration is 2 hours' });
    }

    // Calculate total amount
    const baseRate = 500; // Rs.500 for first 2 hours
    const additionalRate = 200; // Rs.200 per additional hour
    const baseHours = 2;
    
    let totalAmount = baseRate;
    const additionalHours = Math.ceil(durationHours - baseHours);
    
    if (additionalHours > 0) {
      totalAmount += additionalHours * additionalRate;
    }
    
    totalAmount *= peopleCount;

    // Create and save booking
    const booking = new PoolBooking({
      name,
      phone,
      whatsapp,
      email,
      peopleCount,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount
    });

    const savedBooking = await booking.save();
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking,
      pricing: {
        baseRate,
        additionalHours: savedBooking.additionalHours,
        additionalRate,
        totalAmount: savedBooking.totalAmount,
        perPersonAmount: savedBooking.totalAmount / peopleCount
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Get all pool bookings with optional limit
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const query = PoolBooking.find().sort({ createdAt: -1 });
    
    if (limit > 0) {
      query.limit(limit);
    }
    
    const bookings = await query.exec();
    res.json({
      count: bookings.length,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

module.exports = router;