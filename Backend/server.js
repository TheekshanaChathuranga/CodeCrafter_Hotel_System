import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";

// Socket.io Configuration
import { configureSocket } from "./socket/socketServer.js";

// Routes imports
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/roomRoutes.js"; // Customer room routes
import bookingRoutes from "./routes/booking.js"; // Customer booking routes
import manageRoomRoutes from "./routes/manageRoom.js"; // Admin room management
import poolRoutes from "./routes/managePool.js";
import poolBookingRoutes from "./routes/poolBooking.js"; // Customer pool booking
import poolBookingRoutesReception from "./routes/poolBookingRoutes.js"; // Reception pool booking
import userRoutes from "./routes/manageUser.js";
import receptionBookingRoutes from "./routes/receptionBookings.js";
import dashboardRoutes from "./routes/dashboard.js";
import BookingConfirmationRoutes from "./routes/adminBookingConfirmation.js";
import receptionRoomsRoutes from "./routes/receptionRooms.js";
import userBookingsRoutes from "./routes/userBookings.js"; // Customer bookings view
import profileRoutes from "./routes/profileRoutes.js"; // Customer profile

// Configure environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const { io, adminSockets } = configureSocket(server);
app.set("io", io);
app.set("adminSockets", adminSockets);

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Port and DB setup
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);

// Customer routes
app.use("/api/rooms", roomRoutes); // Customer room availability
app.use("/api/bookings", bookingRoutes); // Customer room bookings
app.use("/api/pool-booking", poolBookingRoutes); // Customer pool bookings
app.use("/api/user-bookings", userBookingsRoutes); // Customer view bookings
app.use("/api/profile", profileRoutes); // Customer profile

// Admin routes
app.use("/api/manage/rooms", manageRoomRoutes); // Admin room management
app.use("/api/pools", poolRoutes); // Admin pool management
app.use("/api/users", userRoutes); // Admin user management
app.use("/api/admin/bookings", BookingConfirmationRoutes);

// Reception-specific routes
app.use("/api/receptionBookings", receptionBookingRoutes);
app.use("/api/roomBookings", receptionBookingRoutes);
app.use("/api/receptionRooms", receptionRoomsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/poolBookings", poolBookingRoutesReception);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    dbState: mongoose.connection.readyState,
    dbName: mongoose.connection.db?.databaseName || "unknown",
    dbHost: mongoose.connection.host || "unknown",
    websocket: io.engine.clientsCount > 0 ? "active" : "inactive",
    connectedAdmins: adminSockets.size,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `MongoDB connected to: ${mongoose.connection.host || "unknown-host"}/${
      mongoose.connection.db?.databaseName || "unknown-db"
    }`
  );
  console.log(`WebSocket server ready`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server gracefully...");
  await mongoose.disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
