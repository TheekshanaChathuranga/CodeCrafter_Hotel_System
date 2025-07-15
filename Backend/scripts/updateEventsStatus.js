import mongoose from "mongoose";
import Event from "../models/Event.js";
import dotenv from "dotenv";

dotenv.config();

async function updateExistingEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-system"
    );
    console.log("Connected to MongoDB");

    // Find all events without status field or with null status
    const eventsWithoutStatus = await Event.find({
      $or: [{ status: { $exists: false } }, { status: null }, { status: "" }],
    });

    console.log(
      `Found ${eventsWithoutStatus.length} events without status field`
    );

    if (eventsWithoutStatus.length > 0) {
      // Update all events without status to have 'pending' status
      const result = await Event.updateMany(
        {
          $or: [
            { status: { $exists: false } },
            { status: null },
            { status: "" },
          ],
        },
        {
          $set: { status: "pending" },
        }
      );

      console.log(
        `Updated ${result.modifiedCount} events to have 'pending' status`
      );
    }

    // Check all events now
    const allEvents = await Event.find({});
    console.log(`Total events: ${allEvents.length}`);
    console.log("Events by status:");
    const statusCounts = {};
    allEvents.forEach((event) => {
      const status = event.status || "no-status";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    console.log(statusCounts);

    // Show pending events
    const pendingEvents = await Event.find({ status: "pending" });
    console.log(`Pending events: ${pendingEvents.length}`);
    pendingEvents.forEach((event) => {
      console.log(
        `- ${event.eventId || event._id}: ${event.name || "No name"} (${
          event.eventType || "No type"
        })`
      );
    });
  } catch (error) {
    console.error("Error updating events:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

updateExistingEvents();
