import express from 'express';
import Booking from '../models/ReceptionBooking.js';

const router = express.Router();

// Get available rooms
router.get('/available', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    // Find rooms that are booked during the requested period and not cancelled or checked-out
    const bookedRooms = await Booking.find({
      status: { $nin: ['cancelled', 'checked-out'] },
      $or: [
        { 
          'bookingDetails.checkIn': { $lt: new Date(checkOut) },
          'bookingDetails.checkOut': { $gt: new Date(checkIn) }
        }
      ]
    }).distinct('bookingDetails.roomNumber');

    // All rooms in the hotel
    const allRooms = [
      { id: '102', type: 'Single Room', acType: 'Non-AC' },
      { id: '101', type: 'Double Room', acType: 'AC' },
      { id: '103', type: 'Double Room', acType: 'AC' },
      { id: '104', type: 'Double Room', acType: 'AC' },
      { id: '105', type: 'Double Room', acType: 'AC' },
      { id: '106', type: 'Double Room', acType: 'AC' },
      { id: '107', type: 'Triple Room', acType: 'AC' },
      { id: '108', type: 'Triple Room', acType: 'AC' },
      { id: '109', type: 'Triple Room', acType: 'AC' }
    ];

    // Filter available rooms
    const availableRooms = allRooms.filter(room => !bookedRooms.includes(room.id));
    
    res.json(availableRooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;