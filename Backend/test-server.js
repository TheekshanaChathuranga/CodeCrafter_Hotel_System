import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

console.log("Testing basic imports...");

// Test individual route imports
try {
  console.log("Testing auth routes...");
  const authRoutes = await import("./routes/auth.js");
  console.log("✓ Auth routes imported successfully");

  console.log("Testing room routes...");
  const roomRoutes = await import("./routes/roomRoutes.js");
  console.log("✓ Room routes imported successfully");

  console.log("Testing pool booking routes...");
  const poolBookingRoutes = await import("./routes/poolBookingRoutes.js");
  console.log("✓ Pool booking routes imported successfully");

  console.log("Testing reception booking routes...");
  const receptionBookingRoutes = await import("./routes/receptionBookings.js");
  console.log("✓ Reception booking routes imported successfully");

  console.log("Testing socket server...");
  const socketServer = await import("./socket/socketServer.js");
  console.log("✓ Socket server imported successfully");

  console.log("All imports successful! Server should work.");
} catch (error) {
  console.error("Import error:", error);
  console.error("Stack:", error.stack);
}
