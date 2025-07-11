import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PoolBooking from '../models/PoolBooking.js';

// Initialize environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixOnlineBookingAmounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find bookings with totalAmount of 0 or null
    const brokenBookings = await PoolBooking.find({
      $or: [
        { totalAmount: 0 },
        { totalAmount: null },
        { totalAmount: { $exists: false } }
      ]
    });

    console.log(`Found ${brokenBookings.length} bookings with missing or zero total amounts`);

    for (const booking of brokenBookings) {
      // Calculate the total amount based on peopleCount and duration
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const durationHours = (checkOutDate - checkInDate) / (1000 * 60 * 60);
      
      const baseRate = 500;
      const additionalRate = 200;
      const baseHours = 2;
      let totalAmount = baseRate;
      const additionalHours = Math.ceil(durationHours - baseHours);

      if (additionalHours > 0) {
        totalAmount += additionalHours * additionalRate;
      }
      totalAmount *= booking.peopleCount;

      // Update the booking
      await PoolBooking.findByIdAndUpdate(booking._id, {
        totalAmount: totalAmount
      });

      console.log(`Updated booking ${booking._id}: ${booking.peopleCount} people, ${durationHours.toFixed(1)} hours, total: Rs.${totalAmount}`);
    }

    console.log('Finished fixing booking amounts');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing booking amounts:', error);
    process.exit(1);
  }
}

fixOnlineBookingAmounts();
