import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Destructure and validate input
    const { checkIn, checkOut, phoneNumber, roomNumber, ...rest } = req.body;
    
    // Convert to Date objects
    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    // Date validation
    if (newCheckOut <= newCheckIn) {
      return res.status(400).json({ 
        message: "Check-out date must be after check-in date" 
      });
    }

    // Phone number validation
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ 
        message: "Invalid phone number format (10 digits required)" 
      });
    }

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      roomNumber: roomNumber,
      $or: [
        { 
          checkIn: { $lt: newCheckOut },
          checkOut: { $gt: newCheckIn }
        }
      ]
    });

    if (existingBooking) {
      return res.status(409).json({
        message: `Room ${roomNumber} is already booked from ${existingBooking.checkIn.toDateString()} to ${existingBooking.checkOut.toDateString()}`
      });
    }

    // Create new booking
    const newBooking = new Booking({
      roomNumber,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      phoneNumber,
      ...rest
    });

    // Save to database
    const savedBooking = await newBooking.save();

    // Success response
    res.status(201).json({
      success: true,
      message: "Booking confirmed!",
      bookingId: savedBooking._id,
      details: {
        roomNumber: savedBooking.roomNumber,
        dates: {
          checkIn: savedBooking.checkIn,
          checkOut: savedBooking.checkOut
        },
        guest: savedBooking.fullName
      }
    });

  } catch (error) {
    console.error('Booking error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate booking detected'
      });
    }

    // Generic error response
    res.status(500).json({
      message: 'Booking processing failed',
      error: error.message
    });
  }
});

export default router;