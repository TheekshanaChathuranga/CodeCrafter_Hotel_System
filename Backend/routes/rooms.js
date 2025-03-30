import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms", error });
  }
});

// Add a new room
router.post("/", async (req, res) => {
  try {
    const { name, price, image, description } = req.body;
    if (!name || !price || !image || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRoom = new Room({ name, price, image, description });
    await newRoom.save();
    res.status(201).json({ message: "Room added successfully!", room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "Failed to add room", error });
  }
});

export default router;
