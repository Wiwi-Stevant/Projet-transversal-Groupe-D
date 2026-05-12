import express from "express";
import { setLed } from "../controllers/ledController.js";
import { asyncHandler } from "../middlewares/asyncErrorHandler.js";

const router = express.Router();

/**
 * @swagger
 * /api/led:
 *   post:
 *     summary: Définit l'état de la LED (stocké dans config, clé led_state)
 *     tags: [Device]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [on]
 *             properties:
 *               on:
 *                 type: boolean
 *                 description: true = LED allumée (valeur on), false = éteinte (off)
 *     responses:
 *       200:
 *         description: État enregistré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 led:
 *                   type: string
 *                   enum: [on, off]
 *                 on:
 *                   type: boolean
 *       400:
 *         description: 'Corps invalide (propriété booléenne "on" obligatoire)'
 */
router.post("/api/led", asyncHandler(setLed));

export default router;
