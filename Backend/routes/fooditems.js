import express from "express";
import FoodItem from "../models/FoodItem.js";

const router = express.Router();

// Get all food items
router.get("/", async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch food items", error: error.message });
  }
});

export default router; 