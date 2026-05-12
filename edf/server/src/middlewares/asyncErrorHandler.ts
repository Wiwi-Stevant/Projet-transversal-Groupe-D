import type { Request, Response, NextFunction } from "express";

/**
 * Async Error Handler Wrapper
 * Enveloppe les handlers async pour capturer automatiquement les erreurs
 * et les passer au middleware d'erreur centralisé
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
