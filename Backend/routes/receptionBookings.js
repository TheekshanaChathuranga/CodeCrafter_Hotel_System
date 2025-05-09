import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

// Create new booking
router.post('/', async (req, res) => {
  try {
    const booking = new Booking({
      guestDetails: {
        name: req.body.adminDetails.name,
        mobile: req.body.adminDetails.mobile,
        email: req.body.adminDetails.email,
        whatsapp: req.body.adminDetails.whatsapp
      },
      bookingDetails: {
        checkIn: req.body.adminDetails.checkIn,
        checkOut: req.body.adminDetails.checkOut,
        roomNumber: req.body.selectedRoom.roomNumber,
        roomType: req.body.selectedRoomType,
        acType: req.body.selectedRoom.acType,
        packageType: req.body.packageType
      },
      paymentDetails: {
        paymentType: req.body.paymentDetails.paymentType,
        advanceAmount: req.body.paymentDetails.advanceAmount,
        remainingAmount: req.body.paymentDetails.remainingAmount,
        totalAmount: req.body.paymentDetails.totalAmount
      }
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
router.patch('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;