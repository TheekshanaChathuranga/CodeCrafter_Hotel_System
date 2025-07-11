import express from 'express';
import mongoose from 'mongoose';
import PoolBooking from '../models/PoolBooking.js';

// Test the booking creation and calculation
async function testBookingCalculation() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotelBookingSystem');
    console.log('Connected to MongoDB for testing');

    // Test data for a booking
    const testBookingData = {
      name: 'Test User',
      phone: '1234567890',
      peopleCount: 3,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
      paymentType: 'notPaid'
    };

    console.log('Creating test booking with data:', testBookingData);

    // Create a test booking
    const booking = new PoolBooking(testBookingData);
    const savedBooking = await booking.save();

    console.log('Saved booking:', {
      id: savedBooking._id,
      peopleCount: savedBooking.peopleCount,
      totalAmount: savedBooking.totalAmount,
      checkIn: savedBooking.checkIn,
      checkOut: savedBooking.checkOut
    });

    // Verify calculation
    const expectedAmount = 500 * 3; // 3 people × Rs.500
    console.log(`Expected amount: Rs.${expectedAmount}`);
    console.log(`Actual amount: Rs.${savedBooking.totalAmount}`);
    console.log(`Calculation correct: ${savedBooking.totalAmount === expectedAmount}`);

    // Clean up test data
    await PoolBooking.findByIdAndDelete(savedBooking._id);
    console.log('Test booking deleted');

    await mongoose.disconnect();
    console.log('Test completed successfully');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testBookingCalculation();
