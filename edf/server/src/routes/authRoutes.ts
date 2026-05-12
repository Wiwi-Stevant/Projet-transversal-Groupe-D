import express from "express";
import * as authController from "../controllers/authController.js";
import { basicAuth } from "../middlewares/basicAuth.js";
import { jwtAuth } from "../middlewares/jwtAuth.js";
import { asyncHandler } from "../middlewares/asyncErrorHandler.js";
import auth from "http-auth";
import path from "path";
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction } from "express";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// HTTP BASIC AUTH
// ============================================

/**
 * @swagger
 * /api/admin/basic:
 *   get:
 *     summary: Zone protégée par HTTP Basic Auth
 *     tags: [Authentication]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Accès autorisé
 *       401:
 *         description: Non autorisé
 */
router.get(
  "/api/admin/basic",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    basicAuth(req, res, next);
  }),
  (req: Request, res: Response) => {
    res.status(200).json({ message: "✅ Bienvenue dans la zone Basic Auth!" });
  }
);

// ============================================
// HTTP DIGEST AUTH
// ============================================

// Configuration du middleware Digest
const digestAuth = auth.digest({
  realm: "Zone securisee",
  file: path.join(__dirname, "../../users.htdigest"),
});

// Créer un vrai middleware Express à partir du digestAuth de http-auth
const digestMiddleware: any = (req: Request, res: Response, next: NextFunction) => {
  // digest auth est une fonction qui peut être appelée directement
  return (digestAuth as any)(req, res, next);
};

/**
 * @swagger
 * /api/admin/digest:
 *   get:
 *     summary: Zone protégée par HTTP Digest Auth
 *     tags: [Authentication]
 *     security:
 *       - digestAuth: []
 *     responses:
 *       200:
 *         description: Accès autorisé
 *       401:
 *         description: Non autorisé
 */
router.get(
  "/api/admin/digest",
  digestMiddleware,
  (req: Request, res: Response) => {
    res.status(200).json({
      message: `✅ Bienvenue dans la zone Digest Auth!`,
    });
  }
);

// ============================================
// JWT AUTH
// ============================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authentification et génération des tokens JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "student"
 *               password:
 *                 type: string
 *                 example: "password123"
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nouveau token généré
 *       401:
 *         description: Refresh token invalide ou expiré
 */
router.post("/api/auth/refresh", asyncHandler(authController.refresh));

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Récupère le profil utilisateur (protégé par JWT)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Token expiré ou manquant
 *       403:
 *         description: Token invalide
 */
router.get(
  "/api/profile",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    jwtAuth(req, res, next);
  }),
  asyncHandler(authController.getProfile)
);

export default router;
