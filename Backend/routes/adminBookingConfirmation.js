import express from 'express';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all pending bookings
router.get('/pending', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .select('-__v')
      .lean();
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ error: 'Failed to fetch pending bookings' });
  }
});

// Get single booking details
router.get('/pending/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve booking
router.patch('/:id/approve', async (req, res) => {
  try {
    // Temporarily hardcode processedBy for testing
    const processedBy = new mongoose.Types.ObjectId('67ed21a0c1811a6b2f5480b4'); // Replace with a valid user ID
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'confirmed',
        processedBy: processedBy, // Use hardcoded ID for now
        processedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').emit('booking-updated', {
        bookingId: booking._id,
        newStatus: 'confirmed'
      });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(400).json({ error: error.message });
  }
});

// Reject booking
router.patch('/:id/reject', async (req, res) => {
  try {
    // Temporarily hardcode processedBy for testing
    const processedBy = new mongoose.Types.ObjectId('67ed21a0c1811a6b2f5480b4'); // Replace with a valid user ID
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        processedBy: processedBy, // Use hardcoded ID for now
        processedAt: new Date(),
        rejectionReason: req.body.reason || ''
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').emit('booking-updated', {
        bookingId: booking._id,
        newStatus: 'rejected'
      });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;