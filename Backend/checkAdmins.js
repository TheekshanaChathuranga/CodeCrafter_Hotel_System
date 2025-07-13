import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hoteldb";

async function checkAdmins() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const admins = await User.find({ role: "admin" }).select(
      "username email role _id"
    );
    console.log("\n=== Admin Users ===");
    console.log(JSON.stringify(admins, null, 2));

    if (admins.length === 0) {
      console.log("\nNo admin users found!");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAdmins();
