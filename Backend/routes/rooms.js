import express from "express";
import Room from "../models/Room.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({
      success: true,
      results: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms"
    });
  }
});

// Create room (Admin only)
router.post("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    const newRoom = await Room.create(req.body);
    res.status(201).json({
      success: true,
      data: newRoom
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;