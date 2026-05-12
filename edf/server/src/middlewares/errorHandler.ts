import type { Request, Response, NextFunction } from "express";

// Middleware centralisé de gestion des erreurs
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  const anyError = err as { status?: number; message?: string };
  const status = typeof anyError.status === "number" ? anyError.status : 500;
  const message = anyError.message ?? "Erreur serveur interne.";

  res.status(status).json({ error: message });
};

