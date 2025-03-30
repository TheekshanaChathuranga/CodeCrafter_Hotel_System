import express from "express";
import Room from "../models/Room.js";


const router = express.Router();

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error });
  }
});

export default router;
