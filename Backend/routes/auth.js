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
        message: "User already exists" 
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Successful response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: newUser._id } // Optional
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration error",
      error: error.message // Optional
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
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    //Backend validates and returns token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
});

// verify token and get user details
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Mock authentication
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password") {
    return res.json({ token: "admin-token", role: "admin" });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

router.post("/signup", (req, res) => {
  // Handle user registration
  res.json({ message: "User registered successfully" });
});

export default router;
