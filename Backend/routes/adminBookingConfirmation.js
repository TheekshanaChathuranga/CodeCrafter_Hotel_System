import express from "express";
import OnlineBooking from "../models/Booking.js";
import PoolBooking from "../models/PoolBooking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import {
  sendBookingApprovalEmail,
  sendBookingRejectionEmail,
} from "../config/emailConfig.js";

const router = express.Router();

// Get all pending bookings
router.get("/pending", async (req, res) => {
  try {
    const bookings = await OnlineBooking.find({ status: "pending" })
      .select("-__v")
      .lean();

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    res.status(500).json({ error: "Failed to fetch pending bookings" });
  }
});

// Get single booking details
router.get("/pending/:id", async (req, res) => {
  try {
    const booking = await OnlineBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve booking
router.patch("/:id/approve", async (req, res) => {
  try {
    // Temporarily hardcode processedBy for testing
    const processedBy = new mongoose.Types.ObjectId("67ed21a0c1811a6b2f5480b4");

    const booking = await OnlineBooking.findByIdAndUpdate(
      req.params.id,
      {
        status: "confirmed",
        processedBy: processedBy, // Use hardcoded ID for now
        processedAt: new Date(),
      },
      { new: true }
    ).populate("user", "email");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Send approval email
    if (booking.user && booking.user.email) {
      const bookingDetails = {
        bookingId: booking._id,
        type: "Room Booking",
        roomNumber: booking.roomNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      };

      try {
        await sendBookingApprovalEmail(
          booking.user.email,
          booking.fullName,
          bookingDetails
        );
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Continue with the approval even if email fails
      }
    }

    // Emit socket event if io is available
    if (req.app.get("io")) {
      req.app.get("io").emit("booking-updated", {
        bookingId: booking._id,
        newStatus: "confirmed",
      });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(400).json({ error: error.message });
  }
});

// Reject booking
router.patch("/:id/reject", async (req, res) => {
  try {
    // Temporarily hardcode processedBy for testing
    const processedBy = new mongoose.Types.ObjectId("67ed21a0c1811a6b2f5480b4");

    const booking = await OnlineBooking.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        processedBy: processedBy, // Use hardcoded ID for now
        processedAt: new Date(),
        rejectionReason: req.body.reason || "",
      },
      { new: true }
    ).populate("user", "email");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Send rejection email
    if (booking.user && booking.user.email) {
      const bookingDetails = {
        bookingId: booking._id,
        type: "Room Booking",
        roomNumber: booking.roomNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      };

      try {
        await sendBookingRejectionEmail(
          booking.user.email,
          booking.fullName,
          bookingDetails,
          req.body.reason
        );
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
        // Continue with the rejection even if email fails
      }
    }

    // Emit socket event if io is available
    if (req.app.get("io")) {
      req.app.get("io").emit("booking-updated", {
        bookingId: booking._id,
        newStatus: "rejected",
      });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all pending pool bookings
router.get("/pool/pending", async (req, res) => {
  try {
    const bookings = await PoolBooking.find({ status: "pending" })
      .select("-__v")
      .lean();

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching pending pool bookings:", error);
    res.status(500).json({ error: "Failed to fetch pending pool bookings" });
  }
});

// Get single pool booking details
router.get("/pool/pending/:id", async (req, res) => {
  try {
    const booking = await PoolBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Pool booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve pool booking
router.patch("/pool/:id/approve", async (req, res) => {
  try {
    const booking = await PoolBooking.findByIdAndUpdate(
      req.params.id,
      {
        status: "confirmed",
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Pool booking not found" });
    }

    // Send approval email
    if (booking.email) {
      const bookingDetails = {
        bookingId: booking._id,
        type: "Pool Booking",
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      };

      try {
        await sendBookingApprovalEmail(
          booking.email,
          booking.name,
          bookingDetails
        );
      } catch (emailError) {
        console.error("Failed to send pool approval email:", emailError);
        // Continue with the approval even if email fails
      }
    }

    res.json(booking);
  } catch (error) {
    console.error("Error approving pool booking:", error);
    res.status(400).json({ error: error.message });
  }
});

// Reject pool booking
router.patch("/pool/:id/reject", async (req, res) => {
  try {
    const booking = await PoolBooking.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Pool booking not found" });
    }

    // Send rejection email
    if (booking.email) {
      const bookingDetails = {
        bookingId: booking._id,
        type: "Pool Booking",
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      };

      try {
        await sendBookingRejectionEmail(
          booking.email,
          booking.name,
          bookingDetails,
          req.body.reason
        );
      } catch (emailError) {
        console.error("Failed to send pool rejection email:", emailError);
        // Continue with the rejection even if email fails
      }
    }

    res.json(booking);
  } catch (error) {
    console.error("Error rejecting pool booking:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all pending events
router.get("/events/pending", async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" })
      .select("-__v")
      .lean();

    res.json(events);
  } catch (error) {
    console.error("Error fetching pending events:", error);
    res.status(500).json({ error: "Failed to fetch pending events" });
  }
});

// Get single event details
router.get("/events/pending/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve event
router.patch("/events/:id/approve", async (req, res) => {
  try {
    const processedBy = new mongoose.Types.ObjectId("67ed21a0c1811a6b2f5480b4");

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "confirmed",
        processedBy: processedBy,
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Send approval email
    if (event.email) {
      const bookingDetails = {
        bookingId: event.eventId || event._id,
        type: "Event Booking",
        eventType: event.eventType,
        checkIn: event.checkIn,
        checkOut: event.checkOut,
      };

      try {
        await sendBookingApprovalEmail(event.email, event.name, bookingDetails);
      } catch (emailError) {
        console.error("Failed to send event approval email:", emailError);
        // Continue with the approval even if email fails
      }
    }

    // Emit socket event if io is available
    if (req.app.get("io")) {
      req.app.get("io").emit("event-updated", {
        eventId: event._id,
        newStatus: "confirmed",
      });
    }

    res.json(event);
  } catch (error) {
    console.error("Error approving event:", error);
    res.status(400).json({ error: error.message });
  }
});

// Reject event
router.patch("/events/:id/reject", async (req, res) => {
  try {
    const processedBy = new mongoose.Types.ObjectId("67ed21a0c1811a6b2f5480b4");

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        processedBy: processedBy,
        processedAt: new Date(),
        rejectionReason: req.body.reason || "",
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Send rejection email
    if (event.email) {
      const bookingDetails = {
        bookingId: event.eventId || event._id,
        type: "Event Booking",
        eventType: event.eventType,
        checkIn: event.checkIn,
        checkOut: event.checkOut,
      };

      try {
        await sendBookingRejectionEmail(
          event.email,
          event.name,
          bookingDetails,
          req.body.reason
        );
      } catch (emailError) {
        console.error("Failed to send event rejection email:", emailError);
        // Continue with the rejection even if email fails
      }
    }

    // Emit socket event if io is available
    if (req.app.get("io")) {
      req.app.get("io").emit("event-updated", {
        eventId: event._id,
        newStatus: "rejected",
      });
    }

    res.json(event);
  } catch (error) {
    console.error("Error rejecting event:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
