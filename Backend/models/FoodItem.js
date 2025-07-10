import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unitType: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  category: { type: String, required: false },
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

export default FoodItem; 