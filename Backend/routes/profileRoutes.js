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
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  }
);

export default router;
