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
 * /api/auth/login:
 * post:
 * summary: Authentification et génération des tokens JWT
 * tags: [Authentication]
 */
router.post("/api/auth/login", asyncHandler(authController.login));

/**
 * @swagger
 * /api/auth/refresh:
 * post:
 * summary: Rafraîchir l'Access Token
 * tags: [Authentication]
 */
router.post("/api/auth/refresh", asyncHandler(authController.refresh));

/**
 * @swagger
 * /api/profile:
 * get:
 * summary: Récupère le profil utilisateur (protégé par JWT)
 * tags: [Authentication]
 */
router.get(
  "/api/profile",
  (req: Request, res: Response, next: NextFunction) => {
    jwtAuth(req, res, next);
  },
  asyncHandler(authController.getProfile)
);

export default router;