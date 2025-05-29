// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import http from "http";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// // Route Imports
// import authRoutes from "./routes/auth.js";
// import roomRoutes from "./routes/manageRoom.js";
// import poolRoutes from "./routes/managePool.js";
// import userRoutes from "./routes/manageUser.js";
// import BookingConfirmationRoutes from "./routes/adminBookingConfirmation.js";


// // Socket.io Configuration
// import { configureSocket } from "./socket/socketServer.js";

// // Configure environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // Create HTTP server for Socket.io
// const server = http.createServer(app);

// // Configure Socket.io
// const { io, adminSockets } = configureSocket(server);

// // Make socket instances available to routes
// app.set("io", io);
// app.set("adminSockets", adminSockets);

// // Get directory name for ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Server Configuration
// const PORT = process.env.PORT || 5000;
// const MONGODB_URI = process.env.MONGODB_URI;

// // Validate required environment variables
// if (!MONGODB_URI) {
//   console.error("Error: MONGODB_URI is not defined in environment variables");
//   process.exit(1);
// }

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:5173",
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Static Files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Database Connection
// mongoose.connect(MONGODB_URI)
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((error) => {
//     console.error("MongoDB connection error:", error);
//     process.exit(1);
//   });

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/rooms", roomRoutes);
// app.use("/api/pools", poolRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/admin/bookings", BookingConfirmationRoutes);
    



// // Health Check Endpoint
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     message: "Server is running",
//     websocket: io.engine.clientsCount > 0 ? "active" : "inactive",
//     connectedAdmins: adminSockets.size,
//     timestamp: new Date().toISOString()
//   });
// });

// // Error Handling Middleware (should be after all routes)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     error: "Internal Server Error",
//     message: err.message 
//   });
// });

// // Start Server
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`WebSocket server ready`);
//   console.log(`Admin dashboard: ${process.env.CLIENT_URL}/admin`);
// });

// // Handle shutdown gracefully
// process.on("SIGINT", async () => {
//   console.log("Shutting down server gracefully...");
//   await mongoose.disconnect();
//   server.close(() => {
//     console.log("Server closed");
//     process.exit(0);
//   });
// });

// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import http from "http";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// // Route Imports
// import authRoutes from "./routes/auth.js";
// //import roomRoutes from "./routes/roomRoutes.js";
// import roomRoutes from "./routes/manageRoom.js";
// import bookingRoutes from "./routes/booking.js";
// //import poolRoutes from "./routes/poolRoutes.js";
// import poolRoutes from "./routes/managePool.js";
// //import poolBookingRoutes from "./routes/poolBooking.js";
// import poolBookingRoutes from "./routes/poolBooking.js";//pool booking
// import manageRoomRoutes from "./routes/manageRoom.js";
// import managePoolRoutes from "./routes/managePool.js";
// import manageUserRoutes from "./routes/manageUser.js";
// import BookingConfirmationRoutes from "./routes/adminBookingConfirmation.js";


// // Socket.io Configuration
// import { configureSocket } from "./socket/socketServer.js";

// // Configure environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // Create HTTP server for Socket.io
// const server = http.createServer(app);

// // Configure Socket.io
// const { io, adminSockets } = configureSocket(server);

// // Make socket instances available to routes
// app.set("io", io);
// app.set("adminSockets", adminSockets);

// // Get directory name for ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Server Configuration
// const PORT = process.env.PORT || 5000;
// const MONGODB_URI = process.env.MONGODB_URI;

// // Validate required environment variables
// if (!MONGODB_URI) {
//   console.error("Error: MONGODB_URI is not defined in environment variables");
//   process.exit(1);
// }

// // Enhanced CORS configuration
// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
//   credentials: true,
//   optionsSuccessStatus: 200
// }));

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));



// // Static Files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Database Connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(MONGODB_URI, {
//       serverSelectionTimeoutMS: 5000,
//       maxPoolSize: 10,
//       socketTimeoutMS: 45000
//     });

//     const dbName = new URL(MONGODB_URI).pathname.substring(1);
//     console.log(`🌿 MongoDB connected to database: ${dbName}`);

