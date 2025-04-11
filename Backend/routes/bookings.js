const express = require("express");
const router = express.Router();

const bookings = [];

router.post("/", (req, res) => {
  const booking = req.body;
  bookings.push(booking);
  res.json({ message: "Booking successful", booking });
});

router.get("/", (req, res) => {
  res.json(bookings);
});

module.exports = router;
