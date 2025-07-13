import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unitType: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  category: { type: String, required: false },
  image: { type: String, required: false }, // stores filename or URL
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

export default FoodItem; 