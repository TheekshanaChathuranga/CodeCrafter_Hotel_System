const express = require('express');
const router = express.Router();
const PoolBooking = require('../models/PoolBooking');

// Create a new pool booking
router.post('/', async (req, res) => {
  try {
    const { name, phone, whatsapp, email, peopleCount, checkIn, checkOut } = req.body;
    
    // Validate required fields
    if (!name || !phone || !peopleCount || !checkIn || !checkOut) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate duration
    const durationHours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    
    // Validate duration
    if (durationHours <= 0) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    // Calculate total amount
    const baseRate = 500;
    const additionalRate = 200;
    const baseHours = 2;
    
    let totalAmount = baseRate;
    if (durationHours > baseHours) {
      totalAmount += Math.ceil(durationHours - baseHours) * additionalRate;
    }
    
    totalAmount *= peopleCount;

    // Create and save booking
    const booking = new PoolBooking({
      name,
      phone,
      whatsapp,
      email,
      peopleCount,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      totalAmount
    });

    const savedBooking = await booking.save();
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking
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