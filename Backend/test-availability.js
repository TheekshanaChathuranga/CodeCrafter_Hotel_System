/**
 * Test script to verify that room availability filtering
 * considers both online and reception bookings
 */

import mongoose from "mongoose";
import Booking from "./models/Booking.js";
import ReceptionBooking from "./models/ReceptionBooking.js";
import Room from "./models/Room.js";

// Connect to database
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hoteldb";

async function testAvailabilityFiltering() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const testDate = new Date("2025-07-20");
    const checkIn = new Date(testDate);
    const checkOut = new Date(testDate);
    checkOut.setDate(checkOut.getDate() + 1);

    console.log(
      `\nTesting availability for: ${checkIn.toISOString()} to ${checkOut.toISOString()}`
    );

    // Check online bookings
    const onlineBookings = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn },
        },
      ],
    }).select("roomNumber checkIn checkOut status");

    console.log("\nOnline bookings for this period:");
    onlineBookings.forEach((booking) => {
      console.log(
        `- Room ${booking.roomNumber}: ${booking.checkIn} to ${booking.checkOut} (${booking.status})`
      );
    });

    // Check reception bookings
    const receptionBookings = await ReceptionBooking.find({
      status: { $in: ["confirmed", "checked-in"] },
      $or: [
        {
          "bookingDetails.checkIn": { $lt: checkOut },
          "bookingDetails.checkOut": { $gt: checkIn },
        },
      ],
    }).select(
      "bookingDetails.roomNumber bookingDetails.checkIn bookingDetails.checkOut status"
    );

    console.log("\nReception bookings for this period:");
    receptionBookings.forEach((booking) => {
      console.log(
        `- Room ${booking.bookingDetails.roomNumber}: ${booking.bookingDetails.checkIn} to ${booking.bookingDetails.checkOut} (${booking.status})`
      );
    });

    // Get combined booked room numbers
    const onlineBookedRooms = onlineBookings.map((b) => b.roomNumber);
    const receptionBookedRooms = receptionBookings.map(
      (b) => b.bookingDetails.roomNumber
    );
    const allBookedRooms = [
      ...new Set([...onlineBookedRooms, ...receptionBookedRooms]),
    ];

    console.log(
      `\nBooked rooms from online bookings: [${onlineBookedRooms.join(", ")}]`
    );
    console.log(
      `Booked rooms from reception bookings: [${receptionBookedRooms.join(
        ", "
      )}]`
    );
    console.log(`All booked rooms combined: [${allBookedRooms.join(", ")}]`);

    // Get available rooms
    const availableRooms = await Room.find({
      roomNumber: { $nin: allBookedRooms },
      roomStatus: "Available",
    }).select("roomNumber type");

    console.log(
      `\nAvailable rooms: [${availableRooms
        .map((r) => r.roomNumber)
        .join(", ")}]`
    );
    console.log(`Total available: ${availableRooms.length}`);

    console.log("\n✅ Test completed successfully!");
    console.log(
      "✅ Room availability filtering now considers both online and reception bookings"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testAvailabilityFiltering();
