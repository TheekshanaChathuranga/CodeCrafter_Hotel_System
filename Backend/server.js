require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Atlas connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Booking Schema
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, default: '' },
  email: { type: String, default: '' },
  bookingDate: { type: Date, default: Date.now },
  duration: { type: Number, default: 2 }, // 2 hours default
  amount: { type: Number, default: 500 }, // Rs.500 default
  peopleCount: { type: Number, required: true }
});

const Booking = mongoose.model('Booking', bookingSchema, 'poolbookings');

// Routes
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, phone, whatsapp, email, peopleCount } = req.body;
    
    if (!name || !phone || !peopleCount) {
      return res.status(400).json({ message: 'Name, phone, and people count are required' });
    }

    const newBooking = new Booking({
      name,
      phone,
      whatsapp: whatsapp || '',
      email: email || '',
      peopleCount
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalPeople = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$peopleCount" } } }
    ]);
    
    res.json({
      totalBookings,
      totalPeople: totalPeople[0]?.total || 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});