import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../services/userService.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string };
    }
  }
}

/**
 * JWT — Authorization: Bearer &lt;access_token&gt;
 */
export const jwtAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Authorization header manquant ou format invalide.");
  }

  const token = authHeader.substring(7);

  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      throw new Error("JWT_ACCESS_SECRET non configuré");
    }

    const decoded = jwt.verify(token, accessSecret) as jwt.JwtPayload & {
      id?: number;
      email?: string;
    };

    const idRaw = decoded.id ?? decoded.sub;
    const id = typeof idRaw === "string" ? Number(idRaw) : Number(idRaw);
    const email = decoded.email;

    if (!Number.isFinite(id) || typeof email !== "string" || !email) {
      throw new HttpError(403, "Token invalide.");
    }

    req.user = { id, email };
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Token expiré. Veuillez vous reconnecter.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(403, "Token invalide.");
    }
    throw error;
  }
};
