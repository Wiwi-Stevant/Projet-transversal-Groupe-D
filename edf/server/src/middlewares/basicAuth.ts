import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../services/userService.js";

/**
 * HTTP Basic Authentication Middleware
 * RFC 7617 - https://tools.ietf.org/html/rfc7617
 *
 * Format: Authorization: Basic base64(username:password)
 */
export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 1. Vérifier que l'en-tête Authorization existe
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Zone Admin"');
    throw new HttpError(401, "Authorization header manquant ou format invalide.");
  }

  // 2. Extraire la partie encodée en Base64
  const base64String = authHeader.substring(6); // Enlever "Basic "

  // 3. Décoder le Base64
  let credentials: string;
  try {
    credentials = Buffer.from(base64String, "base64").toString("utf-8");
  } catch (error) {
    throw new HttpError(401, "Erreur de décodage Base64.");
  }

  // 4. Séparer username:password
  const [username, password] = credentials.split(":");

  // 5. Vérifier les identifiants
  if (username !== "admin" || password !== "supersecret") {
    throw new HttpError(401, "Identifiants invalides.");
  }

  // 6. Succès - continuer
  next();
};
