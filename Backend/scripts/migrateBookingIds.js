import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hoteldb";

async function migrateExistingBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all bookings that don't have a custom bookingId
    const bookingsToMigrate = await Booking.find({
      $or: [
        { bookingId: { $exists: false } },
        { bookingId: { $not: { $regex: /^#RO\d{4}$/ } } },
      ],
    }).sort({ createdAt: 1 });

    console.log(`Found ${bookingsToMigrate.length} bookings to migrate`);

    if (bookingsToMigrate.length === 0) {
      console.log(
        "No bookings need migration. All bookings already have custom booking IDs."
      );
      return;
    }

    let nextNumber = 1;

    // Check if there are any existing bookings with custom IDs
    const latestCustomBooking = await Booking.findOne(
      { bookingId: { $regex: /^#RO\d{4}$/ } },
      {},
      { sort: { bookingId: -1 } }
    );

    if (latestCustomBooking && latestCustomBooking.bookingId) {
      const currentNumber = parseInt(latestCustomBooking.bookingId.slice(-4));
      nextNumber = currentNumber + 1;
      console.log(
        `Starting migration from booking ID #RO${nextNumber
          .toString()
          .padStart(4, "0")}`
      );
    } else {
      console.log("Starting migration from booking ID #RO0001");
    }

    // Migrate each booking
    for (const booking of bookingsToMigrate) {
      const newBookingId = `#RO${nextNumber.toString().padStart(4, "0")}`;

      await Booking.findByIdAndUpdate(booking._id, {
        bookingId: newBookingId,
      });

      console.log(
        `Migrated booking ${booking._id} -> ${newBookingId} (Room ${booking.roomNumber}, ${booking.fullName})`
      );
      nextNumber++;
    }

    console.log(
      `\nMigration completed! ${bookingsToMigrate.length} bookings migrated.`
    );

    // Show summary of all bookings with custom IDs
    const allCustomBookings = await Booking.find(
      { bookingId: { $regex: /^#RO\d{4}$/ } },
      { bookingId: 1, roomNumber: 1, fullName: 1, createdAt: 1 }
    ).sort({ bookingId: 1 });

    console.log(
      `\nTotal bookings with custom IDs: ${allCustomBookings.length}`
    );
    console.log("Sample of migrated bookings:");
    allCustomBookings.slice(0, 10).forEach((booking) => {
      console.log(
        `- ${booking.bookingId}: Room ${booking.roomNumber} (${
          booking.fullName
        }) - ${booking.createdAt.toLocaleDateString()}`
      );
    });
  } catch (error) {
    console.error("Error migrating bookings:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the migration
migrateExistingBookings();
