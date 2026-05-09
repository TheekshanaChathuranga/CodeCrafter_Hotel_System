import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const testUsers = [
  {
    username: "admin",
    email: "admin@hotel.com",
    password: "Admin@123456",
    role: "admin",
    fullName: "Admin User",
    status: "active",
  },
  {
    username: "receptionist",
    email: "reception@hotel.com",
    password: "Reception@123",
    role: "receptionist",
    fullName: "Reception Staff",
    status: "active",
  },
  {
    username: "customer",
    email: "customer@hotel.com",
    password: "Customer@123",
    role: "user",
    fullName: "John Customer",
    status: "active",
  },
  {
    username: "johndoe",
    email: "john.doe@email.com",
    password: "TestUser@123",
    role: "user",
    fullName: "John Doe",
    status: "active",
  },
  {
    username: "janesmith",
    email: "jane.smith@email.com",
    password: "TestUser@123",
    role: "user",
    fullName: "Jane Smith",
    status: "active",
  },
];

async function createTestUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const userData of testUsers) {
      // Check if user already exists
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`✓ ${userData.email} already exists`);
        continue;
      }

      // Don't hash here — the User model pre('save') hook hashes automatically
      const newUser = new User(userData);
      await newUser.save();
      console.log(
        `✓ Created ${userData.role}: ${userData.email} / ${userData.password}`
      );
    }

    console.log("\n✅ Test users created successfully!");
    console.log("\n📋 Demo Credentials:");
    console.log("─".repeat(50));
    testUsers.forEach((user) => {
      console.log(`${user.role.toUpperCase()}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUsers();
