// routes/booking.js
import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('Received booking data:', req.body);
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(400).json({ 
      message: 'Booking failed',
      error: error.message 
    });
  }
});

export default router;