import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//import User from "../models/User.js";
import User from "./models/User.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
      res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error signing up", error });
    }
  });
  

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user._id });
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    res.status(500).json({ message: "Error logging in", error });
  }
});

export default router;
