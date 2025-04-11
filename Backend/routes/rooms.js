const express = require("express");
const router = express.Router();

const rooms = [
  { id: 1, name: "Deluxe Room", price: 100 },
  { id: 2, name: "Suite", price: 200 },
];

router.get("/", (req, res) => {
  res.json(rooms);
});

router.get("/:id", (req, res) => {
  const room = rooms.find((r) => r.id === parseInt(req.params.id));
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

module.exports = router;
