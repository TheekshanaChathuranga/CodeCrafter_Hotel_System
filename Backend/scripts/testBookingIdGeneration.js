import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hoteldb";

async function testBookingIdGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Test generating booking IDs
    console.log("\n=== Testing Booking ID Generation ===");

    for (let i = 1; i <= 5; i++) {
      const bookingId = await Booking.generateNextBookingId();
      console.log(`Generated Booking ID ${i}: ${bookingId}`);
    }

    // Check existing bookings to see the pattern
    console.log("\n=== Checking Existing Bookings ===");
    const existingBookings = await Booking.find(
      { bookingId: { $regex: /^#RO\d{4}$/ } },
      { bookingId: 1, roomNumber: 1, fullName: 1 }
    )
      .sort({ bookingId: 1 })
      .limit(10);

    if (existingBookings.length > 0) {
      console.log("Existing bookings with custom IDs:");
      existingBookings.forEach((booking) => {
        console.log(
          `- ${booking.bookingId}: Room ${booking.roomNumber} (${booking.fullName})`
        );
      });
    } else {
      console.log("No existing bookings with custom booking IDs found.");
    }

    // Find the latest booking ID
    const latestBooking = await Booking.findOne(
      { bookingId: { $regex: /^#RO\d{4}$/ } },
      { bookingId: 1 }
    ).sort({ bookingId: -1 });

    if (latestBooking) {
      console.log(`\nLatest booking ID: ${latestBooking.bookingId}`);
    } else {
      console.log(
        "\nNo bookings with custom IDs found. Next ID will be #RO0001"
      );
    }
  } catch (error) {
    console.error("Error testing booking ID generation:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the test
testBookingIdGeneration();
