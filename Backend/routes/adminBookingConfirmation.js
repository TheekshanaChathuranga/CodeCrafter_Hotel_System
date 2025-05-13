import express from 'express';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

const router = express.Router();

// Admin middleware (directly in route file)
const adminAuth = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get pending bookings
router.get('/pending', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve booking
router.patch('/:id/approve', adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'confirmed',
        processedBy: req.user.id,
        processedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Notify via Socket.io
    req.app.get('io').emit('booking-updated', {
      bookingId: booking._id,
      newStatus: 'confirmed',
      processedBy: req.user.name
    });

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reject booking
router.patch('/:id/reject', adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        processedBy: req.user.id,
        processedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    req.app.get('io').emit('booking-updated', {
      bookingId: booking._id,
      newStatus: 'rejected',
      processedBy: req.user.name
    });

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;