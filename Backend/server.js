
// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import roomRoutes from "./routes/roomRoutes.js";
// import bookingRoutes from "./routes/booking.js";

// dotenv.config();

// const app = express();

// // Enhanced CORS configuration
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
//     credentials: true,
//     optionsSuccessStatus: 200
//   })
// );

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/rooms", roomRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/uploads", express.static("uploads"));

// // MongoDB Connection with enhanced configuration
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000,
//       maxPoolSize: 10,
//       socketTimeoutMS: 45000
//     });

//     const dbName = new URL(process.env.MONGODB_URI).pathname.substring(1);
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

// // Server configuration
// const PORT = process.env.PORT || 5000;
// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🔗 Allowed Origins: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
//     });
//   } catch (err) {
//     console.error(`❌ Server startup failed: ${err.message}`);
//     process.exit(1);
//   }
// };

// // Handle shutdown gracefully
// process.on("SIGINT", async () => {
//   await mongoose.connection.close();
//   console.log("Mongoose connection closed through app termination");
//   process.exit(0);
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
import dotenv from "dotenv";
import cors from "cors";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/booking.js";

dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    credentials: true,
    optionsSuccessStatus: 200
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add this line before routes
app.use('/uploads', express.static('uploads')); 

// Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/uploads", express.static("uploads"));

// MongoDB Connection with updated configuration
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Removed deprecated options
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000
    });

    const dbName = new URL(process.env.MONGODB_URI).pathname.substring(1);
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

// Server configuration
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Allowed Origins: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
    });
  } catch (err) {
    console.error(`❌ Server startup failed: ${err.message}`);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed through app termination");
  process.exit(0);
});

// Handle uncaught errors
process.on("unhandledRejection", (err) => {
  console.error(`⚠️ Unhandled Rejection: ${err}`);
  process.exit(1);
});

// Start the application
startServer();