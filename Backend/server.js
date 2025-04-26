import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Booking Schema
const bookingSchema = new mongoose.Schema({
  guestDetails: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: String,
    whatsapp: String
  },
  bookingDetails: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    roomNumber: { type: String, required: true },
    roomType: { type: String, required: true },
    acType: { type: String, required: true },
    packageType: { type: String, required: true }
  },
  paymentDetails: {
    paymentType: { type: String, required: true },
    advanceAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  status: { type: String, default: 'confirmed', enum: ['confirmed', 'cancelled', 'checked-in', 'checked-out', 'no-show'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// API Routes

// Create new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking({
      guestDetails: {
        name: req.body.adminDetails.name,
        mobile: req.body.adminDetails.mobile,
        email: req.body.adminDetails.email,
        whatsapp: req.body.adminDetails.whatsapp
      },
      bookingDetails: {
        checkIn: req.body.adminDetails.checkIn,
        checkOut: req.body.adminDetails.checkOut,
        roomNumber: req.body.selectedRoom.roomNumber,
        roomType: req.body.selectedRoomType,
        acType: req.body.selectedRoom.acType,
        packageType: req.body.packageType
      },
      paymentDetails: {
        paymentType: req.body.paymentDetails.paymentType,
        advanceAmount: req.body.paymentDetails.advanceAmount,
        remainingAmount: req.body.paymentDetails.remainingAmount,
        totalAmount: req.body.paymentDetails.totalAmount
      }
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single booking
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available rooms
app.get('/api/rooms/available', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    // Find rooms that are booked during the requested period and not cancelled or checked-out
    const bookedRooms = await Booking.find({
      status: { $nin: ['cancelled', 'checked-out'] },
      $or: [
        { 
          'bookingDetails.checkIn': { $lt: new Date(checkOut) },
          'bookingDetails.checkOut': { $gt: new Date(checkIn) }
        }
      ]
    }).distinct('bookingDetails.roomNumber');

    // All rooms in the hotel
    const allRooms = [
      { id: '102', type: 'Single Room', acType: 'Non-AC' },
      { id: '101', type: 'Double Room', acType: 'AC' },
      { id: '103', type: 'Double Room', acType: 'AC' },
      { id: '104', type: 'Double Room', acType: 'AC' },
      { id: '105', type: 'Double Room', acType: 'AC' },
      { id: '106', type: 'Double Room', acType: 'AC' },
      { id: '107', type: 'Triple Room', acType: 'AC' },
      { id: '108', type: 'Triple Room', acType: 'AC' },
      { id: '109', type: 'Triple Room', acType: 'AC' }
    ];

    // Filter available rooms
    const availableRooms = allRooms.filter(room => !bookedRooms.includes(room.id));
    
    res.json(availableRooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});