import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/manageRoom.js";
import poolRoutes from "./routes/managePool.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
// app.use("/api/rooms", roomRoutes);

// app.get("/api/health", (req, res) => {
//   res.status(200).json({ status: "OK", message: "Server is running" });
// });

app.use('/api/auth', authRoutes);
app.use("/api/rooms", roomRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/pools", poolRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});