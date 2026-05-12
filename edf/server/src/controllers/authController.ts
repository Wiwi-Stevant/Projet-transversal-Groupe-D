import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../services/userService.js";

/**
 * Utilisateur de demo (pour l'exercice)
 */
const demoUser = {
  id: 1,
  username: "student",
  password: "password123",
  role: "admin",
};

/**
 * Crée un Access Token (courte durée - 15 minutes)
 */
const createAccessToken = () => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  if (!accessSecret) {
    throw new Error("JWT_ACCESS_SECRET non configuré");
  }

  return jwt.sign(
    {
      id: demoUser.id,
      username: demoUser.username,
      role: demoUser.role,
    },
    accessSecret,
    { expiresIn: "15m" }
  );
};

/**
 * Crée un Refresh Token (longue durée - 7 jours)
 */
const createRefreshToken = () => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET non configuré");
  }

  return jwt.sign(
    {
      id: demoUser.id,
      username: demoUser.username,
    },
    refreshSecret,
    { expiresIn: "7d" }
  );
};

/**
 * POST /api/auth/login
 * Authentifie l'utilisateur et retourne les tokens
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Validation simple
  if (!username || !password) {
    throw new HttpError(400, "Username et password requis.");
  }

  // Vérifier les identifiants contre l'utilisateur de demo
  if (username !== demoUser.username || password !== demoUser.password) {
    throw new HttpError(401, "Identifiants invalides.");
  }

  // Générer les tokens
  const accessToken = createAccessToken();
  const refreshToken = createRefreshToken();

  // Définir le Refresh Token dans un cookie HttpOnly
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });

  // Retourner l'Access Token en JSON
  res.status(200).json({
    accessToken,
    user: {
      id: demoUser.id,
      username: demoUser.username,
      role: demoUser.role,
    },
  });
};

/**
 * POST /api/auth/refresh
 * Rafraîchit l'Access Token en utilisant le Refresh Token
 */
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  // Validation
  if (!refreshToken) {
    throw new HttpError(400, "Refresh token requis dans le corps de la requête.");
  }

  // Vérifier le Refresh Token
  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error("JWT_REFRESH_SECRET non configuré");
    }

    jwt.verify(refreshToken, refreshSecret);

    // Générer un nouvel Access Token
    const newAccessToken = createAccessToken();

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Refresh token expiré. Reconnexion obligatoire.");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(403, "Refresh token invalide.");
    } else {
      throw error;
    }
  }
};

/**
 * GET /api/profile
 * Route protégée - retourne les données du profil utilisateur
 */
export const getProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new HttpError(401, "Utilisateur non authentifié.");
  }

  res.status(200).json({
    message: `Bienvenue ${req.user.username}!`,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    },
  });
};
