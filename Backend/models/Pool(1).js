// Backend/models/Pool.js
import mongoose from "mongoose";

const poolSchema = new mongoose.Schema({
  name: String,
  description: String,
  capacity: Number,
  poolStatus: String,
  openingTime: String,
  closingTime: String,
  images: [String],
}, { timestamps: true });

export default mongoose.model("Pool", poolSchema);
