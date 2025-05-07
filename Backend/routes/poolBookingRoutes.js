const express = require('express');
const router = express.Router();
const PoolBooking = require('../models/PoolBooking');

// Create a new pool booking
router.post('/', async (req, res) => {
  try {
    const { name, phone, whatsapp, email, peopleCount, checkIn, checkOut } = req.body;
    
    // Calculate duration in hours
    const durationHours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    
    // Calculate total amount (Rs.500 for first 2 hours, Rs.200 per additional hour)
    const baseRate = 500;
    const additionalRate = 200;
    const baseHours = 2;
    
    let totalAmount = baseRate;
    if (durationHours > baseHours) {
      totalAmount += Math.ceil(durationHours - baseHours) * additionalRate;
    }
    
    // Multiply by number of people
    totalAmount *= peopleCount;
    
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
    
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all pool bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await PoolBooking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;