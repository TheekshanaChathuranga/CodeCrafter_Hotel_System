import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

// POST route to create a booking
router.post('/', async (req, res) => {
  try {
    const { adminDetails, selectedRoom, packageType, paymentDetails } = req.body;

    if (!adminDetails || !selectedRoom || !packageType || !paymentDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newBooking = new Booking({
      adminDetails: {
        name: adminDetails.name,
        mobile: adminDetails.mobile,
        email: adminDetails.email || null,
        whatsapp: adminDetails.whatsapp || null,
        checkIn: adminDetails.checkIn,
        checkOut: adminDetails.checkOut,
      },
      selectedRoom: {
        roomNumber: selectedRoom.roomNumber,
        acType: selectedRoom.acType,
      },
      packageType,
      paymentDetails: {
        paymentType: paymentDetails.paymentType || "N/A",
        advanceAmount: paymentDetails.advanceAmount || 0,
        remainingAmount: paymentDetails.remainingAmount || 0,
        totalAmount: paymentDetails.totalAmount || 0,
      },
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch all bookings
router.get('/', async (req, res) => {
  try {
    // Fetch all bookings from the database
    const bookings = await Booking.find(); 

    // Check if there are any bookings
    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found' });
    }

    // Send the bookings as the response
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single booking by ID
import mongoose from 'mongoose';

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE route to delete a booking by ID
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
