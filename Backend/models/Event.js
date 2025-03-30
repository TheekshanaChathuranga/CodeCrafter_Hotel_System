import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone1: { type: String, required: true },
  phone2: { type: String },
  eventType: { type: String, required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  email: { type: String },
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

export default Event;