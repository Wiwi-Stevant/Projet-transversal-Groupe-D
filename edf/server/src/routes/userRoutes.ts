import express from "express";
import * as userController from "../controllers/userController.js";
import { checkIdParam } from "../middlewares/checkIdParam.js";
import { asyncHandler } from "../middlewares/asyncErrorHandler.js";

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère la liste des utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *       500:
 *         description: Erreur serveur interne
 */
router.get("/api/users", asyncHandler(userController.getAllUsers));

/**
 * @swagger
 * /api/users/active:
 *   get:
 *     summary: Récupère la liste des utilisateurs actifs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs actifs récupérée avec succès
 *       500:
 *         description: Erreur serveur interne
 */
router.get("/api/users/active", asyncHandler(userController.getActiveUsers));

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, teacher]
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur interne
 */
router.post("/api/users", asyncHandler(userController.createUserController));

/**
 * @swagger
 * /api/users/{id}/toggle-active:
 *   patch:
 *     summary: Active ou désactive un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       400:
 *         description: Identifiant invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur interne
 */
router.patch("/api/users/:id/toggle-active", checkIdParam, asyncHandler(userController.toggleUserActive));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       400:
 *         description: Identifiant invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur interne
 */
router.delete("/api/users/:id", checkIdParam, asyncHandler(userController.deleteUserController));

export default router;
