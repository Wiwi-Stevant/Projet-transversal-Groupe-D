import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import * as authService from "../services/authService.js";
import { HttpError } from "../services/userService.js";

/**
 * POST /api/auth/register — US-3.2
 */
export const register = async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body?.email, req.body?.password);
  res.status(201).json({ user });
};

/**
 * POST /api/auth/login — US-3.3 (JWT access + refresh cookie)
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  const { user, accessToken, refreshToken } = await authService.loginWithTokens(email, password);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    accessToken,
    user: { id: user.id, email: user.email },
  });
};

/**
 * POST /api/auth/refresh
 */
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken || typeof refreshToken !== "string") {
    throw new HttpError(400, "Refresh token requis dans le corps de la requête.");
  }

  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET non configuré");
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshSecret) as jwt.JwtPayload & {
      id?: number;
      email?: string;
    };

    const idRaw = decoded.id ?? decoded.sub;
    const id = typeof idRaw === "string" ? Number(idRaw) : Number(idRaw);
    if (!Number.isFinite(id)) {
      throw new HttpError(403, "Refresh token invalide.");
    }

    const user = await User.findByPk(id);
    if (!user || user.email !== decoded.email) {
      throw new HttpError(403, "Refresh token invalide.");
    }

    const payload: authService.AuthUserPayload = {
      id: Number(user.id),
      email: user.email,
    };

    const newAccessToken = authService.createAccessToken(payload);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Refresh token expiré. Reconnexion obligatoire.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(403, "Refresh token invalide.");
    }
    throw error;
  }
};

/**
 * GET /api/profile
 */
export const getProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new HttpError(401, "Utilisateur non authentifié.");
  }

  res.status(200).json({
    message: `Bienvenue ${req.user.email}`,
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
};
