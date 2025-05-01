import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

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
  status: { 
    type: String, 
    default: 'confirmed', 
    enum: ['confirmed', 'cancelled', 'checked-in', 'checked-out', 'no-show'] 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Room Schema
const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: { type: String, required: true },
  acType: { type: String, required: true },
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
  amenities: [String],
  status: { 
    type: String, 
    default: 'available',
    enum: ['available', 'occupied', 'maintenance'] 
  }
});

const Room = mongoose.model('Room', roomSchema);

// User Schema for authentication
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'staff', enum: ['admin', 'staff'] }
});

const User = mongoose.model('User', userSchema);

// Pool Booking Schema
const poolBookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  mobile: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' }
});

const PoolBooking = mongoose.model('PoolBooking', poolBookingSchema);

// ========== API ROUTES ========== //

// ----- Booking Routes ----- //
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking({
      guestDetails: {
        name: req.body.guestDetails.name,
        mobile: req.body.guestDetails.mobile,
        email: req.body.guestDetails.email,
        whatsapp: req.body.guestDetails.whatsapp
      },
      bookingDetails: {
        checkIn: req.body.bookingDetails.checkIn,
        checkOut: req.body.bookingDetails.checkOut,
        roomNumber: req.body.bookingDetails.roomNumber,
        roomType: req.body.bookingDetails.roomType,
        acType: req.body.bookingDetails.acType,
        packageType: req.body.bookingDetails.packageType
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

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----- Room Routes ----- //
app.post('/api/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rooms/available', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    const bookedRooms = await Booking.find({
      status: { $nin: ['cancelled', 'checked-out'] },
      $or: [
        { 
          'bookingDetails.checkIn': { $lt: new Date(checkOut) },
          'bookingDetails.checkOut': { $gt: new Date(checkIn) }
        }
      ]
    }).distinct('bookingDetails.roomNumber');

    const allRooms = await Room.find({ status: 'available' });
    const availableRooms = allRooms.filter(room => !bookedRooms.includes(room.roomNumber));
    
    res.json(availableRooms);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----- Auth Routes ----- //
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      message: 'Login successful',
      user: { username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----- Pool Routes ----- //
app.post('/api/pool/bookings', async (req, res) => {
  try {
    const booking = new PoolBooking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/pool/bookings', async (req, res) => {
  try {
    const bookings = await PoolBooking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});