//     // Connection event listeners
//     mongoose.connection.on("connected", () => {
//       console.log("Mongoose connected to DB");
//     });

//     mongoose.connection.on("error", (err) => {
//       console.error(`Mongoose connection error: ${err}`);
//     });

//     mongoose.connection.on("disconnected", () => {
//       console.warn("Mongoose connection disconnected");
//     });

//   } catch (err) {
//     console.error(`❌ MongoDB connection failed: ${err.message}`);
//     process.exit(1);
//   }
// };

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/rooms", roomRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/pools", poolRoutes);
// app.use("/api/pool-bookings", poolBookingRoutes); // Pool booking routes
// //app.use("/api/pool-bookings", poolBookingRoutes);
// app.use("/api/admin/rooms", manageRoomRoutes);
// app.use("/api/admin/pools", managePoolRoutes);
// app.use("/api/admin/users", manageUserRoutes);
// app.use("/api/admin/bookings", BookingConfirmationRoutes);

// // Health Check Endpoint
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     message: "Server is running",
//     websocket: io.engine.clientsCount > 0 ? "active" : "inactive",
//     connectedAdmins: adminSockets.size,
//     timestamp: new Date().toISOString()
//   });
// });

// // Error Handling Middleware (should be after all routes)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     error: "Internal Server Error",
//     message: err.message 
//   });
// });

// // Start Server
// const startServer = async () => {
//   try {
//     await connectDB();
//     server.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🔗 Allowed Origins: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
//       console.log(`WebSocket server ready`);
//       console.log(`Admin dashboard: ${process.env.CLIENT_URL}/admin`);
//     });
//   } catch (err) {
//     console.error(`❌ Server startup failed: ${err.message}`);
//     process.exit(1);
//   }
// };

// // Handle shutdown gracefully
// process.on("SIGINT", async () => {
//   console.log("Shutting down server gracefully...");
//   await mongoose.disconnect();
//   server.close(() => {
//     console.log("Server closed");
//     process.exit(0);
//   });
// });

// // Handle uncaught errors
// process.on("unhandledRejection", (err) => {
//   console.error(`⚠️ Unhandled Rejection: ${err}`);
//   process.exit(1);
// });

// // Start the application
// startServer();


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
import bookingRoutes from "./routes/booking.js";
import poolRoutes from "./routes/managePool.js";
import poolBookingRoutes from "./routes/poolBooking.js";
import manageRoomRoutes from "./routes/manageRoom.js";
import managePoolRoutes from "./routes/managePool.js";
import manageUserRoutes from "./routes/manageUser.js";
import BookingConfirmationRoutes from "./routes/adminBookingConfirmation.js";
import profileRoutes from "./routes/profileRoutes.js"; // NEW: Import profile routes

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
const MONGODB_URI = process.env.MONGODB_URI;

// Validate required environment variables
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000
    });

    const dbName = new URL(MONGODB_URI).pathname.substring(1);
    console.log(`🌿 MongoDB connected to database: ${dbName}`);

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose connection disconnected");
    });

  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/pools", poolRoutes);
app.use("/api/pool-bookings", poolBookingRoutes);
app.use("/api/admin/rooms", manageRoomRoutes);
app.use("/api/admin/pools", managePoolRoutes);
app.use("/api/admin/users", manageUserRoutes);
app.use("/api/admin/bookings", BookingConfirmationRoutes);
app.use("/api/profile", profileRoutes); // NEW: Add profile routes

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
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Allowed Origins: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
      console.log(`WebSocket server ready`);
      console.log(`Admin dashboard: ${process.env.CLIENT_URL}/admin`);
    });
  } catch (err) {
    console.error(`❌ Server startup failed: ${err.message}`);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  console.log("Shutting down server gracefully...");
  await mongoose.disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Handle uncaught errors
process.on("unhandledRejection", (err) => {
  console.error(`⚠️ Unhandled Rejection: ${err}`);
  process.exit(1);
});

// Start the application
startServer();