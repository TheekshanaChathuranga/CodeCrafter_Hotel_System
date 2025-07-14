import express from "express";
import User from "../models/User.js";
import verifyToken from "../middleware/verifyToken.js";
import { upload, handleUploadErrors } from "../middleware/upload.js";

const router = express.Router();

// Get current user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
});

// Update profile route
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { fullName, bio, location, phone, profilePicture } = req.body;

    // Validate fullName only if it's provided and not empty
    if (fullName && fullName.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Full name must be at least 3 characters.",
      });
    }

    // Prepare update object with only provided fields
    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    if (phone !== undefined) updateFields.phone = phone;
    if (profilePicture !== undefined)
      updateFields.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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
