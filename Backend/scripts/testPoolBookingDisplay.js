import mongoose from "mongoose";
import PoolBooking from "../models/PoolBooking.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hoteldb";

async function testPoolBookingDisplay() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the first pool booking
    const firstBooking = await PoolBooking.findOne().sort({ createdAt: -1 });

    if (!firstBooking) {
      console.log("No pool bookings found in database");
      return;
    }

    console.log("Found booking:", {
      id: firstBooking._id,
      fullName: firstBooking.fullName,
      date: firstBooking.date,
      userId: firstBooking.userId,
      user: firstBooking.user,
      customerId: firstBooking.customerId,
    });

    // Update this booking with a test user ID
    const testUserId = "675c8d1e2b3a4f5e6d7c8a9b"; // Example ObjectId format

    await PoolBooking.findByIdAndUpdate(firstBooking._id, {
      userId: testUserId,
      user: testUserId,
      customerId: testUserId,
    });

    console.log(
      `Updated booking ${firstBooking._id} with test user ID: ${testUserId}`
    );
    console.log(
      `You can now test the frontend by using this user ID in your token`
    );
    console.log(
      `API endpoint to test: http://localhost:5000/api/pool-booking/user/${testUserId}`
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testPoolBookingDisplay();
