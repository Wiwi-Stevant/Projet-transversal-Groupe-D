import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../services/userService.js";

/**
 * Extension du type Request pour ajouter la propriété user
 */
declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload & { id: number; username: string; role: string };
    }
  }
}

/**
 * JWT Authentication Middleware
 * RFC 7519 - https://tools.ietf.org/html/rfc7519
 *
 * Format: Authorization: Bearer <token>
 */
export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 1. Vérifier que l'en-tête Authorization existe
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Authorization header manquant ou format invalide.");
  }

  // 2. Extraire le token (position 7 = "Bearer ".length)
  const token = authHeader.substring(7);

  // 3. Vérifier et décoder le token
  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      throw new Error("JWT_ACCESS_SECRET non configuré");
    }

    const decoded = jwt.verify(token, accessSecret);
    req.user = decoded as jwt.JwtPayload & { id: number; username: string; role: string };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Token expiré. Veuillez vous reconnecter.");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(403, "Token invalide.");
    } else {
      throw error;
    }
  }
};
