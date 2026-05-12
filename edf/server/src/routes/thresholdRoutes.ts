import express from "express";
import { getThresholdHandler, setThresholdHandler } from "../controllers/thresholdController.js";
import { asyncHandler } from "../middlewares/asyncErrorHandler.js";

const router = express.Router();

/**
 * @swagger
 * /api/threshold:
 *   get:
 *     summary: Lit le seuil d’activité (config activity_threshold)
 *     tags: [Device]
 *     responses:
 *       200:
 *         description: Seuil courant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 threshold:
 *                   type: integer
 *                   minimum: 0
 *       404:
 *         description: Aucune valeur en base
 *   post:
 *     summary: Définit le seuil d’activité (config activity_threshold)
 *     tags: [Device]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [threshold]
 *             properties:
 *               threshold:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Seuil enregistré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 threshold:
 *                   type: integer
 *       400:
 *         description: Corps invalide
 */
router.get("/api/threshold", asyncHandler(getThresholdHandler));
router.post("/api/threshold", asyncHandler(setThresholdHandler));

export default router;
