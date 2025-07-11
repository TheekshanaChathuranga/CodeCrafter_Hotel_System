import mongoose from 'mongoose';
import PoolBooking from '../models/PoolBooking.js';

async function checkBookings() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotelBookingSystem', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Find bookings with missing or zero totalAmount
    const problematicBookings = await PoolBooking.find({
      $or: [
        { totalAmount: { $exists: false } },
        { totalAmount: null },
        { totalAmount: 0 },
        { totalAmount: { $lte: 0 } }
      ]
    });
    
    console.log('Problematic bookings found:', problematicBookings.length);
    
    if (problematicBookings.length > 0) {
      console.log('Sample problematic booking:');
      console.log(JSON.stringify(problematicBookings[0], null, 2));
      
      // Show all problematic booking IDs
      console.log('\nAll problematic booking IDs:');
      problematicBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ID: ${booking._id}, peopleCount: ${booking.peopleCount}, totalAmount: ${booking.totalAmount}`);
      });
    }
    
    // Also check all bookings count
    const allBookings = await PoolBooking.find({});
    console.log('\nTotal bookings in database:', allBookings.length);
    
    // Show some valid bookings for comparison
    const validBookings = await PoolBooking.find({
      totalAmount: { $gt: 0 }
    }).limit(3);
    
    console.log('\nSample valid bookings:');
    validBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ID: ${booking._id}, peopleCount: ${booking.peopleCount}, totalAmount: ${booking.totalAmount}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDatabase check completed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkBookings();
