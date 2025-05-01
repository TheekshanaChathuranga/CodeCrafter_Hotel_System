import express from "express";
import Event from "../models/Event.js";
import validateEvent from "../middleware/validateEvent.js";

const router = express.Router();

// Create Event (No auth)
router.post("/", validateEvent, async (req, res) => {
  try {
    const eventData = { ...req.body }; // No userId since no auth
    const event = new Event(eventData);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(400).json({ message: "Failed to create event", error: error.message });
  }
});

// Get All Events (No auth)
router.get("/", async (req, res) => {
  try {
    console.log("Fetching events from backend...");
    const events = await Event.find();
    console.log("Events fetched:", events);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error.message, error.stack);
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
});

// Get a single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Event (No auth)
router.put("/:id", validateEvent, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(400).json({ message: "Failed to update event", error: error.message });
  }
});

// Delete Event (No auth)
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
});

export default router;