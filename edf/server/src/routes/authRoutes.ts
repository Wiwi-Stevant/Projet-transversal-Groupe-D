import express from "express";
import * as authController from "../controllers/authController.js";
import { jwtAuth } from "../middlewares/jwtAuth.js";
import { asyncHandler } from "../middlewares/asyncErrorHandler.js";
import type { Request, Response, NextFunction } from "express";

const router = express.Router();

// ============================================
// JWT AUTH (Connexion & Refresh)
// ============================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription (mot de passe hashé bcrypt en base) — US-3.2
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Compte créé
 *       400:
 *         description: Données invalides
 *       409:
 *         description: E-mail déjà utilisé
 */
router.post("/api/auth/register", asyncHandler(authController.register));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion JWT (access token + cookie refresh) — US-3.3
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *       401:
 *         description: Identifiants invalides
 */
router.post("/api/auth/login", asyncHandler(authController.login));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir l'Access Token
 *     tags: [Authentication]
 */
router.post("/api/auth/refresh", asyncHandler(authController.refresh));

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Récupère le profil utilisateur (protégé par JWT)
 *     tags: [Authentication]
 */
router.get(
  "/api/profile",
  (req: Request, res: Response, next: NextFunction) => {
    jwtAuth(req, res, next);
  },
  asyncHandler(authController.getProfile)
);

export default router;