import express from 'express';
import ReceptionBooking from '../models/ReceptionBooking.js';
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
    const receptionBookings = await ReceptionBooking.find().lean();
    const onlineBookings = await OnlineBooking.find().lean();
    
    // Combine all bookings with a unified structure
    const allBookings = [
      ...receptionBookings.map(booking => ({ ...booking, bookingType: 'reception' })),
      ...onlineBookings.map(booking => ({ ...booking, bookingType: 'online' }))
    ];
    
    // Today's check-ins
    const todaysCheckIns = allBookings.filter(booking => {
      const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
      if (!checkInDate) return false;
      const checkIn = new Date(checkInDate);
      return checkIn >= today && checkIn <= todayEnd;
    }).length;

    // Today's check-outs
    const todaysCheckOuts = allBookings.filter(booking => {
      const checkOutDate = booking.bookingDetails?.checkOut || booking.checkOut;
      if (!checkOutDate) return false;
      const checkOut = new Date(checkOutDate);
      return checkOut >= today && checkOut <= todayEnd;
    }).length;

    // Currently occupied rooms
    const currentlyOccupied = allBookings.filter(booking => {
      const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
      const checkOutDate = booking.bookingDetails?.checkOut || booking.checkOut;
      if (!checkInDate || !checkOutDate) return false;
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      return checkIn <= today && checkOut > today && booking.status === 'checked-in';
    }).length;

    // Room availability by type
    const roomTypes = ['Single Room', 'Double Room', 'Triple Room'];
    const totalRoomsByType = { 'Single Room': 1, 'Double Room': 5, 'Triple Room': 3 };
    
    const occupiedByType = {};
    roomTypes.forEach(type => {
      occupiedByType[type] = allBookings.filter(booking => {
        const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
        const checkOutDate = booking.bookingDetails?.checkOut || booking.checkOut;
        const roomType = booking.bookingDetails?.roomType || booking.roomType;
        if (!checkInDate || !checkOutDate || !roomType) return false;
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        return roomType === type &&
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
        const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
        if (!checkInDate) return false;
        const checkIn = new Date(checkInDate);
        return checkIn >= today && checkIn <= todayEnd;
      })
      .reduce((sum, booking) => {
        const amount = booking.paymentDetails?.totalAmount || booking.totalAmount || 0;
        return sum + amount;
      }, 0);

    const monthlyRevenue = allBookings
      .filter(booking => {
        const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
        if (!checkInDate) return false;
        const checkIn = new Date(checkInDate);
        return checkIn.getMonth() === today.getMonth() && 
               checkIn.getFullYear() === today.getFullYear();
      })
      .reduce((sum, booking) => {
        const amount = booking.paymentDetails?.totalAmount || booking.totalAmount || 0;
        return sum + amount;
      }, 0);

    // Upcoming check-ins (next 3 days)
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const upcomingCheckIns = allBookings.filter(booking => {
      const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
      if (!checkInDate) return false;
      const checkIn = new Date(checkInDate);
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

    // Get all bookings from both collections
    const receptionBookings = await ReceptionBooking.find({
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

    // Mark bookings with their type
    const allBookings = [
      ...receptionBookings.map(booking => ({ ...booking, bookingType: 'reception' })),
      ...onlineBookings.map(booking => ({ ...booking, bookingType: 'online' }))
    ];

    res.json(allBookings);
  } catch (error) {
    console.error('Error fetching bookings for date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
