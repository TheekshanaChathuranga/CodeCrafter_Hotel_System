import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['Single', 'Double', 'Triple'] },
  acOption: { type: String, required: true, enum: ['AC', 'Non-AC', 'Both'] },
  hasAC: { type: Boolean, required: true },
  pricePerNight: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  roomStatus: { type: String, required: true, enum: ['Available', 'Not Available'] },
  description: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);
export default Room;