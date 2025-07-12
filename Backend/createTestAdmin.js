import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createTestAdmin() {
  await mongoose.connect(MONGODB_URI);

  const username = "testadmin";
  const email = "testadmin@example.com";
  const password = "TestAdmin123";
  const role = "admin";

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Test admin already exists:", existing);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, role });
  await newUser.save();
  console.log("Test admin created:", { username, email, password, role });
  await mongoose.disconnect();
}

createTestAdmin().catch(err => {
  console.error("Error creating test admin:", err);
  mongoose.disconnect();
}); 