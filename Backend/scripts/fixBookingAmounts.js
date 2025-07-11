import mongoose from 'mongoose';
import PoolBooking from '../models/PoolBooking.js';

async function fixBookingAmounts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotelBookingSystem');
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
    
    console.log(`Found ${problematicBookings.length} bookings with missing/invalid total amounts`);
    
    let fixedCount = 0;
    
    for (const booking of problematicBookings) {
      try {
        // Calculate correct total amount
        const peopleCount = Math.max(booking.peopleCount || 1, 1);
        const baseRate = 500;
        const additionalRate = 200;
        const baseHours = 2;
        
        let totalAmount = baseRate;
        
        // Calculate duration if checkIn and checkOut exist
        if (booking.checkIn && booking.checkOut) {
          const durationHours = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60);
          const additionalHours = Math.ceil(Math.max(durationHours - baseHours, 0));
          
          if (additionalHours > 0) {
            totalAmount += additionalHours * additionalRate;
          }
        }
        
        // Multiply by people count
        totalAmount = totalAmount * peopleCount;
        
        // Update the booking
        await PoolBooking.findByIdAndUpdate(booking._id, {
          totalAmount: totalAmount,
          peopleCount: peopleCount // ensure peopleCount is also set correctly
        });
        
        console.log(`Fixed booking ${booking._id}: ${peopleCount} people × Rs.${totalAmount/peopleCount} = Rs.${totalAmount}`);
        fixedCount++;
        
      } catch (error) {
        console.error(`Error fixing booking ${booking._id}:`, error.message);
      }
    }
    
    console.log(`\nFixed ${fixedCount} bookings successfully`);
    
    // Verify the fixes
    const stillProblematic = await PoolBooking.find({
      $or: [
        { totalAmount: { $exists: false } },
        { totalAmount: null },
        { totalAmount: 0 },
        { totalAmount: { $lte: 0 } }
      ]
    });
    
    console.log(`Remaining problematic bookings: ${stillProblematic.length}`);
    
    // Show some corrected bookings
    const correctedBookings = await PoolBooking.find({
      totalAmount: { $gt: 0 }
    }).limit(5);
    
    console.log('\nSample corrected bookings:');
    correctedBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ID: ${booking._id}, peopleCount: ${booking.peopleCount}, totalAmount: Rs.${booking.totalAmount}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDatabase fix completed successfully');
    
  } catch (error) {
    console.error('Error fixing booking amounts:', error);
    process.exit(1);
  }
}

fixBookingAmounts();
