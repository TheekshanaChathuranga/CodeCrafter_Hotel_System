import express from "express";
import Room from "../models/Room.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure upload directory
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
}).array("images", 3);

// Middleware to handle upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Add new room
router.post("/add", (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { roomNumber, type, acOption, pricePerNight, pricePerDay, roomStatus, description } = req.body;
    
    // Basic validation
    if (!roomNumber || !type || !acOption || !pricePerNight || !pricePerDay || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!['Available', 'Not Available'].includes(roomStatus)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (!["AC", "Non-AC", "Both"].includes(acOption)) {
      return res.status(400).json({ error: "Invalid AC option. Must be 'AC', 'Non-AC', or 'Both'." });
    }

    const hasAC = acOption !== "Non-AC";

    const numericPricePerNight = parseFloat(pricePerNight);
    if (isNaN(numericPricePerNight) || numericPricePerNight < 0) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    const numericPricePerDay = parseFloat(pricePerDay);
    if (isNaN(numericPricePerDay) || numericPricePerDay < 0) {
      return res.status(400).json({ error: "Invalid price per day value" });
    }

    const imagePaths = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const newRoom = new Room({
      roomNumber,
      type,
      acOption,
      hasAC,
      pricePerNight: numericPricePerNight,
      pricePerDay: numericPricePerDay,
      roomStatus,
      description,
      images: imagePaths
    });

    await newRoom.save();
    res.status(201).json({ 
      message: "Room added successfully",
      room: newRoom
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Room number must be unique" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error adding room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update room
router.put("/update/:id", (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      roomNumber, 
      type, 
      acOption, 
      pricePerNight, 
      pricePerDay, 
      roomStatus, 
      description,
      deletedImages // This comes from the frontend
    } = req.body;

    const existingRoom = await Room.findById(id);
    if (!existingRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Handle deleted images
    let imagesToDelete = [];
    try {
      imagesToDelete = deletedImages ? JSON.parse(deletedImages) : [];
    } catch (parseError) {
      console.error("Error parsing deletedImages:", parseError);
    }

    // Delete files from server
    imagesToDelete.forEach(imagePath => {
      try {
        const filename = path.basename(imagePath);
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error("Error deleting image file:", fileError);
      }
    });

    // Filter out deleted images from existing images
    const remainingImages = existingRoom.images.filter(
      img => !imagesToDelete.includes(img)
    );

    // Add new images
    const newImagePaths = req.files?.map(file => `/uploads/${file.filename}`) || [];
    const allImages = [...remainingImages, ...newImagePaths].slice(0, 3);

    // Validate input data
    const numericPricePerNight = parseFloat(pricePerNight);
    if (isNaN(numericPricePerNight)) {
      return res.status(400).json({ error: "Invalid price per night value" });
    }

    const numericPricePerDay = parseFloat(pricePerDay);
    if (isNaN(numericPricePerDay)) {
      return res.status(400).json({ error: "Invalid price per day value" });
    }

    if (!["AC", "Non-AC", "Both"].includes(acOption)) {
      return res.status(400).json({ error: "Invalid AC option" });
    }

    if (!["Available", "Not Available"].includes(roomStatus)) {
      return res.status(400).json({ error: "Invalid room status" });
    }

    const hasAC = acOption !== "Non-AC";

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        roomNumber,
        type,
        acOption,
        hasAC,
        pricePerNight: numericPricePerNight,
        pricePerDay: numericPricePerDay,
        roomStatus,
        description,
        images: allImages
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Room updated successfully",
      room: updatedRoom
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Room number must be unique" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete room
router.delete("/delete/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Delete associated images
    room.images.forEach(imagePath => {
      try {
        const filename = path.basename(imagePath);
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    });

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;