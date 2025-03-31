import express from 'express';
import OnlineBooking from '../models/OnlineBooking.js';

const router = express.Router();

// Get all rooms (existing)
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

// Create new booking
router.post('/online', async (req, res) => {
  try {
    const booking = new OnlineBooking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Booking failed', error: error.message });
  }
});

export default router;