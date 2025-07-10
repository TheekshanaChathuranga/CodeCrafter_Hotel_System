import express from 'express';
import Booking from '../models/ReceptionBooking.js';
import OnlineBooking from '../models/Booking.js';

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

// Get all bookings (both reception and online bookings)
router.get('/', async (req, res) => {
  try {
    // Get reception bookings
    const receptionBookings = await Booking.find().sort({ createdAt: -1 }).lean();
    
    // Get online bookings  
    const onlineBookings = await OnlineBooking.find().sort({ createdAt: -1 }).lean();
    
    // Transform online bookings to match reception booking structure
    const transformedOnlineBookings = onlineBookings.map(booking => ({
      _id: booking._id,
      guestDetails: {
        name: booking.fullName,
        mobile: booking.phoneNumber,
        email: booking.email || null,
        whatsapp: booking.whatsappNumber || null
      },
      bookingDetails: {
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomNumber: booking.roomNumber,
        roomType: booking.roomType,
        acType: "AC", // Default for online bookings
        packageType: "room-only" // Default for online bookings
      },
      paymentDetails: {
        paymentType: "pending",
        advanceAmount: 0,
        remainingAmount: 0,
        totalAmount: 0
      },
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      bookingType: 'online', // Mark as online booking
      originalData: booking // Keep original data for reference
    }));
    
    // Mark reception bookings
    const markedReceptionBookings = receptionBookings.map(booking => ({
      ...booking,
      bookingType: 'reception'
    }));
    
    // Combine and sort by creation date
    const allBookings = [...markedReceptionBookings, ...transformedOnlineBookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(allBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single booking (handle both types)
router.get('/:id', async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id).lean();
    let bookingType = 'reception';
    
    // If not found in reception bookings, try online bookings
    if (!booking) {
      booking = await OnlineBooking.findById(req.params.id).lean();
      if (booking) {
        bookingType = 'online';
        // Transform online booking to reception booking structure
        booking = {
          _id: booking._id,
          guestDetails: {
            name: booking.fullName,
            mobile: booking.phoneNumber,
            email: booking.email || null,
            whatsapp: booking.whatsappNumber || null
          },
          bookingDetails: {
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomNumber: booking.roomNumber,
            roomType: booking.roomType,
            acType: "AC", // Default for online bookings
            packageType: "room-only" // Default for online bookings
          },
          paymentDetails: {
            paymentType: "pending",
            advanceAmount: 0,
            remainingAmount: 0,
            totalAmount: 0
          },
          status: booking.status,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          bookingType: 'online',
          originalData: booking // Keep original data for reference
        };
      }
    } else {
      booking.bookingType = 'reception';
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status (handle both types)
router.patch('/:id', async (req, res) => {
  try {
    let booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    // If not found in reception bookings, try online bookings
    if (!booking) {
      booking = await OnlineBooking.findByIdAndUpdate(
        req.params.id,
        { 
          status: req.body.status,
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      if (booking) {
        // Transform back to reception booking structure for response
        booking = {
          _id: booking._id,
          guestDetails: {
            name: booking.fullName,
            mobile: booking.phoneNumber,
            email: booking.email || null,
            whatsapp: booking.whatsappNumber || null
          },
          bookingDetails: {
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomNumber: booking.roomNumber,
            roomType: booking.roomType,
            acType: "AC",
            packageType: "room-only"
          },
          paymentDetails: {
            paymentType: "pending",
            advanceAmount: 0,
            remainingAmount: 0,
            totalAmount: 0
          },
          status: booking.status,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          bookingType: 'online'
        };
      }
    } else {
      booking.bookingType = 'reception';
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete booking (handle both types)
router.delete('/:id', async (req, res) => {
  try {
    let booking = await Booking.findByIdAndDelete(req.params.id);
    
    // If not found in reception bookings, try online bookings
    if (!booking) {
      booking = await OnlineBooking.findByIdAndDelete(req.params.id);
    }
    
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