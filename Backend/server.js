import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Routes imports
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/manageRoom.js";
import poolRoutes from "./routes/managePool.js";
import userRoutes from './routes/manageUser.js';
import bookingRoutes from "./routes/receptionBookings.js";
import receptionRoomRoutes from "./routes/receptionRooms.js";
import poolBookingRoutes from "./routes/poolBookingRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";

// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'http://localhost:5177'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Check if MONGODB_URI is defined
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

// Database connection with better error handling
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Connection events
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('MongoDB connection established'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
// Authentication routes
app.use('/api/auth', authRoutes);

// Management routes
app.use("/api/rooms", roomRoutes);
app.use("/api/pools", poolRoutes);
app.use('/api/users', userRoutes);

// Reception routes
app.use('/api/receptionBookings', bookingRoutes);
app.use('/api/receptionRooms', receptionRoomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/roomBookings', bookingRoutes);  // Add this route for room bookings

// Admin booking confirmation routes
import adminBookingRoutes from "./routes/adminBookingConfirmation.js";
app.use('/api/admin/bookings', adminBookingRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Pool booking routes
app.use('/api/poolBookings', poolBookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    dbState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    message: 'Server is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
});