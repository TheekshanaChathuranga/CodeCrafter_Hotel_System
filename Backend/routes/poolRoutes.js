// Backend/routes/poolRoutes.js
import express from "express";
import Pool from "../models/Pool.js";

const router = express.Router();

// Get all pool details
router.get("/", async (req, res) => {
  try {
    const pools = await Pool.find();
    res.status(200).json(pools);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pool details", error });
  }
});

export default router;