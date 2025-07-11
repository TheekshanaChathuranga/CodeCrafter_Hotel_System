import express from 'express';
import Booking from '../models/ReceptionBooking.js';
import OnlineBooking from '../models/Booking.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Get all bookings from both collections
    const receptionBookings = await Booking.find().lean();
    const onlineBookings = await OnlineBooking.find().lean();
    
    // Transform online bookings to match reception booking structure
    const transformedOnlineBookings = onlineBookings.map(booking => ({
      _id: booking._id,
      guestDetails: {
        name: booking.fullName,
        mobile: booking.phoneNumber
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
        totalAmount: 0
      },
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));
    
    // Combine all bookings
    const allBookings = [...receptionBookings, ...transformedOnlineBookings];

    // Today's check-ins
    const todaysCheckIns = allBookings.filter(booking => {
      const checkIn = new Date(booking.bookingDetails.checkIn);
      return checkIn >= today && checkIn <= todayEnd;
    }).length;

    // Today's check-outs
    const todaysCheckOuts = allBookings.filter(booking => {
      const checkOut = new Date(booking.bookingDetails.checkOut);
      return checkOut >= today && checkOut <= todayEnd;
    }).length;

    // Currently occupied rooms
    const currentlyOccupied = allBookings.filter(booking => {
      const checkIn = new Date(booking.bookingDetails.checkIn);
      const checkOut = new Date(booking.bookingDetails.checkOut);
      return checkIn <= today && checkOut > today && booking.status === 'checked-in';
    }).length;

    // Room availability by type
    const roomTypes = ['Single Room', 'Double Room', 'Triple Room'];
    const totalRoomsByType = { 'Single Room': 5, 'Double Room': 15, 'Triple Room': 10 };
    
    const occupiedByType = {};
    roomTypes.forEach(type => {
      occupiedByType[type] = allBookings.filter(booking => {
        const checkIn = new Date(booking.bookingDetails.checkIn);
        const checkOut = new Date(booking.bookingDetails.checkOut);
        return booking.bookingDetails.roomType === type &&
               checkIn <= today && checkOut > today &&
               booking.status === 'checked-in';
      }).length;
    });

    const availableRooms = roomTypes.map(type => ({
      type,
      available: totalRoomsByType[type] - (occupiedByType[type] || 0),
      total: totalRoomsByType[type],
      occupied: occupiedByType[type] || 0
    }));

    // Revenue calculations
    const todaysRevenue = allBookings
      .filter(booking => {
        const checkIn = new Date(booking.bookingDetails.checkIn);
        return checkIn >= today && checkIn <= todayEnd;
      })
      .reduce((sum, booking) => sum + booking.paymentDetails.totalAmount, 0);

    const monthlyRevenue = allBookings
      .filter(booking => {
        const checkIn = new Date(booking.bookingDetails.checkIn);
        return checkIn.getMonth() === today.getMonth() && 
               checkIn.getFullYear() === today.getFullYear();
      })
      .reduce((sum, booking) => sum + booking.paymentDetails.totalAmount, 0);

    // Upcoming check-ins (next 3 days)
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const upcomingCheckIns = allBookings.filter(booking => {
      const checkIn = new Date(booking.bookingDetails.checkIn);
      return checkIn > todayEnd && checkIn <= threeDaysFromNow;
    }).length;

    res.json({
      todaysCheckIns,
      todaysCheckOuts,
      currentlyOccupied,
      totalAvailable: availableRooms.reduce((sum, room) => sum + room.available, 0),
      availableRooms,
      todaysRevenue,
      monthlyRevenue,
      upcomingCheckIns,
      totalBookings: allBookings.length,
      totalRooms: Object.values(totalRoomsByType).reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bookings for a specific date
router.get('/bookings/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get bookings from both collections
    const receptionBookings = await Booking.find({
      $or: [
        {
          'bookingDetails.checkIn': {
            $gte: targetDate,
            $lt: nextDay
          }
        },
        {
          'bookingDetails.checkOut': {
            $gte: targetDate,
            $lt: nextDay
          }
        },
        {
          'bookingDetails.checkIn': { $lte: targetDate },
          'bookingDetails.checkOut': { $gte: nextDay }
        }
      ]
    }).sort({ 'bookingDetails.checkIn': 1 }).lean();

    const onlineBookings = await OnlineBooking.find({
      $or: [
        {
          'checkIn': {
            $gte: targetDate,
            $lt: nextDay
          }
        },
        {
          'checkOut': {
            $gte: targetDate,
            $lt: nextDay
          }
        },
        {
          'checkIn': { $lte: targetDate },
          'checkOut': { $gte: nextDay }
        }
      ]
    }).sort({ 'checkIn': 1 }).lean();

    // Transform online bookings to match reception booking structure
    const transformedOnlineBookings = onlineBookings.map(booking => ({
      _id: booking._id,
      guestDetails: {
        name: booking.fullName,
        mobile: booking.phoneNumber
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
        totalAmount: 0
      },
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      bookingType: 'online'
    }));

    // Mark reception bookings
    const markedReceptionBookings = receptionBookings.map(booking => ({
      ...booking,
      bookingType: 'reception'
    }));

    // Combine and sort by check-in date
    const allBookings = [...markedReceptionBookings, ...transformedOnlineBookings]
      .sort((a, b) => new Date(a.bookingDetails.checkIn) - new Date(b.bookingDetails.checkIn));

    res.json(allBookings);
  } catch (error) {
    console.error('Error fetching bookings for date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
