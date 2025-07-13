import express from 'express';
const router = express.Router();
import Event from '../models/Event.js';

// GET all event bookings
router.get('/event-bookings', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event bookings' });
  }
});

export default router; 