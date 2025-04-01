import express from "express";
import Room from "../models/Room.js";
<<<<<<< Updated upstream
import { protect, restrictTo } from "../middleware/auth.js";
=======
>>>>>>> Stashed changes

const router = express.Router();

// Get all rooms
router.get("/", async (req, res) => {
  try {
//<<<<<<< Updated upstream
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
=======
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching rooms",
      error: error.message 
>>>>>>> Stashed changes
    });
  }
});

export default router;