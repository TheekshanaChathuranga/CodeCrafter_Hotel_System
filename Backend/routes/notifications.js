import express from "express";
import Notification from "../models/Notification.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Debug route to check token contents
router.get("/debug-token", verifyToken, async (req, res) => {
  res.json({
    success: true,
    tokenData: req.user,
    hasRole: !!req.user.role,
    role: req.user.role,
    userId: req.user.userId,
    username: req.user.username,
  });
});

// Get unread notification count for admin
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    console.log("Unread count request received");
    console.log("User from token:", req.user);
    console.log("User role:", req.user?.role);
    console.log("User ID:", req.user?.userId); // Fixed: use userId instead of id

    if (req.user.role !== "admin") {
      console.log("Access denied: User is not admin");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
        userRole: req.user.role,
      });
    }

    console.log("User is admin, fetching unread count...");

    const count = await Notification.countDocuments({
      $or: [
        { adminId: req.user.userId }, // Fixed: use userId instead of id
        { adminId: null }, // Global notifications
      ],
      isRead: false,
    });

    console.log("Unread count found:", count);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
});

// Get all notifications for admin (paginated)
router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      $or: [
        { adminId: req.user.userId }, // Fixed: use userId instead of id
        { adminId: null }, // Global notifications
      ],
    })
      .populate("bookingId", "roomNumber fullName status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({
      $or: [
        { adminId: req.user.userId }, // Fixed: use userId instead of id
        { adminId: null },
      ],
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalCount: total,
      },
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
});

// Mark notifications as read
router.put("/mark-read", verifyToken, async (req, res) => {
  try {
    console.log("=== MARK AS READ REQUEST ===");
    console.log("User:", req.user);
    console.log("Request body:", req.body);

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { notificationIds } = req.body;

    let updateQuery;
    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      updateQuery = {
        _id: { $in: notificationIds },
        $or: [
          { adminId: req.user.userId }, // Fixed: use userId instead of id
          { adminId: null },
        ],
      };
      console.log("Marking specific notifications as read:", notificationIds);
    } else {
      // Mark all unread notifications as read
      updateQuery = {
        $or: [
          { adminId: req.user.userId }, // Fixed: use userId instead of id
          { adminId: null },
        ],
        isRead: false,
      };
      console.log(
        "Marking ALL unread notifications as read for user:",
        req.user.userId
      );
    }

    console.log("Update query:", JSON.stringify(updateQuery, null, 2));

    const result = await Notification.updateMany(updateQuery, {
      isRead: true,
      readAt: new Date(),
    });

    console.log("Update result:", result);
    console.log("Modified count:", result.modifiedCount);

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
});

// Delete old read notifications (cleanup)
router.delete("/cleanup", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Delete read notifications older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      isRead: true,
      readAt: { $lt: thirtyDaysAgo },
    });

    res.json({
      success: true,
      message: `${result.deletedCount} old notifications cleaned up`,
    });
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup notifications",
    });
  }
});

export default router;
