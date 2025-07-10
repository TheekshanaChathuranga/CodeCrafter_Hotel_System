// routes/userRoutes.js
import express from 'express';
import User from "../models/User.js";

const router = express.Router();

// GET all users with optimized pagination
router.get("/", async (req, res) => {
  try {
    // Get query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search || "";
    const role = req.query.role;

    const query = {
      $and: [
        {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        },
        role ? { role } : {} // filter by role if provided
      ]
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }) // newest users first
        .select("-password"), // exclude password from result
      User.countDocuments(query)
    ]);

    res.status(200).json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

// GET single user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE user
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE user
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;