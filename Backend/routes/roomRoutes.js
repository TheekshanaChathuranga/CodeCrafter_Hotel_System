import express from 'express';
import Room from '../models/Room.js'; // Note the .js extension
import Booking from '../models/Booking.js';


const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Add other routes as needed...




router.get('/available', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    // Validate dates
    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        message: 'Both checkIn and checkOut dates are required' 
      });
    }

    // Convert to Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Find conflicting bookings
    const bookedRooms = await Booking.find({
      $or: [
        { 
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    }).distinct('roomNumber');

    // Get available rooms
    const availableRooms = await Room.find({
      roomNumber: { $nin: bookedRooms },
      roomStatus: "Available"
    });

    res.json(availableRooms);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});










export default router;

