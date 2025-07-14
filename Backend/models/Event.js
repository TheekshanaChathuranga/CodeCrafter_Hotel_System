import mongoose from 'mongoose';

const tableDataSchema = new mongoose.Schema({
  category: String,
  description: String,
  unit: String,
  quantity: Number,
  rate: Number,
  amount: Number
}, { _id: false });

const extraFieldSchema = new mongoose.Schema({
  description: String,
  unit: String,
  quantity: Number,
  rate: Number,
  amount: Number
}, { _id: false });

const eventSchema = new mongoose.Schema({
  name: String,
  phone1: String,
  phone2: String,
  noOfGuests: Number,
  eventType: String,
  checkIn: Date,
  checkOut: Date,
  email: String,
  notes: String,
  tableData: [tableDataSchema],
  extraFields: [extraFieldSchema],
  totalAmount: Number,
  serviceCharge: Number,
  grandTotal: Number,
  extraAmount: Number,
  hall: String,
  excelFile: { type: mongoose.Schema.Types.Mixed, default: null },
  // Auto-generated human-readable event reference like "#E0001"
  eventId: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema); 