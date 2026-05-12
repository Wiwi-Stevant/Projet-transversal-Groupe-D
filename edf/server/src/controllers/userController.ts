import type { Request, Response } from "express";
import { UserService, HttpError } from "../services/userService.js";

const userService = new UserService();

/**
 * GET /api/users
 * Récupère tous les utilisateurs
 */
export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.findAll();
  res.status(200).json(users);
};

/**
 * GET /api/users/active
 * Récupère tous les utilisateurs actifs
 */
export const getActiveUsers = async (_req: Request, res: Response) => {
  const users = await userService.findActive();
  res.status(200).json(users);
};

/**
 * POST /api/users
 * Crée un nouvel utilisateur
 */
export const createUserController = async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
};

/**
 * PATCH /api/users/:id/toggle-active
 * Bascule le statut actif/inactif d'un utilisateur
 */
export const toggleUserActive = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new HttpError(400, "Identifiant invalide.");
  }

  const user = await userService.toggleActive(id);
  res.status(200).json(user);
};

/**
 * DELETE /api/users/:id
 * Supprime un utilisateur
 */
export const deleteUserController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new HttpError(400, "Identifiant invalide.");
  }

  await userService.delete(id);
  res.status(200).json({ message: "Utilisateur supprimé." });
};

