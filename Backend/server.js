import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// Route Imports
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import foodItemsRoutes from "./routes/fooditems.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/booking.js";
import poolRoutes from "./routes/managePool.js";
import poolBookingRoutes from "./routes/poolBookingRoutes.js";
import manageRoomRoutes from "./routes/manageRoom.js";
import manageUserRoutes from "./routes/manageUser.js";
import BookingConfirmationRoutes from "./routes/adminBookingConfirmation.js";
import userBookings from "./routes/userBookings.js";
import profileRoutes from "./routes/profileRoutes.js";
import receptionBookingsRoutes from "./routes/receptionBookings.js";
import receptionRoomsRoutes from "./routes/receptionRooms.js";
import dashboardRoutes from "./routes/dashboard.js";

// Middleware Imports
import validateEvent from "./middleware/validateEvent.js";
import errorHandler from "./middleware/errorHandler.js";

// Socket.io Configuration
import { configureSocket } from "./socket/socketServer.js";

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
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hoteldb";

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Database Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/fooditems", foodItemsRoutes);
app.use("/api/rooms", roomRoutes); // Room availability routes
app.use("/api/bookings", bookingRoutes); // Changed from booking to bookings to match frontend
app.use("/api/pools", poolRoutes);
app.use("/api/pool-booking", poolBookingRoutes); // Pool booking routes
app.use("/api/poolBookings", poolBookingRoutes); // Pool bookings list routes (same as pool-booking)
app.use("/api/manage/rooms", manageRoomRoutes);
app.use("/api/manage/users", manageUserRoutes);
app.use("/api/admin/bookings", BookingConfirmationRoutes);
app.use("/api/user-bookings", userBookings); // Add the new user bookings route
app.use("/api/profile", profileRoutes); // Add profile routes
app.use("/api/receptionBookings", receptionBookingsRoutes); // Add reception bookings route
app.use("/api/receptionRooms", receptionRoomsRoutes); // Add reception rooms route
app.use("/api/dashboard", dashboardRoutes); // Add dashboard routes

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    websocket: io.engine.clientsCount > 0 ? "active" : "inactive",
    connectedAdmins: adminSockets.size,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(
    `Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`
  );
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
