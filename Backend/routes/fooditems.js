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

// Update a food item by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updatedItem = await FoodItem.findByIdAndUpdate(id, update, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update food item', error: error.message });
  }
});

// Create a new food item
router.post('/', async (req, res) => {
  try {
    const { name, unitType, unitPrice, category } = req.body;
    const newItem = new FoodItem({ name, unitType, unitPrice, category });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create food item', error: error.message });
  }
});

// Delete a food item by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await FoodItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete food item', error: error.message });
  }
});

export default router; 