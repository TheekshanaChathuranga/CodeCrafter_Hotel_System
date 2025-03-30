import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  acType: { type: String, enum: ["AC", "Non-AC"], required: true },
});

export default mongoose.model("Room", roomSchema);
