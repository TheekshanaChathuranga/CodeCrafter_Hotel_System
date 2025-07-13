import express from 'express';
import CustomerEvent from '../models/CustomerEvent.js';
import validateCustomerEvent from '../middleware/validateCustomerEvent.js';

const router = express.Router();

// Create a new customer event booking (no auth required)
router.post('/', validateCustomerEvent, async (req, res) => {
  try {
    const booking = new CustomerEvent(req.body);
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating customer event booking:', err);
    res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
});

// Get all pending customer events (admin purpose)
router.get('/pending', async (req, res) => {
  try {
    const bookings = await CustomerEvent.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching pending customer events:', err);
    res.status(500).json({ message: 'Failed to fetch pending events', error: err.message });
  }
});

export default router; 