import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user — do NOT hash here; the User model pre('save') hook hashes automatically
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Successful response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: newUser._id }, // Optional
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration error",
      error: error.message, // Optional
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Prevent inactive users (receptionist and user roles) from logging in
    if ((user.role === "user" || user.role === "receptionist") && user.status !== "active") {
      return res.status(401).json({ message: "Account disabled. Please contact support" });
    }

    //Backend validates and returns token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, userId: user._id, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
});

// verify token and get user details
router.get("/verify", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
