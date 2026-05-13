import express from "express";
import Event from "../models/events.js";
import { asyncHandler } from "../middlewares/asyncErrorHandler.js";

const router = express.Router();

// Récupérer les 100 derniers événements
router.get("/api/events", asyncHandler(async (req, res) => {
  const events = await Event.findAll({
    limit: 100,
    order: [['createdAt', 'DESC']]
  });
  res.json(events);
}));

export default router;