import express from "express";
import Room from "../models/Room.js";
import { upload, handleUploadErrors, uploadDir } from "../middleware/upload.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Helper function to delete room images
const deleteRoomImages = (images) => {
  images.forEach(imagePath => {
    try {
      const filename = path.basename(imagePath);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Error deleting room image:", error);
    }
  });
};

// Add new room
router.post("/add",
  upload.array("images", 3),
  handleUploadErrors,
  async (req, res) => {
    try {
      const { roomNumber, type, acOption, pricePerNight, pricePerDay, roomStatus, description } = req.body;
      
      // Basic validation
      if (!roomNumber || !type || !acOption || !pricePerNight || !pricePerDay || !description) {
        throw new Error("All fields are required");
      }

      if (!['Available', 'Not Available'].includes(roomStatus)) {
        throw new Error("Invalid status value");
      }

      if (!["AC", "Non-AC", "Both"].includes(acOption)) {
        throw new Error("Invalid AC option. Must be 'AC', 'Non-AC', or 'Both'.");
      }

      const hasAC = acOption !== "Non-AC";
      const numericPricePerNight = parseFloat(pricePerNight);
      const numericPricePerDay = parseFloat(pricePerDay);

      if (isNaN(numericPricePerNight) || numericPricePerNight < 0) {
        throw new Error("Invalid price value");
      }

      if (isNaN(numericPricePerDay) || numericPricePerDay < 0) {
        throw new Error("Invalid price per day value");
      }

      let unavailablePeriod = undefined;
      if (req.body.unavailablePeriod) {
        try {
          const parsed = JSON.parse(req.body.unavailablePeriod);
          if (parsed.start && parsed.end) {
            unavailablePeriod = {
              start: new Date(parsed.start),
              end: new Date(parsed.end)
            };
          }
        } catch (e) {
          throw new Error("Invalid unavailablePeriod format");
        }
      }

      const newRoom = new Room({
        roomNumber,
        type,
        acOption,
        hasAC,
        pricePerNight: numericPricePerNight,
        pricePerDay: numericPricePerDay,
        roomStatus,
        description,
        images: req.files?.map(file => `/uploads/${file.filename}`) || [],
        ...(unavailablePeriod && { unavailablePeriod })
      });

      await newRoom.save();
      res.status(201).json({
        message: "Room added successfully",
        room: newRoom
      });
    } catch (error) {
      // Cleanup uploaded files if error occurs
      if (req.files) {
        deleteRoomImages(req.files.map(f => `/uploads/${f.filename}`));
      }

      if (error.code === 11000) {
        return res.status(400).json({ error: "Room number must be unique" });
      }
      res.status(400).json({ 
        error: error.message,
        ...(error.name === 'ValidationError' && { details: error.errors })
      });
    }
  }
);

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.roomStatus = status;
    if (type) filter.type = type;

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Get single room
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// Update room
router.put("/update/:id",
  upload.array("images", 3),
  handleUploadErrors,
  async (req, res) => {
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
        deletedImages
      } = req.body;

      const existingRoom = await Room.findById(id);
      if (!existingRoom) {
        throw new Error("Room not found");
      }

      // Handle deleted images
      const imagesToDelete = deletedImages ? JSON.parse(deletedImages) : [];
      deleteRoomImages(imagesToDelete);

      // Filter out deleted images
      const remainingImages = existingRoom.images.filter(
        img => !imagesToDelete.includes(img)
      );

      // Add new images (max 3 total)
      const newImagePaths = req.files?.map(file => `/uploads/${file.filename}`) || [];
      const allImages = [...remainingImages, ...newImagePaths].slice(0, 3);

      // Validate and parse input
      const numericPricePerNight = parseFloat(pricePerNight);
      const numericPricePerDay = parseFloat(pricePerDay);
      
      if (isNaN(numericPricePerNight)) {
        throw new Error("Invalid price per night value");
      }

      if (isNaN(numericPricePerDay)) {
        throw new Error("Invalid price per day value");
      }

      if (!["AC", "Non-AC", "Both"].includes(acOption)) {
        throw new Error("Invalid AC option");
      }

      if (!["Available", "Not Available"].includes(roomStatus)) {
        throw new Error("Invalid room status");
      }

      let unavailablePeriod = undefined;
      if (req.body.unavailablePeriod) {
        try {
          const parsed = JSON.parse(req.body.unavailablePeriod);
          if (parsed.start && parsed.end) {
            unavailablePeriod = {
              start: new Date(parsed.start),
              end: new Date(parsed.end)
            };
          }
        } catch (e) {
          throw new Error("Invalid unavailablePeriod format");
        }
      }

      const updateFields = {
        roomNumber,
        type,
        acOption,
        hasAC: acOption !== "Non-AC",
        pricePerNight: numericPricePerNight,
        pricePerDay: numericPricePerDay,
        roomStatus,
        description,
        images: allImages
      };
      if (unavailablePeriod) updateFields.unavailablePeriod = unavailablePeriod;

      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      );

      res.json({
        message: "Room updated successfully",
        room: updatedRoom
      });
    } catch (error) {
      // Cleanup newly uploaded files if error occurs
      if (req.files) {
        deleteRoomImages(req.files.map(f => `/uploads/${f.filename}`));
      }

      if (error.code === 11000) {
        return res.status(400).json({ error: "Room number must be unique" });
      }
      res.status(400).json({ 
        error: error.message,
        ...(error.name === 'ValidationError' && { details: error.errors })
      });
    }
  }
);

// Delete room
router.delete("/delete/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Delete all associated images
    deleteRoomImages(room.images);

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

export default router;