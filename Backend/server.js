import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Route Imports
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/manageRoom.js";
import poolRoutes from "./routes/managePool.js";
import userRoutes from "./routes/manageUser.js";
import BookingConfirmationRoutes from "./routes/adminBookingConfirmation.js";


// Socket.io Configuration
import configureSocket from "./socket/socketServer.js";

// Configure environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Configure Socket.io
const { io, adminSockets } = configureSocket(server);

// Make socket instances available to routes
app.set("io", io);
app.set("adminSockets", adminSockets);

// Get directory name for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Server Configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Validate required environment variables
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/pools", poolRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings/confirmation", BookingConfirmationRoutes); 



// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    websocket: io.engine.clientsCount > 0 ? "active" : "inactive",
    connectedAdmins: adminSockets.size,
    timestamp: new Date().toISOString()
  });
});

// Error Handling Middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: err.message 
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Admin dashboard: ${process.env.CLIENT_URL}/admin`);
});

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  console.log("Shutting down server gracefully...");
  await mongoose.disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});