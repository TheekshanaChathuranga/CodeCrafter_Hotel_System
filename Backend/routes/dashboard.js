import express from 'express';
import ReceptionBooking from '../models/ReceptionBooking.js';
import OnlineBooking from '../models/Booking.js';
import PoolBooking from '../models/PoolBooking.js';
import Pool from '../models/Pool.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import FoodItem from '../models/FoodItem.js';

const router = express.Router();

// Get comprehensive dashboard statistics including pools
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all room bookings from both collections
    const receptionBookings = await ReceptionBooking.find().lean();
    const onlineBookings = await OnlineBooking.find().lean();
    
    // Get pool bookings
    const poolBookings = await PoolBooking.find().populate('poolId', 'name').lean();
    
    // Combine all room bookings with a unified structure
    const allRoomBookings = [
      ...receptionBookings.map(booking => ({ ...booking, bookingType: 'reception' })),
      ...onlineBookings.map(booking => ({ ...booking, bookingType: 'online' }))
    ];
    
    // Today's room check-ins
    const todaysRoomCheckIns = allRoomBookings.filter(booking => {
      const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
      if (!checkInDate) return false;
      const checkIn = new Date(checkInDate);
      return checkIn >= today && checkIn <= todayEnd;
    });

    // Today's room check-outs
    const todaysRoomCheckOuts = allRoomBookings.filter(booking => {
      const checkOutDate = booking.bookingDetails?.checkOut || booking.checkOut;
      if (!checkOutDate) return false;
      const checkOut = new Date(checkOutDate);
      return checkOut >= today && checkOut <= todayEnd;
    });

    // Currently occupied rooms
    const currentlyOccupiedRooms = allRoomBookings.filter(booking => {
      const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
      const checkOutDate = booking.bookingDetails?.checkOut || booking.checkOut;
      if (!checkInDate || !checkOutDate) return false;
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      return checkIn <= today && checkOut > today && (booking.status === 'checked-in' || booking.status === 'confirmed');
    });

    // Today's pool bookings
    const todaysPoolBookings = poolBookings.filter(booking => {
      const bookingDate = booking.date || booking.checkIn;
      if (!bookingDate) return false;
      const date = new Date(bookingDate);
      return date >= today && date <= todayEnd;
    });

    // Pending bookings
    const pendingRoomBookings = allRoomBookings.filter(booking => booking.status === 'pending');
    const pendingPoolBookings = poolBookings.filter(booking => booking.status === 'pending');

    // Resource counts
    const [totalRooms, availableRooms, totalPools, availablePools, totalUsers, totalEvents, totalMenuItems] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ roomStatus: 'Available' }),
      Pool.countDocuments(),
      Pool.countDocuments({ poolStatus: 'Available' }),
      User.countDocuments(), // Get total registered users
      Event.countDocuments(), // Get total events
      FoodItem.countDocuments() // Get total menu items
    ]);

    // Room availability by type
    const roomTypes = ['Single Room', 'Double Room', 'Triple Room'];
    const totalRoomsByType = { 'Single Room': 1, 'Double Room': 5, 'Triple Room': 3 };
    
    const occupiedByType = {};
    roomTypes.forEach(type => {
      occupiedByType[type] = allRoomBookings.filter(booking => {
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

    const availableRoomsByType = roomTypes.map(type => ({
      type,
      available: totalRoomsByType[type] - (occupiedByType[type] || 0),
      total: totalRoomsByType[type],
      occupied: occupiedByType[type] || 0
    }));

    // Revenue calculations
    const todaysRevenue = allRoomBookings
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

    const monthlyRevenue = allRoomBookings
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
    
    const upcomingCheckIns = allRoomBookings.filter(booking => {
      const checkInDate = booking.bookingDetails?.checkIn || booking.checkIn;
      if (!checkInDate) return false;
      const checkIn = new Date(checkInDate);
      return checkIn > todayEnd && checkIn <= threeDaysFromNow;
    }).length;

    res.json({
      rooms: {
        todaysCheckIns: todaysRoomCheckIns.length,
        todaysCheckOuts: todaysRoomCheckOuts.length,
        currentlyOccupied: currentlyOccupiedRooms.length,
        totalAvailable: availableRoomsByType.reduce((sum, room) => sum + room.available, 0),
        availableByType: availableRoomsByType,
        upcomingCheckIns,
        totalBookings: allRoomBookings.length,
        totalRooms: Object.values(totalRoomsByType).reduce((sum, count) => sum + count, 0),
        pendingBookings: pendingRoomBookings.length,
        receptionBookings: receptionBookings.length,
        onlineBookings: onlineBookings.length
      },
      pools: {
        todaysBookings: todaysPoolBookings.length,
        pendingBookings: pendingPoolBookings.length,
        totalBookings: poolBookings.length,
        totalPools,
        availablePools
      },
      revenue: {
        today: todaysRevenue,
        monthly: monthlyRevenue
      },
      overview: {
        totalBookingsToday: todaysRoomCheckIns.length + todaysPoolBookings.length,
        totalPendingBookings: pendingRoomBookings.length + pendingPoolBookings.length,
        totalActivity: todaysRoomCheckIns.length + todaysRoomCheckOuts.length + todaysPoolBookings.length,
        totalUsers,
        totalEvents,
        totalMenuItems
      },
      recentActivity: {
        todayRoomCheckIns: todaysRoomCheckIns.slice(0, 5),
        todayRoomCheckOuts: todaysRoomCheckOuts.slice(0, 5),
        todayPoolBookings: todaysPoolBookings.slice(0, 5),
        pendingRoomBookings: pendingRoomBookings.slice(0, 5),
        pendingPoolBookings: pendingPoolBookings.slice(0, 5)
      }
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

// Get combined bookings for a specific date (rooms and pools)
router.get('/bookings-combined/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get room bookings for the date
    const receptionRoomBookings = await ReceptionBooking.find({
      $or: [
        {
          'bookingDetails.checkIn': { $gte: targetDate, $lt: nextDay }
        },
        {
          'bookingDetails.checkOut': { $gte: targetDate, $lt: nextDay }
        },
        {
          'bookingDetails.checkIn': { $lte: targetDate },
          'bookingDetails.checkOut': { $gte: nextDay }
        }
      ]
    }).sort({ 'bookingDetails.checkIn': 1 }).lean();

    const onlineRoomBookings = await OnlineBooking.find({
      $or: [
        { checkIn: { $gte: targetDate, $lt: nextDay } },
        { checkOut: { $gte: targetDate, $lt: nextDay } },
        { checkIn: { $lte: targetDate }, checkOut: { $gte: nextDay } }
      ]
    }).sort({ checkIn: 1 }).lean();

    // Get pool bookings for the date
    const poolBookings = await PoolBooking.find({
      date: { $gte: targetDate, $lt: nextDay }
    }).populate('poolId', 'name').sort({ checkInTime: 1 }).lean();

    // Format the data for consistent frontend consumption
    const formattedBookings = {
      rooms: {
        reception: receptionRoomBookings.map(booking => ({
          ...booking,
          bookingType: 'reception',
          id: booking._id,
          guestName: booking.guestDetails?.name || 'Unknown',
          roomNumber: booking.bookingDetails?.roomNumber || 'N/A',
          checkIn: booking.bookingDetails?.checkIn,
          checkOut: booking.bookingDetails?.checkOut,
          status: booking.status || 'confirmed'
        })),
        online: onlineRoomBookings.map(booking => ({
          ...booking,
          bookingType: 'online',
          id: booking._id,
          guestName: booking.fullName || 'Unknown',
          roomNumber: booking.roomNumber || 'N/A',
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          status: booking.status || 'pending'
        }))
      },
      pools: poolBookings.map(booking => ({
        ...booking,
        bookingType: 'pool',
        id: booking._id,
        guestName: booking.fullName || booking.name || 'Unknown',
        poolName: booking.poolId?.name || 'Unknown Pool',
        date: booking.date,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestCount: booking.guestCount || booking.peopleCount || 1,
        status: booking.status || 'pending'
      }))
    };

    const summary = {
      date: targetDate.toISOString(),
      totalBookings: receptionRoomBookings.length + onlineRoomBookings.length + poolBookings.length,
      roomBookings: {
        reception: receptionRoomBookings.length,
        online: onlineRoomBookings.length,
        total: receptionRoomBookings.length + onlineRoomBookings.length
      },
      poolBookings: poolBookings.length
    };

    res.json({
      success: true,
      bookings: formattedBookings,
      summary
    });

  } catch (error) {
    console.error('Error fetching combined bookings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;
