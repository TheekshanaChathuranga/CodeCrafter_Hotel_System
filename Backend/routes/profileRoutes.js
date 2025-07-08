import express from "express";
import User from "../models/User.js";
import verifyToken from "../middleware/verifyToken.js";
import { upload, handleUploadErrors } from "../middleware/upload.js";

const router = express.Router();

// Update profile route
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { username, fullName, bio, location, phone, profilePicture } =
      req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        username,
        fullName,
        bio,
        location,
        phone,
        profilePicture, // <-- ensure profilePicture is updated
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

// Upload profile image
router.post(
  "/upload-profile-image",
  verifyToken,
  upload.single("profileImage"),
  handleUploadErrors,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    try {
      // Delete previous profile image if exists and is not default
      const user = await User.findById(req.user.userId);
      if (user && user.profilePicture && user.profilePicture.startsWith('/uploads/profileImages/')) {
        const fs = await import('fs');
        const path = await import('path');
        // Support both Windows and POSIX paths
        let oldImagePath = user.profilePicture;
        if (oldImagePath.startsWith('/')) oldImagePath = oldImagePath.substring(1);
        const absPath = path.resolve(process.cwd(), 'Backend', oldImagePath);
        if (fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
        }
      }
    } catch (err) {
      // Log but don't block upload
      console.error('Error deleting old profile image:', err);
    }
    // Always return the path as /uploads/profileImages/filename
    res.json({ imageUrl: `/uploads/profileImages/${req.file.filename}` });
  }
);

export default router;