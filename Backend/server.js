import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/booking.js';

dotenv.config();

const app = express();
//app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // Update with your frontend URL
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));



const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
