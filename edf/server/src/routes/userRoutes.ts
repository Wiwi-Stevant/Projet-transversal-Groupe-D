import express from "express";
import * as userController from "../controllers/userController.js";
import { asyncHandler } from "../middlewares/asyncErrorHandler.js";

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère la liste des comptes (id, email)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       500:
 *         description: Erreur serveur interne
 */
router.get("/api/users", asyncHandler(userController.getAllUsers));

/**
 * @swagger
 * /api/users/active:
 *   get:
 *     summary: Liste des utilisateurs (alias sans colonne active en base)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       500:
 *         description: Erreur serveur interne
 */
router.get("/api/users/active", asyncHandler(userController.getActiveUsers));

export default router;
