import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import foodItemsRoutes from './routes/fooditems.js';
import uploadRoutes from './routes/upload.js';
import validateEvent from './middleware/validateEvent.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Check if MONGODB_URI is defined
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
// app.use("/api/rooms", roomRoutes);

// app.get("/api/health", (req, res) => {
//   res.status(200).json({ status: "OK", message: "Server is running" });
// });

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/fooditems', foodItemsRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});