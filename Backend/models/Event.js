import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone1: { type: String, required: true },
  phone2: { type: String },
  noOfGuests: {type: Number,required: true},
  eventType: { type: String, required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  email: { type: String },
  tableData: [
    {
      no: Number,
      description: String,
      unit: String,
      quantity: Number,
      rate: Number,
      amount: Number,
    },
  ],
  extraFields: [
    {
      no: String,
      description: String,
      unit: String,
      quantity: Number,
      rate: Number,
      amount: Number,
    },
  ],
  totalAmount: Number,
  serviceCharge: Number,
  grandTotal: Number,
  finalTotal: Number,
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

export default Event;