import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

async function resetTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const emails = [
      "admin@hotel.com",
      "reception@hotel.com",
      "customer@hotel.com",
      "john.doe@email.com",
      "jane.smith@email.com",
    ];

    // Delete existing test users
    const result = await User.deleteMany({ email: { $in: emails } });
    console.log(`Deleted ${result.deletedCount} existing test users`);

    console.log("\nNow run: node createTestUsers.js");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

resetTestUsers();
