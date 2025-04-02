import express from 'express';
import Room from '../models/Room.js'; // Note the .js extension

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add other routes as needed...
export default router;