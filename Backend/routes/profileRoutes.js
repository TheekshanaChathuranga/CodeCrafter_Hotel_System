import express from "express";
import User from "../models/User.js";
import verifyToken from "../middleware/verifyToken.js";
import { upload, handleUploadErrors } from "../middleware/upload.js";

const router = express.Router();

// Update profile route
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { fullName, bio, location, phone, profilePicture } = req.body;

    if (!fullName || fullName.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Full name is required and must be at least 3 characters.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        fullName,
        bio,
        location,
        phone,
        profilePicture,
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
});

// Profile image upload route
router.post(
  "/upload-profile-image",
  verifyToken,
  upload.single("profileImage"),
  handleUploadErrors,
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      // Save file path to user profile
      const imagePath = `/uploads/${req.file.filename}`;
      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        { profilePicture: imagePath },
        { new: true, runValidators: true }
      ).select("-password");
      res.json({
        success: true,
        message: "Profile image uploaded successfully",
        profilePicture: imagePath,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading profile image",
        error: error.message,
      });
    }
  }
);

export default router;